import {
  ArrowRight,
  Building2,
  ChevronRight,
  CircleCheckBig,
  FileText,
  ImageIcon,
  MessageSquareText,
  ShieldCheck,
  WandSparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { apiRequest, resolveAssetUrl } from "../api/client";
import SmartImage from "../components/SmartImage";
import { useAuth } from "../context/AuthContext";

const highlightsByCategory = {
  教育: ["招生咨询", "课程答疑", "家校沟通", "线索转化"],
  企业: ["售前接待", "需求澄清", "方案推荐", "线索收集"],
  文旅: ["导览讲解", "路线推荐", "活动介绍", "游客问答"],
  定制: ["行业知识库", "流程接入", "多角色协同", "场景化交付"],
};

export default function AgentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    apiRequest(`/agents/${id}`)
      .then((data) => {
        setAgent(data.agent);
        const firstImage = data.agent?.imageUrls?.[0] || data.agent?.demoImageUrls?.[0] || "";
        setActiveImage(firstImage);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const gallery = useMemo(() => {
    if (!agent) {
      return [];
    }
    return [...(agent.imageUrls || []), ...(agent.demoImageUrls || [])].filter(Boolean);
  }, [agent]);

  if (loading) {
    return <section className="section-shell text-sm text-ink/60">正在加载项目详情...</section>;
  }

  if (!agent) {
    return <section className="section-shell text-sm text-ink/60">没有找到对应项目。</section>;
  }

  const canBuy = user?.role === "enterprise";
  const highlights = highlightsByCategory[agent.category] || highlightsByCategory.定制;

  return (
    <section className="section-shell">
      <div className="mb-6 flex items-center gap-2 text-sm text-ink/46">
        <Link to="/agents" className="hover:text-ink">
          项目广场
        </Link>
        <ChevronRight size={14} />
        <span>{agent.name}</span>
      </div>

      <div className="hero-panel p-7 sm:p-8 lg:p-10">
        <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="section-label">{agent.category}</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-ink/60">
                {agent.status === "approved" ? "已审核上线" : agent.status}
              </span>
            </div>

            <div>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">{agent.name}</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-ink/66">{agent.summary}</p>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="overflow-hidden border-b border-slate-200 bg-slate-100">
                {activeImage ? (
                  <SmartImage
                    src={activeImage}
                    alt={agent.name}
                    className="h-[460px] w-full object-cover"
                    fallbackClassName="h-[460px] w-full"
                    label="项目主图"
                  />
                ) : (
                  <div className="flex h-[460px] items-center justify-center bg-slate-100 text-sm text-ink/50">暂无项目预览</div>
                )}
              </div>
              {gallery.length ? (
                <div className="grid gap-3 p-4 sm:grid-cols-4">
                  {gallery.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setActiveImage(image)}
                      className={`overflow-hidden rounded-[18px] border p-1 transition ${
                        activeImage === image ? "border-sky bg-sky/5" : "border-slate-200 bg-white"
                      }`}
                    >
                      <SmartImage
                        src={image}
                        alt={`${agent.name} 预览 ${index + 1}`}
                        className="h-24 w-full rounded-[14px] object-cover"
                        fallbackClassName="h-24 w-full rounded-[14px]"
                        label="缩略图"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-5 xl:sticky xl:top-28">
            <div className="surface-panel p-7">
              <div className="font-display text-4xl font-semibold text-ink">¥{(agent.price / 100).toLocaleString("zh-CN")}</div>
              <p className="mt-3 text-sm leading-7 text-ink/66">
                该项目可作为标准化方案直接采购，也可基于现有能力继续扩展为企业定制项目。
              </p>

              <div className="mt-6 grid gap-3">
                <InfoRow icon={<Building2 size={17} />} label="提供方" value={agent.school?.organizationName || "高校团队"} />
                <InfoRow icon={<ShieldCheck size={17} />} label="审核状态" value={agent.status === "approved" ? "已通过审核" : agent.status} />
                <InfoRow icon={<ImageIcon size={17} />} label="展示素材" value={`${gallery.length || 0} 张`} />
                <InfoRow icon={<FileText size={17} />} label="交付文件" value={agent.fileUrl ? "已提供下载文件" : "仅项目展示版"} />
              </div>

              <div className="soft-divider mt-6 pt-6">
                <div className="space-y-3">
                  <ActionBullet icon={<CircleCheckBig size={16} />} text="企业可从详情页直接进入采购或定制需求流程。" />
                  <ActionBullet icon={<MessageSquareText size={16} />} text="高校可继续在后台完善 Prompt、案例图和交付材料。" />
                  <ActionBullet icon={<WandSparkles size={16} />} text="平台统一管理项目审核与订单支付确认状态。" />
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {canBuy ? (
                  <Link to={`/enterprise/orders/new?agentId=${agent.id}`} className="button-primary w-full">
                    购买 / 定制
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                ) : (
                  <Link to="/auth" className="button-primary w-full">
                    登录后购买
                  </Link>
                )}

                <Link to="/cases" className="button-secondary w-full">
                  查看成功案例
                </Link>

                {agent.fileUrl ? (
                  <a href={resolveAssetUrl(agent.fileUrl)} target="_blank" rel="noreferrer" className="button-secondary w-full">
                    下载交付文件
                  </a>
                ) : null}
              </div>
            </div>

            <div className="surface-panel p-6">
              <div className="eyebrow">采购建议</div>
              <div className="mt-3 font-display text-2xl font-semibold text-ink">如果你需要完整业务适配</div>
              <p className="mt-3 text-sm leading-7 text-ink/66">
                可以直接提交企业需求，补充预算、时间和能力边界，平台会按订单流转继续推进沟通与交付。
              </p>
              <Link to="/enterprise/orders/new" className="button-secondary mt-5">
                提交企业需求
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <ContentPanel title="项目说明">
          <p className="text-sm leading-8 text-ink/68">{agent.description}</p>
        </ContentPanel>

        <ContentPanel title="适配亮点">
          <div className="grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => (
              <div key={item} className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-ink/72">
                <div className="flex items-center gap-3">
                  <CircleCheckBig size={16} className="text-tide" />
                  {item}
                </div>
              </div>
            ))}
          </div>
        </ContentPanel>
      </div>

      {(agent.promptTemplate || agent.conversationTemplate) && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {agent.promptTemplate ? (
            <ContentPanel title="Prompt 模板">
              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-5 text-sm leading-8 text-ink/68">{agent.promptTemplate}</div>
            </ContentPanel>
          ) : null}

          {agent.conversationTemplate ? (
            <ContentPanel title="对话流程模板">
              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-5 text-sm leading-8 text-ink/68">{agent.conversationTemplate}</div>
            </ContentPanel>
          ) : null}
        </div>
      )}

      <div className="mt-6">
        <ContentPanel title="案例与展示素材">
          <div className="grid gap-4 md:grid-cols-3">
            {(agent.demoImageUrls?.length ? agent.demoImageUrls : gallery.slice(0, 3)).map((image, index) => (
              <SmartImage
                key={`${image}-${index}`}
                src={image}
                alt={`${agent.name} 场景 ${index + 1}`}
                className="h-52 w-full rounded-[18px] object-cover"
                fallbackClassName="h-52 w-full rounded-[18px]"
                label="案例图"
              />
            ))}
          </div>
        </ContentPanel>
      </div>
    </section>
  );
}

function ContentPanel({ title, children }) {
  return (
    <div className="surface-panel p-6">
      <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sky shadow-sm">{icon}</div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-ink/40">{label}</div>
          <div className="mt-1 text-sm font-semibold text-ink">{value}</div>
        </div>
      </div>
    </div>
  );
}

function ActionBullet({ icon, text }) {
  return (
    <div className="flex items-start gap-3 text-sm leading-6 text-ink/68">
      <span className="mt-1 text-sky">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
