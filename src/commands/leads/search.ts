import { Flags } from "@oclif/core";
import { Leads } from "../../api/endpoints.js";
import { advancedSearchLeadsSchema } from "../../api/schemas.js";
import { PipecornCommand } from "../../lib/base-command.js";

export default class LeadsSearch extends PipecornCommand {
  static override description =
    "Run an advanced lead search (Sales Navigator-style filters). Returns a job ID; poll with `pipecorn jobs status`.";

  static override examples = [
    "$ pipecorn leads search --job-titles 'Head of Sales' --seniority-levels 130 --limit 50",
    "$ pipecorn leads search --preview --keyword 'GTM' --company-size 51-200",
  ];

  static override flags = {
    ...PipecornCommand.baseFlags,
    name: Flags.string({ description: "Display name for this search" }),
    keyword: Flags.string({ description: "Free-text keyword" }),
    "job-titles": Flags.string({ multiple: true }),
    "excluded-job-titles": Flags.string({ multiple: true }),
    "past-titles": Flags.string({ multiple: true }),
    "included-locations": Flags.string({ multiple: true }),
    "excluded-locations": Flags.string({ multiple: true }),
    "company-headquarters": Flags.string({ multiple: true }),
    "included-industries": Flags.string({ multiple: true }),
    "excluded-industries": Flags.string({ multiple: true }),
    "included-companies": Flags.string({ multiple: true }),
    "excluded-companies": Flags.string({ multiple: true }),
    functions: Flags.string({ multiple: true }),
    "seniority-levels": Flags.string({ multiple: true }),
    "company-size": Flags.string({ multiple: true }),
    "included-account-lists": Flags.string({ multiple: true }),
    "included-lead-lists": Flags.string({ multiple: true }),
    limit: Flags.integer(),
    streaming: Flags.boolean(),
    scale: Flags.boolean(),
    preview: Flags.boolean({
      description: "Synchronous preview (count + sample) instead of async search",
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(LeadsSearch);
    const body = advancedSearchLeadsSchema.parse({
      name: flags.name,
      keyword: flags.keyword,
      job_titles: flags["job-titles"],
      excluded_job_titles: flags["excluded-job-titles"],
      past_titles: flags["past-titles"],
      included_locations: flags["included-locations"],
      excluded_locations: flags["excluded-locations"],
      company_headquarters: flags["company-headquarters"],
      included_industries: flags["included-industries"],
      excluded_industries: flags["excluded-industries"],
      included_companies: flags["included-companies"],
      excluded_companies: flags["excluded-companies"],
      functions: flags.functions,
      seniority_levels: flags["seniority-levels"],
      company_size: flags["company-size"],
      included_account_lists: flags["included-account-lists"],
      included_lead_lists: flags["included-lead-lists"],
      limit: flags.limit,
      streaming: flags.streaming,
      scale: flags.scale,
    });
    const client = await this.client(flags["api-key"]);
    const result = flags.preview
      ? await Leads.advancedSearchPreview(client, body)
      : await Leads.advancedSearch(client, body);
    this.emit(result, flags.format);
  }
}
