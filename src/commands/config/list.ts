import { Command } from "@oclif/core";
import { configPath, configStore } from "../../lib/config.js";

export default class ConfigList extends Command {
  static override description = "List all CLI configuration values.";

  async run(): Promise<void> {
    const store = configStore();
    this.log(`# ${configPath()}`);
    for (const [k, v] of Object.entries(store.store)) {
      this.log(`${k}=${typeof v === "string" ? v : JSON.stringify(v)}`);
    }
  }
}
