import { Flags } from "@oclif/core";
import { Accounts } from "../../api/endpoints.js";
import { PipecornCommand } from "../../lib/base-command.js";

export default class AccountsStack extends PipecornCommand {
  static override description = "Look up a company's tech stack.";

  static override flags = {
    ...PipecornCommand.baseFlags,
    domain: Flags.string({ description: "Company website domain" }),
    name: Flags.string({ description: "Company name" }),
    "linkedin-url": Flags.string({ description: "LinkedIn company URL" }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AccountsStack);
    if (!flags.domain && !flags.name && !flags["linkedin-url"]) {
      this.error("Provide --domain, --name, or --linkedin-url.", { exit: 2 });
    }
    const client = await this.client(flags["api-key"]);
    const result = await Accounts.companyStack(client, {
      company_domain: flags.domain,
      company_name: flags.name,
      company_linkedin_url: flags["linkedin-url"],
    });
    this.emit(result, flags.format);
  }
}
