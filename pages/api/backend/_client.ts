import axios from "axios";

export function hoxtonClient() {
  const baseURL = process.env.HOXTON_API_BASE_URL!;
  const user = process.env.BASIC_AUTH_USER!;
  const pass = process.env.BASIC_AUTH_PASS!;
  if (!baseURL || !user || !pass) throw new Error("Backend env missing");
  return axios.create({
    baseURL,
    auth: { username: user, password: pass },
    timeout: 15000,
    headers: { Accept: "application/json" },
  });
}
