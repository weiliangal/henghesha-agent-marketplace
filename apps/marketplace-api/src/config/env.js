import "dotenv/config";

const clientOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

export const env = {
  port: Number(process.env.PORT || 4000),
  clientOrigin: clientOrigins[0] || "http://localhost:5173",
  clientOrigins,
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  dbPath: process.env.DATABASE_PATH || "./data/marketplace.sqlite",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-5.2",
};
