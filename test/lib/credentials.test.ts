import { mkdtempSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearCredentials,
  credentialsPath,
  readCredentials,
  resolveAuth,
  writeCredentials,
} from "../../src/lib/credentials.js";

describe("credentials", () => {
  const originalXdg = process.env.XDG_CONFIG_HOME;
  const originalKey = process.env.PRONTO_API_KEY;

  beforeEach(() => {
    process.env.XDG_CONFIG_HOME = mkdtempSync(path.join(tmpdir(), "pronto-cli-"));
    delete process.env.PRONTO_API_KEY;
  });

  afterEach(() => {
    if (originalXdg === undefined) delete process.env.XDG_CONFIG_HOME;
    else process.env.XDG_CONFIG_HOME = originalXdg;
    if (originalKey === undefined) delete process.env.PRONTO_API_KEY;
    else process.env.PRONTO_API_KEY = originalKey;
  });

  it("writes credentials with 0600 perms", async () => {
    await writeCredentials({
      api_key: "pk_test",
      saved_at: new Date().toISOString(),
    });
    const file = credentialsPath();
    const mode = statSync(file).mode & 0o777;
    expect(mode).toBe(0o600);
    const read = await readCredentials();
    expect(read?.api_key).toBe("pk_test");
  });

  it("readCredentials returns undefined when file missing", async () => {
    expect(await readCredentials()).toBeUndefined();
  });

  it("clearCredentials returns false when no file exists", async () => {
    expect(await clearCredentials()).toBe(false);
    await writeCredentials({ api_key: "x", saved_at: new Date().toISOString() });
    expect(await clearCredentials()).toBe(true);
  });

  it("resolveAuth prefers flag over env over file", async () => {
    await writeCredentials({ api_key: "from-file", saved_at: "now" });
    process.env.PRONTO_API_KEY = "from-env";
    expect((await resolveAuth("from-flag")).apiKey).toBe("from-flag");
    expect((await resolveAuth(undefined)).apiKey).toBe("from-env");
    delete process.env.PRONTO_API_KEY;
    expect((await resolveAuth(undefined)).apiKey).toBe("from-file");
  });

  it("resolveAuth throws AuthError when nothing is set", async () => {
    await expect(resolveAuth(undefined)).rejects.toThrow(
      /No API key found/,
    );
  });
});
