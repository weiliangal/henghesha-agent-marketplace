import { ArrowRight, Blocks, CheckCircle2, Layers3, Search } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../api/client";
import EmptyState from "../components/EmptyState";
import SectionHeader from "../components/SectionHeader";
import SmartImage from "../components/SmartImage";

const categories = ["全部", "教育", "企业", "文旅", "定制"];

const templateFallbackImages = {
  教育: "/showcase/admissions-assistant.svg",
  企业: "/showcase/enterprise-copilot.svg",
  文旅: "/showcase/cultural-guide.svg",
  定制: "/showcase/lab-operations.svg",
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("全部");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let mounted = true;

    apiRequest("/site/templates")
      .then((data) => {
        if (mounted) {
          setTemplates(data.templates || []);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    return templates.filter((template) => {
      const categoryPass = category === "全部" || template.category === category;
      const searchPass =
        !term ||
        [template.name, template.summary, template.description, ...(template.capabilities || [])]
          .join(" ")
          .toLowerCase()
          .includes(term);
      return categoryPass && searchPass;
    });
  }, [category, deferredSearch, templates]);

  const featured = templates.slice(0, 3);

  return (
    <section className="section-shell">
      <div className="hero-panel p-7 sm:p-8 lg:p-10">
        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
          <div>
            <SectionHeader
              eyebrow="模板中心"
              title="先用标准模板降低决策成本，再进入项目采购或定制流程"
              description="模板不是简单的展示页，而是帮助企业快速理解适用场景、核心能力、交付边界和预算区间的采购入口。"
            />

            <div className="mt-8 section-tint p-5">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/32" size={18} />
                  <input
                    className="input-base pl-11"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="搜索模板名称、适用场景或能力标签"
                  />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-ink/60">
                  共 {filtered.length} 个模板
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`pill-filter ${
                      item === category ? "border-ink bg-ink text-white" : "border-slate-200 bg-white text-ink/66 hover:text-ink"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            {(featured.length ? featured : templates.slice(0, 3)).map((template) => (
              <div key={template.id} className="surface-panel overflow-hidden p-0">
                <div className="h-40 overflow-hidden border-b border-slate-200 bg-slate-50">
                  <SmartImage
                    src={getTemplateVisual(template)}
                    alt={template.name}
                    className="h-full w-full object-cover"
                    fallbackClassName="h-full w-full"
                    label="模板封面"
                  />
                </div>
                <div className="p-5">
                  <div className="section-label">{template.category}</div>
                  <h3 className="mt-4 font-display text-2xl font-semibold text-ink">{template.name}</h3>
                  <p className="mt-2 text-sm leading-7 text-ink/64">{template.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <SectionHeader
          eyebrow="模板列表"
          title="统一模板说明、价格带和交付节奏，让企业更容易判断是否值得进入合作"
          description="模板会先约束场景、Prompt 和交互方式，再将项目预估价格和推荐交付周期清晰呈现出来。"
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="surface-panel overflow-hidden">
                <div className="h-56 bg-slate-100 skeleton-shimmer" />
                <div className="space-y-4 p-6">
                  <div className="h-5 w-32 rounded-full bg-slate-100 skeleton-shimmer" />
                  <div className="h-10 w-3/4 rounded-2xl bg-slate-100 skeleton-shimmer" />
                  <div className="h-20 rounded-[20px] bg-slate-100 skeleton-shimmer" />
                </div>
              </div>
            ))
          ) : filtered.length ? (
            filtered.map((template) => <TemplateCard key={template.id} template={template} />)
          ) : (
            <div className="xl:col-span-2">
              <EmptyState
                title="没有匹配的模板"
                description="可以切换分类、修改搜索词，或直接前往企业需求页发起纯定制订单。"
                action={
                  <Link to="/enterprise/orders/new" className="button-primary">
                    发起定制需求
                  </Link>
                }
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TemplateCard({ template }) {
  const orderUrl = template.agentId
    ? `/enterprise/orders/new?templateId=${template.id}&agentId=${template.agentId}`
    : `/enterprise/orders/new?templateId=${template.id}`;

  return (
    <article className="surface-panel overflow-hidden p-0">
      <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="border-b border-slate-200 bg-slate-50 lg:border-b-0 lg:border-r">
          <SmartImage
            src={getTemplateVisual(template)}
            alt={template.name}
            className="h-full min-h-[280px] w-full object-cover"
            fallbackClassName="h-full min-h-[280px] w-full"
            label="模板封面"
          />
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="section-label">{template.category}</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-ink/58">预计 {template.deliveryDays} 天</span>
          </div>

          <h3 className="mt-4 font-display text-3xl font-semibold text-ink">{template.name}</h3>
          <p className="mt-3 text-sm leading-7 text-ink/64">{template.summary}</p>
          <p className="mt-4 text-sm leading-7 text-ink/60">{template.description}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {(template.capabilities || []).map((item) => (
              <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-ink/58">
                {item}
              </span>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <TemplatePanel title="Prompt 模板" content={template.promptTemplate} />
            <TemplatePanel title="对话流程模板" content={template.conversationTemplate} />
          </div>

          <div className="mt-6 rounded-[20px] border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm text-ink/50">参考价格</div>
            <div className="mt-2 font-display text-3xl font-semibold text-ink">{formatCurrency(template.recommendedPrice)}</div>
            <div className="mt-3 space-y-2 text-sm leading-7 text-ink/62">
              <InfoRow icon={<CheckCircle2 size={16} />} text="适合作为企业内部评估和第一阶段采购入口" />
              <InfoRow
                icon={<Layers3 size={16} />}
                text={template.agentName ? `可进一步关联项目「${template.agentName}」继续推进` : "可直接作为纯定制模板使用"}
              />
              <InfoRow icon={<Blocks size={16} />} text="支持带入企业需求页自动预填订单内容" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={orderUrl} className="button-primary">
              使用模板下单
              <ArrowRight size={16} className="ml-2" />
            </Link>
            {template.agentId ? (
              <Link to={`/agents/${template.agentId}`} className="button-secondary">
                查看关联项目
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function TemplatePanel({ title, content }) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-ink">{title}</div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ink/62">{content}</p>
    </div>
  );
}

function InfoRow({ icon, text }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 text-sky">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function getTemplateVisual(template) {
  return template.imageUrl || template.gallery?.[0] || templateFallbackImages[template.category] || "/showcase/knowledge-ops.svg";
}

function formatCurrency(value) {
  if (!value) {
    return "待评估";
  }
  return `¥${(value / 100).toLocaleString("zh-CN")}`;
}
