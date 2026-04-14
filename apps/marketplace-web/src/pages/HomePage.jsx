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
    summary: "用于招生咨询、院系介绍与政策答疑的多轮问答智能体，适合高校官网、咨询台与社群场景。",
    tags: ["政策答疑", "招生咨询", "知识库接入"],
  },
  {
    key: "enterprise",
    image: "/showcase/enterprise-copilot.svg",
    category: "企业",
    title: "企业售前顾问",
    summary: "围绕产品资料、服务条款和行业方案进行信息检索与问答，适合销售、咨询与客户成功团队使用。",
    tags: ["售前咨询", "方案匹配", "企业知识库"],
  },
  {
    key: "culture",
    image: "/showcase/cultural-guide.svg",
    category: "文旅",
    title: "文旅讲解官",
    summary: "适用于景区、展馆和城市文旅服务的导览智能体，可结合路线推荐、讲解文本与多语输出。",
    tags: ["导览讲解", "多语服务", "路线推荐"],
  },
  {
    key: "lab",
    image: "/showcase/lab-operations.svg",
    category: "定制",
    title: "科研协作助手",
    summary: "面向实验室、研究团队与校企联合项目的流程辅助智能体，支持资料整理、任务提醒与交付归档。",
    tags: ["资料整理", "协作流转", "定制交付"],
  },
];

const serviceLanes = [
  {
    icon: <GraduationCap size={18} />,
    title: "对高校团队",
    text: "把项目简介、示例展示、交付方式与定价组织成标准化页面，帮助成果从研究展示走向对外服务。",
  },
  {
    icon: <Building2 size={18} />,
    title: "对企业客户",
    text: "通过项目广场、模板中心与需求表单快速判断是否适配当前业务，再决定采购现成方案或继续定制。",
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "对平台管理",
    text: "通过审核机制、订单状态与支付确认环节维持内容质量与交易秩序，形成可持续的平台运营结构。",
  },
];

const processSteps = [
  {
    icon: <GraduationCap size={18} />,
    title: "高校团队整理项目",
    description: "围绕应用场景、核心能力、交付边界与演示素材整理项目资料，形成可审核的标准页面。",
  },
  {
    icon: <BadgeCheck size={18} />,
    title: "平台审核并上线",
    description: "管理员确认内容完整度、交付说明和展示质量，统一决定项目是否进入公开广场。",
  },
  {
    icon: <Building2 size={18} />,
    title: "企业评估与下单",
    description: "企业从项目广场或模板中心进入详情页，对比方案后直接采购或提交定制需求。",
  },
  {
    icon: <Workflow size={18} />,
    title: "交付协作与跟进",
    description: "订单进入状态流转，平台协助高校与企业完成沟通、支付确认和交付收口。",
  },
];

const credibilityPoints = [
  "按角色拆分高校、企业与管理员入口，采购链路更清晰。",
  "项目展示围绕场景、能力、交付方式与报价组织，不靠夸张词汇堆砌。",
  "先提供标准化采购与模板入口，再延展到定制合作与长期交付。",
];

