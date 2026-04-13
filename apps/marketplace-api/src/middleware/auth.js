import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { db, serializeUser } from "../database/index.js";

export function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    env.jwtSecret,
    { expiresIn: "7d" },
  );
}

function getUserById(id) {
  return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id);
}

function resolveSafeUser(id) {
  const user = serializeUser(getUserById(id));
  if (!user || user.status === "disabled") {
    return null;
  }
  return user;
}

export function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    req.user = null;
    next();
    return;
  }

  try {
    const payload = jwt.verify(authHeader.slice(7), env.jwtSecret);
    req.user = resolveSafeUser(payload.sub);
  } catch {
    req.user = null;
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    res.status(401).json({ message: "请先登录。" });
    return;
  }
  next();
}

export function requireRole(...roles) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      res.status(401).json({ message: "请先登录。" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "当前角色无权执行该操作。" });
      return;
    }
    next();
  };
}
