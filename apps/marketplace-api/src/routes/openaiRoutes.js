import { Router } from "express";

import { requireAuth } from "../middleware/auth.js";
import { generateAgentContent } from "../services/openaiService.js";
import { requireFields } from "../utils/helpers.js";

const router = Router();

router.post("/generate", requireAuth, (req, res, next) => {
  Promise.resolve()
    .then(async () => {
      const requirement = req.body.requirement || req.body.prompt;
      const type = req.body.type || req.body.category || "定制";
      const missing = requireFields({ requirement, type }, ["requirement", "type"]);
      if (missing.length) {
        res.status(400).json({ message: `缺少字段: ${missing.join(", ")}` });
        return;
      }

      const payload = {
        requirement,
        type,
        parameters: req.body.parameters || {},
        requesterRole: req.user.role,
      };

      const generated = await generateAgentContent(payload);
      res.json(generated);
    })
    .catch(next);
});

export default router;
