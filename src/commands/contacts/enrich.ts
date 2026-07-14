import { Flags } from "@oclif/core";
import { Contacts } from "../../api/endpoints.js";
import {
  bulkEnrichContactsSchema,
  singleEnrichContactSchema,
  type ContactInput,
} from "../../api/schemas.js";
import { PipecornCommand } from "../../lib/base-command.js";
import { readCsvRows } from "../../lib/csv.js";

type EnrichmentType = "email" | "phone" | "personal_email";

export default class ContactsEnrich extends PipecornCommand {
  static override description =
    "Enrich contacts with email or phone. Pass --batch to enqueue a CSV (async; returns enrichment_id).";

  static override examples = [
    "$ pipecorn contacts enrich --firstname Ada --lastname Lovelace --domain mathmatics.example",
    "$ pipecorn contacts enrich --batch contacts.csv --enrichment email --webhook-url https://my.app/hook",
    "$ pipecorn contacts enrich --batch contacts.csv --enrichment phone --dry-run",
  ];

  static override flags = {
    ...PipecornCommand.baseFlags,
    firstname: Flags.string({ description: "First name (single mode)" }),
    lastname: Flags.string({ description: "Last name (single mode)" }),
    domain: Flags.string({ description: "Company domain (single mode)" }),
    "company-name": Flags.string({ description: "Company name (single mode)" }),
    "linkedin-url": Flags.string({ description: "LinkedIn URL (single mode)" }),
    batch: Flags.string({ description: "Path to a CSV file (batch mode)" }),
    enrichment: Flags.string({
      description: "Enrichment type",
      options: ["email", "phone", "personal_email"],
      default: "email",
    }),
    "webhook-url": Flags.string({
      description: "Webhook URL to receive completed records",
    }),
    "dry-run": Flags.boolean({
      description: "Report how many contacts would be enqueued without spending credits",
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ContactsEnrich);
    const enrichment = flags.enrichment as EnrichmentType;

    if (flags.batch) {
      await this.runBatch(flags, enrichment);
      return;
    }
    await this.runSingle(flags, enrichment);
  }

  private async runSingle(
    flags: Record<string, unknown>,
    enrichment: EnrichmentType,
  ): Promise<void> {
    const body = singleEnrichContactSchema.parse({
      firstname: flags.firstname,
      lastname: flags.lastname,
      domain: flags.domain,
      company_name: flags["company-name"],
      linkedin_url: flags["linkedin-url"],
      enrichment_type: [enrichment],
      webhook_url: flags["webhook-url"],
    });
    const client = await this.client(flags["api-key"] as string | undefined);
    const result = await Contacts.singleEnrich(client, body);
    this.emit(result, flags.format as string | undefined);
  }

  private async runBatch(
    flags: Record<string, unknown>,
    enrichment: EnrichmentType,
  ): Promise<void> {
    const rows = await readCsvRows(flags.batch as string);
    if (rows.length < 2) {
      this.error("Batch mode requires at least 2 rows. For 1 row, use single mode.", {
        exit: 2,
      });
    }
    const contacts: ContactInput[] = rows.map((r, idx) => {
      const firstname = r.firstname ?? r.first_name ?? r["First Name"] ?? "";
      const lastname = r.lastname ?? r.last_name ?? r["Last Name"] ?? "";
      if (!firstname || !lastname) {
        this.error(`Row ${idx + 1}: firstname and lastname are required`, { exit: 2 });
      }
      const out: ContactInput = { firstname, lastname };
      const linkedin = r.linkedin_url ?? r["LinkedIn"];
      const domain = r.domain ?? r["Domain"];
      const company = r.company_name ?? r.company ?? r["Company"];
      if (linkedin) out.linkedin_url = linkedin;
      if (domain) out.domain = domain;
      if (company) out.company_name = company;
      return out;
    });

    if (flags["dry-run"]) {
      const creditsPerContact = enrichment === "email" ? 3 : 30;
      this.emit(
        {
          dry_run: true,
          contact_count: contacts.length,
          enrichment_type: enrichment,
          estimated_credits: contacts.length * creditsPerContact,
        },
        flags.format as string | undefined,
      );
      return;
    }

    const body = bulkEnrichContactsSchema.parse({
      contacts,
      enrichment_type: [enrichment],
      webhook_url: flags["webhook-url"],
    });
    const client = await this.client(flags["api-key"] as string | undefined);
    const result = await Contacts.bulkEnrich(client, body);
    this.emit(result, flags.format as string | undefined);
  }
}
