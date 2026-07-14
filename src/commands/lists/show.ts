import { Args } from "@oclif/core";
import { Lists } from "../../api/endpoints.js";
import { PipecornCommand } from "../../lib/base-command.js";

export default class ListsShow extends PipecornCommand {
  static override description = "Show a single list and its members.";

  static override args = {
    id: Args.string({ description: "List ID", required: true }),
  };

  static override flags = { ...PipecornCommand.baseFlags };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ListsShow);
    const client = await this.client(flags["api-key"]);
    const result = await Lists.get(client, args.id);
    this.emit(result, flags.format);
  }
}
