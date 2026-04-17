import { Router } from "express";

import { templateCatalog } from "../data/templateCatalog.js";
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

function pickFeaturedTemplates(templates, count = 3) {
  const seenCategories = new Set();
  const featured = [];

  for (const template of templates) {
    if (seenCategories.has(template.category)) {
      continue;
    }

    seenCategories.add(template.category);
    featured.push(template);

    if (featured.length >= count) {
      break;
    }
  }

  return featured.length ? featured : templates.slice(0, count);
}

router.get("/templates", (_req, res) => {
  const approvedAgents = db
    .prepare(`${agentSelect} WHERE a.status = 'approved' ORDER BY a.featured DESC, a.id ASC`)
    .all()
    .map(serializeAgent);

  const templates = templateCatalog.map((template) => {
    const linkedAgent =
      approvedAgents.find((agent) => agent.category === template.category) ||
      approvedAgents.find((agent) => agent.name.includes(template.name.replace(" Agent", "").replace("模板", "")));

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
    featuredTemplates: pickFeaturedTemplates(templates),
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
      categoryCoverage: new Set(templateCatalog.map((template) => template.category)).size,
    },
    latestAgents,
  });
});

export default router;

