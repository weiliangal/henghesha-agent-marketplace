import bcrypt from "bcryptjs";
import { Router } from "express";

import { db, serializeUser } from "../database/index.js";
import { createToken, requireAuth } from "../middleware/auth.js";
import { nowIso, requireFields } from "../utils/helpers.js";

const router = Router();

router.post("/register", (req, res) => {
  const fullName = req.body.fullName || req.body.name;
  const missing = requireFields({ ...req.body, fullName }, ["email", "password", "role", "fullName"]);
  if (missing.length) {
    res.status(400).json({ message: `缺少字段: ${missing.join(", ")}` });
    return;
  }

  const { email, password, role, organizationName = "", phone = "", bio = "" } = req.body;
  if (!["school", "enterprise"].includes(role)) {
    res.status(400).json({ message: "注册仅支持 school 或 enterprise。" });
    return;
  }

  const exists = db.prepare(`SELECT id FROM users WHERE email = ?`).get(String(email).toLowerCase());
  if (exists) {
    res.status(409).json({ message: "该邮箱已注册。" });
    return;
  }

  const time = nowIso();
  const result = db
    .prepare(
      `
      INSERT INTO users (
        email, password_hash, role, status, full_name, organization_name, phone, avatar_url, bio, created_at, updated_at
      ) VALUES (?, ?, ?, 'active', ?, ?, ?, '', ?, ?, ?)
    `,
    )
    .run(String(email).toLowerCase(), bcrypt.hashSync(password, 10), role, fullName, organizationName, phone, bio, time, time);

  const user = serializeUser(db.prepare(`SELECT * FROM users WHERE id = ?`).get(result.lastInsertRowid));
  res.status(201).json({ token: createToken(user), user });
});

router.post("/login", (req, res) => {
  const missing = requireFields(req.body, ["email", "password"]);
  if (missing.length) {
    res.status(400).json({ message: `缺少字段: ${missing.join(", ")}` });
    return;
  }

  const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(String(req.body.email).toLowerCase());
  if (!user || !bcrypt.compareSync(req.body.password, user.password_hash)) {
    res.status(401).json({ message: "邮箱或密码错误。" });
    return;
  }

  if (user.status === "disabled") {
    res.status(403).json({ message: "该账户已被管理员禁用。" });
    return;
  }

  const safeUser = serializeUser(user);
  res.json({ token: createToken(safeUser), user: safeUser });
});

function sendProfile(req, res) {
  res.json({ user: req.user });
}

router.get("/me", requireAuth, sendProfile);
router.get("/profile", requireAuth, sendProfile);

export default router;
