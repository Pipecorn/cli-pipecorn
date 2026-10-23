import { Args, Flags } from "@oclif/core";
import { promises as fs } from "node:fs";
import { stringify } from "csv-stringify/sync";
import { Lists } from "../../api/endpoints.js";
import { PipecornCommand } from "../../lib/base-command.js";

export default class ListsExport extends PipecornCommand {
  static override description =
    "Export every member of a list to CSV, fetching all its pages. Writes to stdout by default; use -o to write a file.";

  static override args = {
    id: Args.string({ description: "List ID", required: true }),
  };

  static override flags = {
    ...PipecornCommand.baseFlags,
    output: Flags.string({ char: "o", description: "Output file (default: stdout)" }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ListsExport);
    const client = await this.client(flags["api-key"]);
    const rows = await collectListRows((cursor) => Lists.get(client, args.id, { cursor }));
    const csv =
      rows.length === 0
        ? ""
        : stringify(rows, { header: true, columns: columns(rows) });
    if (flags.output) {
      await fs.writeFile(flags.output, csv);
      this.logToStderr(`Wrote ${rows.length} rows to ${flags.output}`);
    } else {
      process.stdout.write(csv);
    }
  }
}

/** Every row of a list, following pagination.next_cursor until the last page. */
export async function collectListRows(
  fetchPage: (cursor?: string) => Promise<unknown>,
): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = [];
  let cursor: string | undefined;
  do {
    const page = await fetchPage(cursor);
    rows.push(...extractRows(page));
    cursor = nextCursor(page);
  } while (cursor);
  return rows;
}

function nextCursor(page: unknown): string | undefined {
  const pagination = (page as { pagination?: { has_more?: boolean; next_cursor?: string } } | null)
    ?.pagination;
  return pagination?.has_more ? pagination.next_cursor : undefined;
}

function extractRows(list: unknown): Record<string, unknown>[] {
  if (typeof list !== "object" || list === null) return [];
  const obj = list as Record<string, unknown>;
  const candidates = [obj.items, obj.companies, obj.leads, obj.accounts, obj.members, obj.records];
  for (const c of candidates) {
    if (Array.isArray(c)) return c.map((r) => flatten(r));
  }
  return [];
}

function flatten(row: unknown): Record<string, unknown> {
  if (typeof row !== "object" || row === null) return { value: row };
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row as Record<string, unknown>)) {
    out[k] =
      v === null || v === undefined
        ? ""
        : typeof v === "object"
          ? JSON.stringify(v)
          : v;
  }
  return out;
}

function columns(rows: Record<string, unknown>[]): string[] {
  const seen = new Set<string>();
  for (const r of rows) for (const k of Object.keys(r)) seen.add(k);
  return [...seen];
}
