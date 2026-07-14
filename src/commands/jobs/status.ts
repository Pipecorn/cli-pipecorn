import { Args, Flags } from "@oclif/core";
import chalk from "chalk";
import { Searches, type Search } from "../../api/endpoints.js";
import { PipecornCommand } from "../../lib/base-command.js";

const TERMINAL_STATUSES = new Set([
  "FINISHED",
  "ERROR",
  "RATE_LIMITED",
  "UNAUTHORIZED",
  "FORBIDDEN",
]);

export default class JobsStatus extends PipecornCommand {
  static override description =
    "Show the status of a search (job). Use --watch to poll until it finishes.";

  static override args = {
    id: Args.string({ description: "Search/job ID", required: true }),
  };

  static override flags = {
    ...PipecornCommand.baseFlags,
    watch: Flags.boolean({ description: "Poll until the job reaches a terminal status" }),
    interval: Flags.integer({
      description: "Polling interval in seconds (with --watch)",
      default: 5,
      min: 1,
    }),
    timeout: Flags.integer({
      description: "Give up after N seconds (with --watch)",
      default: 1800,
      min: 1,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(JobsStatus);
    const client = await this.client(flags["api-key"]);

    if (!flags.watch) {
      const search = await Searches.get(client, args.id);
      this.emit(search, flags.format);
      return;
    }

    const intervalMs = flags.interval * 1000;
    const deadline = Date.now() + flags.timeout * 1000;
    let last: Search | undefined;

    for (;;) {
      const search = await Searches.get(client, args.id);
      const status = String(search.status ?? "UNKNOWN");
      if (process.stderr.isTTY) {
        process.stderr.write(`\r${chalk.dim(new Date().toISOString())} status=${status}     `);
      }
      last = search;
      if (TERMINAL_STATUSES.has(status)) {
        if (process.stderr.isTTY) process.stderr.write("\n");
        this.emit(search, flags.format);
        if (status !== "FINISHED") this.exit(1);
        return;
      }
      if (Date.now() > deadline) {
        if (process.stderr.isTTY) process.stderr.write("\n");
        this.logToStderr(`Timed out after ${flags.timeout}s (last status: ${status}).`);
        this.emit(last, flags.format);
        this.exit(1);
      }
      await sleep(intervalMs);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
