import { Flags } from "@oclif/core";
import { Leads } from "../../api/endpoints.js";
import { ProntoCommand } from "../../lib/base-command.js";

export default class LeadsEnrich extends ProntoCommand {
  static override description = "Enrich a single LinkedIn profile.";

  static override flags = {
    ...ProntoCommand.baseFlags,
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
