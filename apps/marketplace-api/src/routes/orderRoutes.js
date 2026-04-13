import { Router } from "express";

import { addAuditLog, createNotification, db, serializeOrder } from "../database/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { orderUpload } from "../middleware/upload.js";
import { nowIso, requireFields } from "../utils/helpers.js";

const router = Router();

const orderSelect = `
  SELECT
    o.*,
    buyer.full_name AS buyer_name,
    buyer.organization_name AS buyer_org,
    school.full_name AS school_name,
    school.organization_name AS school_org,
    a.name AS agent_name
  FROM orders o
  LEFT JOIN users buyer ON buyer.id = o.buyer_id
  LEFT JOIN users school ON school.id = o.school_id
  LEFT JOIN agents a ON a.id = o.agent_id
`;

function notifyAdmins(title, message) {
  const admins = db.prepare(`SELECT id FROM users WHERE role = 'admin'`).all();
  for (const admin of admins) {
    createNotification(admin.id, title, message);
  }
}

function canReadOrder(order, user) {
  return user.role === "admin" || order.buyer_id === user.id || order.school_id === user.id;
}

function attachmentPath(file) {
  return file ? `/uploads/orders/${file.filename}` : null;
}

router.get("/", requireAuth, (req, res) => {
  let rows = [];
  if (req.user.role === "admin") {
    rows = db.prepare(`${orderSelect} ORDER BY o.id DESC`).all();
  } else if (req.user.role === "enterprise") {
    rows = db.prepare(`${orderSelect} WHERE o.buyer_id = ? ORDER BY o.id DESC`).all(req.user.id);
  } else {
    rows = db.prepare(`${orderSelect} WHERE o.school_id = ? ORDER BY o.id DESC`).all(req.user.id);
  }

  res.json({ orders: rows.map(serializeOrder) });
});

router.get("/:id", requireAuth, (req, res) => {
  const row = db.prepare(`${orderSelect} WHERE o.id = ?`).get(req.params.id);
  if (!row) {
    res.status(404).json({ message: "订单不存在。" });
    return;
  }
  if (!canReadOrder(row, req.user)) {
    res.status(403).json({ message: "无权查看该订单。" });
    return;
  }

  const payment = db.prepare(`SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1`).get(row.id);
  res.json({ order: serializeOrder(row), payment });
});

router.post("/", requireAuth, requireRole("enterprise"), orderUpload.single("attachment"), (req, res) => {
  const missing = requireFields(req.body, ["title", "description", "budget"]);
  if (missing.length) {
    res.status(400).json({ message: `缺少字段: ${missing.join(", ")}` });
    return;
  }

  const time = nowIso();
  let schoolId = null;
  if (req.body.agentId) {
    const agent = db.prepare(`SELECT * FROM agents WHERE id = ? AND status = 'approved'`).get(req.body.agentId);
    if (!agent) {
      res.status(404).json({ message: "智能体不存在或尚未通过审核。" });
      return;
    }
    schoolId = agent.school_id;
  }

  const result = db
    .prepare(
      `
      INSERT INTO orders (
        buyer_id, school_id, agent_id, title, description, note, attachment_url, budget, delivery_deadline, status, payment_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'manual_pending', ?, ?)
    `,
    )
    .run(
      req.user.id,
      schoolId,
      req.body.agentId || null,
      req.body.title,
      req.body.description,
      req.body.note || "",
      attachmentPath(req.file),
      Number(req.body.budget),
      req.body.deliveryDeadline || null,
      time,
      time,
    );

  db.prepare(
    `
    INSERT INTO payments (order_id, pay_method, pay_status, pay_time, remark, created_at)
    VALUES (?, 'manual_transfer', 'pending', NULL, '等待企业线下付款后提交回执。', ?)
  `,
  ).run(result.lastInsertRowid, time);

  if (schoolId) {
    createNotification(schoolId, "收到新的智能体订单", `订单 #${result.lastInsertRowid} 已指向你的智能体，请及时查看。`);
  }
  notifyAdmins("新订单待审核", `订单 #${result.lastInsertRowid} 已创建，请关注后续付款确认。`);

  const created = db.prepare(`${orderSelect} WHERE o.id = ?`).get(result.lastInsertRowid);
  res.status(201).json({ order: serializeOrder(created) });
});

router.patch("/:id", requireAuth, orderUpload.single("attachment"), (req, res) => {
  const existing = db.prepare(`${orderSelect} WHERE o.id = ?`).get(req.params.id);
  if (!existing) {
    res.status(404).json({ message: "订单不存在。" });
    return;
  }
  if (!canReadOrder(existing, req.user)) {
    res.status(403).json({ message: "无权编辑该订单。" });
    return;
  }

  if (req.user.role === "enterprise" && existing.buyer_id === req.user.id) {
    const nextPaymentStatus = req.body.paymentStatus === "submitted" ? "submitted" : existing.payment_status;

    db.prepare(
      `
      UPDATE orders
      SET title = ?, description = ?, note = ?, attachment_url = ?, budget = ?, delivery_deadline = ?, payment_status = ?, updated_at = ?
      WHERE id = ?
    `,
    ).run(
      req.body.title || existing.title,
      req.body.description || existing.description,
      req.body.note ?? existing.note,
      req.file ? attachmentPath(req.file) : existing.attachment_url,
      Number(req.body.budget || existing.budget),
      req.body.deliveryDeadline || existing.delivery_deadline,
      nextPaymentStatus,
      nowIso(),
      existing.id,
    );

    if (nextPaymentStatus === "submitted") {
      db.prepare(`UPDATE payments SET pay_status = 'pending', remark = ?, pay_time = NULL WHERE order_id = ?`).run(
        req.body.paymentRemark || "企业已提交线下支付回执，等待管理员确认。",
        existing.id,
      );
      notifyAdmins("付款待确认", `订单 #${existing.id} 企业已提交手动支付回执。`);
    }
  } else if (req.user.role === "school" && existing.school_id === req.user.id) {
    const nextStatus = req.body.status === "completed" ? "completed" : existing.status;
    db.prepare(`UPDATE orders SET status = ?, note = ?, updated_at = ? WHERE id = ?`).run(nextStatus, req.body.note ?? existing.note, nowIso(), existing.id);
  } else if (req.user.role !== "admin") {
    res.status(403).json({ message: "当前角色不支持该更新。" });
    return;
  }

  const updated = db.prepare(`${orderSelect} WHERE o.id = ?`).get(existing.id);
  res.json({ order: serializeOrder(updated) });
});

router.delete("/:id", requireAuth, (req, res) => {
  const existing = db.prepare(`${orderSelect} WHERE o.id = ?`).get(req.params.id);
  if (!existing) {
    res.status(404).json({ message: "订单不存在。" });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({ message: "只有管理员可以删除订单。" });
    return;
  }

  db.prepare(`DELETE FROM payments WHERE order_id = ?`).run(existing.id);
  db.prepare(`DELETE FROM orders WHERE id = ?`).run(existing.id);
  addAuditLog({
    targetTable: "orders",
    targetId: existing.id,
    action: "delete_order",
    adminId: req.user.id,
    notes: "管理员删除订单。",
  });
  res.json({ message: "订单已删除。" });
});

export default router;
