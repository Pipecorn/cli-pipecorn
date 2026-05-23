/**
 * Compares the API endpoint surface declared in cli-pronto's
 * src/api/endpoints.ts against the endpoints documented in pronto-api-doc.
 * Fails the build when the doc lists a path the CLI doesn't call yet.
 *
 * Pass PRONTO_API_DOC_PATH to point at the api-doc checkout (default:
 * ../pronto-api-doc relative to this file).
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const docRoot =
  process.env.PRONTO_API_DOC_PATH ?? path.resolve(repoRoot, "..", "pronto-api-doc");

const KNOWN_UNSUPPORTED = new Set<string>([
  // Document endpoints the CLI deliberately does not expose yet.
]);

async function main() {
  const docPaths = await collectDocEndpoints();
  const cliPaths = await collectCliEndpoints();

  const missing = [...docPaths].filter(
    (p) => !cliPaths.has(p) && !KNOWN_UNSUPPORTED.has(p),
  );

  if (missing.length === 0) {
    console.log(`✓ Schema drift check: ${docPaths.size} doc endpoints covered.`);
    return;
  }

  console.error("✗ Schema drift detected. The following documented endpoints are not covered:");
  for (const p of missing.sort()) console.error(`  • ${p}`);
  console.error(
    "\nAdd them to src/api/endpoints.ts, or to KNOWN_UNSUPPORTED in scripts/check-schema-drift.ts.",
  );
  process.exit(1);
}

async function collectDocEndpoints(): Promise<Set<string>> {
  const out = new Set<string>();
  const endpointsDir = path.join(docRoot, "api-reference", "endpoints");
  try {
    await walk(endpointsDir, async (file) => {
      if (!file.endsWith(".mdx")) return;
      const text = await fs.readFile(file, "utf8");
      const match = text.match(/^openapi:\s*['"]([^'"]+)['"]/m);
      if (!match || !match[1]) return;
      const tail = match[1].trim();
      const m = tail.match(/(GET|POST|PUT|DELETE|PATCH)\s+(\/\S+)/i);
      if (m && m[1] && m[2]) {
        const normalized = m[2]
          .replace(/\{[^}]+\}/g, "{}")
          .replace(/\/+$/, "") || "/";
        out.add(`${m[1].toUpperCase()} ${normalized}`);
      }
    });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    console.warn(`(skipping: ${endpointsDir} not found)`);
  }
  return out;
}

async function collectCliEndpoints(): Promise<Set<string>> {
  const out = new Set<string>();
  const file = path.join(repoRoot, "src", "api", "endpoints.ts");
  const text = await fs.readFile(file, "utf8");
  const re = /c\.(get|post|put|delete)<[^>]*>\(\s*[`"']([^`"']+)[`"']/g;
  for (const m of text.matchAll(re)) {
    const verb = m[1];
    const literal = m[2];
    if (!verb || !literal) continue;
    const literalPath = literal
      .replace(/\$\{[^}]+\}/g, "{}")
      .replace(/\/+$/, "");
    out.add(`${verb.toUpperCase()} ${literalPath || "/"}`);
  }
  return out;
}

async function walk(dir: string, fn: (file: string) => Promise<void>) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, fn);
    else await fn(full);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
