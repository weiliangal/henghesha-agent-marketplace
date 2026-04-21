import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  FileCheck2,
  Handshake,
  Layers3,
  LineChart,
  Rocket,
  Scale,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";

const stageItems = [
  {
    title: "MVP 建设期",
    text: "围绕项目展示、模板选择、企业需求、订单协作和后台审核形成可运行的基础链路。",
  },
  {
    title: "项目试点期",
    text: "通过高校团队、企业需求和平台协助交付，验证不同类型智能体项目的真实适配度。",
  },
  {
    title: "资源验证期",
    text: "持续确认供给质量、企业需求密度、交付组织能力与平台审核机制的匹配关系。",
  },
];

const validationItems = [
  {
    title: "供给验证",
    text: "筛选高校团队、企业创作者、AI 工作室和行业专家的项目能力，建立基础分级与审核标准。",
  },
  {
    title: "需求验证",
    text: "从企业咨询、模板选择、定制需求和试点订单中判断真实业务场景与采购意愿。",
  },
  {
    title: "交付验证",
    text: "通过需求确认、任务拆解、阶段验收和售后反馈，验证智能体项目从展示到交付的闭环能力。",
  },
];

const focusCards = [
  { icon: ShieldCheck, title: "智能体项目质量管理", text: "建立审核、分级、说明文档和上线标准，让企业看到更清晰的能力边界。" },
  { icon: BadgeCheck, title: "企业客户信任建设", text: "通过案例、验收标准和平台协助交付，降低企业首次合作的不确定感。" },
  { icon: ClipboardCheck, title: "交易闭环验证", text: "持续验证从浏览、咨询、下单、确认支付到交付反馈的完整流程。" },
  { icon: Layers3, title: "标准化交付体系建设", text: "沉淀需求模板、交付节点、验收口径和售后响应机制。" },
  { icon: Scale, title: "知识产权与授权管理", text: "明确项目授权、署名、归属和商业使用范围，保障参与方权益。" },
  { icon: UsersRound, title: "创作者生态补充", text: "引入高校团队、企业创作者、AI 工作室和行业专家联合供给。" },
  { icon: LineChart, title: "流量与品牌建设", text: "围绕高校试点、企业 BD、社群运营和案例传播逐步积累可信曝光。" },
  { icon: Compass, title: "与大型平台的差异化定位", text: "聚焦高校成果转化、垂直行业交付和平台协助落地服务。" },
];

const mechanisms = [
  ["项目质量不稳定", "审核、分级、评分和交付标准"],
  ["企业信任不足", "成功案例、平台协助交付和项目验收"],
  ["高校项目商业化经验不足", "企业创作者、行业专家和 AI 工作室联合交付"],
  ["平台早期流量有限", "高校试点、企业 BD、社群运营和案例传播"],
  ["交易流程尚未完全自动化", "人工撮合，后续上线订单系统"],
  ["技术壁垒初期不高", "行业模板、交付流程、项目数据和客户案例"],
  ["知识产权风险", "授权、署名、归属和商业使用确认机制"],
  ["交付管理复杂", "需求确认、任务拆解、阶段验收和售后反馈流程"],
  ["创作者供给不足", "高校团队、企业创作者、AI 工作室和行业专家"],
  ["大厂竞争压力", "聚焦高校成果转化和垂直行业交付服务"],
];

const timeline = [
  {
    phase: "第一阶段",
    title: "基础展示与试点验证",
    text: "完善项目广场、模板中心、案例展示和需求入口，验证高校成果与企业场景的匹配方式。",
  },
  {
    phase: "第二阶段",
    title: "订单与交付体系建设",
    text: "强化订单状态、支付确认、派单协作、阶段验收和交付记录，提升项目可追踪性。",
  },
  {
    phase: "第三阶段",
    title: "创作者生态扩展",
    text: "补充高校团队、行业专家、企业创作者和 AI 工作室，形成更稳定的服务供给网络。",
  },
  {
    phase: "第四阶段",
    title: "行业解决方案沉淀",
    text: "围绕教育、企业服务、文旅、科研协作等方向沉淀模板、案例和交付方法。",
  },
];

const commitments = [
  "不夸大项目能力",
  "不擅自使用学校与企业名义",
  "不让未成熟项目直接进入高风险交付",
  "保障创作者合理权益",
  "优先建立真实案例",
];

