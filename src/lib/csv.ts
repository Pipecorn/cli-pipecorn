import { promises as fs } from "node:fs";
import { parse } from "csv-parse/sync";

export async function readCsvRows(filePath: string): Promise<Record<string, string>[]> {
  const buf = await fs.readFile(filePath);
  const rows = parse(buf, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];
  return rows;
}
