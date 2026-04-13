import { Router } from "express";

import { db, serializeAgent } from "../database/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { agentUpload } from "../middleware/upload.js";
import { normalizeArray, nowIso, requireFields, slugify } from "../utils/helpers.js";

const router = Router();

const agentSelect = `
  SELECT
    a.*,
    u.full_name AS school_name,
    u.organization_name AS school_org
  FROM agents a
  LEFT JOIN users u ON u.id = a.school_id
`;

function imagePaths(files) {
  return (files || []).map((file) => `/uploads/images/${file.filename}`);
}

function filePath(file) {
  return file ? `/uploads/agents/${file.filename}` : null;
}

function canReadAgent(agent, user) {
  if (agent.status === "approved") {
    return true;
  }
  if (!user) {
    return false;
  }
  return user.role === "admin" || user.id === agent.school_id;
}

router.get("/", (req, res) => {
  const conditions = [];
  const params = [];

  if (req.query.mine === "true" && req.user?.role === "school") {
    conditions.push("a.school_id = ?");
    params.push(req.user.id);
  } else if (req.user?.role !== "admin") {
    conditions.push("a.status = 'approved'");
  }

  if (req.query.category && req.query.category !== "全部") {
    conditions.push("a.category = ?");
    params.push(req.query.category);
  }

  if (req.query.featured === "true") {
    conditions.push("a.featured = 1");
  }

  if (req.query.search) {
    conditions.push("(a.name LIKE ? OR a.summary LIKE ? OR a.description LIKE ?)");
    const term = `%${req.query.search}%`;
    params.push(term, term, term);
  }

  if (req.query.status && req.user?.role === "admin") {
    conditions.push("a.status = ?");
    params.push(req.query.status);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = db.prepare(`${agentSelect} ${whereClause} ORDER BY a.featured DESC, a.id DESC`).all(...params);
  res.json({ agents: rows.map(serializeAgent) });
});

router.get("/:id", (req, res) => {
  const row = db.prepare(`${agentSelect} WHERE a.id = ?`).get(req.params.id);
  if (!row) {
    res.status(404).json({ message: "智能体不存在。" });
    return;
  }
  if (!canReadAgent(row, req.user)) {
    res.status(403).json({ message: "该智能体尚未通过审核。" });
    return;
  }
  res.json({ agent: serializeAgent(row) });
});

router.post(
  "/",
  requireAuth,
  requireRole("school"),
  agentUpload.fields([
    { name: "images", maxCount: 5 },
    { name: "demoImages", maxCount: 4 },
    { name: "agentFile", maxCount: 1 },
  ]),
  (req, res) => {
    const missing = requireFields(req.body, ["name", "summary", "description", "price", "category"]);
    if (missing.length) {
      res.status(400).json({ message: `缺少字段: ${missing.join(", ")}` });
      return;
    }

    const files = req.files || {};
    const time = nowIso();
    const slugBase = slugify(req.body.name);
    const count = db.prepare(`SELECT COUNT(*) AS count FROM agents WHERE slug LIKE ?`).get(`${slugBase}%`).count;
    const slug = count ? `${slugBase}-${count + 1}` : slugBase;

    const result = db
      .prepare(
        `
        INSERT INTO agents (
          name, slug, summary, description, image_urls_json, demo_image_urls_json, file_url,
          price, category, status, school_id, prompt_template, conversation_template, featured, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, 0, ?, ?)
      `,
      )
      .run(
        req.body.name,
        slug,
        req.body.summary,
        req.body.description,
        JSON.stringify(imagePaths(files.images)),
        JSON.stringify(imagePaths(files.demoImages)),
        filePath(files.agentFile?.[0]),
        Number(req.body.price),
        req.body.category,
        req.user.id,
        req.body.promptTemplate || "",
        req.body.conversationTemplate || "",
        time,
        time,
      );

    const created = db.prepare(`${agentSelect} WHERE a.id = ?`).get(result.lastInsertRowid);
    res.status(201).json({
      message: "智能体已提交，等待管理员审核。",
      agent: serializeAgent(created),
    });
  },
);

router.patch(
  "/:id",
  requireAuth,
  agentUpload.fields([
    { name: "images", maxCount: 5 },
    { name: "demoImages", maxCount: 4 },
    { name: "agentFile", maxCount: 1 },
  ]),
  (req, res) => {
    const existing = db.prepare(`SELECT * FROM agents WHERE id = ?`).get(req.params.id);
    if (!existing) {
      res.status(404).json({ message: "智能体不存在。" });
      return;
    }

    const isOwner = req.user.role === "school" && req.user.id === existing.school_id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      res.status(403).json({ message: "无权编辑该智能体。" });
      return;
    }

    const files = req.files || {};
    const nextImages = files.images?.length ? imagePaths(files.images) : normalizeArray(req.body.existingImageUrls);
    const nextDemoImages = files.demoImages?.length ? imagePaths(files.demoImages) : normalizeArray(req.body.existingDemoImageUrls);
    const nextFile = files.agentFile?.[0] ? filePath(files.agentFile[0]) : existing.file_url;
    const nextStatus = isAdmin ? req.body.status || existing.status : "pending";

    db.prepare(
      `
      UPDATE agents
      SET
        name = ?,
        slug = ?,
        summary = ?,
        description = ?,
        image_urls_json = ?,
        demo_image_urls_json = ?,
        file_url = ?,
        price = ?,
        category = ?,
        status = ?,
        prompt_template = ?,
        conversation_template = ?,
        featured = ?,
        updated_at = ?
      WHERE id = ?
    `,
    ).run(
      req.body.name || existing.name,
      slugify(req.body.name || existing.name),
      req.body.summary || existing.summary,
      req.body.description || existing.description,
      JSON.stringify(nextImages.length ? nextImages : JSON.parse(existing.image_urls_json)),
      JSON.stringify(nextDemoImages.length ? nextDemoImages : JSON.parse(existing.demo_image_urls_json)),
      nextFile,
      Number(req.body.price || existing.price),
      req.body.category || existing.category,
      nextStatus,
      req.body.promptTemplate ?? existing.prompt_template,
      req.body.conversationTemplate ?? existing.conversation_template,
      req.body.featured !== undefined ? Number(req.body.featured === "true" || req.body.featured === true) : existing.featured,
      nowIso(),
      existing.id,
    );

    const updated = db.prepare(`${agentSelect} WHERE a.id = ?`).get(existing.id);
    res.json({
      message: isAdmin ? "智能体已更新。" : "智能体已重新提交审核。",
      agent: serializeAgent(updated),
    });
  },
);

router.delete("/:id", requireAuth, (req, res) => {
  const existing = db.prepare(`SELECT * FROM agents WHERE id = ?`).get(req.params.id);
  if (!existing) {
    res.status(404).json({ message: "智能体不存在。" });
    return;
  }

  const isOwner = req.user.role === "school" && req.user.id === existing.school_id;
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) {
    res.status(403).json({ message: "无权删除该智能体。" });
    return;
  }

  db.prepare(`DELETE FROM agents WHERE id = ?`).run(existing.id);
  res.json({ message: "智能体已删除。" });
});

export default router;
