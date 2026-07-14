import { Flags } from "@oclif/core";
import { Intents } from "../../api/endpoints.js";
import { PipecornCommand } from "../../lib/base-command.js";

export default class SignalsGrowth extends PipecornCommand {
  static override description =
    "Find companies with notable headcount growth. Streams to --webhook-url.";

  static override flags = {
    ...PipecornCommand.baseFlags,
    "webhook-url": Flags.string({ required: true }),
    "min-growth-percent": Flags.integer(),
    "min-headcount": Flags.integer(),
    "max-headcount": Flags.integer(),
    "included-industries": Flags.string({ multiple: true }),
    "included-locations": Flags.string({ multiple: true }),
    "company-size": Flags.string({ multiple: true }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(SignalsGrowth);
    const client = await this.client(flags["api-key"]);
    const result = await Intents.growth(client, {
      webhook_url: flags["webhook-url"],
      min_growth_percent: flags["min-growth-percent"],
      min_headcount: flags["min-headcount"],
      max_headcount: flags["max-headcount"],
      included_industries: flags["included-industries"],
      included_locations: flags["included-locations"],
      company_size: flags["company-size"],
    });
    this.emit(result, flags.format);
  }
}
