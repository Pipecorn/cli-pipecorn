import { Flags } from "@oclif/core";
import { Accounts } from "../../api/endpoints.js";
import { enrichAccountSchema } from "../../api/schemas.js";
import { ProntoCommand } from "../../lib/base-command.js";

export default class AccountsEnrich extends ProntoCommand {
  static override description = "Enrich a single company by domain, name, or LinkedIn URL.";

  static override examples = [
    "$ pronto accounts enrich --domain stripe.com",
    "$ pronto accounts enrich --linkedin-url https://linkedin.com/company/stripe",
  ];

  static override flags = {
    ...ProntoCommand.baseFlags,
    domain: Flags.string({ description: "Company website domain" }),
    name: Flags.string({ description: "Company name" }),
    "linkedin-url": Flags.string({ description: "LinkedIn company profile URL" }),
    country: Flags.string({ description: "Two-letter ISO country code" }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AccountsEnrich);
    const body = enrichAccountSchema.parse({
      domain: flags.domain,
      name: flags.name,
      company_linkedin_url: flags["linkedin-url"],
      country: flags.country,
    });
    const client = await this.client(flags["api-key"]);
    const result = await Accounts.enrich(client, body);
    this.emit(result, flags.format);
  }
}
