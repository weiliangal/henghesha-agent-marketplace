import { ArrowRight, Blocks, MessagesSquare, MonitorPlay, Workflow } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../api/client";
import EmptyState from "../components/EmptyState";
import SectionHeader from "../components/SectionHeader";
import SmartImage from "../components/SmartImage";

const caseFallbackImages = {
  教育: "/showcase/campus-services.svg",
  企业: "/showcase/service-console.svg",
  文旅: "/showcase/cultural-guide.svg",
  定制: "/showcase/knowledge-ops.svg",
};

export default function CasesPage() {
  const [cases, setCases] = useState([]);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    Promise.all([apiRequest("/agents"), apiRequest("/site/templates")]).then(([agentsData, templatesData]) => {
      setCases(agentsData.agents || []);
      setTemplates(templatesData.templates || []);
    });
  }, []);

  const templateMap = useMemo(() => {
    const map = new Map();
    for (const template of templates) {
      if (!map.has(template.category)) {
        map.set(template.category, template);
      }
    }
    return map;
  }, [templates]);

  return (
    <section className="section-shell">
      <div className="hero-panel p-7 sm:p-8 lg:p-10">
        <SectionHeader
          eyebrow="成功案例"
          title="用真实业务场景和交付边界说明项目价值，而不是只展示效果"
          description="案例页重点帮助企业理解项目适用场景、交互方式、上线成熟度以及是否适合继续采购或定制。"
          action={
            <Link to="/templates" className="button-secondary">
              先看模板中心
              <ArrowRight size={16} className="ml-2" />
            </Link>
          }
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {cases.length ? (
          cases.map((item) => {
            const matchedTemplate = templateMap.get(item.category);
            const orderUrl = matchedTemplate
              ? `/enterprise/orders/new?templateId=${matchedTemplate.id}&agentId=${item.id}`
              : `/enterprise/orders/new?agentId=${item.id}`;

            return (
              <article key={item.id} className="surface-panel overflow-hidden p-0">
                <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
                  <div className="border-b border-slate-200 bg-slate-50 md:border-b-0 md:border-r">
                    <SmartImage
                      src={getCaseVisual(item, matchedTemplate)}
                      alt={`${item.name} 案例`}
                      className="h-full min-h-[320px] w-full object-cover"
                      fallbackClassName="h-full min-h-[320px] w-full"
                      label="案例封面"
                    />
                  </div>

                  <div className="p-6">
                    <div className="section-label">{item.category}</div>
                    <h2 className="mt-4 font-display text-3xl font-semibold text-ink">{item.name}</h2>
                    <p className="mt-3 text-sm leading-7 text-ink/64">{item.description}</p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <MiniMetric icon={<MessagesSquare size={16} />} title="交互方式" text="多轮问答与业务咨询" />
                      <MiniMetric icon={<Workflow size={16} />} title="协作流程" text="支持下单、审核与交付" />
                      <MiniMetric icon={<MonitorPlay size={16} />} title="展示素材" text={`${Math.max(item.demoImageUrls?.length || 0, 1)} 组案例图`} />
                    </div>

                    <div className="mt-5 rounded-[20px] border border-slate-200 bg-slate-50 p-5">
                      <div className="text-sm font-semibold text-ink">适用场景</div>
                      <div className="mt-2 text-sm leading-7 text-ink/62">{item.summary}</div>
                    </div>

                    {matchedTemplate ? (
                      <div className="mt-5 rounded-[20px] border border-slate-200 bg-white p-5">
                        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                          <span className="text-sky">
                            <Blocks size={16} />
                          </span>
                          推荐模板
                        </div>
                        <div className="mt-3 font-display text-2xl font-semibold text-ink">{matchedTemplate.name}</div>
                        <p className="mt-2 text-sm leading-7 text-ink/62">{matchedTemplate.summary}</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <Link to="/templates" className="button-secondary">
                            去模板中心
                          </Link>
                          <Link to={orderUrl} className="button-primary">
                            采用该模板下单
                          </Link>
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link to={`/agents/${item.id}`} className="button-secondary">
                        查看项目详情
                      </Link>
                      <Link to={orderUrl} className="button-primary">
                        立即采购 / 定制
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="lg:col-span-2">
            <EmptyState title="暂时没有案例" description="项目通过审核并补充展示素材后，这里会自动呈现相应案例内容。" />
          </div>
        )}
      </div>

      <div className="mt-16">
        <SectionHeader
          eyebrow="模板延展"
          title="如果案例已经接近你的目标场景，可以直接从模板继续推进"
          description="模板会提供预算参考、交互结构和建议交付周期，让企业从案例页就能进入采购流程。"
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.length ? (
            templates.slice(0, 3).map((template) => (
              <div key={template.id} className="surface-panel overflow-hidden p-0">
                <div className="h-52 overflow-hidden border-b border-slate-200 bg-slate-50">
                  <SmartImage
                    src={template.imageUrl || template.gallery?.[0] || caseFallbackImages[template.category] || "/showcase/policy-advisor.svg"}
                    alt={template.name}
                    className="h-full w-full object-cover"
                    fallbackClassName="h-full w-full"
                    label="模板封面"
                  />
                </div>

                <div className="p-5">
                  <div className="section-label">{template.category}</div>
                  <h3 className="mt-4 font-display text-2xl font-semibold text-ink">{template.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-ink/64">{template.summary}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink">{formatCurrency(template.recommendedPrice)}</span>
                    <Link
                      to={`/enterprise/orders/new?templateId=${template.id}${template.agentId ? `&agentId=${template.agentId}` : ""}`}
                      className="text-sm font-semibold text-sky"
                    >
                      直接采用
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 xl:col-span-3">
              <EmptyState title="模板数据暂未加载" description="模板准备完成后，这里会自动显示推荐模板。" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function MiniMetric({ icon, title, text }) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink/42">
        {icon}
        {title}
      </div>
      <div className="mt-2 text-sm font-semibold text-ink">{text}</div>
    </div>
  );
}

function getCaseVisual(item, matchedTemplate) {
  return (
    item.demoImageUrls?.[0] ||
    item.imageUrls?.[0] ||
    matchedTemplate?.imageUrl ||
    matchedTemplate?.gallery?.[0] ||
    caseFallbackImages[item.category] ||
    "/showcase/service-console.svg"
  );
}

function formatCurrency(value) {
  if (!value) {
    return "待评估";
  }
  return `¥${(value / 100).toLocaleString("zh-CN")}`;
}
