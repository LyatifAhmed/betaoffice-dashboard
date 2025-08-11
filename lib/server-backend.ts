// lib/server-backend.ts
export function getBackendUrl() {
  const u = process.env.HOXTON_API_URL || process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL;
  if (!u) throw new Error("Backend URL missing (HOXTON_API_URL)");
  return u.replace(/\/$/, "");
}

export function withBasicAuth(init: RequestInit = {}): RequestInit {
  const u = process.env.BASIC_AUTH_USER;
  const p = process.env.BASIC_AUTH_PASS;
  const headers = new Headers(init.headers || {});
  if (u && p) {
    headers.set("Authorization", "Basic " + Buffer.from(`${u}:${p}`).toString("base64"));
  }
  return { ...init, headers };
}
