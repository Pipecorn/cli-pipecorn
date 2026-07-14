import { Args } from "@oclif/core";
import chalk from "chalk";
import { Searches } from "../../api/endpoints.js";
import { PipecornCommand } from "../../lib/base-command.js";

export default class JobsDelete extends PipecornCommand {
  static override description = "Delete a saved search.";

  static override args = {
    id: Args.string({ description: "Search/job ID", required: true }),
  };

  static override flags = { ...PipecornCommand.baseFlags };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(JobsDelete);
    const client = await this.client(flags["api-key"]);
    await Searches.delete(client, args.id);
    this.log(`${chalk.green("✓")} Deleted ${args.id}`);
  }
}
