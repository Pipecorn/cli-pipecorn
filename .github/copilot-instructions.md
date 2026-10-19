# Pipecorn CLI

Follow `AGENTS.md` at the repository root: it is the single source of truth for working in this repo and for driving the `pipecorn` CLI.

The rules you must not break:

- Exit codes are a contract: 0 success, 1 API error, 2 invalid input, 3 authentication, 4 rate limit, 5 credits or plan limit. Map new errors through `exitCodeFor()` in `src/api/errors.ts`; never add a code.
- Data goes to stdout, messages and errors to stderr.
- Never log, print or commit an API key, and never put one in a test fixture or in `mcp.json`.
- Enrichment spends the user's credits. Check `pipecorn credits` first and use `--dry-run` on batch enrichment.
- Tests mock HTTP with msw and never call the real API.
- Before you push, run `npm run lint`, `npm run typecheck`, `npm test` and `npm run build`.
- Never tag a release or publish to npm.
