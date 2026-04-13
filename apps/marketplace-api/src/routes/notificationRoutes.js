import { Router } from "express";

import { db } from "../database/index.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, (req, res) => {
  const notifications = db
    .prepare(`SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 30`)
    .all(req.user.id)
    .map((row) => ({
      id: row.id,
      title: row.title,
      message: row.message,
      isRead: Boolean(row.is_read),
      createdAt: row.created_at,
    }));

  res.json({
    notifications,
    unreadCount: notifications.filter((item) => !item.isRead).length,
  });
});

router.patch("/read-all", requireAuth, (req, res) => {
  db.prepare(`UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`).run(req.user.id);
  res.json({ message: "已将所有通知标记为已读。" });
});

router.patch("/:id/read", requireAuth, (req, res) => {
  const row = db.prepare(`SELECT * FROM notifications WHERE id = ?`).get(req.params.id);
  if (!row || row.user_id !== req.user.id) {
    res.status(404).json({ message: "通知不存在。" });
    return;
  }

  db.prepare(`UPDATE notifications SET is_read = 1 WHERE id = ?`).run(row.id);
  res.json({ message: "通知已标记为已读。" });
});

export default router;
