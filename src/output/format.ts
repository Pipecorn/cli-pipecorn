import { stringify } from "csv-stringify/sync";

export type Format = "json" | "csv" | "table";

export function pickFormat(flag: string | undefined): Format {
  if (flag === "json" || flag === "csv" || flag === "table") return flag;
  return process.stdout.isTTY ? "table" : "json";
}

export function render(data: unknown, format: Format): string {
  switch (format) {
    case "json":
      return JSON.stringify(data, null, 2);
    case "csv":
      return renderCsv(toRows(data));
    case "table":
      return renderTable(data);
  }
}

function toRows(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.map((d) => flattenForRow(d));
  }
  if (data && typeof data === "object") {
    return [flattenForRow(data)];
  }
  return [{ value: data }];
}

function flattenForRow(item: unknown): Record<string, unknown> {
  if (item === null || item === undefined) return { value: item };
  if (typeof item !== "object") return { value: item };
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
    if (v === null || v === undefined) {
      out[k] = "";
    } else if (typeof v === "object") {
      out[k] = JSON.stringify(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function renderCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const columns = uniqueColumns(rows);
  return stringify(rows, { header: true, columns }).trimEnd();
}

function renderTable(data: unknown): string {
  if (Array.isArray(data)) {
    return renderRowTable(data.map((d) => flattenForRow(d)));
  }
  if (data && typeof data === "object") {
    return renderKeyValueTable(flattenObject(data as Record<string, unknown>));
  }
  return data === null || data === undefined ? "(no results)" : String(data);
}

function renderRowTable(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "(no results)";
  const columns = uniqueColumns(rows);
  const widths = columns.map((c) =>
    Math.max(
      c.length,
      ...rows.map((r) => String(r[c] ?? "").length),
    ),
  );
  const header = columns
    .map((c, i) => c.padEnd(widths[i] ?? c.length))
    .join("  ");
  const sep = widths.map((w) => "-".repeat(w)).join("  ");
  const body = rows
    .map((r) =>
      columns
        .map((c, i) =>
          truncate(String(r[c] ?? ""), Math.min(widths[i] ?? 0, 60)).padEnd(
            Math.min(widths[i] ?? 0, 60),
          ),
        )
        .join("  "),
    )
    .join("\n");
  return `${header}\n${sep}\n${body}`;
}

function renderKeyValueTable(pairs: Array<[string, unknown]>): string {
  if (pairs.length === 0) return "(no results)";
  const keyWidth = Math.max(5, ...pairs.map(([k]) => k.length));
  const valueWidth = Math.max(
    5,
    ...pairs.map(([, v]) => String(v ?? "").length),
  );
  const cappedValueWidth = Math.min(valueWidth, 80);
  const header = `${"field".padEnd(keyWidth)}  ${"value".padEnd(cappedValueWidth)}`;
  const sep = `${"-".repeat(keyWidth)}  ${"-".repeat(cappedValueWidth)}`;
  const body = pairs
    .map(([k, v]) => {
      const value = truncate(String(v ?? ""), cappedValueWidth);
      return `${k.padEnd(keyWidth)}  ${value}`;
    })
    .join("\n");
  return `${header}\n${sep}\n${body}`;
}

function flattenObject(
  obj: Record<string, unknown>,
  prefix = "",
): Array<[string, unknown]> {
  const out: Array<[string, unknown]> = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      const nested = flattenObject(v as Record<string, unknown>, key);
      if (nested.length === 0) {
        out.push([key, "{}"]);
      } else {
        out.push(...nested);
      }
    } else if (Array.isArray(v)) {
      out.push([key, JSON.stringify(v)]);
    } else {
      out.push([key, v]);
    }
  }
  return out;
}

function uniqueColumns(rows: Record<string, unknown>[]): string[] {
  const seen = new Set<string>();
  for (const row of rows) {
    for (const k of Object.keys(row)) seen.add(k);
  }
  return [...seen];
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return n > 1 ? `${s.slice(0, n - 1)}…` : s.slice(0, n);
}
