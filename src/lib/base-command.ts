import { Command, Flags } from "@oclif/core";
import chalk from "chalk";
import type { ZodError } from "zod";
import { ProntoError, exitCodeFor } from "../api/errors.js";
import type { ProntoClient } from "../api/client.js";
import { buildClient } from "./client-factory.js";
import { pickFormat, render, type Format } from "../output/format.js";

export abstract class ProntoCommand extends Command {
  static override baseFlags = {
    "api-key": Flags.string({
      description: "Pronto API key (overrides env + saved credentials)",
      env: "PRONTO_API_KEY",
      helpGroup: "GLOBAL",
    }),
    format: Flags.string({
      description: "Output format (default: table on TTY, json otherwise)",
      options: ["json", "csv", "table"],
      helpGroup: "GLOBAL",
    }),
    quiet: Flags.boolean({
      description: "Suppress spinners and progress output",
      helpGroup: "GLOBAL",
    }),
    output: Flags.string({
      char: "o",
      description: "Write output to a file instead of stdout",
      helpGroup: "GLOBAL",
    }),
  };

  protected async client(flagKey?: string): Promise<ProntoClient> {
    return buildClient(flagKey);
  }

  protected emit(data: unknown, flag: string | undefined): void {
    const format = pickFormat(flag);
    this.write(render(data, format), flag);
  }

  protected write(text: string, _flag: string | undefined): void {
    process.stdout.write(`${text}\n`);
  }

  protected writeTo(text: string, outputPath: string | undefined): void {
    if (!outputPath) {
      process.stdout.write(`${text}\n`);
      return;
    }
    import("node:fs").then(({ writeFileSync }) => {
      writeFileSync(outputPath, text);
    });
  }

  protected pickFormat(flag: string | undefined): Format {
    return pickFormat(flag);
  }

  override async catch(err: Error & { exitCode?: number }): Promise<never> {
    if (isZodError(err)) {
      this.logToStderr(chalk.red("Invalid input:"));
      for (const issue of err.issues) {
        this.logToStderr(`  • ${issue.path.join(".") || "(root)"}: ${issue.message}`);
      }
      this.exit(2);
    }
    if (err instanceof ProntoError) {
      this.logToStderr(chalk.red(err.message));
      this.exit(exitCodeFor(err));
    }
    throw err;
  }
}

function isZodError(err: unknown): err is ZodError {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { name?: string }).name === "ZodError"
  );
}
