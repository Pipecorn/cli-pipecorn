import { Args, Flags } from "@oclif/core";
import { Searches } from "../../api/endpoints.js";
import { updateLeadStatusSchema } from "../../api/schemas.js";
import { PipecornCommand } from "../../lib/base-command.js";

export default class LeadsSetStatus extends PipecornCommand {
  static override description =
    "Mark leads of a search as qualified or disqualified, by the lead IDs `pipecorn jobs status` returns. IDs that match no lead of the search are listed in unknown_lead_ids.";

  static override examples = [
    "$ pipecorn leads set-status 0d6f1c5e-1b7a-4c1e-9a43-6f8e2a1b9c77 --status disqualified --lead-id 0b9c7d2e-3f4a-4b5c-8d6e-7f8a9b0c1d2e --reason 'Not in our ICP'",
    "$ pipecorn leads set-status 0d6f1c5e-1b7a-4c1e-9a43-6f8e2a1b9c77 --status qualified --lead-id 0b9c7d2e-3f4a-4b5c-8d6e-7f8a9b0c1d2e,5e1f2a3b-4c5d-4e6f-9a7b-8c9d0e1f2a3b",
  ];

  static override args = {
    id: Args.string({ description: "Search/job ID", required: true }),
  };

  static override flags = {
    ...PipecornCommand.baseFlags,
    "lead-id": Flags.string({
      description: "Lead ID (lead.id in the search results). Repeat or comma-separate, up to 1000",
      multiple: true,
      delimiter: ",",
      required: true,
    }),
    status: Flags.string({
      description: "New status",
      options: ["qualified", "disqualified"],
      required: true,
    }),
    reason: Flags.string({
      description: "Why the leads are disqualified. Defaults to 'Manually disqualified'",
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(LeadsSetStatus);
    const body = updateLeadStatusSchema.parse({
      lead_ids: flags["lead-id"],
      status: flags.status,
      reason: flags.reason,
    });
    const client = await this.client(flags["api-key"]);
    const result = await Searches.updateLeadStatus(client, args.id, body);
    this.emit(result, flags.format);
  }
}
