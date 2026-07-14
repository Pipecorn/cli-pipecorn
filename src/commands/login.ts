import { Args, Flags } from "@oclif/core";
import chalk from "chalk";
import { PipecornClient, DEFAULT_BASE_URL } from "../api/client.js";
import { Account } from "../api/endpoints.js";
import { PipecornCommand } from "../lib/base-command.js";
import { configStore } from "../lib/config.js";
import {
  credentialsPath,
  writeCredentials,
} from "../lib/credentials.js";

export default class Login extends PipecornCommand {
  static override description =
    "Save a Pipecorn API key locally after validating it against the API.";

  static override examples = [
    "$ pipecorn login --api-key pk_live_…",
    "$ PIPECORN_API_KEY=pk_live_… pipecorn login",
  ];

  static override args = {
    key: Args.string({ description: "API key (omit to read from --api-key or env)" }),
  };

  static override flags = {
    "api-key": Flags.string({
      description: "API key value",
      env: "PIPECORN_API_KEY",
    }),
    "base-url": Flags.string({
      description: `Override API base URL (default: ${DEFAULT_BASE_URL})`,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Login);
    const key = args.key ?? flags["api-key"];
    if (!key) {
      this.error(
        "Provide an API key: `pipecorn login <key>` or set PIPECORN_API_KEY. Get a key at https://app.pipecorn.com/settings/apis/keys",
        { exit: 2 },
      );
    }
    const baseUrl = flags["base-url"] ?? DEFAULT_BASE_URL;
    const client = new PipecornClient({ apiKey: key, baseUrl });
    const account = await Account.me(client);

    await writeCredentials({
      api_key: key,
      base_url: baseUrl === DEFAULT_BASE_URL ? undefined : baseUrl,
      saved_at: new Date().toISOString(),
    });
    if (baseUrl !== DEFAULT_BASE_URL) {
      configStore().set("base_url", baseUrl);
    }
    const who = describe(account);
    this.log(`${chalk.green("✓")} Logged in${who ? ` as ${who}` : ""}`);
    this.log(chalk.dim(`Credentials saved to ${credentialsPath()} (mode 0600).`));
  }
}

function describe(account: unknown): string {
  if (typeof account !== "object" || account === null) return "";
  const a = account as Record<string, unknown>;
  const name = typeof a.name === "string" ? a.name : undefined;
  const email = typeof a.email === "string" ? a.email : undefined;
  const org =
    typeof a.organization === "object" && a.organization
      ? (a.organization as Record<string, unknown>).name
      : undefined;
  const parts = [name ?? email, typeof org === "string" ? `(${org})` : undefined].filter(Boolean);
  return parts.join(" ");
}
