import { ArrowRight, Blocks, MessagesSquare, MonitorPlay, Workflow } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../api/client";
import EmptyState from "../components/EmptyState";
import SectionHeader from "../components/SectionHeader";
import SmartImage from "../components/SmartImage";

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
      <div className="hero-panel p-6 sm:p-8 lg:p-10">
        <div className="relative z-10">
          <SectionHeader
            eyebrow="成功案例"
            title="用更像国际产品网站的方式展示 Demo、场景与能力边界"
            description="案例页不是简单的图片堆叠，而是帮助企业在采购前快速理解智能体适用场景、交互方式和可落地程度。"
            action={
              <Link to="/templates" className="button-secondary">
                先看模板中心
                <ArrowRight size={16} className="ml-2" />
              </Link>
            }
          />
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {cases.length ? (
          cases.map((item, index) => {
            const matchedTemplate = templateMap.get(item.category);
            const orderUrl = matchedTemplate
              ? `/enterprise/orders/new?templateId=${matchedTemplate.id}&agentId=${item.id}`
              : `/enterprise/orders/new?agentId=${item.id}`;

            return (
              <article key={item.id} className="mesh-panel overflow-hidden">
                <div className={`relative z-10 grid gap-6 p-6 md:p-7 ${index % 2 === 0 ? "md:grid-cols-[0.95fr_1.05fr]" : "md:grid-cols-[1.05fr_0.95fr]"}`}>
                  <div className={`${index % 2 === 0 ? "" : "md:order-2"} space-y-4`}>
                    <div className="overflow-hidden rounded-[1.7rem]">
                      <SmartImage
                        src={item.demoImageUrls?.[0] || item.imageUrls?.[0]}
                        alt={`${item.name} 案例`}
                        className="h-full min-h-[300px] w-full object-cover"
                        fallbackClassName="h-full min-h-[300px] w-full"
                        label="案例图"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {[...(item.demoImageUrls || []), ...(item.imageUrls || [])]
                        .slice(0, 3)
                        .map((image, imageIndex) => (
                          <SmartImage
                            key={`${item.id}-${imageIndex}`}
                            src={image}
                            alt={`${item.name} 宣传图 ${imageIndex + 1}`}
                            className="h-24 w-full rounded-[1.1rem] object-cover"
                            fallbackClassName="h-24 w-full rounded-[1.1rem]"
                            label="宣传图"
                          />
                        ))}
                    </div>
                  </div>

                  <div className={`${index % 2 === 0 ? "" : "md:order-1"} space-y-5`}>
                    <div className="data-chip">{item.category}</div>
                    <h2 className="font-display text-3xl font-semibold text-ink">{item.name}</h2>
                    <p className="text-sm leading-7 text-ink/66">{item.description}</p>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <MiniMetric icon={<MessagesSquare size={16} />} title="交互方式" text="多轮问答与需求澄清" />
                      <MiniMetric icon={<Workflow size={16} />} title="流程形态" text="支持接单与转人工" />
                      <MiniMetric icon={<MonitorPlay size={16} />} title="展示素材" text={`${item.demoImageUrls?.length || 1} 组场景图`} />
                    </div>

                    <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(245,239,230,0.84),rgba(255,255,255,0.94))] p-5 text-sm leading-7 text-ink/68">
                      <div className="font-semibold text-ink">适配场景</div>
                      <div className="mt-2">{item.summary}</div>
                    </div>

                    {matchedTemplate ? (
                      <div className="rounded-[1.5rem] border border-white/80 bg-white/82 p-5">
                        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                          <span className="text-sky">
                            <Blocks size={16} />
                          </span>
                          推荐模板
                        </div>
                        <div className="mt-3 font-display text-2xl font-semibold text-ink">{matchedTemplate.name}</div>
                        <p className="mt-2 text-sm leading-7 text-ink/64">{matchedTemplate.summary}</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <Link to="/templates" className="button-secondary">
                            去模板中心
                          </Link>
                          <Link to={orderUrl} className="button-primary">
                            套用模板下单
                          </Link>
                        </div>
                      </div>
                    ) : null}

                    <div className="flex flex-wrap gap-3">
                      <Link to={`/agents/${item.id}`} className="button-secondary">
                        查看智能体详情
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
            <EmptyState title="暂时没有案例" description="学校上传并通过审核后，这里会自动展示对应的案例内容。" />
          </div>
        )}
      </div>

      <div className="mt-16">
        <SectionHeader
          eyebrow="模板延展"
          title="如果案例已经接近你的目标场景，可以直接从模板继续推进"
          description="模板会带出预算参考、交互框架和建议交付周期，让企业从案例页就能进入定制流程。"
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.length ? (
            templates.slice(0, 3).map((template) => (
              <div key={template.id} className="glass-card card-hover overflow-hidden">
                <div className="relative h-52 overflow-hidden">
                  <SmartImage
                    src={template.imageUrl || template.gallery?.[0]}
                    alt={template.name}
                    className="h-full w-full object-cover"
                    fallbackClassName="h-full w-full"
                    label="模板封面"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-aurora/80 via-aurora/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="text-xs uppercase tracking-[0.22em] text-white/68">{template.category}</div>
                    <div className="mt-2 font-display text-2xl font-semibold">{template.name}</div>
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <p className="text-sm leading-7 text-ink/66">{template.summary}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink">¥{(template.recommendedPrice / 100).toLocaleString("zh-CN")}</span>
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
              <EmptyState title="模板数据暂未加载" description="模板中心准备好后，这里会自动展示推荐模板。" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function MiniMetric({ icon, title, text }) {
  return (
    <div className="rounded-[1.35rem] border border-white/80 bg-white/84 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink/40">
        {icon}
        {title}
      </div>
      <div className="mt-2 text-sm font-semibold text-ink">{text}</div>
    </div>
  );
}
