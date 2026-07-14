import { Args, Flags } from "@oclif/core";
import { Lists } from "../../api/endpoints.js";
import { createListSchema } from "../../api/schemas.js";
import { PipecornCommand } from "../../lib/base-command.js";

export default class ListsCreate extends PipecornCommand {
  static override description = "Create an empty list.";

  static override args = {
    name: Args.string({ description: "List name", required: true }),
  };

  static override flags = {
    ...PipecornCommand.baseFlags,
    kind: Flags.string({
      description: "List kind",
      options: ["account", "lead"],
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ListsCreate);
    const body = createListSchema.parse({ name: args.name, kind: flags.kind });
    const client = await this.client(flags["api-key"]);
    const result = await Lists.create(client, body);
    this.emit(result, flags.format);
  }
}
