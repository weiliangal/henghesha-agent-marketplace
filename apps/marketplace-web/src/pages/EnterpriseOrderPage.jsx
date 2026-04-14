import {
  ArrowRight,
  BadgeCheck,
  Blocks,
  BriefcaseBusiness,
  CalendarRange,
  CreditCard,
  FilePenLine,
  Package,
  Paperclip,
  ShieldCheck,
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
        title: current.title || `基于「${selectedTemplate.name}」的企业智能体需求`,
        description:
          current.description ||
          `希望基于「${selectedTemplate.name}」启动项目评估。\n适用场景：${selectedTemplate.summary}\n核心能力：${(selectedTemplate.capabilities || []).join("、") || "请结合贵方模板说明补充"}\n请围绕企业实际业务补充交付边界、接口要求和上线目标。`,
        note:
          current.note ||
          "请进一步说明希望对接的系统、知识库来源、数据安全要求、验收节点和后续运维方式。",
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
        title: current.title || `采购或定制「${selectedAgent.name}」`,
        description:
          current.description ||
          `希望围绕「${selectedAgent.name}」进行采购评估或定制扩展。\n当前项目简介：${selectedAgent.summary}\n请结合我方业务流程、对接方式和交付要求给出实施建议。`,
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
          ? `需求单已提交，系统已按「${selectedTemplate.name}」模板预填采购信息。后续请在订单中心补充线下付款回执。`
          : "需求单已提交，平台会把订单流转给对应团队，后续请在订单中心补充付款回执与协作说明。",
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
      <div className="hero-panel p-7 sm:p-8 lg:p-10">
        <SectionHeader
          eyebrow="企业需求提交"
          title="把采购意向整理成一份清晰、正式、可评估的项目需求单"
          description="你可以直接关联已上线项目，也可以先选模板再补充业务要求。平台会基于这份需求单组织报价、评估、审核和后续交付协作。"
        />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <MetricCard
            icon={<Blocks size={16} />}
            label="模板采购"
            text="适合已有明确场景，希望快速比选标准方案的企业客户。"
          />
          <MetricCard
            icon={<Package size={16} />}
            label="项目定制"
            text="适合已选定团队或项目，需要继续扩展业务能力和交付边界。"
          />
          <MetricCard
            icon={<ShieldCheck size={16} />}
            label="平台协同"
            text="所有订单统一进入审核与状态流转，便于后续付款确认与交付跟进。"
          />
        </div>
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <div className="surface-panel p-6">
            <div className="section-label">提交流程</div>
            <div className="mt-5 space-y-4">
              <FlowStep
                title="1. 选择现成项目或标准模板"
                text="如已在项目广场中找到合适方案，可直接带入项目；如仍在评估阶段，可先从模板中心进入。"
              />
              <FlowStep
                title="2. 补充需求说明与附件"
                text="建议上传业务背景、流程说明、对接文档或预算要求，减少后续反复沟通。"
              />
              <FlowStep
                title="3. 平台进入审核与协同"
                text="订单会同步给对应高校团队和管理员，后续状态、支付确认和交付记录统一沉淀在订单中心。"
              />
            </div>
          </div>

          <SelectionCard
            eyebrow="当前模板"
            emptyText="当前未绑定模板，系统会把这份表单视为纯定制需求。"
            title={selectedTemplate?.name}
            summary={selectedTemplate?.summary}
            price={selectedTemplate?.recommendedPrice}
            image={selectedTemplate?.imageUrl || selectedTemplate?.gallery?.[0]}
            badge={selectedTemplate?.category}
            bullets={selectedTemplate?.capabilities}
            fallbackLabel="模板封面"
          />

          <SelectionCard
            eyebrow="当前项目"
            emptyText="当前未绑定具体项目，平台会在审核阶段协助匹配团队与交付方式。"
            title={selectedAgent?.name}
            summary={selectedAgent?.summary}
            price={selectedAgent?.price}
            image={selectedAgent?.imageUrls?.[0]}
            badge={selectedAgent?.category}
            bullets={selectedAgent ? ["可直接采购", "支持二次定制", "进入订单中心协作"] : []}
            fallbackLabel="项目封面"
          />

          <div className="section-tint p-6">
            <div className="section-label">填写建议</div>
            <div className="mt-4 space-y-3 text-sm leading-7 text-ink/66">
              <p>建议明确业务目标、使用部门、预期交付周期以及是否需要私有化部署或知识库接入。</p>
              <p>如果已有内部流程文档、招标说明或对接接口要求，可以作为附件一并提交，便于团队更快评估。</p>
            </div>
          </div>
        </div>

        <div className="surface-panel p-8 md:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="section-label">正式需求单</div>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">填写企业项目需求</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/64">
                平台会根据你填写的内容生成订单记录，并同步到团队工作台和管理员审核视图。
              </p>
            </div>
            <div className="data-chip">
              <BriefcaseBusiness size={15} />
              企业采购入口
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <FormField label="选择模板（可选）" icon={<Blocks size={16} />}>
              <select
                className="input-base"
                value={form.templateId}
                onChange={(event) => setForm((current) => ({ ...current, templateId: event.target.value }))}
              >
                <option value="">不使用模板，直接发布需求</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} / {formatCurrency(template.recommendedPrice)}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="关联项目（可选）" icon={<Package size={16} />}>
              <select
                className="input-base"
                value={form.agentId}
                onChange={(event) => setForm((current) => ({ ...current, agentId: event.target.value }))}
              >
                <option value="">仅发起定制需求</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} / {formatCurrency(agent.price)}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="需求标题" icon={<FilePenLine size={16} />}>
              <input
                className="input-base"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="例如：招生咨询智能体项目采购需求"
                required
              />
            </FormField>

            <FormField label="需求说明" icon={<BadgeCheck size={16} />}>
              <textarea
                rows="7"
                className="input-base"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="请说明业务背景、目标用户、应用场景、预期能力、交付要求等。"
                required
              />
            </FormField>

            <FormField label="协作备注" icon={<Paperclip size={16} />}>
              <textarea
                rows="4"
                className="input-base"
                value={form.note}
                onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                placeholder="例如：是否需要私有化部署、对接内部系统、分阶段验收或培训交付。"
              />
            </FormField>

            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="预算（分）" icon={<CreditCard size={16} />}>
                <input
                  type="number"
                  className="input-base"
                  value={form.budget}
                  onChange={(event) => setForm((current) => ({ ...current, budget: event.target.value }))}
                  placeholder="请输入预算"
                  required
                />
              </FormField>

              <FormField label="期望交付时间" icon={<CalendarRange size={16} />}>
                <input
                  type="date"
                  className="input-base"
                  value={form.deliveryDeadline}
                  onChange={(event) => setForm((current) => ({ ...current, deliveryDeadline: event.target.value }))}
                />
              </FormField>
            </div>

            <UploadField
              label="上传附件"
              hint={attachment ? attachment.name : "可上传需求文档、招标说明、接口文档、流程图或补充说明"}
            >
              <input type="file" onChange={(event) => setAttachment(event.target.files?.[0] || null)} className="block w-full text-sm" />
            </UploadField>

            {message ? <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink/72">{message}</div> : null}

            <button type="submit" disabled={submitting} className="button-primary w-full">
              {submitting ? "正在提交..." : "提交需求单"}
              {!submitting ? <ArrowRight size={16} className="ml-2" /> : null}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-16">
        <SectionHeader
          eyebrow="模板入口"
          title="如果还没有确定具体方案，可以先从模板中心开始"
          description="平台模板会预置能力范围、参考价格和交付周期，适合企业先完成第一次内部评估，再决定是否进入定制合作。"
          action={
            <Link to="/templates" className="button-secondary">
              前往模板中心
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
                className="surface-panel card-hover p-5 text-left"
              >
                <div className="section-label">{template.category}</div>
                <h3 className="mt-4 font-display text-2xl font-semibold text-ink">{template.name}</h3>
                <p className="mt-3 text-sm leading-7 text-ink/64">{template.summary}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">{formatCurrency(template.recommendedPrice)}</span>
                  <span className="text-sm font-semibold text-sky">带入表单</span>
                </div>
              </button>
            ))
          ) : (
            <div className="md:col-span-2 xl:col-span-4">
              <EmptyState title="模板数据准备中" description="模板内容加载完成后，这里会展示可直接带入需求表单的标准方案。" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SelectionCard({ eyebrow, emptyText, title, summary, price, image, badge, bullets = [], fallbackLabel }) {
  return (
    <div className="surface-panel p-6">
      <div className="section-label">{eyebrow}</div>
      {title ? (
        <div className="mt-5 overflow-hidden rounded-[22px] border border-slate-200 bg-white">
          {image ? (
            <SmartImage src={image} alt={title} className="h-56 w-full object-cover" fallbackClassName="h-56 w-full" label={fallbackLabel} />
          ) : null}
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">{badge ? <span className="section-label">{badge}</span> : null}</div>
                <h3 className="mt-3 font-display text-2xl font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-ink/64">{summary}</p>
              </div>
              {price ? <span className="rounded-full bg-ink px-3 py-1 text-sm font-semibold text-white">{formatCurrency(price)}</span> : null}
            </div>

            {bullets.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {bullets.map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-ink/58">
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-[20px] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-7 text-ink/60">{emptyText}</div>
      )}
    </div>
  );
}

function FormField({ label, icon, children }) {
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
    <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-ink">{label}</div>
      <div className="mt-1 text-xs text-ink/48">{hint}</div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function FlowStep({ title, text }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
      <div className="font-semibold text-ink">{title}</div>
      <p className="mt-2 text-sm leading-7 text-ink/64">{text}</p>
    </div>
  );
}

function MetricCard({ icon, label, text }) {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="text-sky">{icon}</span>
        {label}
      </div>
      <p className="mt-3 text-sm leading-7 text-ink/60">{text}</p>
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

function formatCurrency(value) {
  if (!value) {
    return "待评估";
  }
  return `¥${(value / 100).toLocaleString("zh-CN")}`;
}
