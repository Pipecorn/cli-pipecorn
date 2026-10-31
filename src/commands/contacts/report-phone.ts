import { Flags } from "@oclif/core";
import { Contacts } from "../../api/endpoints.js";
import { reportPhoneSchema } from "../../api/schemas.js";
import { PipecornCommand } from "../../lib/base-command.js";

export default class ContactsReportPhone extends PipecornCommand {
  static override description =
    "Report a phone number Pipecorn returned as wrong and search for another one. The new search costs 30 credits, only if it finds a number; follow it with `pipecorn contacts get <enrichment_id>`.";

  static override examples = [
    "$ pipecorn contacts report-phone --linkedin-url https://www.linkedin.com/in/william-hewish --phone +33612345678 --reason wrong_person",
    "$ pipecorn contacts report-phone --linkedin-url https://www.linkedin.com/in/william-hewish --phone +33612345678 --reason disconnected --no-find-replacement",
  ];

  static override flags = {
    ...PipecornCommand.baseFlags,
    "linkedin-url": Flags.string({
      description: "LinkedIn profile URL of the contact",
      required: true,
    }),
    phone: Flags.string({
      description: "The wrong number, in international format (e.g. +33612345678)",
      required: true,
    }),
    reason: Flags.string({
      description: "wrong_person: someone else's number. disconnected: no longer works",
      options: ["wrong_person", "disconnected"],
      required: true,
    }),
    "find-replacement": Flags.boolean({
      description: "Search for another number",
      default: true,
      allowNo: true,
    }),
    "webhook-url": Flags.string({
      description: "Webhook URL to receive the result of the new search",
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ContactsReportPhone);
    const body = reportPhoneSchema.parse({
      linkedin_url: flags["linkedin-url"],
      phone: flags.phone,
      reason: flags.reason,
      find_replacement: flags["find-replacement"],
      webhook_url: flags["webhook-url"],
    });
    const client = await this.client(flags["api-key"]);
    const result = await Contacts.reportPhone(client, body);
    this.emit(result, flags.format);
  }
}
