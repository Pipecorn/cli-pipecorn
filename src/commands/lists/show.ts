import { Args, Flags } from "@oclif/core";
import { Lists } from "../../api/endpoints.js";
import { PipecornCommand } from "../../lib/base-command.js";

export default class ListsShow extends PipecornCommand {
  static override description =
    "Show a single list and one page of its members (up to 1000). Pass --cursor with pagination.next_cursor for the next page.";

  static override args = {
    id: Args.string({ description: "List ID", required: true }),
  };

  static override flags = {
    ...PipecornCommand.baseFlags,
    cursor: Flags.string({ description: "pagination.next_cursor from the previous page" }),
    "per-page": Flags.integer({
      description: "Members per page (1-1000, default 1000)",
      min: 1,
      max: 1000,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ListsShow);
    const client = await this.client(flags["api-key"]);
    const result = await Lists.get(client, args.id, {
      cursor: flags.cursor,
      perPage: flags["per-page"],
    });
    this.emit(result, flags.format);
  }
}
