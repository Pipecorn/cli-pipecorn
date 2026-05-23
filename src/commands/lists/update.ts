import { Args, Flags } from "@oclif/core";
import { Lists } from "../../api/endpoints.js";
import { ProntoCommand } from "../../lib/base-command.js";

export default class ListsUpdate extends ProntoCommand {
  static override description = "Rename a list.";

  static override args = {
    id: Args.string({ description: "List ID", required: true }),
  };

  static override flags = {
    ...ProntoCommand.baseFlags,
    name: Flags.string({ description: "New list name", required: true }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ListsUpdate);
    const client = await this.client(flags["api-key"]);
    const result = await Lists.update(client, args.id, { name: flags.name });
    this.emit(result, flags.format);
  }
}
