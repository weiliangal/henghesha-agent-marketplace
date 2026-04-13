import {
  ArrowRight,
  BadgeCheck,
  Blocks,
  Bot,
  Building2,
  ChevronRight,
  GraduationCap,
  LayoutPanelTop,
  Search,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Workflow,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../api/client";
import AgentCard from "../components/AgentCard";
import AgentSkeleton from "../components/AgentSkeleton";
import EmptyState from "../components/EmptyState";
import SectionHeader from "../components/SectionHeader";
import SmartImage from "../components/SmartImage";

const categories = ["全部", "教育", "企业", "文旅", "定制"];

const workflow = [
  {
    icon: <GraduationCap size={18} />,
    title: "学校上传成果",
    description: "学校把案例图、Prompt、交付说明和定价整理成可上架的商品条目。",
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "平台审核上线",
    description: "管理员审核内容质量、支付状态和交付可信度，保证前台展示足够专业。",
  },
  {
    icon: <Building2 size={18} />,
    title: "企业浏览采购",
    description: "企业可以直接购买现成智能体，也可以围绕模板发起定制订单。",
  },
  {
    icon: <Bot size={18} />,
    title: "AI 辅助生成",
    description: "学校在上传前可先生成产品文案草案，加快打包、上架与交付准备。",
  },
];

const valuePillars = [
  "不是单页作品集，而是完整的交易与交付入口",
  "学校、企业、管理员三端角色明确，链路闭环",
  "先用手动确认支付快速落地，后续再扩展自动支付",
  "支持从 SQLite 平滑迁移到 Supabase / PostgreSQL",
];

export default function HomePage() {
  const [agents, setAgents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("全部");
  const [search, setSearch] = useState("");
  const [, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let mounted = true;

    Promise.all([apiRequest("/agents"), apiRequest("/site/overview"), apiRequest("/site/templates")])
      .then(([agentsData, overviewData, templateData]) => {
        if (!mounted) {
          return;
        }

        startTransition(() => {
          setAgents(agentsData.agents || []);
          setOverview(overviewData);
          setTemplates(templateData.featuredTemplates || templateData.templates || []);
        });
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
    return agents.filter((agent) => {
      const categoryPass = category === "全部" || agent.category === category;
      const searchPass = !term || [agent.name, agent.summary, agent.description].join(" ").toLowerCase().includes(term);
      return categoryPass && searchPass;
    });
  }, [agents, category, deferredSearch]);

  const featured = filtered.filter((agent) => agent.featured).slice(0, 6);
  const curated = (featured.length ? featured : filtered).slice(0, 6);
  const latest = overview?.latestAgents?.slice(0, 3) || [];
  const stats = overview?.stats || {};
  const promoGallery = (curated.length ? curated : agents)
    .flatMap((agent) =>
      [...(agent.imageUrls || []), ...(agent.demoImageUrls || [])]
        .slice(0, 2)
        .map((image, index) => ({
          id: `${agent.id}-${index}`,
          image,
          name: agent.name,
          category: agent.category,
        })),
    )
    .slice(0, 6);

  return (
    <>
      <section className="section-shell pb-10">
        <div className="hero-panel p-6 sm:p-8 lg:p-10">
          <div className="relative z-10 grid gap-10 xl:grid-cols-[1.15fr_0.85fr] xl:items-stretch">
            <div className="space-y-8 animate-rise-in-delay-1">
              <div className="flex flex-wrap gap-3">
                <span className="data-chip">
                  <Sparkles size={15} />
                  国际化 AI 平台质感
                </span>
                <span className="data-chip">
                  <BadgeCheck size={15} />
                  高校成果可直接商品化
                </span>
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[1.02] tracking-tight text-ink md:text-6xl xl:text-7xl">
                  让智能体从
                  <span className="block bg-[linear-gradient(135deg,#07111f_0%,#0d5c9c_48%,#0f766e_100%)] bg-clip-text text-transparent">
                    展示原型
                  </span>
                  变成真实交易产品
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-ink/66">
                  恒河沙智能体交易网把高校研发成果、企业采购需求、模板选型和平台审核整合到同一个站点，
                  让智能体真正具备展示、询价、下单与交付能力。
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/agents" className="button-primary">
                  浏览智能体库
                </Link>
                <Link to="/templates" className="button-secondary">
                  查看模板中心
                  <ArrowRight size={16} className="ml-2" />
                </Link>
                <Link to="/enterprise/orders/new" className="button-secondary">
                  企业发起定制
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <HeroStat label="已上架智能体" value={`${stats.approvedAgents ?? agents.length}+`} />
                <HeroStat label="学校供给方" value={`${stats.schoolUsers ?? 0}+`} />
                <HeroStat label="企业采购方" value={`${stats.enterpriseUsers ?? 0}+`} />
                <HeroStat label="订单流转量" value={`${stats.orderCount ?? 0}+`} />
              </div>

              <div className="section-tint p-5">
                <div className="relative z-10">
                  <div className="eyebrow">Discovery Layer</div>
                  <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/32" size={18} />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="搜索智能体名称、行业场景、能力标签或交付关键词"
                        className="input-base pl-11"
                      />
                    </div>
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
            </div>

            <div className="grid gap-5 animate-rise-in-delay-2">
              <div className="animate-soft-float rounded-[2rem] bg-[linear-gradient(145deg,#07111f_0%,#0d5c9c_55%,#fb7c32_100%)] p-6 text-white shadow-luxe">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.28em] text-white/60">Marketplace Flow</div>
                    <div className="mt-2 font-display text-2xl font-semibold">面向真实交易的前台结构</div>
                  </div>
                  <Workflow size={18} className="text-white/70" />
                </div>
                <div className="mt-6 space-y-3">
                  {workflow.map((item, index) => (
                    <div key={item.title} className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/16">{item.icon}</div>
                        <div>
                          <div className="text-sm font-semibold">
                            0{index + 1} {item.title}
                          </div>
                          <div className="mt-1 text-sm leading-6 text-white/72">{item.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <QuickPortal
                  title="学校工作台"
                  text="上传智能体、完善交付说明、AI 生成草案，再进入审核流程。"
                  to="/school/upload"
                  icon={<WandSparkles size={18} />}
                />
                <QuickPortal
                  title="企业入口"
                  text="先浏览现成智能体，也可以从模板中心快速发起定制订单。"
                  to="/templates"
                  icon={<LayoutPanelTop size={18} />}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pt-2">
        <SectionHeader
          eyebrow="推荐智能体"
          title="可直接采购，也可作为定制项目的起点"
          description="前台卡片不仅展示价格和图片，更要帮助企业快速判断供给方、适用场景和下单入口。"
          action={
            <Link to="/agents" className="button-secondary">
              查看全部
              <ChevronRight size={16} className="ml-2" />
            </Link>
          }
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => <AgentSkeleton key={index} />)
          ) : curated.length ? (
            curated.map((agent) => <AgentCard key={agent.id} agent={agent} />)
          ) : (
            <div className="md:col-span-2 xl:col-span-3">
              <EmptyState
                title="暂时没有匹配的智能体"
                description="可以切换分类、调整关键词，或者直接发起企业定制订单。"
                action={
                  <Link to="/enterprise/orders/new" className="button-primary">
                    发起定制订单
                  </Link>
                }
              />
            </div>
          )}
        </div>
      </section>

      <section className="section-shell pt-4">
        <SectionHeader
          eyebrow="模板中心"
          title="让企业先选标准模板，再决定采购还是继续定制"
          description="模板会把适用场景、能力标签、价格带和交互方式讲清楚，降低企业第一次下单的门槛。"
          action={
            <Link to="/templates" className="button-secondary">
              查看全部模板
              <ArrowRight size={16} className="ml-2" />
            </Link>
          }
        />

        <div className="mt-10 grid gap-5 xl:grid-cols-3">
          {templates.length ? (
            templates.slice(0, 3).map((template) => (
              <TemplateSpotlightCard key={template.id} template={template} />
            ))
          ) : (
            <div className="xl:col-span-3">
              <EmptyState title="模板中心正在准备中" description="模板数据加载完成后，这里会自动展示适合企业快速决策的标准方案。" />
            </div>
          )}
        </div>
      </section>

      <section className="section-shell pt-4">
        <SectionHeader
          eyebrow="宣传图库"
          title="先用视觉素材建立信任，再带动详情页与下单转化"
          description="每个智能体都支持多张宣传图和 Demo 图，首页可以直接承担品牌展示与方案种草的任务。"
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          {promoGallery.length ? (
            <>
              <div className="glass-card card-hover overflow-hidden">
                <div className="relative h-[480px] overflow-hidden">
                  <SmartImage
                    src={promoGallery[0].image}
                    alt={promoGallery[0].name}
                    className="h-full w-full object-cover"
                    fallbackClassName="h-full w-full"
                    label="宣传图"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-aurora/80 via-aurora/10 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <div className="data-chip border-white/20 bg-white/12 text-white">{promoGallery[0].category}</div>
                    <div className="mt-4 font-display text-4xl font-semibold">{promoGallery[0].name}</div>
                    <div className="mt-2 max-w-xl text-sm leading-7 text-white/78">
                      可用于首页主视觉、详情辅助图、案例展示图和阶段性投放素材。
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {promoGallery.slice(1).map((item) => (
                  <div key={item.id} className="glass-card card-hover overflow-hidden">
                    <div className="relative h-[228px] overflow-hidden">
                      <SmartImage
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        fallbackClassName="h-full w-full"
                        label="宣传图"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-aurora/78 via-aurora/10 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="text-xs uppercase tracking-[0.22em] text-white/68">{item.category}</div>
                        <div className="mt-2 font-display text-2xl font-semibold">{item.name}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="lg:col-span-2">
              <EmptyState title="宣传图库暂未生成" description="智能体一旦带有多张展示图，这里会自动汇总品牌展示素材。" />
            </div>
          )}
        </div>
      </section>

      <section className="section-shell pt-4">
        <div className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
          <div className="section-tint p-8">
            <div className="relative z-10">
              <div className="data-chip">Platform Value</div>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink">
                借鉴国际大型 SaaS 的清爽感，但服务中国智能体交易场景
              </h2>
              <p className="mt-4 text-base leading-8 text-ink/66">
                我们把 Stripe、Vercel、OpenAI 一类产品的高级感，转化成更适合智能体交易平台的表达方式：
                层级清楚、留白充足、按钮信号明确、信息可信。
              </p>
              <div className="mt-6 space-y-3">
                {valuePillars.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-[1.4rem] border border-white/80 bg-white/78 px-4 py-3">
                    <BadgeCheck size={17} className="mt-0.5 text-tide" />
                    <span className="text-sm leading-6 text-ink/72">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {latest.length ? (
              latest.map((agent) => (
                <div key={agent.id} className="glass-card card-hover p-5">
                  <div className="eyebrow">{agent.category}</div>
                  <div className="mt-3 font-display text-2xl font-semibold text-ink">{agent.name}</div>
                  <p className="mt-3 text-sm leading-7 text-ink/66">{agent.summary}</p>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm font-semibold text-ink">¥{(agent.price / 100).toLocaleString("zh-CN")}</div>
                    <Link to={`/agents/${agent.id}`} className="text-sm font-semibold text-sky">
                      查看
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="md:col-span-3">
                <EmptyState title="还没有最新上架内容" description="智能体通过审核后，这里会自动展示新的上线项目。" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section-shell pt-4">
        <SectionHeader
          eyebrow="平台流程"
          title="一个高端前台，不只要好看，还要让浏览、信任和转化同时发生"
          description="首页要清楚说明平台是什么、谁在供给、企业如何采购、管理员如何审核，以及下一步该去哪里。"
          align="center"
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {workflow.map((item, index) => (
            <div key={item.title} className="glass-card card-hover p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mist text-sky">{item.icon}</div>
              <div className="mt-6 text-xs uppercase tracking-[0.26em] text-ink/42">Step 0{index + 1}</div>
              <div className="mt-3 font-display text-2xl font-semibold text-ink">{item.title}</div>
              <p className="mt-3 text-sm leading-7 text-ink/66">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function HeroStat({ label, value }) {
  return (
    <div className="rounded-[1.55rem] border border-white/80 bg-white/80 p-5 shadow-[0_18px_36px_rgba(8,17,31,0.06)]">
      <div className="text-sm text-ink/52">{label}</div>
      <div className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">{value}</div>
    </div>
  );
}

function QuickPortal({ title, text, to, icon }) {
  return (
    <Link to={to} className="glass-card card-hover p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mist text-sky">{icon}</div>
      <div className="mt-5 font-display text-2xl font-semibold text-ink">{title}</div>
      <p className="mt-3 text-sm leading-7 text-ink/66">{text}</p>
      <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky">
        进入
        <ArrowRight size={16} />
      </div>
    </Link>
  );
}

function TemplateSpotlightCard({ template }) {
  const orderUrl = template.agentId
    ? `/enterprise/orders/new?templateId=${template.id}&agentId=${template.agentId}`
    : `/enterprise/orders/new?templateId=${template.id}`;

  return (
    <article className="glass-card card-hover overflow-hidden">
      <div className="relative h-64 overflow-hidden">
        <SmartImage
          src={template.imageUrl || template.gallery?.[0]}
          alt={template.name}
          className="h-full w-full object-cover"
          fallbackClassName="h-full w-full"
          label="模板封面"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-aurora/82 via-aurora/15 to-transparent" />
        <div className="absolute left-5 top-5">
          <span className="data-chip border-white/20 bg-white/12 text-white">
            <Blocks size={14} />
            {template.category}
          </span>
        </div>
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <div className="font-display text-3xl font-semibold">{template.name}</div>
          <div className="mt-2 text-sm leading-7 text-white/78">{template.summary}</div>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="flex flex-wrap gap-2">
          {(template.capabilities || []).map((item) => (
            <span key={item} className="pill-filter border border-white/80 bg-white/78 text-ink/72">
              {item}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-[1.4rem] border border-white/80 bg-white/78 px-4 py-3">
          <div>
            <div className="text-sm text-ink/52">推荐价格</div>
            <div className="mt-1 font-display text-2xl font-semibold text-ink">
              ¥{(template.recommendedPrice / 100).toLocaleString("zh-CN")}
            </div>
          </div>
          <div className="text-right text-sm leading-6 text-ink/60">预计 {template.deliveryDays} 天可完成首版交付</div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to={orderUrl} className="button-primary">
            套用模板下单
          </Link>
          <Link to="/templates" className="button-secondary">
            查看详情
          </Link>
        </div>
      </div>
    </article>
  );
}
