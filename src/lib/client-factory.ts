import { PipecornClient, DEFAULT_BASE_URL } from "../api/client.js";
import { configStore } from "./config.js";
import { resolveAuth } from "./credentials.js";

export async function buildClient(flagKey?: string): Promise<PipecornClient> {
  const auth = await resolveAuth(flagKey);
  const fromConfig = configStore().get("base_url");
  const baseUrl = auth.baseUrl ?? fromConfig ?? DEFAULT_BASE_URL;
  return new PipecornClient({ apiKey: auth.apiKey, baseUrl });
}
