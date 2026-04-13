import { Router } from "express";

import { db, serializeAgent } from "../database/index.js";

const router = Router();

const agentSelect = `
  SELECT
    a.*,
    u.full_name AS school_name,
    u.organization_name AS school_org
  FROM agents a
  LEFT JOIN users u ON u.id = a.school_id
`;

const templateCatalog = [
  {
    id: "admissions-starter",
    slug: "admissions-starter",
    name: "招生咨询模板",
    category: "教育",
    summary: "适合学校官网、招生页和企微接待场景的标准问答模板。",
    description: "覆盖专业推荐、报考条件说明、预约到访和线索沉淀，适合先上线后细化。",
    imageUrl: "/uploads/seed/admission-secondary.svg",
    gallery: ["/uploads/seed/admission-cover.svg", "/uploads/seed/admission-secondary.svg", "/uploads/seed/admission-demo.svg"],
    capabilities: ["多轮问答", "志愿推荐", "预约转化", "家长沟通"],
    recommendedPrice: 98000,
    deliveryDays: 7,
    promptTemplate: "请以清晰、可信、招生顾问式的口吻回答问题，并主动引导用户留下专业、城市与意向信息。",
    conversationTemplate: "1. 识别咨询身份 2. 了解成绩与方向 3. 推荐专业或路径 4. 引导预约咨询",
  },
  {
    id: "sales-qualification",
    slug: "sales-qualification",
    name: "售前线索筛选模板",
    category: "企业",
    summary: "适合官网、展会和公众号接待的销售线索收集与方案初筛模板。",
    description: "帮助企业快速上线标准售前助手，再逐步增加 CRM 对接、行业知识库和报价逻辑。",
    imageUrl: "/uploads/seed/sales-secondary.svg",
    gallery: ["/uploads/seed/sales-cover.svg", "/uploads/seed/sales-secondary.svg", "/uploads/seed/sales-demo.svg"],
    capabilities: ["需求识别", "客户分层", "线索留资", "方案推荐"],
    recommendedPrice: 168000,
    deliveryDays: 10,
    promptTemplate: "请以专业、克制、商业顾问式的方式识别客户需求，并用简洁结构化语言输出建议方案。",
    conversationTemplate: "1. 判断客户类型 2. 追问应用场景 3. 给出方案建议 4. 引导留资或转人工",
  },
  {
    id: "culture-guide",
    slug: "culture-guide",
    name: "文旅讲解模板",
    category: "文旅",
    summary: "适合景区、博物馆和城市文旅入口的导览与讲解模板。",
    description: "支持路线推荐、景点讲解、活动说明和问答接待，适合作为内容型智能体的标准底座。",
    imageUrl: "/uploads/seed/culture-secondary.svg",
    gallery: ["/uploads/seed/culture-cover.svg", "/uploads/seed/culture-secondary.svg", "/uploads/seed/culture-demo.svg"],
    capabilities: ["讲解脚本", "路线推荐", "游客问答", "活动介绍"],
    recommendedPrice: 128000,
    deliveryDays: 9,
    promptTemplate: "请以亲和、可信、具有导览感的语气介绍景点或活动，并在必要时补充路线和游玩建议。",
    conversationTemplate: "1. 识别游客需求 2. 推荐路线或项目 3. 提供讲解信息 4. 补充注意事项",
  },
  {
    id: "custom-knowledge-base",
    slug: "custom-knowledge-base",
    name: "企业知识库定制模板",
    category: "定制",
    summary: "适合希望快速启动定制开发的企业知识库与流程协同模板。",
    description: "先用模板跑通角色设定、语气、交互流程和交付范围，再围绕企业数据做二次开发。",
    imageUrl: "/uploads/seed/sales-demo-2.svg",
    gallery: ["/uploads/seed/sales-demo-2.svg", "/uploads/seed/admission-demo-2.svg", "/uploads/seed/culture-demo-2.svg"],
    capabilities: ["知识库接入", "角色话术", "流程编排", "定制扩展"],
    recommendedPrice: 198000,
    deliveryDays: 14,
    promptTemplate: "请根据企业知识库和业务流程输出结构化回复，必要时给出下一步动作、所需材料和责任角色。",
    conversationTemplate: "1. 确认问题类型 2. 调用知识或流程 3. 输出明确结论 4. 引导后续协同",
  },
];

router.get("/templates", (_req, res) => {
  const approvedAgents = db
    .prepare(`${agentSelect} WHERE a.status = 'approved' ORDER BY a.featured DESC, a.id ASC`)
    .all()
    .map(serializeAgent);

  const templates = templateCatalog.map((template) => {
    const linkedAgent =
      approvedAgents.find((agent) => agent.category === template.category) ||
      approvedAgents.find((agent) => agent.name.includes(template.name.replace("模板", "")));

    return {
      ...template,
      agentId: linkedAgent?.id ?? null,
      agentName: linkedAgent?.name ?? null,
      school: linkedAgent?.school ?? null,
      gallery: template.gallery?.length
        ? template.gallery
        : [...(linkedAgent?.imageUrls || []), ...(linkedAgent?.demoImageUrls || [])].slice(0, 3),
    };
  });

  res.json({
    templates,
    featuredTemplates: templates.slice(0, 3),
  });
});

router.get("/overview", (_req, res) => {
  const approvedAgents = db.prepare(`SELECT COUNT(*) AS count FROM agents WHERE status = 'approved'`).get().count;
  const schoolUsers = db.prepare(`SELECT COUNT(*) AS count FROM users WHERE role = 'school'`).get().count;
  const enterpriseUsers = db.prepare(`SELECT COUNT(*) AS count FROM users WHERE role = 'enterprise'`).get().count;
  const orderCount = db.prepare(`SELECT COUNT(*) AS count FROM orders`).get().count;
  const latestAgents = db.prepare(`${agentSelect} WHERE a.status = 'approved' ORDER BY a.id DESC LIMIT 6`).all().map(serializeAgent);

  res.json({
    stats: {
      approvedAgents,
      schoolUsers,
      enterpriseUsers,
      orderCount,
      categoryCoverage: 4,
    },
    latestAgents,
  });
});

export default router;
