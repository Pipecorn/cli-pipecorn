import chalk from "chalk";
import { PipecornCommand } from "../lib/base-command.js";
import { clearCredentials, credentialsPath } from "../lib/credentials.js";

export default class Logout extends PipecornCommand {
  static override description = "Remove saved Pipecorn credentials from this machine.";

  async run(): Promise<void> {
    const removed = await clearCredentials();
    if (removed) {
      this.log(`${chalk.green("✓")} Removed ${credentialsPath()}`);
    } else {
      this.log("No saved credentials to remove.");
    }
  }
}
