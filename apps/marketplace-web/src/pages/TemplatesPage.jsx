import { ArrowRight, Blocks, CheckCircle2, Layers3, Sparkles } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../api/client";
import EmptyState from "../components/EmptyState";
import SectionHeader from "../components/SectionHeader";
import SmartImage from "../components/SmartImage";

const categories = ["全部", "教育", "企业", "文旅", "定制"];

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
      <div className="hero-panel p-6 sm:p-8 lg:p-10">
        <div className="relative z-10 grid gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <span className="data-chip">
                <Blocks size={15} />
                Template Marketplace
              </span>
              <span className="data-chip">
                <Sparkles size={15} />
                先选模板，再定制交付
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[1.04] tracking-tight text-ink md:text-6xl">
                把模板做成企业更容易下单的
                <span className="block bg-[linear-gradient(135deg,#07111f_0%,#0d5c9c_48%,#0f766e_100%)] bg-clip-text text-transparent">
                  第一层选择入口
                </span>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-ink/66">
                模板页不是简单陈列，而是把场景、能力、交付范围和价格预估讲清楚，
                让企业可以直接从模板发起订单，也可以再进入单体详情继续比较。
              </p>
            </div>

            <div className="section-tint p-5">
              <div className="relative z-10 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <input
                  className="input-base"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="搜索模板名称、能力标签、行业场景"
                />
                <div className="flex flex-wrap gap-2">
                  {categories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCategory(item)}
                      className={`pill-filter ${item === category ? "bg-ink text-white" : "border border-white/80 bg-white/82 text-ink/68 hover:text-ink"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            {(featured.length ? featured : templates.slice(0, 3)).map((template, index) => (
              <div key={template.id} className="glass-card card-hover overflow-hidden">
                <div className="relative h-52 overflow-hidden xl:h-44">
                  <SmartImage
                    src={template.imageUrl || template.gallery?.[0]}
                    alt={template.name}
                    className="h-full w-full object-cover"
                    fallbackClassName="h-full w-full"
                    label="模板封面"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-aurora/80 via-aurora/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="text-xs uppercase tracking-[0.22em] text-white/66">Featured 0{index + 1}</div>
                    <div className="mt-2 font-display text-2xl font-semibold">{template.name}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <SectionHeader
          eyebrow="模板列表"
          title="支持直接套用，也支持继续深度定制"
          description="模板会把场景、Prompt、交互方式、价格带和推荐交付周期先定义出来，降低企业下单门槛。"
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="glass-card overflow-hidden">
                <div className="h-60 bg-white/80 skeleton-shimmer" />
                <div className="space-y-4 p-6">
                  <div className="h-5 w-32 rounded-full bg-white/80 skeleton-shimmer" />
                  <div className="h-10 w-3/4 rounded-2xl bg-white/80 skeleton-shimmer" />
                  <div className="h-20 rounded-[1.2rem] bg-white/80 skeleton-shimmer" />
                </div>
              </div>
            ))
          ) : filtered.length ? (
            filtered.map((template) => <TemplateCard key={template.id} template={template} />)
          ) : (
            <div className="xl:col-span-2">
              <EmptyState
                title="没有匹配的模板"
                description="可以切换分类、修改搜索词，或者直接前往企业下单页发布纯定制需求。"
                action={
                  <Link to="/enterprise/orders/new" className="button-primary">
                    直接发起定制订单
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
    <article className="glass-card card-hover overflow-hidden">
      <div className="relative h-72 overflow-hidden">
        <SmartImage
          src={template.imageUrl || template.gallery?.[0]}
          alt={template.name}
          className="h-full w-full object-cover"
          fallbackClassName="h-full w-full"
          label="模板封面"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-aurora/85 via-aurora/15 to-transparent" />
        <div className="absolute left-5 top-5 flex flex-wrap gap-2">
          <span className="data-chip border-white/20 bg-white/12 text-white">{template.category}</span>
          <span className="data-chip border-white/20 bg-white/12 text-white">预计 {template.deliveryDays} 天</span>
        </div>
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <div className="font-display text-3xl font-semibold">{template.name}</div>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-white/78">{template.summary}</p>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-sm leading-7 text-ink/68">{template.description}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {(template.capabilities || []).map((item) => (
              <span key={item} className="pill-filter border border-white/80 bg-white/80 text-ink/72">
                {item}
              </span>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <TemplatePanel title="Prompt 模板" content={template.promptTemplate} />
            <TemplatePanel title="对话流程模板" content={template.conversationTemplate} />
          </div>
        </div>

        <div className="mesh-panel p-5">
          <div className="relative z-10">
            <div className="text-xs uppercase tracking-[0.24em] text-ink/44">Template Value</div>
            <div className="mt-3 font-display text-3xl font-semibold text-ink">
              ¥{(template.recommendedPrice / 100).toLocaleString("zh-CN")}
            </div>
            <p className="mt-2 text-sm leading-7 text-ink/64">建议作为首版上线预算，再按企业数据接入和流程复杂度继续扩展。</p>

            <div className="mt-5 space-y-3">
              <InfoRow icon={<CheckCircle2 size={16} />} text="适合作为采购前的标准方案起点" />
              <InfoRow icon={<Layers3 size={16} />} text={template.agentName ? `可关联现成智能体：${template.agentName}` : "可直接作为纯定制模板使用"} />
              <InfoRow icon={<Sparkles size={16} />} text="支持进入企业下单页自动预填需求" />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={orderUrl} className="button-primary">
                选用模板下单
                <ArrowRight size={16} className="ml-2" />
              </Link>
              {template.agentId ? (
                <Link to={`/agents/${template.agentId}`} className="button-secondary">
                  查看关联智能体
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function TemplatePanel({ title, content }) {
  return (
    <div className="rounded-[1.45rem] border border-white/80 bg-white/78 p-4">
      <div className="text-sm font-semibold text-ink">{title}</div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ink/66">{content}</p>
    </div>
  );
}

function InfoRow({ icon, text }) {
  return (
    <div className="flex items-start gap-3 rounded-[1.2rem] border border-white/80 bg-white/78 px-4 py-3 text-sm leading-6 text-ink/70">
      <span className="mt-0.5 text-sky">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
