import { Router } from "express";

import { addAuditLog, createNotification, db, serializeAgent, serializeOrder, serializeUser } from "../database/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { nowIso } from "../utils/helpers.js";

const router = Router();

const agentSelect = `
  SELECT
    a.*,
    u.full_name AS school_name,
    u.organization_name AS school_org
  FROM agents a
  LEFT JOIN users u ON u.id = a.school_id
`;

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

router.use(requireAuth, requireRole("admin"));

router.get("/stats", (_req, res) => {
  const stats = {
    users: db.prepare(`SELECT COUNT(*) AS count FROM users`).get().count,
    pendingAgents: db.prepare(`SELECT COUNT(*) AS count FROM agents WHERE status = 'pending'`).get().count,
    approvedAgents: db.prepare(`SELECT COUNT(*) AS count FROM agents WHERE status = 'approved'`).get().count,
    submittedPayments: db.prepare(`SELECT COUNT(*) AS count FROM orders WHERE payment_status = 'submitted'`).get().count,
    completedOrders: db.prepare(`SELECT COUNT(*) AS count FROM orders WHERE status = 'completed'`).get().count,
    pendingOrders: db.prepare(`SELECT COUNT(*) AS count FROM orders WHERE status = 'pending'`).get().count,
  };

  res.json({ stats });
});

router.get("/users", (_req, res) => {
  const users = db.prepare(`SELECT * FROM users ORDER BY id DESC`).all().map(serializeUser);
  res.json({ users });
});

router.patch("/users/:id/status", (req, res) => {
  const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(req.params.id);
  if (!user) {
    res.status(404).json({ message: "用户不存在。" });
    return;
  }

  const nextStatus = req.body.status === "disabled" ? "disabled" : "active";
  db.prepare(`UPDATE users SET status = ?, updated_at = ? WHERE id = ?`).run(nextStatus, nowIso(), user.id);

  addAuditLog({
    targetTable: "users",
    targetId: user.id,
    action: `user_${nextStatus}`,
    adminId: req.user.id,
    notes: req.body.notes || "",
  });

  createNotification(user.id, "账户状态已更新", `你的账户状态已更新为：${nextStatus === "active" ? "正常" : "禁用"}。`);

  const updated = serializeUser(db.prepare(`SELECT * FROM users WHERE id = ?`).get(user.id));
  res.json({ user: updated });
});

router.delete("/users/:id", (req, res) => {
  const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(req.params.id);
  if (!user) {
    res.status(404).json({ message: "用户不存在。" });
    return;
  }

  if (user.role === "admin") {
    res.status(400).json({ message: "不能删除管理员账户。" });
    return;
  }

  const ownedAgents = db.prepare(`SELECT COUNT(*) AS count FROM agents WHERE school_id = ?`).get(user.id).count;
  const ownedOrders = db.prepare(`SELECT COUNT(*) AS count FROM orders WHERE buyer_id = ? OR school_id = ?`).get(user.id, user.id).count;
  if (ownedAgents || ownedOrders) {
    res.status(400).json({ message: "该用户仍有关联的智能体或订单，暂不允许直接删除。" });
    return;
  }

  db.prepare(`DELETE FROM notifications WHERE user_id = ?`).run(user.id);
  db.prepare(`DELETE FROM users WHERE id = ?`).run(user.id);

  addAuditLog({
    targetTable: "users",
    targetId: user.id,
    action: "delete_user",
    adminId: req.user.id,
    notes: req.body?.notes || "",
  });

  res.json({ message: "用户已删除。" });
});

router.get("/agents", (_req, res) => {
  const agents = db.prepare(`${agentSelect} ORDER BY a.id DESC`).all().map(serializeAgent);
  res.json({ agents });
});

router.get("/orders", (_req, res) => {
  const orders = db.prepare(`${orderSelect} ORDER BY o.id DESC`).all().map(serializeOrder);
  res.json({ orders });
});

