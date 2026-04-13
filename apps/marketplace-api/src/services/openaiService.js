import OpenAI from "openai";

import { env } from "../config/env.js";

const client = env.openaiApiKey ? new OpenAI({ apiKey: env.openaiApiKey }) : null;

function extractJSONObject(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("模型未返回 JSON 对象。");
  }
  return JSON.parse(match[0]);
}

function buildMockResult({ requirement, type }) {
  const snippet = String(requirement || "").slice(0, 24) || "智能体需求";
  return {
    name: `${type || "通用"}智能体方案`,
    summary: `围绕“${snippet}”生成的演示型智能体简介。`,
    description: "适合快速验证业务流程、构建展示页面，并形成可以继续上架和定制开发的产品雏形。",
    promptTemplate: "请以专业、可信、简洁的方式回答用户问题，并在最后补充下一步建议。",
    conversationTemplate: "1. 识别需求 2. 追问背景 3. 输出方案 4. 邀请留资或转人工",
    recommendedPrice: 128000,
    suggestedCategory: type || "定制",
  };
}

export async function generateAgentContent(payload) {
  if (!client) {
    return {
      source: "mock",
      result: buildMockResult(payload),
    };
  }

  const response = await client.responses.create({
    model: env.openaiModel,
    reasoning: { effort: "low" },
    instructions:
      "你是智能体交易平台的产品经理。请严格返回 JSON，包含 name、summary、description、promptTemplate、conversationTemplate、recommendedPrice、suggestedCategory。",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify(payload),
          },
        ],
      },
    ],
  });

  return {
    source: "openai",
    result: extractJSONObject(response.output_text),
    raw: response,
  };
}
