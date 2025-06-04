import jwt from "jsonwebtoken";

const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET!;
if (!MAGIC_LINK_SECRET) throw new Error("Missing MAGIC_LINK_SECRET");

const TOKEN_EXPIRY_SECONDS = 60 * 15; // 15 dakika geçerli

export function generateToken(email: string): string {
  return jwt.sign({ email }, MAGIC_LINK_SECRET, { expiresIn: TOKEN_EXPIRY_SECONDS });
}

export function verifyToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, MAGIC_LINK_SECRET) as { email: string };
    return payload.email;
  } catch (err) {
    return null;
  }
}
