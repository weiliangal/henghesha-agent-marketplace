import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { env } from "./config/env.js";
import { optionalAuth } from "./middleware/auth.js";
import adminRoutes from "./routes/adminRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import openaiRoutes from "./routes/openaiRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import siteRoutes from "./routes/siteRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadRoot = path.resolve(__dirname, "../uploads");
const bundledUploadRoot = path.resolve(__dirname, "../seed-uploads");
const frontendDist = path.resolve(__dirname, "../../marketplace-web/dist");
const frontendIndex = path.join(frontendDist, "index.html");

app.set("trust proxy", true);
app.use(
  cors((req, callback) => {
    const origin = req.header("Origin");
    const protocol = req.header("x-forwarded-proto")?.split(",")[0]?.trim() || req.protocol;
    const host = req.get("host");
    const sameOrigin = Boolean(origin && host && origin === `${protocol}://${host}`);

    if (!origin || sameOrigin || env.clientOrigins.includes(origin)) {
      callback(null, { origin: true, credentials: true });
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(uploadRoot));
app.use("/uploads", express.static(bundledUploadRoot));
app.use(optionalAuth);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "henghesha-agent-marketplace-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/site", siteRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/openai", openaiRoutes);

if (fs.existsSync(frontendIndex)) {
  app.use(express.static(frontendDist));

  app.get(/^(?!\/api(?:\/|$)|\/uploads(?:\/|$)).*/, (_req, res) => {
    res.sendFile(frontendIndex);
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    message: "服务异常，请稍后重试。",
    detail: err.message,
  });
});

export default app;
