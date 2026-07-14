import { promises as fs } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { AuthError } from "../api/errors.js";

const ENV_VAR = "PIPECORN_API_KEY";

export interface StoredCredentials {
  api_key: string;
  base_url?: string;
  saved_at: string;
}

export function credentialsPath(): string {
  const xdg = process.env.XDG_CONFIG_HOME;
  const base = xdg && xdg.length > 0 ? xdg : path.join(homedir(), ".config");
  return path.join(base, "pipecorn", "credentials.json");
}

export async function readCredentials(): Promise<StoredCredentials | undefined> {
  try {
    const raw = await fs.readFile(credentialsPath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<StoredCredentials>;
    if (typeof parsed.api_key === "string" && parsed.api_key.length > 0) {
      return {
        api_key: parsed.api_key,
        base_url: parsed.base_url,
        saved_at: parsed.saved_at ?? new Date().toISOString(),
      };
    }
    return undefined;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw err;
  }
}

export async function writeCredentials(creds: StoredCredentials): Promise<void> {
  const file = credentialsPath();
  await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  await fs.writeFile(file, JSON.stringify(creds, null, 2), { mode: 0o600 });
}

export async function clearCredentials(): Promise<boolean> {
  try {
    await fs.unlink(credentialsPath());
    return true;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw err;
  }
}

export interface ResolvedAuth {
  apiKey: string;
  baseUrl: string | undefined;
  source: "flag" | "env" | "file";
}

export async function resolveAuth(
  flagKey: string | undefined,
): Promise<ResolvedAuth> {
  if (flagKey && flagKey.length > 0) {
    return { apiKey: flagKey, baseUrl: undefined, source: "flag" };
  }
  const fromEnv = process.env[ENV_VAR];
  if (fromEnv && fromEnv.length > 0) {
    return { apiKey: fromEnv, baseUrl: undefined, source: "env" };
  }
  const stored = await readCredentials();
  if (stored) {
    return { apiKey: stored.api_key, baseUrl: stored.base_url, source: "file" };
  }
  throw new AuthError(
    {
      error:
        "No API key found. Set PIPECORN_API_KEY or run `pipecorn login`. Get a key at https://app.pipecorn.com/settings/apis/keys.",
    },
    "No API key found. Set PIPECORN_API_KEY or run `pipecorn login`. Get a key at https://app.pipecorn.com/settings/apis/keys.",
  );
}
