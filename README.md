# @prontohq/cli

`pronto` — command-line interface for [Pronto](https://prontohq.com),
the B2B sales-intelligence platform. Search leads and accounts, enrich
contacts in bulk from CSV, manage lists, and stream buying-intent signals
to your webhook — all from your terminal or a shell script.

## Install

```sh
# npm (no global install needed)
npx @prontohq/cli --help

# global install
npm install -g @prontohq/cli

# Homebrew
brew install prontohq/pronto/pronto
```

## Authenticate

Get an API key at <https://app.prontohq.com/settings/apis/keys>, then:

```sh
pronto login pk_live_xxx
# or
export PRONTO_API_KEY=pk_live_xxx
pronto whoami
```

Credentials are stored at `~/.config/pronto/credentials.json` with mode
`0600`. `PRONTO_API_KEY` always wins over the saved file; `--api-key` on
any command wins over both.

## Quick examples

```sh
# Preview an account search (sync, free)
pronto accounts search --preview --keyword '"sales agency"' --company-size 11-50

# Start an async lead search and poll until it finishes
JOB=$(pronto leads search --job-titles 'Head of Sales' --limit 50 --format json | jq -r .id)
pronto jobs status "$JOB" --watch

# Bulk-enrich contacts from CSV (async; prints enrichment_id)
pronto contacts enrich --batch leads.csv --enrichment email \
  --webhook-url https://my.app/webhooks/pronto

# Dry-run to see credit cost first
pronto contacts enrich --batch leads.csv --enrichment phone --dry-run

# Export a list to CSV
pronto lists export <list-id> -o list.csv

# Buying signals → webhook stream
pronto signals hiring --webhook-url https://my.app/hook \
  --selected-titles 'Account Executive' --published-date last_7_days
```

## Output

`--format json|csv|table` — default is `table` on a TTY and `json`
otherwise (so pipes work). `-o file.csv` writes to disk. Errors go to
stderr; the exit code identifies the failure class:

| code | meaning |
|---|---|
| 0 | success |
| 1 | Pronto API error |
| 2 | invalid input |
| 3 | authentication |
| 4 | rate limit |
| 5 | credits or plan limit |

## Configuration

```sh
pronto config list
pronto config set base_url https://staging.prontohq.com/api/v2
pronto config set default_format json
pronto config get base_url
```

Config lives at the platform's standard XDG location
(`~/.config/pronto/config.json` on Linux/macOS).

## Development

```sh
npm install
npm run dev -- whoami           # run via tsx without building
npm test
npm run typecheck && npm run lint
npm run check:schemas           # diff against pronto-api-doc
```

To point at a sibling `pronto-api-doc` checkout other than the default:

```sh
PRONTO_API_DOC_PATH=/path/to/pronto-api-doc npm run check:schemas
```
