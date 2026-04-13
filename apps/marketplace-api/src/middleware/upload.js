import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "../..");
const imageDir = path.join(appRoot, "uploads", "images");
const agentDir = path.join(appRoot, "uploads", "agents");
const orderDir = path.join(appRoot, "uploads", "orders");

fs.mkdirSync(imageDir, { recursive: true });
fs.mkdirSync(agentDir, { recursive: true });
fs.mkdirSync(orderDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === "agentFile") {
      cb(null, agentDir);
      return;
    }
    if (file.fieldname === "attachment") {
      cb(null, orderDir);
      return;
    }
    cb(null, imageDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]+/g, "-");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

export const agentUpload = multer({ storage });
export const orderUpload = multer({ storage });
