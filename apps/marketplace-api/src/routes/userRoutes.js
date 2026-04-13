import bcrypt from "bcryptjs";
import { Router } from "express";

import { db, serializeUser } from "../database/index.js";
import { requireAuth } from "../middleware/auth.js";
import { nowIso, requireFields } from "../utils/helpers.js";

const router = Router();

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.patch("/me", requireAuth, (req, res) => {
  db.prepare(
    `
    UPDATE users
    SET full_name = ?, organization_name = ?, phone = ?, bio = ?, avatar_url = ?, updated_at = ?
    WHERE id = ?
  `,
  ).run(
    req.body.fullName || req.user.fullName,
    req.body.organizationName ?? req.user.organizationName,
    req.body.phone ?? req.user.phone,
    req.body.bio ?? req.user.bio,
    req.body.avatarUrl ?? req.user.avatarUrl,
    nowIso(),
    req.user.id,
  );

  const user = serializeUser(db.prepare(`SELECT * FROM users WHERE id = ?`).get(req.user.id));
  res.json({ user });
});

router.patch("/me/password", requireAuth, (req, res) => {
  const missing = requireFields(req.body, ["currentPassword", "newPassword"]);
  if (missing.length) {
    res.status(400).json({ message: `缺少字段: ${missing.join(", ")}` });
    return;
  }

  const current = db.prepare(`SELECT * FROM users WHERE id = ?`).get(req.user.id);
  if (!bcrypt.compareSync(req.body.currentPassword, current.password_hash)) {
    res.status(400).json({ message: "当前密码不正确。" });
    return;
  }

  db.prepare(`UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?`).run(bcrypt.hashSync(req.body.newPassword, 10), nowIso(), req.user.id);

  res.json({ message: "密码已更新。" });
});

export default router;
