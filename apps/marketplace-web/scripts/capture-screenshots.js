import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import puppeteer from "puppeteer-core";

const apiPort = 4000;
const webPort = 4173;

process.env.PORT = String(apiPort);
process.env.CLIENT_ORIGIN = `http://127.0.0.1:${webPort}`;

const { default: apiApp } = await import("../../marketplace-api/src/app.js");
const { initDatabase } = await import("../../marketplace-api/src/database/index.js");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");
const distRoot = path.join(webRoot, "dist");
const screenshotRoot = path.resolve(webRoot, "..", "..", "docs", "screenshots");
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

if (!fs.existsSync(distRoot)) {
  throw new Error("dist 目录不存在，请先运行 npm run build。");
}

fs.mkdirSync(screenshotRoot, { recursive: true });

function contentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  return "application/octet-stream";
}

function createStaticServer(rootDir) {
  return http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    let filePath = path.join(rootDir, urlPath === "/" ? "index.html" : urlPath.replace(/^\//, ""));

    if (!filePath.startsWith(rootDir)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(rootDir, "index.html");
    }

    try {
      const data = fs.readFileSync(filePath);
      res.writeHead(200, { "Content-Type": contentType(filePath) });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });
}

async function waitForHttp(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function isReachable(url) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

let apiServer = null;
let staticServer = null;

if (!(await isReachable(`http://127.0.0.1:${apiPort}/api/health`))) {
  initDatabase();
  apiServer = apiApp.listen(apiPort);
}

if (!(await isReachable(`http://127.0.0.1:${webPort}/`))) {
  staticServer = createStaticServer(distRoot).listen(webPort);
}

try {
  await waitForHttp(`http://127.0.0.1:${apiPort}/api/health`);
  await waitForHttp(`http://127.0.0.1:${webPort}/`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    defaultViewport: {
      width: 1440,
      height: 1800,
      deviceScaleFactor: 1,
    },
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    async function resetSession(page) {
      await page.goto(`http://127.0.0.1:${webPort}/`, { waitUntil: "networkidle0" });
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    }

    async function captureProtectedPage({ path: targetPath, expectedPath, email, password, screenshotName }) {
      const page = await browser.newPage();
      await resetSession(page);
      await page.goto(`http://127.0.0.1:${webPort}${targetPath}`, { waitUntil: "networkidle0" });
      await page.waitForFunction(
        (path) => window.location.pathname === path || Boolean(document.querySelector('input[type="email"]')),
        {},
        expectedPath,
      );

      const alreadyOnTarget = await page.evaluate((path) => window.location.pathname === path, expectedPath);

      if (!alreadyOnTarget) {
        await page.type('input[type="email"]', email);
        await page.type('input[type="password"]', password);
        await Promise.all([
          page.waitForFunction((path) => window.location.pathname === path, {}, expectedPath),
          page.click('button[type="submit"]'),
        ]);
      }

      await page.screenshot({
        path: path.join(screenshotRoot, screenshotName),
        fullPage: true,
      });
    }

    const homePage = await browser.newPage();
    await homePage.goto(`http://127.0.0.1:${webPort}/`, { waitUntil: "networkidle0" });
    await homePage.screenshot({
      path: path.join(screenshotRoot, "homepage.png"),
      fullPage: true,
    });

    const agentsPage = await browser.newPage();
    await agentsPage.goto(`http://127.0.0.1:${webPort}/agents`, { waitUntil: "networkidle0" });
    await agentsPage.screenshot({
      path: path.join(screenshotRoot, "agents.png"),
      fullPage: true,
    });

    const templatesPage = await browser.newPage();
    await templatesPage.goto(`http://127.0.0.1:${webPort}/templates`, { waitUntil: "networkidle0" });
    await templatesPage.screenshot({
      path: path.join(screenshotRoot, "templates.png"),
      fullPage: true,
    });

    const casesPage = await browser.newPage();
    await casesPage.goto(`http://127.0.0.1:${webPort}/cases`, { waitUntil: "networkidle0" });
    await casesPage.screenshot({
      path: path.join(screenshotRoot, "cases.png"),
      fullPage: true,
    });

    const detailPage = await browser.newPage();
    await detailPage.goto(`http://127.0.0.1:${webPort}/agents/1`, { waitUntil: "networkidle0" });
    await detailPage.screenshot({
      path: path.join(screenshotRoot, "agent-detail.png"),
      fullPage: true,
    });

    const authPage = await browser.newPage();
    await resetSession(authPage);
    await authPage.goto(`http://127.0.0.1:${webPort}/auth`, { waitUntil: "networkidle0" });
    await authPage.screenshot({
      path: path.join(screenshotRoot, "auth.png"),
      fullPage: true,
    });

    await captureProtectedPage({
      path: "/school/upload",
      expectedPath: "/school/upload",
      email: "school@example.com",
      password: "password123",
      screenshotName: "school-upload.png",
    });

    await captureProtectedPage({
      path: "/enterprise/orders/new",
      expectedPath: "/enterprise/orders/new",
      email: "enterprise@example.com",
      password: "password123",
      screenshotName: "enterprise-order.png",
    });

    await captureProtectedPage({
      path: "/orders",
      expectedPath: "/orders",
      email: "enterprise@example.com",
      password: "password123",
      screenshotName: "orders.png",
    });

    await captureProtectedPage({
      path: "/profile",
      expectedPath: "/profile",
      email: "enterprise@example.com",
      password: "password123",
      screenshotName: "profile.png",
    });

    await captureProtectedPage({
      path: "/admin",
      expectedPath: "/admin",
      email: "admin@henghesha.com",
      password: "password123",
      screenshotName: "admin.png",
    });
  } finally {
    await browser.close();
  }
} finally {
  if (apiServer) {
    await new Promise((resolve) => apiServer.close(resolve));
  }
  if (staticServer) {
    await new Promise((resolve) => staticServer.close(resolve));
  }
}
