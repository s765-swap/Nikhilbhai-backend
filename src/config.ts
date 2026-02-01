import dotenv from "dotenv";

dotenv.config();

export type StaffUser = {
  username: string;
  password: string; // plaintext for simplicity (internal tool)
  name: string;
};

function mustGet(name: string): string {
  const raw = process.env[name];
  const v = typeof raw === "string" ? raw.trim() : raw;
  if (!v) throw new Error(`Missing env var ${name}`);

  // Helpful validation for Mongo URI to avoid confusing parse errors at startup.
  if (name === "MONGODB_URI") {
    // Allow forgiving input where the full line was pasted as the value
    // (e.g. "MONGODB_URI=mongodb://...") — strip the leading "MONGODB_URI=" if present.
    let s = String(v);
    if (s.startsWith(`${name}=`)) {
      s = s.slice(name.length + 1);
    }
    s = s.trim();
    if (!/^mongodb(\+srv)?:\/\//i.test(s)) {
      throw new Error(
        `Invalid MONGODB_URI. It must start with "mongodb://" or "mongodb+srv://". Got: ${s}`
      );
    }

    // use the possibly-stripped/trimmed string as the value
    return s;
  }

  return String(v);
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

