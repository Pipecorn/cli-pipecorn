import { Searches } from "../../api/endpoints.js";
import { PipecornCommand } from "../../lib/base-command.js";

export default class JobsList extends PipecornCommand {
  static override description =
    "List recent searches. Each search corresponds to an async lead/account job.";

  static override flags = { ...PipecornCommand.baseFlags };

  async run(): Promise<void> {
    const { flags } = await this.parse(JobsList);
    const client = await this.client(flags["api-key"]);
    const result = await Searches.list(client);
    this.emit(result, flags.format);
  }
}