function formatCurrency(value) {
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
      const searchPass = !term || [agent.name, agent.summary, agent.description].join(" ").toLowerCase().includes(term);
      return categoryPass && searchPass;
    });
  }, [agents, category, deferredSearch]);

  const featured = filtered.filter((agent) => agent.featured);
  const curated = (featured.length ? featured : filtered).slice(0, 6);
  const latest = overview?.latestAgents?.slice(0, 4) || [];
  const stats = overview?.stats || {};

  return (
    <>
      <section className="section-shell pb-8">
        <div className="hero-panel p-7 sm:p-8 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <div className="space-y-8 animate-rise-in-delay-1">
              <div className="section-label">高校成果转化与企业智能体服务平台</div>

              <div className="space-y-5">
                <h1 className="max-w-4xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink md:text-5xl xl:text-6xl">
                  让智能体项目从研究展示走向
                  <span className="block text-sky">可采购、可交付、可持续合作</span>
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-ink/66">
                  恒河沙智能体交易网面向高校团队、企业客户与合作伙伴，提供项目展示、模板采购、需求提交、
                  审核上线与订单协作的一体化平台入口，让智能体成果以更专业、更可信的方式进入真实业务场景。
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/agents" className="button-primary">
                  浏览项目广场
                </Link>
                <Link to="/enterprise/orders/new" className="button-secondary">
                  提交企业需求
                  <ArrowRight size={16} className="ml-2" />
                </Link>
                <Link to="/school/upload" className="button-secondary">
                  高校团队入驻
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard label="已上线项目" value={`${stats.approvedAgents ?? agents.length}+`} note="覆盖教育、企业与文旅场景" />
                <MetricCard label="高校团队" value={`${stats.schoolUsers ?? 0}+`} note="支持项目上架与持续更新" />
                <MetricCard label="企业需求" value={`${stats.orderCount ?? 0}+`} note="围绕采购、定制与交付协作" />
              </div>
            </div>

            <div className="grid gap-4 animate-rise-in-delay-2">
              <div className="section-tint p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="eyebrow">平台定位</div>
                    <div className="mt-3 font-display text-2xl font-semibold text-ink">更像真实企业服务平台，而不是作品陈列页</div>
                  </div>
                  <LayoutPanelTop size={18} className="text-sky" />
                </div>
                <div className="mt-5 space-y-3">
                  {credibilityPoints.map((item) => (
                    <div key={item} className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-ink/68">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <EntryCard
                  icon={<Building2 size={18} />}
                  title="企业采购入口"
                  text="从项目广场和模板中心进入，快速判断是否适配，再提交需求或直接采购。"
                  to="/enterprise/orders/new"
                />
                <EntryCard
                  icon={<Bot size={18} />}
                  title="高校团队入口"
                  text="围绕项目简介、演示素材与交付边界整理信息，进入平台审核流程。"
                  to="/school/upload"
                />
              </div>
            </div>
          </div>

          <div className="soft-divider mt-10 pt-8">
            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="surface-panel p-5">
                <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/32" size={18} />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="搜索项目名称、适用场景或能力关键词"
                      className="input-base pl-11"
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-ink/70">
                    共 {filtered.length} 个结果
                  </div>
                  <Link to="/templates" className="button-secondary">
                    去模板中心
                  </Link>
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

              <div className="surface-panel p-5">
                <div className="eyebrow">合作方式</div>
                <div className="mt-3 text-base leading-8 text-ink/66">
                  企业可先采购标准项目，也可通过模板提交需求单；高校团队则以标准化项目页面方式入驻平台。
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pt-2">
        <SectionHeader
          eyebrow="精选场景"
          title="围绕真实业务场景组织项目展示，而不是按“AI 功能标签”堆砌页面"
          description="首页先展示平台能够承接的典型项目类型，让高校团队知道如何包装成果，也让企业客户更快完成判断。"
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {showcaseProjects.map((project) => (
            <ShowcaseProjectCard key={project.key} project={project} />
          ))}
        </div>
      </section>

      <section className="section-shell pt-2">
        <SectionHeader
          eyebrow="项目广场"
          title="既能展示成熟项目，也能承接企业定制需求"
          description="项目卡片不只展示封面与价格，还应帮助企业快速判断提供方、审核状态和是否适合立即沟通。"
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
                description="可以切换分类、调整关键词，或直接提交企业需求让平台协助匹配。"
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

      <section className="section-shell pt-2">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="section-tint p-8">
            <div className="section-label">平台价值</div>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink">
              用更克制、更可信的方式组织项目内容，提升合作效率
            </h2>
            <p className="mt-4 text-base leading-8 text-ink/66">
              平台重点不是展示技术炫目感，而是帮助高校团队更规范地对外呈现项目，也帮助企业客户更清晰地完成筛选、采购与沟通。
            </p>

            <div className="mt-6 space-y-4">
              {serviceLanes.map((item) => (
                <div key={item.title} className="surface-panel p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-sky">{item.icon}</div>
                    <div className="font-semibold text-ink">{item.title}</div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-ink/66">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {latest.length ? (
              latest.map((agent) => (
                <article key={agent.id} className="surface-panel card-hover p-6">
                  <div className="eyebrow">{agent.category}</div>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-ink">{agent.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-ink/66">{agent.summary}</p>
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
                <EmptyState title="暂时没有最新项目" description="项目通过审核后，这里会自动展示最近上线内容。" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section-shell pt-2">
        <SectionHeader
          eyebrow="合作流程"
          title="把高校供给、企业采购与平台审核组织成一条清晰的业务链路"
          description="不是简单的内容陈列，而是从项目整理、审核上线到企业决策和交付协作的完整流程。"
          align="center"
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {processSteps.map((item, index) => (
            <article key={item.title} className="surface-panel card-hover p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-sky">{item.icon}</div>
              <div className="mt-6 text-xs uppercase tracking-[0.24em] text-ink/42">Step 0{index + 1}</div>
              <h3 className="mt-3 font-display text-2xl font-semibold text-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-ink/66">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell pt-2">
        <SectionHeader
          eyebrow="模板中心"
          title="先用标准模板降低决策成本，再转向企业定制"
          description="模板不是另一个展示页，而是帮助企业快速理解范围、预算与交付周期的采购入口。"
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
              <EmptyState title="模板内容准备中" description="模板数据准备完成后，这里会自动展示可直接用于企业下单的标准方案。" />
            </div>
          )}
        </div>
      </section>

      <section className="section-shell pt-2">
        <div className="hero-panel p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="section-label">开始合作</div>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
                如果你已经有项目或需求，现在就可以进入下一步
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-ink/66">
                企业可提交采购或定制需求，高校团队可直接入驻并上传项目资料。平台会保持现有页面结构与流程逻辑，同时持续优化内容组织与视觉体验。
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <EntryCard icon={<Building2 size={18} />} title="企业需求提交" text="围绕预算、交付周期和业务目标发起采购或定制流程。" to="/enterprise/orders/new" />
              <EntryCard icon={<Blocks size={18} />} title="高校团队入驻" text="提交团队项目、展示材料和交付说明，进入平台审核。" to="/school/upload" />
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
      <div className="text-sm text-ink/50">{label}</div>
      <div className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">{value}</div>
      <div className="mt-2 text-sm leading-6 text-ink/56">{note}</div>
    </div>
  );
}

function EntryCard({ icon, title, text, to }) {
  return (
    <Link to={to} className="surface-panel card-hover p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-sky">{icon}</div>
      <div className="mt-5 font-display text-2xl font-semibold text-ink">{title}</div>
      <p className="mt-3 text-sm leading-7 text-ink/66">{text}</p>
      <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky">
        进入
        <ArrowRight size={16} />
      </div>
    </Link>
  );
}

function ShowcaseProjectCard({ project }) {
  return (
    <article className="glass-card overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="border-b border-slate-200 bg-slate-50 lg:border-b-0 lg:border-r">
          <img src={project.image} alt={project.title} className="h-full w-full object-cover" />
        </div>
        <div className="p-6 lg:p-7">
          <div className="section-label">{project.category}</div>
          <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">{project.title}</h3>
          <p className="mt-4 text-sm leading-7 text-ink/66">{project.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-ink/58">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/agents" className="button-secondary">
              查看同类项目
            </Link>
            <Link to="/enterprise/orders/new" className="text-sm font-semibold text-sky">
              提交需求
            </Link>
          </div>
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
      <h3 className="mt-4 font-display text-3xl font-semibold text-ink">{template.name}</h3>
      <p className="mt-4 text-sm leading-7 text-ink/66">{template.summary}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {(template.capabilities || []).map((item) => (
          <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-ink/58">
            {item}
          </span>
        ))}
      </div>

      <div className="mt-6 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm text-ink/50">参考价格</div>
        <div className="mt-2 font-display text-3xl font-semibold text-ink">{formatCurrency(template.recommendedPrice)}</div>
        <div className="mt-2 text-sm text-ink/56">预计 {template.deliveryDays} 天交付首版</div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to={orderUrl} className="button-primary">
          使用模板下单
        </Link>
        <Link to="/templates" className="button-secondary">
          查看模板详情
        </Link>
      </div>
    </article>
  );
}
