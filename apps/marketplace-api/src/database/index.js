import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

import { env } from "../config/env.js";
import { nowIso, parseJSON, slugify } from "../utils/helpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "../..");
const dbPath = path.resolve(appRoot, env.dbPath);

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new DatabaseSync(dbPath);
db.exec("PRAGMA journal_mode = WAL;");

const demoPassword = "password123";

const seedUsers = [
  {
    email: "admin@henghesha.com",
    role: "admin",
    fullName: "平台管理员",
    organizationName: "恒河沙平台",
    phone: "13800000000",
    bio: "负责平台审核、用户管理和支付确认。",
  },
  {
    email: "school@example.com",
    role: "school",
    fullName: "陈老师",
    organizationName: "星河职业学院",
    phone: "13900000001",
    bio: "学校侧演示账户，可上传与管理智能体成果。",
  },
  {
    email: "enterprise@example.com",
    role: "enterprise",
    fullName: "周总",
    organizationName: "远图科技",
    phone: "13700000002",
    bio: "企业侧演示账户，可发布需求和采购智能体。",
  },
];

const seedAgents = [
  {
    key: "admission",
    name: "招生问答助手",
    summary: "面向学校招生咨询的多轮问答智能体。",
    description: "支持专业推荐、报考条件说明、预约到访和家长常见问题解答。",
    images: ["/uploads/seed/admission-cover.svg", "/uploads/seed/admission-secondary.svg"],
    demos: ["/uploads/seed/admission-demo.svg", "/uploads/seed/admission-demo-2.svg"],
    price: 98000,
    category: "教育",
    status: "approved",
    featured: 1,
    promptTemplate: "请以专业、可信、简洁的方式回答用户问题，并在最后给出下一步建议。",
    conversationTemplate: "1. 识别需求 2. 追问背景 3. 输出方案 4. 引导留资或转人工",
  },
  {
    key: "sales",
    name: "企业售前顾问",
    summary: "面向企业客户接待和方案初筛的智能体。",
    description: "适用于企业官网、公众号和展会场景，可自动收集需求并推荐解决方案。",
    images: ["/uploads/seed/sales-cover.svg", "/uploads/seed/sales-secondary.svg"],
    demos: ["/uploads/seed/sales-demo.svg", "/uploads/seed/sales-demo-2.svg"],
    price: 168000,
    category: "企业",
    status: "approved",
    featured: 1,
    promptTemplate: "请以专业、克制、商业顾问式的方式识别客户需求，并给出结构化建议。",
    conversationTemplate: "1. 判断客户类型 2. 追问应用场景 3. 给出方案建议 4. 引导留资或转人工",
  },
  {
    key: "culture",
    name: "文旅讲解官",
    summary: "适用于景区、博物馆和城市文旅场景的导览智能体。",
    description: "支持讲解脚本、路线推荐、活动介绍和游客问答。",
    images: ["/uploads/seed/culture-cover.svg", "/uploads/seed/culture-secondary.svg"],
    demos: ["/uploads/seed/culture-demo.svg", "/uploads/seed/culture-demo-2.svg"],
    price: 128000,
    category: "文旅",
    status: "approved",
    featured: 0,
    promptTemplate: "请以亲和、可信、具有导览感的语气介绍景点或活动，并补充游玩建议。",
    conversationTemplate: "1. 识别游客需求 2. 推荐路线或项目 3. 提供讲解信息 4. 补充注意事项",
  },
];

