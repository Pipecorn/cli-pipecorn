import { Args } from "@oclif/core";
import { Contacts } from "../../api/endpoints.js";
import { PipecornCommand } from "../../lib/base-command.js";

export default class ContactsGet extends PipecornCommand {
  static override description = "Fetch a previously-enriched contact by enrichment id.";

  static override args = {
    id: Args.string({ description: "Enrichment ID", required: true }),
  };

  static override flags = { ...PipecornCommand.baseFlags };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ContactsGet);
    const client = await this.client(flags["api-key"]);
    const result = await Contacts.get(client, args.id);
    this.emit(result, flags.format);
  }
}
