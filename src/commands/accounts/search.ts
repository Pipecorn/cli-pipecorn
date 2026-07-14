import { Flags } from "@oclif/core";
import { Accounts } from "../../api/endpoints.js";
import { searchAccountsSchema } from "../../api/schemas.js";
import { PipecornCommand } from "../../lib/base-command.js";

export default class AccountsSearch extends PipecornCommand {
  static override description =
    "Start a company search. Returns a job ID — poll with `pipecorn jobs status <id>`.";

  static override examples = [
    "$ pipecorn accounts search --keyword '\"sales agency\"' --company-size 11-50 --limit 100",
    "$ pipecorn accounts search --preview --keyword 'fintech'   # synchronous count + sample",
  ];

  static override flags = {
    ...PipecornCommand.baseFlags,
    name: Flags.string({ description: "Display name for the saved search" }),
    keyword: Flags.string({ description: "Boolean keyword query" }),
    "included-industries": Flags.string({ multiple: true }),
    "excluded-industries": Flags.string({ multiple: true }),
    "included-locations": Flags.string({ multiple: true }),
    "excluded-locations": Flags.string({ multiple: true }),
    "company-size": Flags.string({ multiple: true }),
    "min-revenue": Flags.integer(),
    "max-revenue": Flags.integer(),
    "revenue-currency": Flags.string(),
    limit: Flags.integer({ description: "Max companies (≤ 1000)" }),
    preview: Flags.boolean({
      description: "Synchronous preview (count + small sample) instead of async search",
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AccountsSearch);
    const body = searchAccountsSchema.parse({
      name: flags.name,
      keyword: flags.keyword,
      included_industries: flags["included-industries"],
      excluded_industries: flags["excluded-industries"],
      included_locations: flags["included-locations"],
      excluded_locations: flags["excluded-locations"],
      company_size: flags["company-size"],
      min_revenue: flags["min-revenue"],
      max_revenue: flags["max-revenue"],
      revenue_currency: flags["revenue-currency"],
      limit: flags.limit,
    });
    const client = await this.client(flags["api-key"]);
    const result = flags.preview
      ? await Accounts.searchPreview(client, body)
      : await Accounts.search(client, body);
    this.emit(result, flags.format);
  }
}