const demoOrderSeed = {
  title: "高校招生场景智能体采购",
  description: "希望围绕招生问答助手做官网和企微双端部署。",
  note: "请补充交付周期、知识库整理方式和后续运维建议。",
  budget: 120000,
  deliveryDeadline: "2026-05-10",
  status: "pending",
  paymentStatus: "submitted",
  payMethod: "manual_transfer",
  payRemark: "企业已提交线下支付回执，等待管理员确认。",
};

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'school', 'enterprise')),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'disabled')),
      full_name TEXT NOT NULL,
      organization_name TEXT,
      phone TEXT,
      avatar_url TEXT,
      bio TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      summary TEXT NOT NULL,
      description TEXT NOT NULL,
      image_urls_json TEXT NOT NULL,
      demo_image_urls_json TEXT NOT NULL,
      file_url TEXT,
      price INTEGER NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')),
      school_id INTEGER NOT NULL,
      prompt_template TEXT,
      conversation_template TEXT,
      featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (school_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      buyer_id INTEGER NOT NULL,
      school_id INTEGER,
      agent_id INTEGER,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      note TEXT,
      attachment_url TEXT,
      budget INTEGER NOT NULL,
      delivery_deadline TEXT,
      status TEXT NOT NULL CHECK(status IN ('pending', 'paid', 'completed', 'cancelled')),
      payment_status TEXT NOT NULL CHECK(payment_status IN ('manual_pending', 'submitted', 'confirmed', 'rejected')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (buyer_id) REFERENCES users(id),
      FOREIGN KEY (school_id) REFERENCES users(id),
      FOREIGN KEY (agent_id) REFERENCES agents(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      pay_method TEXT NOT NULL,
      pay_status TEXT NOT NULL CHECK(pay_status IN ('pending', 'confirmed', 'rejected')),
      pay_time TEXT,
      remark TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target_table TEXT NOT NULL,
      target_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      admin_id INTEGER NOT NULL,
      notes TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (admin_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  ensureColumn("users", "status", "TEXT NOT NULL DEFAULT 'active'");
  ensureColumn("orders", "note", "TEXT");
  ensureColumn("orders", "attachment_url", "TEXT");

  seedDemoData();
  normalizeDemoSeedData();
  syncSeedMedia();
}

function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = columns.some((item) => item.name === column);
  if (!exists) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

export function serializeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.full_name,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    status: user.status || "active",
    organizationName: user.organization_name,
    phone: user.phone,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export function serializeAgent(row) {
  if (!row) {
    return null;
  }

  const imageUrls = parseJSON(row.image_urls_json, []);
  const demoImageUrls = parseJSON(row.demo_image_urls_json, []);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    summary: row.summary,
    description: row.description,
    imageUrls,
    demoImageUrls,
    thumbnailUrl: imageUrls[0] || "",
    demoUrl: demoImageUrls[0] || "",
    fileUrl: row.file_url,
    price: row.price,
    category: row.category,
    status: row.status,
    featured: Boolean(row.featured),
    promptTemplate: row.prompt_template,
    conversationTemplate: row.conversation_template,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    school: row.school_id
      ? {
          id: row.school_id,
          fullName: row.school_name,
          organizationName: row.school_org,
        }
      : null,
  };
}

export function serializeOrder(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    buyerId: row.buyer_id,
    schoolId: row.school_id,
    agentId: row.agent_id,
    title: row.title,
    description: row.description,
    note: row.note,
    attachmentUrl: row.attachment_url,
    budget: row.budget,
    deliveryDeadline: row.delivery_deadline,
    status: row.status,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    buyerName: row.buyer_name,
    buyerOrg: row.buyer_org,
    schoolName: row.school_name,
    schoolOrg: row.school_org,
    agentName: row.agent_name,
  };
}

export function createNotification(userId, title, message) {
  db.prepare(`
    INSERT INTO notifications (user_id, title, message, is_read, created_at)
    VALUES (?, ?, ?, 0, ?)
  `).run(userId, title, message, nowIso());
}

export function addAuditLog({ targetTable, targetId, action, adminId, notes = "" }) {
  db.prepare(`
    INSERT INTO audit_logs (target_table, target_id, action, admin_id, notes, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(targetTable, targetId, action, adminId, notes, nowIso());
}

function seedDemoData() {
  const count = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
  if (count > 0) {
    return;
  }

  const time = nowIso();
  const passwordHash = bcrypt.hashSync(demoPassword, 10);
  const insertUser = db.prepare(`
    INSERT INTO users (
      email, password_hash, role, status, full_name, organization_name, phone, avatar_url, bio, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const user of seedUsers) {
    insertUser.run(
      user.email,
      passwordHash,
      user.role,
      "active",
      user.fullName,
      user.organizationName,
      user.phone,
      "",
      user.bio,
      time,
      time,
    );
  }

  const school = db.prepare(`SELECT id FROM users WHERE email = 'school@example.com' LIMIT 1`).get();
  const enterprise = db.prepare(`SELECT id FROM users WHERE email = 'enterprise@example.com' LIMIT 1`).get();
  if (!school || !enterprise) {
    return;
  }

  const insertAgent = db.prepare(`
    INSERT INTO agents (
      name, slug, summary, description, image_urls_json, demo_image_urls_json, file_url,
      price, category, status, school_id, prompt_template, conversation_template,
      featured, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const agent of seedAgents) {
    insertAgent.run(
      agent.name,
      slugify(agent.name),
      agent.summary,
      agent.description,
      JSON.stringify(agent.images),
      JSON.stringify(agent.demos),
      "",
      agent.price,
      agent.category,
      agent.status,
      school.id,
      agent.promptTemplate,
      agent.conversationTemplate,
      agent.featured,
      time,
      time,
    );
  }

  const firstAgent = db.prepare(`SELECT id, school_id FROM agents ORDER BY id ASC LIMIT 1`).get();
  if (!firstAgent) {
    return;
  }

  const order = db.prepare(`
    INSERT INTO orders (
      buyer_id, school_id, agent_id, title, description, note, attachment_url,
      budget, delivery_deadline, status, payment_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    enterprise.id,
    firstAgent.school_id,
    firstAgent.id,
    demoOrderSeed.title,
    demoOrderSeed.description,
    demoOrderSeed.note,
    "",
    demoOrderSeed.budget,
    demoOrderSeed.deliveryDeadline,
    demoOrderSeed.status,
    demoOrderSeed.paymentStatus,
    time,
    time,
  );

  db.prepare(`
    INSERT INTO payments (order_id, pay_method, pay_status, pay_time, remark, created_at)
    VALUES (?, ?, ?, NULL, ?, ?)
  `).run(order.lastInsertRowid, demoOrderSeed.payMethod, "pending", demoOrderSeed.payRemark, time);

  createNotification(firstAgent.school_id, "收到新的订单请求", `订单 #${order.lastInsertRowid} 已指向你的智能体，请尽快查看。`);
  createNotification(enterprise.id, "订单已创建", `订单 #${order.lastInsertRowid} 已提交，等待平台审核支付与交付流程。`);
}

function normalizeDemoSeedData() {
  const time = nowIso();

  for (const user of seedUsers) {
    db.prepare(`
      UPDATE users
      SET
        full_name = ?,
        organization_name = ?,
        phone = ?,
        bio = ?,
        status = COALESCE(status, 'active'),
        updated_at = ?
      WHERE email = ?
    `).run(user.fullName, user.organizationName, user.phone, user.bio, time, user.email);
  }

  for (const agent of seedAgents) {
    const patterns = agent.images.concat(agent.demos).map((item) => path.basename(item));
    const conditions = patterns.map(() => `(image_urls_json LIKE ? OR demo_image_urls_json LIKE ?)`).join(" OR ");
    const values = patterns.flatMap((pattern) => [`%${pattern}%`, `%${pattern}%`]);
    const existing = db.prepare(`SELECT id FROM agents WHERE ${conditions} LIMIT 1`).get(...values);
    if (!existing) {
      continue;
    }

    db.prepare(`
      UPDATE agents
      SET
        name = ?,
        slug = ?,
        summary = ?,
        description = ?,
        image_urls_json = ?,
        demo_image_urls_json = ?,
        price = ?,
        category = ?,
        status = ?,
        prompt_template = ?,
        conversation_template = ?,
        featured = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      agent.name,
      slugify(agent.name),
      agent.summary,
      agent.description,
      JSON.stringify(agent.images),
      JSON.stringify(agent.demos),
      agent.price,
      agent.category,
      agent.status,
      agent.promptTemplate,
      agent.conversationTemplate,
      agent.featured,
      time,
      existing.id,
    );
  }

  const enterprise = db.prepare(`SELECT id FROM users WHERE email = 'enterprise@example.com' LIMIT 1`).get();
  const firstAgent = db.prepare(`SELECT id, school_id FROM agents ORDER BY id ASC LIMIT 1`).get();
  if (!enterprise || !firstAgent) {
    return;
  }

  const demoOrder = db.prepare(`
    SELECT id
    FROM orders
    WHERE buyer_id = ? AND agent_id = ?
    ORDER BY id ASC
    LIMIT 1
  `).get(enterprise.id, firstAgent.id);

  if (!demoOrder) {
    return;
  }

  db.prepare(`
    UPDATE orders
    SET
      title = ?,
      description = ?,
      note = ?,
      budget = ?,
      delivery_deadline = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    demoOrderSeed.title,
    demoOrderSeed.description,
    demoOrderSeed.note,
    demoOrderSeed.budget,
    demoOrderSeed.deliveryDeadline,
    time,
    demoOrder.id,
  );

  db.prepare(`UPDATE payments SET remark = ? WHERE order_id = ?`).run(demoOrderSeed.payRemark, demoOrder.id);
}

function syncSeedMedia() {
  for (const agent of seedAgents) {
    db.prepare(`
      UPDATE agents
      SET image_urls_json = ?, demo_image_urls_json = ?, updated_at = ?
      WHERE name = ?
    `).run(JSON.stringify(agent.images), JSON.stringify(agent.demos), nowIso(), agent.name);
  }
}
