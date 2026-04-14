import axios from "axios";

const explicitApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const fallbackApiBaseUrl =
  typeof window !== "undefined" ? new URL("/api", window.location.origin).toString() : "http://localhost:4000/api";

const API_BASE_URL = explicitApiBaseUrl || fallbackApiBaseUrl;
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export function resolveAssetUrl(value) {
  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${API_ORIGIN}${value}`;
  }

  return `${API_ORIGIN}/${value.replace(/^\.?\//, "")}`;
}

export async function apiRequest(path, options = {}) {
  const { token, body, headers = {}, method = "GET" } = options;

  try {
    const response = await client.request({
      url: path,
      method,
      data: body,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error.message || "请求失败";
    throw new Error(message);
  }
}

export { API_BASE_URL, API_ORIGIN };
