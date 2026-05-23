import { Account } from "../api/endpoints.js";
import { ProntoCommand } from "../lib/base-command.js";

export default class Credits extends ProntoCommand {
  static override description = "Show the current credit balance for the authenticated account.";

  static override flags = { ...ProntoCommand.baseFlags };

  async run(): Promise<void> {
    const { flags } = await this.parse(Credits);
    const client = await this.client(flags["api-key"]);
    const result = await Account.credits(client);
    this.emit(result, flags.format);
  }
}
