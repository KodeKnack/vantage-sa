import crypto from "crypto";

export function hmacSha256(message: string) {
  const secret = process.env.HMAC_SECRET;
  if (process.env.NODE_ENV === "production" && !secret) {
    throw new Error("Missing HMAC_SECRET in production");
  }
  const key = secret ?? "dev-secret";
  return crypto.createHmac("sha256", key).update(message).digest("hex");
}