export default function ProgressPage() {
  return (
    <div className="bg-sand">
      <section className="section-shell pt-14 sm:pt-20">
        <div className="hero-panel overflow-hidden">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.08fr_0.92fr] lg:p-12">
            <div>
              <div className="section-label">平台建设说明</div>
              <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-6xl">
                平台建设进展与保障机制
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-9 text-ink/66">
                我们正在建立一个更可信、更规范、更可交付的智能体交易与转化平台。当前平台仍处于持续建设阶段，
                会以审慎、透明和可验证的方式推进项目上线、企业需求、交易协作与交付保障。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/school/upload" className="button-primary">
                  提交智能体项目
                  <ArrowRight size={16} className="ml-2" />
                </Link>
                <Link to="/enterprise/orders/new" className="button-secondary">
                  发布企业需求
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <div className="grid gap-4">
                {stageItems.map((item, index) => (
                  <div key={item.title} className="rounded-[22px] border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky/10 text-sm font-semibold text-sky">
                        {index + 1}
                      </span>
                      <h2 className="font-display text-lg font-semibold text-ink">{item.title}</h2>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-ink/62">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <Header
          eyebrow="当前平台阶段"
          title="MVP 建设期 + 项目试点期 + 资源验证期"
          text="平台会从供给、需求和交付三个方向持续验证，优先建立真实案例和可复用的协作机制。"
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {validationItems.map((item) => (
            <div key={item.title} className="surface-panel card-hover p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky/10 text-sky">
                <FileCheck2 size={20} />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-ink/62">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <Header
          eyebrow="当前建设重点"
          title="围绕质量、信任、交易和交付建立平台基础能力"
          text="平台不会只做项目陈列，而是逐步补齐项目审核、需求撮合、交付协作、权益确认和案例沉淀。"
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {focusCards.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="surface-panel card-hover p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-sky">
                  <Icon size={20} />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold leading-7 text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink/62">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section-shell">
        <div className="section-tint p-5 sm:p-7 lg:p-8">
          <Header
            eyebrow="阶段性挑战与解决机制"
            title="以机制化方式降低早期合作的不确定性"
            text="平台会把阶段性挑战拆解为可管理的流程动作，通过审核、撮合、验收、授权和案例沉淀逐步完善。"
          />
          <div className="mt-8 overflow-hidden rounded-[24px] border border-slate-200 bg-white">
            <div className="hidden grid-cols-[0.95fr_1.25fr] bg-slate-50 px-6 py-4 text-sm font-semibold text-ink/56 md:grid">
              <div>当前建设场景</div>
              <div>解决机制</div>
            </div>
            <div className="divide-y divide-slate-200">
              {mechanisms.map(([challenge, mechanism]) => (
                <div key={challenge} className="grid gap-3 px-5 py-5 md:grid-cols-[0.95fr_1.25fr] md:px-6">
                  <div className="flex items-start gap-3 text-sm font-semibold text-ink">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-sky" />
                    {challenge}
                  </div>
                  <div className="text-sm leading-7 text-ink/64">{mechanism}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <Header
          eyebrow="近期平台完善计划"
          title="分阶段推进，从展示验证走向可交付体系"
          text="平台会先把基础链路做稳，再逐步扩展创作者生态和行业解决方案，避免过早承诺难以保障的服务范围。"
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-4">
          {timeline.map((item, index) => (
            <div key={item.title} className="surface-panel relative p-6">
              <div className="flex items-center justify-between gap-4">
                <span className="section-label">{item.phase}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky text-sm font-semibold text-white">
                  {index + 1}
                </span>
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold text-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-ink/62">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="surface-panel p-6 sm:p-8">
            <div className="section-label">平台承诺</div>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink">
              先建立真实可信的合作基础，再逐步扩大平台规模
            </h2>
            <p className="mt-4 text-base leading-8 text-ink/64">
              平台会以项目真实能力、交付边界和参与方权益为基础推进合作，优先把可验证、可复盘、可持续的案例做扎实。
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {commitments.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-[22px] border border-slate-200 bg-white p-5">
                <CheckCircle2 className="mt-0.5 text-sky" size={20} />
                <span className="text-sm font-semibold leading-7 text-ink">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell pb-20">
        <div className="rounded-[32px] bg-ink p-7 text-white sm:p-9 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="eyebrow text-white/45">参与平台建设</div>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                欢迎高校团队、企业客户和创作者共同完善平台生态
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-white/68">
                你可以提交智能体项目、发布企业需求，或申请成为创作者。平台会根据项目成熟度、需求匹配度和交付条件进行协助推进。
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link to="/school/upload" className="button-ghost">
                <Rocket size={16} className="mr-2" />
                提交智能体项目
              </Link>
              <Link to="/enterprise/orders/new" className="button-ghost">
                <Building2 size={16} className="mr-2" />
                发布企业需求
              </Link>
              <Link to="/auth" className="button-ghost">
                <Handshake size={16} className="mr-2" />
                申请成为创作者
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Header({ eyebrow, title, text }) {
  return (
    <div className="max-w-3xl">
      <div className="section-label">{eyebrow}</div>
      <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-8 text-ink/64">{text}</p>
    </div>
  );
}
