import {
  ArrowRight,
  BadgeCheck,
  Blocks,
  Bot,
  Building2,
  ChevronRight,
  CircleDollarSign,
  GraduationCap,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../api/client";
import AgentCard from "../components/AgentCard";
import AgentSkeleton from "../components/AgentSkeleton";
import EmptyState from "../components/EmptyState";
import SectionHeader from "../components/SectionHeader";

const categories = ["全部", "教育", "企业", "文旅", "定制"];

const showcaseProjects = [
  {
    key: "admissions",
    image: "/showcase/admissions-assistant.svg",
    category: "教育",
    title: "招生问答助手",
    summary: "面向高校招生、继续教育和国际合作咨询，支持政策问答、资料检索、线索收集与人工转接。",
    tags: ["招生咨询", "政策问答", "知识库接入"],
  },
  {
    key: "enterprise",
    image: "/showcase/enterprise-copilot.svg",
    category: "企业",
    title: "企业售前顾问",
    summary: "围绕产品资料、服务条款和行业方案进行信息检索与问答，适合销售、咨询和客户成功团队。",
    tags: ["售前咨询", "方案匹配", "企业知识库"],
  },
  {
    key: "culture",
    image: "/showcase/cultural-guide.svg",
    category: "文旅",
    title: "文旅讲解官",
    summary: "适用于景区、展馆和城市文旅服务，可结合路线推荐、讲解文本、多语言输出与内容运营。",
    tags: ["导览讲解", "多语服务", "路线推荐"],
  },
  {
    key: "lab",
    image: "/showcase/lab-operations.svg",
    category: "定制",
    title: "科研协作助手",
    summary: "面向实验室、研究团队与校企联合项目，辅助资料整理、任务提醒、会议纪要和交付归档。",
    tags: ["资料整理", "协作流转", "定制交付"],
  },
];

const platformHighlights = [
  {
    icon: <GraduationCap size={18} />,
    title: "高校成果入库",
    text: "将项目介绍、Prompt、演示素材、授权边界和交付说明整理成可审核、可采购的标准化项目页。",
  },
  {
    icon: <BadgeCheck size={18} />,
    title: "平台审核分级",
    text: "围绕可用性、交付边界、资料完整度和商业风险进行分级，让企业客户更容易做判断。",
  },
  {
    icon: <Building2 size={18} />,
    title: "企业需求撮合",
    text: "企业可以从项目库、模板中心或需求单进入，平台协助确认预算、周期和交付团队。",
  },
  {
    icon: <Workflow size={18} />,
    title: "订单协作交付",
    text: "从支付确认、任务拆解、阶段验收到账后交付，形成可追踪的交易闭环。",
  },
];

const serviceLanes = [
  {
    icon: <GraduationCap size={18} />,
    title: "高校与创作者",
    text: "将研究成果、课程项目和 AI 工作流整理成可展示、可报价、可交付的商品化页面。",
  },
  {
    icon: <Building2 size={18} />,
    title: "企业采购方",
    text: "快速筛选智能体项目与模板，先确认场景适配，再进入采购、定制或试点合作。",
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "平台保障方",
    text: "通过审核、授权、人工撮合、付款确认和交付验收，降低早期交易的不确定性。",
  },
];

const processSteps = [
  {
    icon: <GraduationCap size={18} />,
    title: "项目整理",
    description: "高校团队补充场景说明、能力边界、Demo 截图、交付方式和参考报价。",
  },
  {
    icon: <BadgeCheck size={18} />,
    title: "审核上线",
    description: "平台确认内容完整度、授权说明与交付可行性，再进入公开项目广场。",
  },
  {
    icon: <Building2 size={18} />,
    title: "企业评估",
    description: "企业围绕预算、周期和业务目标选择现成项目、模板或定制开发。",
  },
  {
    icon: <Workflow size={18} />,
    title: "协作交付",
    description: "订单进入状态流转，平台协助完成付款确认、派单、验收和售后反馈。",
  },
];

const credibilityPoints = [
  "项目不只展示概念，而是补充交付边界、案例素材、报价和服务方式。",
  "企业可以通过模板先建立需求轮廓，再由平台协助匹配高校团队或创作者。",
  "平台将持续沉淀行业模板、交付标准、授权说明和真实案例。",
];

function formatCurrency(value = 0) {
  return `¥${(value / 100).toLocaleString("zh-CN")}`;
}

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
      const haystack = [agent.name, agent.summary, agent.description, agent.category].filter(Boolean).join(" ").toLowerCase();
      return categoryPass && (!term || haystack.includes(term));
    });
  }, [agents, category, deferredSearch]);

  const featured = filtered.filter((agent) => agent.featured);
  const curated = (featured.length ? featured : filtered).slice(0, 6);
  const latest = overview?.latestAgents?.slice(0, 4) || [];
  const stats = overview?.stats || {};

  return (
    <>
      <section className="section-shell pb-8 pt-8">
        <div className="hero-panel overflow-hidden">
          <div className="grid gap-10 p-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10 xl:p-12">
            <div className="flex min-h-[640px] flex-col justify-between">
              <div className="space-y-8 animate-rise-in-delay-1">
                <div className="section-label">
                  <Sparkles size={14} />
                  Framer-like Premium Direction
                </div>

                <div className="space-y-6">
                  <h1 className="max-w-4xl font-display text-[3.2rem] font-semibold leading-[1.02] tracking-[-0.07em] text-ink sm:text-[4rem] lg:text-[4.6rem] xl:text-[5.35rem]">
                    让智能体成果
                    <span className="block text-ink/32">进入真实交易</span>
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-ink/64">
                    恒河沙智能体交易网连接高校团队、企业客户与 AI 创作者，将智能体项目从展示样例整理成可审核、可采购、可交付的商业化服务。
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link to="/agents" className="button-primary">
                    浏览智能体库
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                  <Link to="/enterprise/orders/new" className="button-secondary">
                    发布企业需求
                  </Link>
                  <Link to="/progress" className="button-secondary">
                    查看平台进展
                  </Link>
                </div>
              </div>

              <div className="mt-12 grid gap-3 sm:grid-cols-3">
                <MetricCard label="已上线项目" value={`${stats.approvedAgents ?? agents.length}+`} note="审核后展示" />
                <MetricCard label="试点场景" value="8+" note="教育、企业、文旅" />
                <MetricCard label="交付周期" value="7-30天" note="按项目拆解" />
              </div>
            </div>

            <div className="relative min-h-[640px] animate-rise-in-delay-2">
              <div className="absolute inset-0 rounded-[36px] bg-[radial-gradient(circle_at_30%_16%,rgba(91,141,239,0.35),transparent_30%),linear-gradient(135deg,#050b18,#082033_48%,#0f766e)]" />
              <div className="absolute inset-4 rounded-[30px] border border-white/12 bg-white/[0.04] p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between text-white/70">
                  <span className="text-xs font-semibold uppercase tracking-[0.32em]">Agent Exchange OS</span>
                  <Layers3 size={18} />
                </div>

                <div className="mt-10 space-y-4">
                  <div className="rounded-[28px] border border-white/12 bg-white/[0.08] p-6 text-white shadow-2xl shadow-black/20">
                    <div className="text-sm font-semibold uppercase tracking-[0.28em] text-white/45">Marketplace Flow</div>
                    <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em]">从项目、模板到订单交付</h2>
                    <p className="mt-4 max-w-sm text-sm leading-7 text-white/62">
                      平台把高校成果、企业需求、审核标准和交付状态组织成一条清晰的协作链路。
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <HeroMiniPanel label="Supply" title="学校工作台" text="上传项目、授权、查看线索" active />
                    <HeroMiniPanel label="Demand" title="企业入口" text="模板选择、发布需求、确认预算" />
                    <HeroMiniPanel label="Trust" title="平台审核" text="分级、定价、支付确认" />
                    <HeroMiniPanel label="Delivery" title="交付管理" text="阶段验收、售后反馈" active />
                  </div>
                </div>

                <div className="mt-4 rounded-[24px] border border-white/12 bg-white/90 p-4 text-ink shadow-2xl shadow-black/20">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">当前建设重点</div>
                      <div className="mt-1 text-sm font-semibold">质量审核、人工撮合、支付确认、标准交付</div>
                    </div>
                    <Link to="/progress" className="shrink-0 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white">
                      了解机制
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white/72 p-5 sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="surface-panel p-4">
                <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/32" size={18} />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="搜索智能体名称、行业场景或交付能力"
                      className="input-base pl-11"
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-ink/64">
                    共 {filtered.length} 个结果
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCategory(item)}
                      className={`pill-filter ${
                        item === category ? "border-ink bg-ink text-white" : "border-slate-200 bg-white text-ink/62 hover:text-ink"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="surface-panel p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-ink/36">Positioning</div>
                <p className="mt-3 text-sm leading-7 text-ink/64">
                  我们不把项目包装成“万能 AI 演示”，而是围绕需求、授权、价格、案例与交付边界建立交易信任。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <SectionHeader
          eyebrow="平台结构"
          title="不是简单作品陈列，而是面向采购决策的智能体交易系统"
          description="借鉴 Framer 的视觉节奏，但把内容重心放在交易可信度、场景匹配和交付闭环上。"
          align="center"
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {platformHighlights.map((item) => (
            <article key={item.title} className="surface-panel card-hover p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-white">{item.icon}</div>
              <h3 className="mt-6 font-display text-2xl font-semibold tracking-[-0.04em] text-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-ink/62">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div className="sticky-panel">
            <div className="section-label">精选场景</div>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-[-0.06em] text-ink md:text-5xl">
              项目展示要像真实服务，而不是 AI 作品墙
            </h2>
            <p className="mt-5 text-base leading-8 text-ink/64">
              首页优先展示企业能理解的场景：招生咨询、售前顾问、文旅讲解、科研协作。每个项目都需要明确适用对象、使用边界和交付方式。
            </p>
            <div className="mt-6 space-y-3">
              {credibilityPoints.map((item) => (
                <div key={item} className="rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-ink/64">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            {showcaseProjects.map((project, index) => (
              <ShowcaseProjectCard key={project.key} project={project} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <SectionHeader
          eyebrow="项目广场"
          title="用更清晰的卡片帮助企业完成筛选"
          description="项目卡片保留图片、价格、分类和审核状态，同时强化“提供方”和“可交付性”，让客户更像在浏览可采购服务。"
          action={
            <Link to="/agents" className="button-secondary">
              查看全部项目
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
                title="暂时没有匹配的项目"
                description="可以切换分类、调整关键词，或直接提交企业需求，让平台协助匹配。"
                action={
                  <Link to="/enterprise/orders/new" className="button-primary">
                    提交企业需求
                  </Link>
                }
              />
            </div>
          )}
        </div>
      </section>

      <section className="section-shell">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="dark-panel p-8 lg:p-10">
            <div className="section-label border-white/12 bg-white/10 text-white/70">服务对象</div>
            <h2 className="mt-6 font-display text-4xl font-semibold leading-tight tracking-[-0.06em] text-white md:text-5xl">
              平台同时服务供给、需求与交付三端
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">
              交易平台的核心不是页面漂亮，而是把角色、信息、审核和交付组织起来。视觉要高级，业务也要稳。
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {serviceLanes.map((item) => (
                <div key={item.title} className="rounded-[26px] border border-white/10 bg-white/[0.06] p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-ink">{item.icon}</div>
                  <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/58">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {latest.length ? (
              latest.map((agent) => (
                <article key={agent.id} className="surface-panel card-hover p-6">
                  <div className="section-label">{agent.category}</div>
                  <h3 className="mt-4 font-display text-2xl font-semibold tracking-[-0.04em] text-ink">{agent.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-ink/62">{agent.summary}</p>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm font-semibold text-ink">{formatCurrency(agent.price)}</div>
                    <Link to={`/agents/${agent.id}`} className="text-sm font-semibold text-sky">
                      查看项目
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="md:col-span-2">
                <EmptyState title="暂无最新项目" description="项目通过审核后，这里会自动展示最近上线内容。" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <SectionHeader
          eyebrow="合作流程"
          title="把高校供给、企业采购与平台审核组织成一条清晰链路"
          description="从项目整理、审核上线到企业评估和协作交付，每一步都有明确的业务状态，而不是只停留在展示层。"
          align="center"
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {processSteps.map((item, index) => (
            <article key={item.title} className="surface-panel card-hover p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-ink">{item.icon}</div>
                <span className="font-display text-4xl font-semibold tracking-[-0.08em] text-ink/10">0{index + 1}</span>
              </div>
              <h3 className="mt-6 font-display text-2xl font-semibold tracking-[-0.04em] text-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-ink/62">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <SectionHeader
          eyebrow="模板中心"
          title="先用标准模板降低沟通成本，再转向定制交付"
          description="模板不是另一个展示页，而是帮助企业快速明确预算、周期、能力范围和交付预期。"
          action={
            <Link to="/templates" className="button-secondary">
              查看模板中心
              <ArrowRight size={16} className="ml-2" />
            </Link>
          }
        />

        <div className="mt-10 grid gap-5 xl:grid-cols-3">
          {templates.length ? (
            templates.slice(0, 3).map((template) => <TemplateCard key={template.id} template={template} />)
          ) : (
            <div className="xl:col-span-3">
              <EmptyState title="模板内容准备中" description="模板数据准备完成后，这里会自动展示可用于企业下单的标准方案。" />
            </div>
          )}
        </div>
      </section>

      <section className="section-shell pt-4">
        <div className="cta-panel p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="section-label border-white/20 bg-white/10 text-white/72">开始合作</div>
              <h2 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-[-0.06em] text-white md:text-5xl">
                如果你已经有项目或需求，现在就可以进入下一步
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/64">
                企业可提交采购或定制需求，高校团队可上传项目资料。平台会围绕审核、匹配、付款和交付继续完善服务流程。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/enterprise/orders/new" className="button-light">
                发布企业需求
              </Link>
              <Link to="/school/upload" className="button-dark-outline">
                提交智能体项目
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function MetricCard({ label, value, note }) {
  return (
    <div className="metric-card">
      <div className="text-sm text-ink/48">{label}</div>
      <div className="mt-3 font-display text-3xl font-semibold tracking-[-0.05em] text-ink">{value}</div>
      <div className="mt-2 text-sm leading-6 text-ink/54">{note}</div>
    </div>
  );
}

function HeroMiniPanel({ label, title, text, active = false }) {
  return (
    <div className={`rounded-[26px] border p-5 ${active ? "border-white/18 bg-white text-ink" : "border-white/10 bg-white/[0.06] text-white"}`}>
      <div className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${active ? "text-ink/38" : "text-white/42"}`}>{label}</div>
      <div className="mt-4 font-display text-2xl font-semibold tracking-[-0.04em]">{title}</div>
      <p className={`mt-2 text-sm leading-6 ${active ? "text-ink/58" : "text-white/58"}`}>{text}</p>
    </div>
  );
}

