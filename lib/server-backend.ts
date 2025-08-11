// lib/server-backend.ts
export function getBackendUrl() {
  const u = process.env.HOXTON_API_URL;
  if (!u) throw new Error("HOXTON_API_URL is not set");
  return u.replace(/\/$/, "");
}

export function withBasicAuth(init: RequestInit = {}) {
  const user = process.env.BASIC_AUTH_USER ?? "";
  const pass = process.env.BASIC_AUTH_PASS ?? "";
  const auth = "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");

  const headers = new Headers(init.headers as any);
  if (!headers.has("Authorization")) headers.set("Authorization", auth);
  return { ...init, headers };
}