router.get("/audit-logs", (_req, res) => {
  const logs = db
    .prepare(
      `
      SELECT
        l.*,
        u.full_name AS admin_name,
        u.email AS admin_email
      FROM audit_logs l
      LEFT JOIN users u ON u.id = l.admin_id
      ORDER BY l.id DESC
      LIMIT 30
    `,
    )
    .all()
    .map((row) => ({
      id: row.id,
      targetTable: row.target_table,
      targetId: row.target_id,
      action: row.action,
      adminId: row.admin_id,
      adminName: row.admin_name,
      adminEmail: row.admin_email,
      notes: row.notes,
      timestamp: row.timestamp,
    }));

  res.json({ logs });
});

function updateAgentStatus(req, res) {
  const agent = db.prepare(`SELECT * FROM agents WHERE id = ?`).get(req.params.id);
  if (!agent) {
    res.status(404).json({ message: "智能体不存在。" });
    return;
  }

  const nextStatus = req.body.status || (req.body.action === "approve" ? "approved" : req.body.action === "reject" ? "rejected" : agent.status);
  const nextFeatured = req.body.featured !== undefined ? Number(req.body.featured === true || req.body.featured === "true") : agent.featured;

  db.prepare(`UPDATE agents SET status = ?, featured = ?, updated_at = ? WHERE id = ?`).run(nextStatus, nextFeatured, nowIso(), agent.id);

  addAuditLog({
    targetTable: "agents",
    targetId: agent.id,
    action: `agent_${nextStatus}`,
    adminId: req.user.id,
    notes: req.body.notes || "",
  });

  createNotification(agent.school_id, "智能体审核结果已更新", `你的智能体“${agent.name}”当前状态为：${nextStatus}。`);

  const updated = db.prepare(`${agentSelect} WHERE a.id = ?`).get(agent.id);
  res.json({ agent: serializeAgent(updated) });
}

router.patch("/agents/:id", updateAgentStatus);
router.patch("/agents/:id/status", updateAgentStatus);

function updateOrderStatus(req, res) {
  const order = db.prepare(`${orderSelect} WHERE o.id = ?`).get(req.params.id);
  if (!order) {
    res.status(404).json({ message: "订单不存在。" });
    return;
  }

  const nextPaymentStatus = req.body.paymentStatus || order.payment_status;
  const nextStatus = req.body.status || (nextPaymentStatus === "confirmed" ? "paid" : order.status);

  db.prepare(`UPDATE orders SET status = ?, payment_status = ?, updated_at = ?, note = COALESCE(?, note) WHERE id = ?`).run(
    nextStatus,
    nextPaymentStatus,
    nowIso(),
    req.body.note ?? null,
    order.id,
  );

  db.prepare(`UPDATE payments SET pay_method = ?, pay_status = ?, pay_time = ?, remark = ? WHERE order_id = ?`).run(
    req.body.payMethod || "manual_transfer",
    nextPaymentStatus === "confirmed" ? "confirmed" : nextPaymentStatus === "rejected" ? "rejected" : "pending",
    nextPaymentStatus === "confirmed" ? nowIso() : null,
    req.body.remark || "管理员已处理订单支付状态。",
    order.id,
  );

  addAuditLog({
    targetTable: "orders",
    targetId: order.id,
    action: `order_${nextStatus}_${nextPaymentStatus}`,
    adminId: req.user.id,
    notes: req.body.remark || "",
  });

  createNotification(order.buyer_id, "订单状态已更新", `订单 #${order.id} 状态：${nextStatus}，支付状态：${nextPaymentStatus}。`);
  if (order.school_id) {
    createNotification(order.school_id, "订单处理有新进展", `订单 #${order.id} 状态：${nextStatus}，请及时跟进。`);
  }

  const updated = db.prepare(`${orderSelect} WHERE o.id = ?`).get(order.id);
  res.json({ order: serializeOrder(updated) });
}

router.patch("/orders/:id", updateOrderStatus);
router.patch("/orders/:id/status", updateOrderStatus);

export default router;