function ShowcaseProjectCard({ project, index }) {
  return (
    <article className={`showcase-row ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
      <div className="showcase-visual">
        <img src={project.image} alt={project.title} loading="lazy" className="h-full w-full object-contain p-4" />
      </div>
      <div className="showcase-copy">
        <div className="section-label">{project.category}</div>
        <h3 className="mt-5 font-display text-4xl font-semibold tracking-[-0.06em] text-ink">{project.title}</h3>
        <p className="mt-4 text-base leading-8 text-ink/64">{project.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-ink/58">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link to="/agents" className="button-secondary">
            查看同类项目
          </Link>
          <Link to="/enterprise/orders/new" className="text-sm font-semibold text-sky">
            提交需求
          </Link>
        </div>
      </div>
    </article>
  );
}

function TemplateCard({ template }) {
  const orderUrl = template.agentId
    ? `/enterprise/orders/new?templateId=${template.id}&agentId=${template.agentId}`
    : `/enterprise/orders/new?templateId=${template.id}`;

  return (
    <article className="surface-panel card-hover p-6">
      <div className="section-label">{template.category}</div>
      <h3 className="mt-4 font-display text-3xl font-semibold tracking-[-0.05em] text-ink">{template.name}</h3>
      <p className="mt-4 text-sm leading-7 text-ink/62">{template.summary}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {(template.capabilities || []).map((item) => (
          <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-ink/58">
            {item}
          </span>
        ))}
      </div>

      <div className="mt-6 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2 text-sm text-ink/50">
          <CircleDollarSign size={16} />
          参考价格
        </div>
        <div className="mt-2 font-display text-3xl font-semibold tracking-[-0.05em] text-ink">
          {formatCurrency(template.recommendedPrice)}
        </div>
        <div className="mt-2 text-sm text-ink/56">预计 {template.deliveryDays} 天交付首版</div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to={orderUrl} className="button-primary">
          使用模板下单
        </Link>
        <Link to="/templates" className="button-secondary">
          查看详情
        </Link>
      </div>
    </article>
  );
}
