import { Args } from "@oclif/core";
import { Command } from "@oclif/core";
import { configStore } from "../../lib/config.js";

export default class ConfigGet extends Command {
  static override description = "Read a CLI configuration value.";
  static override args = {
    key: Args.string({ description: "Config key", required: true }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(ConfigGet);
    const value = configStore().get(args.key as never);
    if (value === undefined) this.exit(1);
    this.log(typeof value === "string" ? value : JSON.stringify(value));
  }
}
