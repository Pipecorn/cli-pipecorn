import { Account } from "../api/endpoints.js";
import { PipecornCommand } from "../lib/base-command.js";

export default class Whoami extends PipecornCommand {
  static override description = "Show the authenticated account and credit balance.";

  static override flags = { ...PipecornCommand.baseFlags };

  async run(): Promise<void> {
    const { flags } = await this.parse(Whoami);
    const client = await this.client(flags["api-key"]);
    const [account, credits] = await Promise.all([
      Account.me(client),
      Account.credits(client).catch(() => undefined),
    ]);
    this.emit({ account, credits }, flags.format);
  }
}
