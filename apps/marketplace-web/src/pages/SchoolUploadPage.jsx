import {
  Blocks,
  Bot,
  Download,
  FileArchive,
  PencilLine,
  Search,
  ShieldCheck,
  Trash2,
  UploadCloud,
  WandSparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest, resolveAssetUrl } from "../api/client";
import EmptyState from "../components/EmptyState";
import SectionHeader from "../components/SectionHeader";
import SmartImage from "../components/SmartImage";
import { useAuth } from "../context/AuthContext";

const DEFAULT_CREATOR_CATEGORY = "销售增长";
const ALL_TEMPLATES = "全部模板";
const legacyCategoryOptions = ["教育", "企业", "文旅", "定制"];

const blankForm = {
  name: "",
  summary: "",
  description: "",
  price: "",
  category: DEFAULT_CREATOR_CATEGORY,
  promptTemplate: "",
  conversationTemplate: "",
};

const orderStatusLabel = {
  pending: "待审核",
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
  const [templates, setTemplates] = useState([]);
  const [templateCategory, setTemplateCategory] = useState(ALL_TEMPLATES);
  const [templateSearch, setTemplateSearch] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [demoFiles, setDemoFiles] = useState([]);
  const [agentFile, setAgentFile] = useState(null);
  const [message, setMessage] = useState("");
  const [aiRequirement, setAiRequirement] = useState("");
  const [aiType, setAiType] = useState(DEFAULT_CREATOR_CATEGORY);
  const [loadingAI, setLoadingAI] = useState(false);

  async function loadWorkspace() {
    const [agentsData, ordersData, templatesData] = await Promise.all([
      apiRequest("/agents?mine=true", { token }),
      apiRequest("/orders", { token }),
      apiRequest("/site/templates"),
    ]);

    setMyAgents(agentsData.agents || []);
    setSchoolOrders(ordersData.orders || []);
    setTemplates(templatesData.templates || []);
  }

  useEffect(() => {
    loadWorkspace();
  }, [token]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => String(template.id) === String(selectedTemplateId)) || null,
    [selectedTemplateId, templates],
  );

  const templateCategories = useMemo(
    () => Array.from(new Set(templates.map((template) => template.category).filter(Boolean))),
    [templates],
  );

  const creatorCategoryOptions = useMemo(
    () =>
      Array.from(
        new Set([DEFAULT_CREATOR_CATEGORY, ...templateCategories, ...legacyCategoryOptions, form.category, aiType].filter(Boolean)),
      ),
    [aiType, form.category, templateCategories],
  );

  const filteredTemplates = useMemo(() => {
    const term = templateSearch.trim().toLowerCase();

    return templates.filter((template) => {
      const categoryPass = templateCategory === ALL_TEMPLATES || template.category === templateCategory;
      const searchPass =
        !term ||
        [template.name, template.summary, template.description, ...(template.capabilities || [])]
          .join(" ")
          .toLowerCase()
          .includes(term);
      return categoryPass && searchPass;
    });
  }, [templateCategory, templateSearch, templates]);

  const highlightedTemplates = filteredTemplates.slice(0, 6);

  async function handleGenerate() {
    const requirement =
      aiRequirement.trim() ||
      (selectedTemplate
        ? `请基于模板「${selectedTemplate.name}」生成一个更适合企业采购和平台上架的实用 Agent 草案，重点补齐使用场景、交付边界和能力说明。`
        : "");

    if (!requirement) {
      setMessage("请先输入需求描述，或先选择一个模板再生成草案。");
      return;
    }

    setLoadingAI(true);
    setMessage("");

    try {
      const data = await apiRequest("/openai/generate", {
        method: "POST",
        token,
        body: {
          requirement,
          type: aiType,
          parameters: {
            targetAudience: "企业采购方",
            templateName: selectedTemplate?.name || "",
            templateCategory: selectedTemplate?.category || "",
            templateCapabilities: selectedTemplate?.capabilities || [],
          },
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

      setMessage(
        selectedTemplate
          ? `已基于「${selectedTemplate.name}」模板生成第一版项目草案，你可以继续补充案例、交付文件和上线说明。`
          : `已通过${data.source === "openai" ? " OpenAI " : "本地演示生成器"}生成第一版项目文案，你可以继续补充交付说明后再提交审核。`,
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoadingAI(false);
    }
  }

  function applyTemplate(template) {
    setEditingId(null);
    setSelectedTemplateId(template.id);
    setImageFiles([]);
    setDemoFiles([]);
    setAgentFile(null);
    setAiType(template.category);
    setAiRequirement(
      `请把「${template.name}」做成适合平台上架和企业采购的实用 Agent，重点面向${template.category}场景，突出${(template.capabilities || []).join("、")}等能力。`,
    );
    setForm({
      name: template.name,
      summary: template.summary,
      description: template.description,
      price: String(template.recommendedPrice || ""),
      category: template.category,
      promptTemplate: template.promptTemplate || "",
      conversationTemplate: template.conversationTemplate || "",
    });
    setMessage(`已将「${template.name}」模板带入创建表单，你的创作者可以直接在此基础上制作实用 Agent。`);
  }

  function clearTemplateSelection() {
    setSelectedTemplateId("");
    setAiRequirement("");
    setAiType(DEFAULT_CREATOR_CATEGORY);
    setForm(blankForm);
    setEditingId(null);
    setImageFiles([]);
    setDemoFiles([]);
    setAgentFile(null);
    setMessage("已清空模板草稿，你可以重新选择模板或从空白表单开始。");
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
        setMessage("项目内容已更新，并重新进入审核流程。");
      } else {
        await apiRequest("/agents", {
          method: "POST",
          token,
          body: formData,
        });
        setMessage("项目已提交，等待平台管理员审核。");
      }

      setForm(blankForm);
      setEditingId(null);
      setSelectedTemplateId("");
      setAiRequirement("");
      setAiType(DEFAULT_CREATOR_CATEGORY);
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
      setMessage("项目已删除。");
      await loadWorkspace();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function handleEdit(agent) {
    setEditingId(agent.id);
    setSelectedTemplateId("");
    setForm({
      name: agent.name,
      summary: agent.summary,
      description: agent.description,
      price: String(agent.price),
      category: agent.category,
      promptTemplate: agent.promptTemplate || "",
      conversationTemplate: agent.conversationTemplate || "",
    });

    setMessage("已载入待编辑内容，重新提交后会回到待审核状态。");
  }

  const stats = useMemo(
    () => [
      { label: "我的项目", value: myAgents.length, note: "已创建的团队项目条目" },
      { label: "待审核", value: myAgents.filter((item) => item.status === "pending").length, note: "等待管理员确认上线" },
      { label: "已上线", value: myAgents.filter((item) => item.status === "approved").length, note: "已进入前台项目广场" },
      { label: "收到订单", value: schoolOrders.length, note: "来自企业客户的协作请求" },
    ],
    [myAgents, schoolOrders],
  );

  return (
    <section className="section-shell">
      <div className="hero-panel p-7 sm:p-8 lg:p-10">
        <SectionHeader
          eyebrow="高校团队入驻"
          title="让创作者先套模板，再把模板做成可上架、可成交、可持续协作的实用 Agent"
          description="工作台现在同时支持模板驱动创建和 AI 草案生成。创作者可以先从 100 个业务模板中选一个，再补充案例图、交付文件、Prompt 和对话流程，最终提交平台审核。"
          action={<div className="data-chip">{templates.length} 个可用模板</div>}
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="metric-card">
              <div className="text-sm text-ink/50">{item.label}</div>
              <div className="mt-3 font-display text-3xl font-semibold text-ink">{item.value}</div>
              <div className="mt-2 text-sm leading-6 text-ink/56">{item.note}</div>
            </div>
          ))}
        </div>
      </div>

      {message ? <div className="mt-6 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink/72">{message}</div> : null}

      <div className="mt-10 grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <div className="section-tint p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sky shadow-sm">
                <Blocks size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="section-label">模板驱动创建</div>
                <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">先选业务模板，再把它做成真正可交付的 Agent</h2>
                <p className="mt-3 text-sm leading-7 text-ink/64">
                  创作者可以直接复用平台这 100 个企业运营模板的名称、场景、能力、Prompt 和对话流程，再结合自己的案例素材做成可采购项目。
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_220px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/32" size={18} />
                <input
                  className="input-base pl-11"
                  placeholder="搜索模板名称、适用场景或能力标签"
                  value={templateSearch}
                  onChange={(event) => setTemplateSearch(event.target.value)}
                />
              </div>

              <select className="input-base" value={templateCategory} onChange={(event) => setTemplateCategory(event.target.value)}>
                {[ALL_TEMPLATES, ...templateCategories].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 space-y-3">
              {highlightedTemplates.length ? (
                highlightedTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className="w-full rounded-[22px] border border-slate-200 bg-white p-5 text-left transition hover:border-ink/20 hover:bg-slate-50"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="section-label">{template.category}</span>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-ink/58">
                            {formatCurrency(template.recommendedPrice)}
                          </span>
                        </div>
                        <h3 className="mt-4 font-display text-2xl font-semibold text-ink">{template.name}</h3>
                        <p className="mt-2 text-sm leading-7 text-ink/64">{template.summary}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {(template.capabilities || []).slice(0, 4).map((item) => (
                            <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-ink/58">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-sm font-semibold text-sky">套用模板</div>
                    </div>
                  </button>
                ))
              ) : (
                <EmptyState title="没有匹配的模板" description="可以切换业务分类或修改关键词，继续筛选适合创作者制作的模板。" />
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/templates" className="button-secondary">
                查看全部模板
              </Link>
              <div className="data-chip">{filteredTemplates.length} 个匹配模板</div>
            </div>
          </div>

          <div className="section-tint p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sky shadow-sm">
                <WandSparkles size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="section-label">AI 文案草案</div>
                <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">可以直接基于已选模板生成第一版项目文案</h2>
                <p className="mt-3 text-sm leading-7 text-ink/64">
                  适合先快速整理项目定位、适用场景、能力亮点和推荐定价，再由团队补充案例、交付边界和文件资料。
                </p>
              </div>
            </div>

            {selectedTemplate ? (
              <div className="mt-6 rounded-[20px] border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="section-label">当前已选模板</div>
                    <h3 className="mt-3 font-display text-2xl font-semibold text-ink">{selectedTemplate.name}</h3>
                    <p className="mt-2 text-sm leading-7 text-ink/64">{selectedTemplate.summary}</p>
                  </div>
                  <button type="button" onClick={clearTemplateSelection} className="button-secondary">
                    清空模板草稿
                  </button>
                </div>
              </div>
            ) : null}

            <div className="mt-6 space-y-4">
              <FormField label="需求描述">
                <textarea
                  rows="4"
                  className="input-base"
                  placeholder="例如：请把售后工单分流模板做成适合 SaaS 企业客服中心上线的实用 Agent。"
                  value={aiRequirement}
                  onChange={(event) => setAiRequirement(event.target.value)}
                />
              </FormField>

              <FormField label="Agent 方向">
                <select className="input-base" value={aiType} onChange={(event) => setAiType(event.target.value)}>
                  {creatorCategoryOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </FormField>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loadingAI || (!aiRequirement.trim() && !selectedTemplate)}
                className="button-secondary w-full"
              >
                <Bot size={16} className="mr-2" />
                {loadingAI ? "正在生成..." : selectedTemplate ? "基于模板生成项目草案" : "生成项目草案"}
              </button>
            </div>
          </div>

          <div className="surface-panel p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="section-label">我的项目</div>
                <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">当前上架列表</h2>
              </div>
              <div className="data-chip">{myAgents.length} 个项目</div>
            </div>

            <div className="mt-6 space-y-4">
              {myAgents.length ? (
                myAgents.map((agent) => (
                  <div key={agent.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-wrap items-start gap-4">
                      <div className="h-24 w-24 overflow-hidden rounded-[18px] bg-white">
                        <SmartImage
                          src={agent.imageUrls?.[0] || agent.demoImageUrls?.[0]}
                          alt={agent.name}
                          className="h-full w-full object-cover"
                          fallbackClassName="h-full w-full"
                          label="封面"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="max-w-2xl">
                            <h3 className="font-display text-2xl font-semibold text-ink">{agent.name}</h3>
                            <p className="mt-2 text-sm leading-7 text-ink/64">{agent.summary}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <span className="section-label">{agent.category}</span>
                              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-ink/60">
                                {statusLabel(agent.status)}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(agent)}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sky"
                            >
                              <PencilLine size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(agent.id)}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-rose-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink/60">
                          <span>参考价格 {formatCurrency(agent.price)}</span>
                          {agent.fileUrl ? (
                            <a href={resolveAssetUrl(agent.fileUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-sky">
                              <Download size={15} />
                              查看交付文件
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="还没有提交项目" description="你可以先套用一个模板，再补充案例图和交付说明后发起审核。" />
              )}
            </div>
          </div>

          <div className="surface-panel p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="section-label">订单协作</div>
                <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">收到的企业需求</h2>
              </div>
              <Link to="/orders" className="button-secondary">
                查看全部订单
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {schoolOrders.length ? (
                schoolOrders.slice(0, 4).map((order) => (
                  <div key={order.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="max-w-2xl">
                        <h3 className="font-display text-2xl font-semibold text-ink">{order.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-ink/64">{order.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-ink/60">
                            {order.buyerOrg || order.buyerName || "企业客户"}
                          </span>
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-ink/60">
                            {orderStatusLabel[order.status] || order.status}
                          </span>
                          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-sm text-amber-700">
                            {paymentStatusLabel[order.paymentStatus] || order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-ink/46">预算</div>
                        <div className="mt-1 font-display text-2xl font-semibold text-ink">{formatCurrency(order.budget)}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="暂时还没有企业订单" description="企业提交需求并关联到你的项目后，这里会同步显示协作与付款状态。" />
              )}
            </div>
          </div>
        </div>

        <div className="surface-panel p-8 md:p-10">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-sky">
              <UploadCloud size={20} />
            </span>
            <div>
              <div className="section-label">{editingId ? "编辑项目" : "提交项目"}</div>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">
                {editingId ? "更新团队项目并重新提交审核" : "填写项目资料并进入审核流程"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-ink/64">
                平台会重点审核内容完整度、展示质量、交付说明和文件资料。审核通过后，项目才会出现在前台项目广场。
              </p>
            </div>
          </div>

          {selectedTemplate ? (
            <div className="mt-6 rounded-[22px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="section-label">表单来源模板</div>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-ink">{selectedTemplate.name}</h3>
                  <p className="mt-2 text-sm leading-7 text-ink/64">{selectedTemplate.summary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(selectedTemplate.capabilities || []).slice(0, 4).map((item) => (
                    <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-ink/58">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <FormField label="项目名称">
              <input className="input-base" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </FormField>

            <FormField label="项目简介">
              <input className="input-base" value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} required />
            </FormField>

            <FormField label="详细说明">
              <textarea rows="6" className="input-base" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
            </FormField>

            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="参考价格（分）">
                <input className="input-base" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
              </FormField>

              <FormField label="业务分类">
                <select className="input-base" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                  {creatorCategoryOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField label="Prompt 模板">
              <textarea rows="3" className="input-base" value={form.promptTemplate} onChange={(event) => setForm({ ...form, promptTemplate: event.target.value })} />
            </FormField>

            <FormField label="对话流程模板">
              <textarea
                rows="3"
                className="input-base"
                value={form.conversationTemplate}
                onChange={(event) => setForm({ ...form, conversationTemplate: event.target.value })}
              />
            </FormField>

            <div className="grid gap-5 md:grid-cols-3">
              <UploadField label="封面图片" hint={`${imageFiles.length} 个文件已选择`} icon={<UploadCloud size={15} />}>
                <input type="file" multiple accept="image/*" onChange={(event) => setImageFiles(Array.from(event.target.files || []))} className="block w-full text-sm" />
              </UploadField>

              <UploadField label="案例图片" hint={`${demoFiles.length} 个文件已选择`} icon={<ShieldCheck size={15} />}>
                <input type="file" multiple accept="image/*" onChange={(event) => setDemoFiles(Array.from(event.target.files || []))} className="block w-full text-sm" />
              </UploadField>

              <UploadField label="交付文件" hint={agentFile ? agentFile.name : "尚未选择文件"} icon={<FileArchive size={15} />}>
                <input type="file" onChange={(event) => setAgentFile(event.target.files?.[0] || null)} className="block w-full text-sm" />
              </UploadField>
            </div>

            <div className="section-tint p-5">
              <div className="section-label">上架说明</div>
              <div className="mt-4 space-y-3 text-sm leading-7 text-ink/64">
                <p>建议至少提供一张封面图、一组案例图和一份可下载交付文件，便于企业客户判断项目成熟度。</p>
                <p>如果你是基于模板制作，最好把实际交付范围、接入方式和上线条件补充完整，这会直接影响采购转化。</p>
                <p>如果你正在编辑已有项目，重新提交后会回到待审核状态，审核通过后再恢复前台展示。</p>
              </div>
            </div>

            <button type="submit" className="button-primary w-full">
              {editingId ? "更新并重新提交审核" : "提交平台审核"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function FormField({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}

function UploadField({ label, hint, icon, children }) {
  return (
    <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="text-sky">{icon}</span>
        {label}
      </div>
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

function formatCurrency(value) {
  if (!value) {
    return "待评估";
  }
  return `¥${(value / 100).toLocaleString("zh-CN")}`;
}

