// lib/server-backend.ts
export function getBackendUrl() {
  const raw = process.env.NEXT_PUBLIC_HOXTON_API_URL || "http://localhost:8000";
  return raw.replace(/\/$/, "");
}
export function withBasicAuth(init: RequestInit = {}) {
  const u = process.env.BASIC_AUTH_USER || "";
  const p = process.env.BASIC_AUTH_PASS || "";
  const h = new Headers(init.headers || {});
  if (u || p) h.set("Authorization", "Basic " + Buffer.from(`${u}:${p}`).toString("base64"));
  return { ...init, headers: h };
}
