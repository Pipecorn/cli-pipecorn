import { Flags } from "@oclif/core";
import { Leads } from "../../api/endpoints.js";
import { PipecornCommand } from "../../lib/base-command.js";

export default class LeadsEnrich extends PipecornCommand {
  static override description = "Enrich a single LinkedIn profile.";

  static override flags = {
    ...PipecornCommand.baseFlags,
    "linkedin-url": Flags.string({
      description: "LinkedIn profile URL",
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(LeadsEnrich);
    const client = await this.client(flags["api-key"]);
    const result = await Leads.enrich(client, {
      linkedin_url: flags["linkedin-url"],
    });
    this.emit(result, flags.format);
  }
}
