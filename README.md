# @pipecorn/cli

`pipecorn` — command-line interface for [Pipecorn](https://pipecorn.com),
the B2B sales-intelligence platform. Search leads and accounts, enrich
contacts in bulk from CSV, manage lists, and stream buying-intent signals
to your webhook — all from your terminal or a shell script.

## Install

```sh
# npm (no global install needed)
npx @pipecorn/cli --help

# global install
npm install -g @pipecorn/cli

# Homebrew (macOS)
brew tap pipecorn/tap
brew trust pipecorn/tap
brew install pipecorn
```

`brew trust` is required once per machine: since Homebrew 6.0 formulae and
casks from third-party taps are not loaded until you opt in. On Linux and
Windows, install from npm.

## Authenticate

Get an API key at <https://app.pipecorn.com/settings/apis/keys>, then:

```sh
pipecorn login pk_live_xxx
# or
export PIPECORN_API_KEY=pk_live_xxx
pipecorn whoami
```

Credentials are stored at `~/.config/pipecorn/credentials.json` with mode
`0600`. `PIPECORN_API_KEY` always wins over the saved file; `--api-key` on
any command wins over both.

## Quick examples

```sh
# Preview an account search (sync, free)
pipecorn accounts search --preview --keyword '"sales agency"' --company-size 11-50

# Start an async lead search and poll until it finishes
JOB=$(pipecorn leads search --job-titles 'Head of Sales' --limit 50 --format json | jq -r .id)
pipecorn jobs status "$JOB" --watch

# Bulk-enrich contacts from CSV (async; prints enrichment_id)
pipecorn contacts enrich --batch leads.csv --enrichment email \
  --webhook-url https://my.app/webhooks/pipecorn

# Dry-run to see credit cost first
pipecorn contacts enrich --batch leads.csv --enrichment phone --dry-run

# Export a list to CSV
pipecorn lists export <list-id> -o list.csv

# Buying signals → webhook stream
pipecorn signals hiring --webhook-url https://my.app/hook \
  --selected-titles 'Account Executive' --published-date last_7_days
```

## Output

`--format json|csv|table` — default is `table` on a TTY and `json`
otherwise (so pipes work). `-o file.csv` writes to disk. Errors go to
stderr; the exit code identifies the failure class:

| code | meaning |
|---|---|
| 0 | success |
| 1 | Pipecorn API error |
| 2 | invalid input |
| 3 | authentication |
| 4 | rate limit |
| 5 | credits or plan limit |

## Configuration

```sh
pipecorn config list
pipecorn config set base_url https://staging.pipecorn.com/api/v2
pipecorn config set default_format json
pipecorn config get base_url
```

Config lives at the platform's standard XDG location
(`~/.config/pipecorn/config.json` on Linux/macOS).

## Development

```sh
npm install
npm run dev -- whoami           # run via tsx without building
npm test
npm run typecheck && npm run lint
npm run check:schemas           # diff against pipecorn-api-doc
```

To point at a sibling `pipecorn-api-doc` checkout other than the default:

```sh
PIPECORN_API_DOC_PATH=/path/to/pipecorn-api-doc npm run check:schemas
```
