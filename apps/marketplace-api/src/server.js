import app from "./app.js";
import { env } from "./config/env.js";
import { initDatabase } from "./database/index.js";

initDatabase();

app.listen(env.port, () => {
  console.log(`恒河沙智能体交易网 API 已启动: http://localhost:${env.port}`);
});
