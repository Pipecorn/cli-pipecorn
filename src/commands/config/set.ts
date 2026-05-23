import { Args, Command } from "@oclif/core";
import chalk from "chalk";
import { configStore } from "../../lib/config.js";

const VALID_KEYS = ["base_url", "default_format"] as const;

export default class ConfigSet extends Command {
  static override description = "Set a CLI configuration value.";
  static override args = {
    key: Args.string({ description: "Config key", required: true }),
    value: Args.string({ description: "Value", required: true }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(ConfigSet);
    const key = args.key;
    if (!(VALID_KEYS as readonly string[]).includes(key)) {
      this.error(`Unknown config key '${key}'. Valid keys: ${VALID_KEYS.join(", ")}`, {
        exit: 2,
      });
    }
    configStore().set(key as never, args.value as never);
    this.log(`${chalk.green("✓")} ${key} = ${args.value}`);
  }
}
