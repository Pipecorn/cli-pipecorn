import { Flags } from "@oclif/core";
import { Intents } from "../../api/endpoints.js";
import { ProntoCommand } from "../../lib/base-command.js";

export default class SignalsHiring extends ProntoCommand {
  static override description =
    "Find companies actively hiring. Results stream to --webhook-url.";

  static override flags = {
    ...ProntoCommand.baseFlags,
    "webhook-url": Flags.string({
      description: "Webhook URL to receive matches",
      required: true,
    }),
    "selected-keywords": Flags.string({ multiple: true }),
    "excluded-keywords": Flags.string({ multiple: true }),
    "selected-titles": Flags.string({ multiple: true }),
    "excluded-titles": Flags.string({ multiple: true }),
    "exclude-consulting-recruiting": Flags.boolean(),
    "exclude-internships": Flags.boolean(),
    "published-date": Flags.string({
      description: "e.g. last_24_hours, last_7_days, last_30_days",
    }),
    "included-locations": Flags.string({ multiple: true }),
    "excluded-locations": Flags.string({ multiple: true }),
    "company-size": Flags.string({ multiple: true }),
    "included-industries": Flags.string({ multiple: true }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(SignalsHiring);
    const client = await this.client(flags["api-key"]);
    const result = await Intents.hiring(client, {
      webhook_url: flags["webhook-url"],
      selected_keywords: flags["selected-keywords"],
      excluded_keywords: flags["excluded-keywords"],
      selected_titles: flags["selected-titles"],
      excluded_titles: flags["excluded-titles"],
      exclude_consulting_recruiting: flags["exclude-consulting-recruiting"],
      exclude_internships: flags["exclude-internships"],
      published_date: flags["published-date"],
      included_locations: flags["included-locations"],
      excluded_locations: flags["excluded-locations"],
      company_size: flags["company-size"],
      included_industries: flags["included-industries"],
    });
    this.emit(result, flags.format);
  }
}
