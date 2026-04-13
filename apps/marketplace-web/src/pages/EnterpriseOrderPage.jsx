import {
  ArrowRight,
  BadgeCheck,
  Blocks,
  CalendarRange,
  CreditCard,
  FilePenLine,
  Package,
  Paperclip,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { apiRequest } from "../api/client";
import EmptyState from "../components/EmptyState";
import SectionHeader from "../components/SectionHeader";
import SmartImage from "../components/SmartImage";
import { useAuth } from "../context/AuthContext";

export default function EnterpriseOrderPage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const [agents, setAgents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [form, setForm] = useState({
    agentId: searchParams.get("agentId") || "",
    templateId: searchParams.get("templateId") || "",
    title: "",
    description: "",
    note: "",
    budget: "",
    deliveryDeadline: "",
  });

  useEffect(() => {
    Promise.all([apiRequest("/agents"), apiRequest("/site/templates")]).then(([agentsData, templatesData]) => {
      setAgents(agentsData.agents || []);
      setTemplates(templatesData.templates || []);
    });
  }, []);

  const selectedAgent = useMemo(() => agents.find((item) => String(item.id) === String(form.agentId)), [agents, form.agentId]);
  const selectedTemplate = useMemo(() => templates.find((item) => String(item.id) === String(form.templateId)), [templates, form.templateId]);

  useEffect(() => {
    if (!selectedTemplate) {
      return;
    }

    setForm((current) => {
      const next = {
        ...current,
        agentId: current.agentId || (selectedTemplate.agentId ? String(selectedTemplate.agentId) : ""),
        title: current.title || `采用 ${selectedTemplate.name} 模板`,
        description:
          current.description ||
          `希望基于“${selectedTemplate.name}”模板启动项目。\n适用场景：${selectedTemplate.summary}\n重点能力：${(selectedTemplate.capabilities || []).join("、")}\n交付目标：请在该模板基础上结合我方业务继续定制。`,
        note: current.note || "请补充交付节奏、对接方式、知识库整理和后续运营建议。",
        budget: current.budget || String(selectedTemplate.recommendedPrice || ""),
        deliveryDeadline: current.deliveryDeadline || (selectedTemplate.deliveryDays ? dateAfterDays(selectedTemplate.deliveryDays) : ""),
      };

      return hasFormChanged(current, next) ? next : current;
    });
  }, [selectedTemplate]);

  useEffect(() => {
    if (!selectedAgent) {
      return;
    }

    setForm((current) => {
      const next = {
        ...current,
        title: current.title || `采购 ${selectedAgent.name}`,
        description: current.description || `希望围绕“${selectedAgent.name}”进行采购或继续定制开发，请结合实际业务给出交付建议。`,
        budget: current.budget || String(selectedAgent.price),
      };

      return hasFormChanged(current, next) ? next : current;
    });
  }, [selectedAgent]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("agentId", form.agentId || "");
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("note", form.note);
      formData.append("budget", String(Number(form.budget)));
      formData.append("deliveryDeadline", form.deliveryDeadline || "");
      if (attachment) {
        formData.append("attachment", attachment);
      }

      await apiRequest("/orders", {
        method: "POST",
        token,
        body: formData,
      });

      setMessage(
        selectedTemplate
          ? `订单已提交，系统已按“${selectedTemplate.name}”模板预填需求。后续请在订单中心提交线下支付回执。`
          : "订单已提交，后续请在订单中心提交线下支付回执。",
      );
      setAttachment(null);
      setForm({
        agentId: "",
        templateId: "",
        title: "",
        description: "",
        note: "",
        budget: "",
        deliveryDeadline: "",
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section-shell">
      <div className="hero-panel p-6 sm:p-8 lg:p-10">
        <div className="relative z-10">
          <SectionHeader
            eyebrow="企业发布订单"
            title="把采购或定制需求整理成一笔清晰、可审核、可流转的正式订单"
            description="你可以直接绑定已上架智能体，也可以先选模板再定制，并补充附件和备注，让平台更快进入交付协作。"
          />
        </div>
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] bg-[linear-gradient(145deg,#07111f_0%,#0d5c9c_46%,#0f766e_100%)] p-8 text-white shadow-luxe">
            <div className="text-xs uppercase tracking-[0.28em] text-white/62">How It Works</div>
            <div className="mt-5 grid gap-4">
              <FlowRow title="先选模板或现成智能体" text="支持从模板中心进入，也支持从详情页直接带入指定智能体。" />
              <FlowRow title="补充附件和备注" text="可上传需求文档、流程图、报价说明或交付约束，减少往返沟通。" />
              <FlowRow title="平台持续同步状态" text="企业、学校与管理员都能看到订单所处的处理阶段。" />
            </div>
          </div>

          <SelectionCard
            eyebrow="当前模板"
            emptyText="当前没有绑定模板，这将作为纯定制需求创建。"
            title={selectedTemplate?.name}
            summary={selectedTemplate?.summary}
            price={selectedTemplate?.recommendedPrice}
            image={selectedTemplate?.imageUrl || selectedTemplate?.gallery?.[0]}
            badge={selectedTemplate?.category}
            bullets={selectedTemplate?.capabilities}
            fallbackLabel="模板封面"
          />

          <SelectionCard
            eyebrow="当前智能体"
            emptyText="当前没有绑定具体智能体，系统会将其视为纯定制订单处理。"
            title={selectedAgent?.name}
            summary={selectedAgent?.summary}
            price={selectedAgent?.price}
            image={selectedAgent?.imageUrls?.[0]}
            badge={selectedAgent?.category}
            fallbackLabel="智能体封面"
          />
        </div>

        <div className="mesh-panel p-8 md:p-10">
          <div className="relative z-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="选择模板（可选）" icon={<Blocks size={16} />}>
                <select className="input-base" value={form.templateId} onChange={(event) => setForm((current) => ({ ...current, templateId: event.target.value }))}>
                  <option value="">不使用模板，直接发布需求</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} / ¥{(template.recommendedPrice / 100).toLocaleString("zh-CN")}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="选择智能体（可选）" icon={<Package size={16} />}>
                <select className="input-base" value={form.agentId} onChange={(event) => setForm((current) => ({ ...current, agentId: event.target.value }))}>
                  <option value="">仅发布定制需求</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} / ¥{(agent.price / 100).toLocaleString("zh-CN")}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="订单标题" icon={<FilePenLine size={16} />}>
                <input className="input-base" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
              </Field>

              <Field label="内容描述" icon={<Sparkles size={16} />}>
                <textarea
                  rows="7"
                  className="input-base"
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  required
                />
              </Field>

              <Field label="备注 / 留言区" icon={<Paperclip size={16} />}>
                <textarea
                  rows="4"
                  className="input-base"
                  value={form.note}
                  onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                  placeholder="例如：请优先考虑私有化部署、知识库导入方式或与 CRM 的对接。"
                />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="预算（分）" icon={<CreditCard size={16} />}>
                  <input type="number" className="input-base" value={form.budget} onChange={(event) => setForm((current) => ({ ...current, budget: event.target.value }))} required />
                </Field>
                <Field label="交付时间" icon={<CalendarRange size={16} />}>
                  <input type="date" className="input-base" value={form.deliveryDeadline} onChange={(event) => setForm((current) => ({ ...current, deliveryDeadline: event.target.value }))} />
                </Field>
              </div>

              <UploadField label="上传附件" hint={attachment ? attachment.name : "可上传需求文档、流程图、补充说明"}>
                <input type="file" onChange={(event) => setAttachment(event.target.files?.[0] || null)} className="block w-full text-sm" />
              </UploadField>

              {message ? <div className="rounded-[1.35rem] border border-white/80 bg-white/82 px-4 py-3 text-sm text-ink/78">{message}</div> : null}

              <button type="submit" disabled={submitting} className="button-primary w-full">
                {submitting ? "提交中..." : "提交订单"}
                {!submitting ? <ArrowRight size={16} className="ml-2" /> : null}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <SectionHeader
          eyebrow="推荐模板"
          title="如果还没想好具体方案，可以先从这些模板起步"
          description="模板会自动带入价格带、交互方式和推荐能力，比完全从零填写更容易完成第一次下单。"
          action={
            <Link to="/templates" className="button-secondary">
              去模板中心
            </Link>
          }
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {templates.length ? (
            templates.slice(0, 4).map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setForm((current) => ({ ...current, templateId: String(template.id) }))}
                className="glass-card card-hover p-5 text-left"
              >
                <div className="eyebrow">{template.category}</div>
                <div className="mt-3 font-display text-2xl font-semibold text-ink">{template.name}</div>
                <div className="mt-3 text-sm leading-7 text-ink/66">{template.summary}</div>
                <div className="mt-5 font-semibold text-ink">¥{(template.recommendedPrice / 100).toLocaleString("zh-CN")}</div>
              </button>
            ))
          ) : (
            <div className="md:col-span-2 xl:col-span-4">
              <EmptyState title="还没有模板数据" description="模板接口加载完成后，这里会自动展示推荐模板。" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SelectionCard({ eyebrow, emptyText, title, summary, price, image, badge, bullets = [], fallbackLabel }) {
  return (
    <div className="mesh-panel p-6">
      <div className="relative z-10">
        <div className="eyebrow">{eyebrow}</div>
        {title ? (
          <div className="mt-4 overflow-hidden rounded-[1.6rem] border border-white/80 bg-white/84">
            {image ? (
              <SmartImage src={image} alt={title} className="h-56 w-full object-cover" fallbackClassName="h-56 w-full" label={fallbackLabel} />
            ) : null}
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2">{badge ? <span className="data-chip">{badge}</span> : null}</div>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-ink/66">{summary}</p>
                </div>
                {price ? <span className="rounded-full bg-ink px-3 py-1 text-sm font-semibold text-white">¥{(price / 100).toLocaleString("zh-CN")}</span> : null}
              </div>

              {bullets.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {bullets.map((item) => (
                    <span key={item} className="pill-filter border border-white/80 bg-white/78 text-ink/72">
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-[1.5rem] border border-dashed border-ink/12 bg-white/78 p-5 text-sm leading-7 text-ink/62">{emptyText}</div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children, icon }) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="text-sky">{icon}</span>
        {label}
      </span>
      {children}
    </label>
  );
}

function UploadField({ label, hint, children }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-ink/14 bg-white/80 p-4">
      <div className="text-sm font-semibold text-ink">{label}</div>
      <div className="mt-1 text-xs text-ink/48">{hint}</div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function FlowRow({ title, text }) {
  return (
    <div className="rounded-[1.45rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
      <div className="flex items-center gap-3 text-sm font-semibold">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
          <BadgeCheck size={16} />
        </span>
        {title}
      </div>
      <p className="mt-3 text-sm leading-6 text-white/76">{text}</p>
    </div>
  );
}

function dateAfterDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + Number(days));
  return date.toISOString().slice(0, 10);
}

function hasFormChanged(current, next) {
  return Object.keys(next).some((key) => current[key] !== next[key]);
}
