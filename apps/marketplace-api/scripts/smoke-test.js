import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "henghesha-smoke-"));
const tempDbPath = path.join(tempDir, "marketplace-smoke.sqlite");

process.env.DATABASE_PATH = tempDbPath;
process.env.PORT = "0";

const { default: app } = await import("../src/app.js");
const { db, initDatabase } = await import("../src/database/index.js");

function cleanup() {
  try {
    db.close();
  } catch {}

  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {}
}

async function run() {
  initDatabase();

  const server = await new Promise((resolve, reject) => {
    const instance = app.listen(0, () => resolve(instance));
    instance.on("error", reject);
  });

  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  async function request(pathname, options = {}) {
    const response = await fetch(`${baseUrl}${pathname}`, options);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`${pathname} failed: ${data.message || response.statusText}`);
    }
    return data;
  }

  try {
    const health = await request("/health");
    if (!health.ok) {
      throw new Error("health check returned unexpected response");
    }

    const enterpriseLogin = await request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "enterprise@example.com",
        password: "password123",
      }),
    });

    const adminLogin = await request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@henghesha.com",
        password: "password123",
      }),
    });

    const agents = await request("/agents");
    if (!agents.agents?.length) {
      throw new Error("expected seeded agents");
    }

    const templates = await request("/site/templates");
    if ((templates.templates || []).length !== 100) {
      throw new Error(`expected 100 enterprise templates, received ${(templates.templates || []).length}`);
    }

    const createdOrder = await request("/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${enterpriseLogin.token}`,
      },
      body: JSON.stringify({
        agentId: agents.agents[0].id,
        title: "Smoke Test Order",
        description: "Created by automated smoke test.",
        budget: 120000,
      }),
    });

    await request(`/admin/orders/${createdOrder.order.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminLogin.token}`,
      },
      body: JSON.stringify({
        status: "paid",
        paymentStatus: "confirmed",
        payMethod: "manual_transfer",
        remark: "Smoke test payment confirmation.",
      }),
    });

    const adminOrders = await request("/admin/orders", {
      headers: {
        Authorization: `Bearer ${adminLogin.token}`,
      },
    });

    console.log(
      JSON.stringify(
        {
          ok: true,
          agents: agents.agents.length,
          templates: templates.templates.length,
          orders: adminOrders.orders.length,
          smokeOrderId: createdOrder.order.id,
          database: tempDbPath,
          port,
        },
        null,
        2,
      ),
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
    cleanup();
  }
}

run().catch((error) => {
  console.error(error);
  cleanup();
  process.exit(1);
});
