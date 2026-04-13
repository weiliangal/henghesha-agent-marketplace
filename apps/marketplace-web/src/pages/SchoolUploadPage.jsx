import { Bot, Download, PencilLine, Trash2, UploadCloud, WandSparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest, resolveAssetUrl } from "../api/client";
import EmptyState from "../components/EmptyState";
import SectionHeader from "../components/SectionHeader";
import SmartImage from "../components/SmartImage";
import { useAuth } from "../context/AuthContext";

const blankForm = {
  name: "",
  summary: "",
  description: "",
  price: "",
  category: "教育",
  promptTemplate: "",
  conversationTemplate: "",
};

const orderStatusLabel = {
  pending: "待推进",
  paid: "已付款",
  completed: "已完成",
  cancelled: "已取消",
};

const paymentStatusLabel = {
  manual_pending: "待提交回执",
  submitted: "待人工确认",
  confirmed: "已确认",
  rejected: "已驳回",
};

export default function SchoolUploadPage() {
  const { token } = useAuth();
  const [myAgents, setMyAgents] = useState([]);
  const [schoolOrders, setSchoolOrders] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [demoFiles, setDemoFiles] = useState([]);
  const [agentFile, setAgentFile] = useState(null);
  const [message, setMessage] = useState("");
  const [aiRequirement, setAiRequirement] = useState("");
  const [aiType, setAiType] = useState("教育");
  const [loadingAI, setLoadingAI] = useState(false);

  async function loadWorkspace() {
    const [agentsData, ordersData] = await Promise.all([apiRequest("/agents?mine=true", { token }), apiRequest("/orders", { token })]);
    setMyAgents(agentsData.agents || []);
    setSchoolOrders(ordersData.orders || []);
  }

  useEffect(() => {
    loadWorkspace();
  }, []);

  async function handleGenerate() {
    setLoadingAI(true);
    setMessage("");

    try {
      const data = await apiRequest("/openai/generate", {
        method: "POST",
        token,
        body: {
          requirement: aiRequirement,
          type: aiType,
          parameters: { targetAudience: "企业采购方" },
        },
      });

      setForm((current) => ({
        ...current,
        name: data.result.name,
        summary: data.result.summary,
        description: data.result.description,
        promptTemplate: data.result.promptTemplate,
        conversationTemplate: data.result.conversationTemplate,
        price: String(data.result.recommendedPrice),
        category: data.result.suggestedCategory || current.category,
      }));
      setMessage(`已通过 ${data.source === "openai" ? "OpenAI" : "Mock"} 生成草案，你可以继续微调后提交。`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoadingAI(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    imageFiles.forEach((file) => formData.append("images", file));
    demoFiles.forEach((file) => formData.append("demoImages", file));
    if (agentFile) {
      formData.append("agentFile", agentFile);
    }

    const current = myAgents.find((item) => item.id === editingId);
    if (editingId && current) {
      formData.append("existingImageUrls", current.imageUrls.join(","));
      formData.append("existingDemoImageUrls", current.demoImageUrls.join(","));
    }

    try {
      if (editingId) {
        await apiRequest(`/agents/${editingId}`, {
          method: "PATCH",
          token,
          body: formData,
        });
        setMessage("智能体已更新，并重新进入审核。");
      } else {
        await apiRequest("/agents", {
          method: "POST",
          token,
          body: formData,
        });
        setMessage("智能体已提交，等待管理员审核。");
      }

      setForm(blankForm);
      setEditingId(null);
      setImageFiles([]);
      setDemoFiles([]);
      setAgentFile(null);
      await loadWorkspace();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleDelete(id) {
    try {
      await apiRequest(`/agents/${id}`, { method: "DELETE", token });
      setMessage("智能体已删除。");
      await loadWorkspace();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function handleEdit(agent) {
    setEditingId(agent.id);
    setForm({
      name: agent.name,
      summary: agent.summary,
      description: agent.description,
      price: String(agent.price),
      category: agent.category,
      promptTemplate: agent.promptTemplate || "",
      conversationTemplate: agent.conversationTemplate || "",
    });
    setMessage("已载入待编辑内容，重新提交后会回到 pending 审核状态。");
  }

  const stats = useMemo(
    () => [
      { label: "我的智能体", value: myAgents.length },
      { label: "待审核", value: myAgents.filter((item) => item.status === "pending").length },
      { label: "已上线", value: myAgents.filter((item) => item.status === "approved").length },
      { label: "收到订单", value: schoolOrders.length },
    ],
    [myAgents, schoolOrders],
  );

  return (
    <section className="section-shell">
      <div className="hero-panel p-6 sm:p-8 lg:p-10">
        <div className="relative z-10">
          <SectionHeader
            eyebrow="学校工作台"
            title="把研发成果包装成真正可上架、可成交、可持续协作的智能体条目"
            description="先用 OpenAI 生成文案草案，再补充案例图、交付文件和报价。上传工作台也会同步显示学校收到的订单请求。"
            action={<div className="data-chip">{schoolOrders.length} 条订单请求</div>}
          />
        </div>
      </div>

      {message ? <div className="mt-6 rounded-[1.35rem] border border-white/80 bg-white/82 px-4 py-3 text-sm text-ink/78">{message}</div> : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="glass-card p-5">
            <div className="text-sm text-ink/52">{item.label}</div>
            <div className="mt-4 font-display text-3xl font-semibold text-ink">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] bg-[linear-gradient(145deg,#07111f_0%,#0d5c9c_46%,#0f766e_100%)] p-8 text-white shadow-luxe">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/12">
                <WandSparkles size={20} />
              </span>
              <div>
                <h2 className="font-display text-3xl font-semibold">AI 草案生成器</h2>
                <p className="mt-2 text-sm text-white/76">先生成完整的产品文案，再进入上架编辑阶段。</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <textarea
                rows="4"
                className="input-base text-ink"
                placeholder="例如：为高职院校招生办公室生成一个可用于官网和微信咨询的智能体。"
                value={aiRequirement}
                onChange={(event) => setAiRequirement(event.target.value)}
              />
              <div className="flex flex-wrap gap-3">
                {["教育", "企业", "文旅", "定制"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setAiType(item)}
                    className={`pill-filter ${aiType === item ? "bg-white text-ink" : "border border-white/10 bg-white/10 text-white hover:bg-white/16"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <button type="button" onClick={handleGenerate} disabled={loadingAI || !aiRequirement} className="button-ghost w-full">
                <Bot className="mr-2" size={16} />
                {loadingAI ? "生成中..." : "用 OpenAI 生成智能体草案"}
              </button>
            </div>
          </div>

          <div className="mesh-panel p-6">
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="eyebrow">我的智能体</div>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-ink">当前上传列表</h2>
                </div>
                <div className="data-chip">{myAgents.length} 个条目</div>
              </div>

              <div className="mt-6 space-y-4">
                {myAgents.length ? (
                  myAgents.map((agent) => (
                    <div key={agent.id} className="rounded-[1.7rem] border border-white/80 bg-white/84 p-5">
                      <div className="flex flex-wrap items-start gap-4">
                        <div className="h-24 w-24 overflow-hidden rounded-[1.2rem]">
                          <SmartImage src={agent.imageUrls?.[0] || agent.demoImageUrls?.[0]} alt={agent.name} className="h-full w-full object-cover" fallbackClassName="h-full w-full" label="封面" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="max-w-2xl">
                              <div className="font-display text-2xl font-semibold text-ink">{agent.name}</div>
                              <div className="mt-2 text-sm leading-7 text-ink/66">{agent.summary}</div>
                              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                <span className="rounded-full bg-sand px-3 py-1 text-ink/70">{agent.category}</span>
                                <span className="rounded-full bg-ink px-3 py-1 text-white">{statusLabel(agent.status)}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => handleEdit(agent)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white text-sky">
                                <PencilLine size={16} />
                              </button>
                              <button type="button" onClick={() => handleDelete(agent.id)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white text-rose-600">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          {agent.fileUrl ? (
                            <a href={resolveAssetUrl(agent.fileUrl)} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky">
                              <Download size={15} />
                              查看已上传文件
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState title="还没有上传内容" description="先在右侧填写表单，或者先使用 AI 草案生成器起草第一版内容。" />
                )}
              </div>
            </div>
          </div>

          <div className="mesh-panel p-6">
            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="eyebrow">订单协作</div>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-ink">收到的订单请求</h2>
                </div>
                <Link to="/orders" className="button-secondary">
                  去订单页
                </Link>
              </div>

              <div className="mt-6 space-y-4">
                {schoolOrders.length ? (
                  schoolOrders.slice(0, 4).map((order) => (
                    <div key={order.id} className="rounded-[1.6rem] border border-white/80 bg-white/84 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="max-w-2xl">
                          <div className="font-display text-2xl font-semibold text-ink">{order.title}</div>
                          <div className="mt-2 text-sm leading-7 text-ink/66">{order.description}</div>
                          <div className="mt-4 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-sand px-3 py-1 text-ink/70">{order.buyerOrg || order.buyerName || "企业客户"}</span>
                            <span className="rounded-full bg-ink px-3 py-1 text-white">{orderStatusLabel[order.status] || order.status}</span>
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">{paymentStatusLabel[order.paymentStatus] || order.paymentStatus}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-ink/48">预算</div>
                          <div className="mt-1 font-display text-2xl font-semibold text-ink">¥{(order.budget / 100).toLocaleString("zh-CN")}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState title="暂时还没有学校侧订单" description="企业下单并关联到学校后，这里会同步显示收到的需求。" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mesh-panel p-8 md:p-10">
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mist text-sky">
                <UploadCloud size={20} />
              </span>
              <div>
                <h2 className="font-display text-3xl font-semibold text-ink">{editingId ? "编辑智能体" : "上传智能体"}</h2>
                <p className="mt-2 text-sm text-ink/62">提交后会进入管理员审核流程，审核通过后才会出现在前台智能体库。</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <Field label="名称">
                <input className="input-base" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              </Field>
              <Field label="简介">
                <input className="input-base" value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} required />
              </Field>
              <Field label="详细说明">
                <textarea rows="5" className="input-base" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="价格（分）">
                  <input className="input-base" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
                </Field>
                <Field label="分类">
                  <select className="input-base" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                    <option value="教育">教育</option>
                    <option value="企业">企业</option>
                    <option value="文旅">文旅</option>
                    <option value="定制">定制</option>
                  </select>
                </Field>
              </div>

              <Field label="Prompt 模板">
                <textarea rows="3" className="input-base" value={form.promptTemplate} onChange={(event) => setForm({ ...form, promptTemplate: event.target.value })} />
              </Field>
              <Field label="对话流程模板">
                <textarea rows="3" className="input-base" value={form.conversationTemplate} onChange={(event) => setForm({ ...form, conversationTemplate: event.target.value })} />
              </Field>

              <div className="grid gap-5 md:grid-cols-3">
                <UploadField label="封面图片" hint={`${imageFiles.length} 个文件已选择`}>
                  <input type="file" multiple accept="image/*" onChange={(event) => setImageFiles(Array.from(event.target.files || []))} className="block w-full text-sm" />
                </UploadField>
                <UploadField label="案例图片" hint={`${demoFiles.length} 个文件已选择`}>
                  <input type="file" multiple accept="image/*" onChange={(event) => setDemoFiles(Array.from(event.target.files || []))} className="block w-full text-sm" />
                </UploadField>
                <UploadField label="智能体文件" hint={agentFile ? agentFile.name : "尚未选择文件"}>
                  <input type="file" onChange={(event) => setAgentFile(event.target.files?.[0] || null)} className="block w-full text-sm" />
                </UploadField>
              </div>

              {message ? <div className="rounded-[1.35rem] border border-white/80 bg-white/82 px-4 py-3 text-sm text-ink/78">{message}</div> : null}

              <button type="submit" className="button-primary w-full">
                {editingId ? "更新并重新提交审核" : "提交审核"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}

function UploadField({ label, hint, children }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-ink/14 bg-white/80 p-4">
      <div className="text-sm font-semibold text-ink">{label}</div>
      <div className="mt-1 text-xs text-ink/48">{hint}</div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function statusLabel(status) {
  return {
    pending: "待审核",
    approved: "已上线",
    rejected: "已驳回",
  }[status] || status;
}
