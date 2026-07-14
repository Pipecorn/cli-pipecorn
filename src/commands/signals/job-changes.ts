import { Flags } from "@oclif/core";
import { Intents } from "../../api/endpoints.js";
import { PipecornCommand } from "../../lib/base-command.js";

export default class SignalsJobChanges extends PipecornCommand {
  static override aliases = ["signals:track-job-changes"];
  static override description =
    "Track when leads in a list change jobs. Streams to --webhook-url.";

  static override flags = {
    ...PipecornCommand.baseFlags,
    "webhook-url": Flags.string({ required: true }),
    "lead-list-id": Flags.string({
      description: "Lead list to monitor",
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(SignalsJobChanges);
    const client = await this.client(flags["api-key"]);
    const result = await Intents.trackJobChanges(client, {
      webhook_url: flags["webhook-url"],
      lead_list_id: flags["lead-list-id"],
    });
    this.emit(result, flags.format);
  }
}
