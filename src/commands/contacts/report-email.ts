import { Flags } from "@oclif/core";
import { Contacts } from "../../api/endpoints.js";
import { reportEmailSchema } from "../../api/schemas.js";
import { PipecornCommand } from "../../lib/base-command.js";

export default class ContactsReportEmail extends PipecornCommand {
  static override description =
    "Report an email address Pipecorn returned as wrong and search for another one of the same type. The new search costs what an enrichment of that type costs (3 credits for a work email), only if it finds an address; a personal email search also needs the personal email opt-in. Follow it with `pipecorn contacts get <enrichment_id>`.";

  static override examples = [
    "$ pipecorn contacts report-email --linkedin-url https://www.linkedin.com/in/william-hewish --email william@oldcompany.com --reason wrong_domain",
    "$ pipecorn contacts report-email --linkedin-url https://www.linkedin.com/in/william-hewish --email william@acme.com --reason bounced --no-find-replacement",
  ];

  static override flags = {
    ...PipecornCommand.baseFlags,
    "linkedin-url": Flags.string({
      description: "LinkedIn profile URL of the contact",
      required: true,
    }),
    email: Flags.string({
      description: "The wrong address, as Pipecorn returned it",
      required: true,
    }),
    reason: Flags.string({
      description:
        "bounced: an email sent to it bounced. invalid_address: does not exist. wrong_domain: at a company the person no longer works for, or the wrong one. wrong_person: someone else's address",
      options: ["bounced", "invalid_address", "wrong_domain", "wrong_person"],
      required: true,
    }),
    "find-replacement": Flags.boolean({
      description: "Search for another address",
      default: true,
      allowNo: true,
    }),
    "webhook-url": Flags.string({
      description: "Webhook URL to receive the result of the new search",
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ContactsReportEmail);
    const body = reportEmailSchema.parse({
      linkedin_url: flags["linkedin-url"],
      email: flags.email,
      reason: flags.reason,
      find_replacement: flags["find-replacement"],
      webhook_url: flags["webhook-url"],
    });
    const client = await this.client(flags["api-key"]);
    const result = await Contacts.reportEmail(client, body);
    this.emit(result, flags.format);
  }
}
