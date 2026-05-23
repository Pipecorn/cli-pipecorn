import { Lists } from "../../api/endpoints.js";
import { ProntoCommand } from "../../lib/base-command.js";

export default class ListsList extends ProntoCommand {
  static override description = "List all account and lead lists.";

  static override flags = { ...ProntoCommand.baseFlags };

  async run(): Promise<void> {
    const { flags } = await this.parse(ListsList);
    const client = await this.client(flags["api-key"]);
    const result = await Lists.list(client);
    this.emit(result, flags.format);
  }
}
