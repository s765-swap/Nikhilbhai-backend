import dotenv from "dotenv";

dotenv.config();

export type StaffUser = {
  username: string;
  password: string; // plaintext for simplicity (internal tool)
  name: string;
};

function mustGet(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? "8080"),
  mongodbUri: mustGet("MONGODB_URI"),
  jwtSecret: mustGet("JWT_SECRET"),
  corsOrigin: mustGet("CORS_ORIGIN"),
  users: (() => {
    const raw = mustGet("USERS_JSON");
    try {
      const parsed = JSON.parse(raw) as StaffUser[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("USERS_JSON must be a non-empty JSON array");
      }
      return parsed;
    } catch (e: any) {
      throw new Error(
        `Invalid USERS_JSON: ${e?.message ?? "could not parse JSON"}`
      );
    }
  })(),
} as const;

