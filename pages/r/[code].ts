// pages/r/[code].ts
import type { GetServerSideProps } from "next";

// Target = your public landing page (home or /pricing etc.)
const LANDING_URL =
  process.env.NEXT_PUBLIC_REFERRAL_LANDING_URL ||
  process.env.NEXT_PUBLIC_SITE_ORIGIN ||
  "https://betaoffice.uk/";

// Resolve backend base URL (Render)
function backendBase() {
  const b = process.env.NEXT_PUBLIC_HOXTON_API_URL  || process.env.BACKEND_URL || "";
  return String(b).replace(/\/+$/, "");
}

export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
  const code = String(params?.code || "").trim();
  const be = backendBase();

  // 1) increment click + try to resolve external_id
  try {
    const r = await fetch(`${be}/referral/resolve-click?code=${encodeURIComponent(code)}`, {
      method: "POST",
    });
    const data = await r.json().catch(() => ({}));

    // 2) set first-party cookies on your frontend domain
    const maxAge = 60 * 60 * 24 * 30; // 30 days
    const cookies: string[] = [
      `ref_code=${code}; Path=/; Max-Age=${maxAge}; SameSite=Lax`,
    ];
    if (data?.external_id) {
      cookies.push(`ref_external_id=${data.external_id}; Path=/; Max-Age=${maxAge}; SameSite=Lax`);
    }
    res.setHeader("Set-Cookie", cookies);
  } catch {
    // ignore; we still redirect below
  }

  // 3) redirect to the public landing page with UTM tags
  const url = new URL(LANDING_URL.endsWith("/") ? LANDING_URL : LANDING_URL + "/");
  url.searchParams.set("ref", code);
  url.searchParams.set("utm_source", "referral");
  url.searchParams.set("utm_medium", "link");
  url.searchParams.set("utm_campaign", `ref_${code}`);

  res.statusCode = 302;
  res.setHeader("Location", url.toString());
  res.end();
  return { props: {} as any };
};

export default function RefRedirect() {
  return null;
}
