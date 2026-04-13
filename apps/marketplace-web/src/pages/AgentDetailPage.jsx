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
import SectionHeader from "../components/SectionHeader";
import SmartImage from "../components/SmartImage";
import { useAuth } from "../context/AuthContext";

const highlightsByCategory = {
  教育: ["招生咨询", "课程答疑", "家长沟通", "线索转化"],
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
    return <section className="section-shell text-sm text-ink/60">正在加载智能体详情...</section>;
  }

  if (!agent) {
    return <section className="section-shell text-sm text-ink/60">没有找到对应的智能体。</section>;
  }

  const canBuy = user?.role === "enterprise";
  const highlights = highlightsByCategory[agent.category] || highlightsByCategory.定制;

  return (
    <section className="section-shell">
      <div className="mb-6 flex items-center gap-2 text-sm text-ink/46">
        <Link to="/agents" className="hover:text-ink">
          智能体库
        </Link>
        <ChevronRight size={14} />
        <span>{agent.name}</span>
      </div>

      <div className="hero-panel p-6 sm:p-8 lg:p-10">
        <div className="relative z-10 grid gap-8 xl:grid-cols-[1.12fr_0.88fr] xl:items-start">
          <div className="space-y-6 animate-rise-in-delay-1">
            <SectionHeader
              eyebrow={agent.category}
              title={agent.name}
              description={agent.summary}
              action={<div className="rounded-full border border-white/80 bg-white/78 px-4 py-2 text-sm font-semibold text-ink">¥{(agent.price / 100).toLocaleString("zh-CN")}</div>}
            />

            <div className="glass-card overflow-hidden p-3">
              <div className="overflow-hidden rounded-[1.7rem]">
                {activeImage ? (
                  <SmartImage
                    src={activeImage}
                    alt={agent.name}
                    className="h-[460px] w-full object-cover"
                    fallbackClassName="h-[460px] w-full"
                    label="主视觉"
                  />
                ) : (
                  <div className="flex h-[460px] items-center justify-center bg-[linear-gradient(135deg,#0d5c9c,#0f766e,#fb7c32)] text-white">
                    暂无预览图
                  </div>
                )}
              </div>
            </div>

            {gallery.length ? (
              <div className="grid gap-4 sm:grid-cols-4">
                {gallery.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    className={`overflow-hidden rounded-[1.25rem] border p-1 transition ${
                      activeImage === image ? "border-sky bg-sky/8" : "border-white/80 bg-white/82"
                    }`}
                  >
                    <SmartImage
                      src={image}
                      alt={`${agent.name} 预览 ${index + 1}`}
                      className="h-24 w-full rounded-[1rem] object-cover"
                      fallbackClassName="h-24 w-full rounded-[1rem]"
                      label="缩略图"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="animate-rise-in-delay-2 xl:sticky xl:top-28">
            <div className="glass-card space-y-6 p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-sky/10 px-3 py-1 text-xs font-semibold text-sky">{agent.category}</span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink/62">
                  {agent.status === "approved" ? "已审核上线" : agent.status}
                </span>
              </div>

              <div>
                <div className="font-display text-4xl font-semibold text-ink">¥{(agent.price / 100).toLocaleString("zh-CN")}</div>
                <p className="mt-3 text-sm leading-7 text-ink/66">可作为现成智能体直接采购，也可以作为能力底座继续扩展成企业定制方案。</p>
              </div>

              <div className="grid gap-3">
                <InfoRow icon={<Building2 size={17} />} label="提供方" value={agent.school?.organizationName || "平台样例"} />
                <InfoRow icon={<ShieldCheck size={17} />} label="审核状态" value={agent.status === "approved" ? "已通过" : agent.status} />
                <InfoRow icon={<ImageIcon size={17} />} label="展示素材" value={`${gallery.length || 0} 组`} />
                <InfoRow icon={<FileText size={17} />} label="交付文件" value={agent.fileUrl ? "已上传" : "仅展示版"} />
              </div>

              <div className="soft-divider pt-6">
                <div className="space-y-3">
                  <ActionBullet icon={<CircleCheckBig size={16} />} text="企业可从详情页直接进入采购或定制订单流程。" />
                  <ActionBullet icon={<MessageSquareText size={16} />} text="学校可在后台继续完善 Prompt、案例图和交付资料。" />
                  <ActionBullet icon={<WandSparkles size={16} />} text="管理员统一审核上线状态和手动支付确认。" />
                </div>
              </div>

              <div className="grid gap-3">
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
                  查看更多案例
                </Link>

                {agent.fileUrl ? (
                  <a href={resolveAssetUrl(agent.fileUrl)} target="_blank" rel="noreferrer" className="button-secondary w-full">
                    下载交付文件
                  </a>
                ) : null}
              </div>
            </div>

            <div className="mt-5 rounded-[1.8rem] bg-[linear-gradient(145deg,#07111f_0%,#0d5c9c_55%,#fb7c32_100%)] p-6 text-white shadow-luxe">
              <div className="text-xs uppercase tracking-[0.28em] text-white/62">Enterprise Fit</div>
              <div className="mt-3 font-display text-2xl font-semibold">想要更完整的交付？</div>
              <p className="mt-3 text-sm leading-7 text-white/78">可以直接发起定制订单，补充预算、时间和能力要求，平台会把这笔交易继续往下推进。</p>
              <Link to="/enterprise/orders/new" className="button-ghost mt-6">
                去发布订单
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <ContentPanel title="智能体描述">
          <p className="text-sm leading-8 text-ink/68">{agent.description}</p>
        </ContentPanel>

        <ContentPanel title="适配亮点">
          <div className="grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => (
              <div key={item} className="rounded-[1.35rem] border border-white/80 bg-white/84 px-4 py-4 text-sm font-medium text-ink/72">
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
              <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(237,244,251,0.7),rgba(255,255,255,0.9))] p-5 text-sm leading-8 text-ink/68">
                {agent.promptTemplate}
              </div>
            </ContentPanel>
          ) : null}

          {agent.conversationTemplate ? (
            <ContentPanel title="对话流程模板">
              <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(255,248,241,0.9),rgba(255,255,255,0.92))] p-5 text-sm leading-8 text-ink/68">
                {agent.conversationTemplate}
              </div>
            </ContentPanel>
          ) : null}
        </div>
      )}

      <div className="mt-6">
        <ContentPanel title="案例与展示说明">
          <div className="grid gap-4 md:grid-cols-3">
            {(agent.demoImageUrls?.length ? agent.demoImageUrls : gallery.slice(0, 3)).map((image, index) => (
              <SmartImage
                key={`${image}-${index}`}
                src={image}
                alt={`${agent.name} 场景 ${index + 1}`}
                className="h-52 w-full rounded-[1.35rem] object-cover"
                fallbackClassName="h-52 w-full rounded-[1.35rem]"
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
    <div className="mesh-panel p-6">
      <div className="relative z-10">
        <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="rounded-[1.35rem] border border-white/80 bg-white/84 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mist text-sky">{icon}</div>
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-ink/40">{label}</div>
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
