# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, Cursor, Copilot) working in
this repository, and for agents that drive the `pipecorn` CLI on a user's
behalf. `CLAUDE.md` only points here.

## What this is

This repo is two things:

1. **`@pipecorn/cli`**, the command-line client for the
   [Pipecorn](https://pipecorn.com) REST API (`https://app.pipecorn.com/api/v2`).
   It searches leads and accounts, enriches contacts with work emails and
   mobiles, manages lists and personas, and starts buying-signal jobs. It is a
   thin client: every command maps to one or a few API calls, and the API
   decides pricing, limits and results. Built with [oclif](https://oclif.io) on
   Node 20+, TypeScript, ESM.
2. **The Pipecorn Agent Plugin** ([agent-plugins.org](https://agent-plugins.org/specification)):
   `plugin.json`, `mcp.json` and `skills/pipecorn/SKILL.md` at the root. It
   gives an agent the Pipecorn MCP server and the rules for using it. None of
   these files ship in the npm package (`files` in `package.json`).

If you are an agent that wants to *use* Pipecorn rather than change this code,
read [`skills/pipecorn/SKILL.md`](skills/pipecorn/SKILL.md), then
<https://pipecorn.com/auth.md> for authentication and
<https://pipecorn.com/openapi.json> for the API.

## Using the CLI as an agent

- Authenticate with `PIPECORN_API_KEY` (or `--api-key`). Keys are created at
  <https://app.pipecorn.com/settings/apis/keys>. Never print or log the key.
- Pass `--format json` (the default when stdout is not a TTY) and `--quiet` so
  output is parseable and free of spinners. Errors go to stderr.
- Branch on the exit code, not on the error text:

  | code | meaning | what to do |
  |---|---|---|
  | 0 | success | |
  | 1 | Pipecorn API error | report the message |
  | 2 | invalid input | fix the flags |
  | 3 | authentication | ask the user for a valid key |
  | 4 | rate limit | wait, then retry |
  | 5 | credits or plan limit | stop and tell the user; do not retry |

- Enrichment spends credits. Run `pipecorn credits` first, and use `--dry-run`
  on `contacts enrich --batch` to see the cost before spending it.
- Searches are asynchronous: `leads search` and `accounts search` return a job
  ID; poll it with `pipecorn jobs status <id> --watch` rather than a loop.
- Prefer `--preview` on searches to check the result count before extracting.

Every command and flag is listed in the README's Commands section; `pipecorn
<command> --help` prints the same.

## Repository layout

- `src/commands/` — one file per command (oclif discovers them by path:
  `src/commands/lists/show.ts` is `pipecorn lists show`).
- `src/api/` — HTTP client (`client.ts`), one function per endpoint
  (`endpoints.ts`), response schemas (`schemas.ts`, zod) and typed errors
  mapped to exit codes (`errors.ts`).
- `src/lib/` — shared command base class, credentials, config, CSV, spinner.
- `src/output/` — JSON / CSV / table formatting.
- `test/` — vitest specs; HTTP is mocked with msw, never the real API.
- `scripts/check-schema-drift.ts` — lists endpoints documented in
  `pipecorn-api-doc` that `src/api/endpoints.ts` does not call yet.
- `homebrew/` and `scripts/render-homebrew-cask.sh` — the Homebrew cask,
  rendered on release.
- `plugin.json`, `mcp.json`, `skills/` — the Agent Plugin (see below).
- `.claude/settings.json`, `.cursor/rules/`, `.windsurf/rules/`,
  `.github/copilot-instructions.md` — per-tool configs. The rule files repeat
  only the rules above that must never break and point back here; change them
  with this file. `.gemini/settings.json` and `.aider.conf.yml` load this file
  directly. Codex, Kiro, Cline, Junie, Amp, Jules and Zed read it on their own.
- `.claude-plugin/` — the same plugin packaged for Claude Code, with a
  marketplace so `/plugin install pipecorn --marketplace Pipecorn/cli-pipecorn`
  works. Keep its `version` and `description` in step with `plugin.json`.

## Working on the code

```sh
npm ci
npm run lint            # eslint
npm run typecheck       # tsc --noEmit
npm test                # vitest
npm run build           # tsc to dist/
npm run dev -- <command> [flags]   # run from source with tsx
npm run check:schemas   # compare src/api/endpoints.ts with the pipecorn-api-doc checkout
```

CI runs lint, typecheck, test and build on Node 20 and 22 for every pull
request; all four must pass. Format with `npm run format` (prettier, 100
columns, double quotes).

- **Exit codes are a contract** that scripts and agents branch on. A new error
  type goes through `exitCodeFor()` in `src/api/errors.ts`. Never exit with a
  new code.
- **Output.** Data goes to stdout, messages and errors to stderr, so pipes
  stay clean.
- A new endpoint goes in `src/api/endpoints.ts` with a zod schema in
  `src/api/schemas.ts`, and a test in `test/api/` that mocks the response.
  `npm run check:schemas` fails when pipecorn-api-doc documents a path the CLI
  doesn't call: add the command, or list the path in `KNOWN_UNSUPPORTED` with
  the reason.
- A new command extends the base command in `src/lib/base-command.ts` so it
  gets `--api-key`, `--format`, `--output` and `--quiet`, and the exit-code
  mapping.
- **Credits.** An email costs 3 enrichment credits and a mobile 30. Give any
  new bulk spending command a `--dry-run` flag, like `contacts enrich`.
- The README's Commands section is generated by `npm run docs` (oclif readme).
  Edit the command class, then regenerate; do not edit that section by hand.
- **Secrets.** The API key comes from `--api-key`, `PIPECORN_API_KEY` or
  `~/.config/pipecorn/credentials.json` (mode 0600), in that order. Never log
  it, never put it in a test fixture or an error message.
- The API's source of truth is the OpenAPI spec at
  <https://docs.pipecorn.com/openapi.json>. Match its field names and
  status codes rather than guessing.

## Releasing

Pushing a `v*` tag runs `.github/workflows/release.yml`: it tests, publishes to
npm with provenance, attaches platform tarballs to a GitHub release and updates
the Homebrew cask. npm publishes the `version` in `package.json`, so bump it in
the same pull request as the change; a maintainer tags it. Never tag or publish
yourself.

## The Agent Plugin

- `plugin.json` must validate against `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`,
  and `mcp.json` against `.../mcp.schema.json`.
- `mcp.json` points at the hosted server, `https://mcp.pipecorn.com/mcp`. It
  must never carry an API key: clients sign in with OAuth or add their own
  `X-API-Key` header.
- `skills/pipecorn/SKILL.md` is the same skill pipecorn.com serves at
  `/.well-known/agent-skills/pipecorn/SKILL.md` (source: `lib/agent/docs.ts`
  in the website repo). Change both together.
- The MCP server is listed in the official MCP registry as
  [`com.pipecorn/mcp`](https://registry.modelcontextprotocol.io/v0/servers/com.pipecorn%2Fmcp/versions/latest).
