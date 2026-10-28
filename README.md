# @pipecorn/cli

📖 Full documentation: [Pipecorn API docs](https://docs.pipecorn.com) · [Developers](https://pipecorn.com/developers)

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
pipecorn login YOUR_API_KEY
# or
export PIPECORN_API_KEY=YOUR_API_KEY
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

## AI agents

This repo is also the **Pipecorn Agent Plugin** ([agent-plugins.org](https://agent-plugins.org/specification)): [`plugin.json`](plugin.json) bundles the hosted Pipecorn MCP server ([`mcp.json`](mcp.json), `https://mcp.pipecorn.com/mcp`, listed in the official MCP registry as [`com.pipecorn/mcp`](https://registry.modelcontextprotocol.io/v0/servers/com.pipecorn%2Fmcp/versions/latest)) and the Pipecorn agent skill ([`skills/pipecorn/SKILL.md`](skills/pipecorn/SKILL.md)). Coding agents working on the CLI read [`AGENTS.md`](AGENTS.md).

In Claude Code, install the plugin from this repo's marketplace (Claude Code 2.1.275 or later):

```
/plugin install pipecorn --marketplace Pipecorn/cli-pipecorn
```

## Configuration

```sh
pipecorn config list
pipecorn config set base_url https://staging.pipecorn.com/api/v2
pipecorn config set default_format json
pipecorn config get base_url
```

Config lives at the platform's standard XDG location
(`~/.config/pipecorn/config.json` on Linux/macOS).

## Commands

Every command, argument and flag. Generated from the command classes by
`npm run docs` — edit the command, not this section.

<!-- commands -->
* [`pipecorn accounts enrich`](#pipecorn-accounts-enrich)
* [`pipecorn accounts search`](#pipecorn-accounts-search)
* [`pipecorn accounts stack`](#pipecorn-accounts-stack)
* [`pipecorn autocomplete [SHELL]`](#pipecorn-autocomplete-shell)
* [`pipecorn config get KEY`](#pipecorn-config-get-key)
* [`pipecorn config list`](#pipecorn-config-list)
* [`pipecorn config set KEY VALUE`](#pipecorn-config-set-key-value)
* [`pipecorn contacts enrich`](#pipecorn-contacts-enrich)
* [`pipecorn contacts get ID`](#pipecorn-contacts-get-id)
* [`pipecorn credits`](#pipecorn-credits)
* [`pipecorn help [COMMAND]`](#pipecorn-help-command)
* [`pipecorn jobs`](#pipecorn-jobs)
* [`pipecorn jobs delete ID`](#pipecorn-jobs-delete-id)
* [`pipecorn jobs status ID`](#pipecorn-jobs-status-id)
* [`pipecorn leads enrich`](#pipecorn-leads-enrich)
* [`pipecorn leads search`](#pipecorn-leads-search)
* [`pipecorn lists`](#pipecorn-lists)
* [`pipecorn lists create NAME`](#pipecorn-lists-create-name)
* [`pipecorn lists export ID`](#pipecorn-lists-export-id)
* [`pipecorn lists show ID`](#pipecorn-lists-show-id)
* [`pipecorn lists update ID`](#pipecorn-lists-update-id)
* [`pipecorn locations QUERY`](#pipecorn-locations-query)
* [`pipecorn login [KEY]`](#pipecorn-login-key)
* [`pipecorn logout`](#pipecorn-logout)
* [`pipecorn personas`](#pipecorn-personas)
* [`pipecorn personas show UUID`](#pipecorn-personas-show-uuid)
* [`pipecorn signals growth`](#pipecorn-signals-growth)
* [`pipecorn signals hiring`](#pipecorn-signals-hiring)
* [`pipecorn signals job-changes`](#pipecorn-signals-job-changes)
* [`pipecorn signals track-job-changes`](#pipecorn-signals-track-job-changes)
* [`pipecorn whoami`](#pipecorn-whoami)

## `pipecorn accounts enrich`

Enrich a single company by domain, name, or LinkedIn URL.

```
USAGE
  $ pipecorn accounts enrich [--api-key <value>] [--format json|csv|table] [--quiet] [-o <value>] [--domain <value>]
    [--name <value>] [--linkedin-url <value>] [--country <value>]

FLAGS
  --country=<value>       Two-letter ISO country code
  --domain=<value>        Company website domain
  --linkedin-url=<value>  LinkedIn company profile URL
  --name=<value>          Company name

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  Enrich a single company by domain, name, or LinkedIn URL.

EXAMPLES
  $ pipecorn accounts enrich --domain stripe.com

  $ pipecorn accounts enrich --linkedin-url https://linkedin.com/company/stripe
```

_See code: [src/commands/accounts/enrich.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/accounts/enrich.ts)_

## `pipecorn accounts search`

Start a company search. Returns a job ID — poll with `pipecorn jobs status <id>`.

```
USAGE
  $ pipecorn accounts search [--api-key <value>] [--format json|csv|table] [--quiet] [-o <value>] [--name <value>]
    [--live] [--webhook-url <value>] [--keyword <value>] [--included-industries <value>...] [--excluded-industries
    <value>...] [--included-locations <value>...] [--excluded-locations <value>...] [--company-size <value>...]
    [--min-revenue <value>] [--max-revenue <value>] [--revenue-currency <value>] [--company-types <value>...]
    [--business-models saas...] [--min-headcount <value>] [--max-headcount <value>] [--min-year-founded <value>]
    [--max-year-founded <value>] [--last-funding-within-days <value>] [--min-last-funding-amount <value>]
    [--max-last-funding-amount <value>] [--headcount-growth-period mom|qoq|six_months|yoy] [--min-headcount-growth
    <value>] [--max-headcount-growth <value>] [--department-headcount <value>...] [--department-headcount-match all|any]
    [--department-growth <value>...] [--department-growth-match all|any] [--min-monthly-visitors <value>]
    [--max-monthly-visitors <value>] [--monthly-visitor-growth-period mom|qoq] [--min-monthly-visitor-growth <value>]
    [--max-monthly-visitor-growth <value>] [--included-company-lists <value>...] [--excluded-company-lists <value>...]
    [--competitors-of <value>...] [--with-job-titles <value>...] [--without-job-titles <value>...] [--limit <value>]
    [--preview]

FLAGS
  --company-size=<value>...
  --excluded-industries=<value>...
  --excluded-locations=<value>...
  --included-industries=<value>...
  --included-locations=<value>...
  --keyword=<value>                 Boolean keyword query
  --limit=<value>                   Max companies (≤ 1000)
  --[no-]live                       Search LinkedIn Sales Navigator (default). --no-live searches the Pipecorn database
  --max-revenue=<value>             Maximum annual revenue, in millions
  --min-revenue=<value>             Minimum annual revenue, in millions
  --name=<value>                    Display name for the saved search
  --preview                         Synchronous preview (count + small sample) instead of async search
  --revenue-currency=<value>
  --webhook-url=<value>             URL that receives the results (required unless --preview)

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

PIPECORN DATABASE (--NO-LIVE) FLAGS
  --business-models=<option>...             <options: saas>
  --company-types=<value>...
  --competitors-of=<value>...               LinkedIn company IDs (up to 10)
  --department-growth=<value>...            <department>:<min>:<max> growth in percent (e.g. 'Engineering:20:')
  --department-growth-match=<option>        <options: all|any>
  --department-headcount=<value>...         <department>:<min>:<max>, a blank bound is open (e.g. 'Sales:10:')
  --department-headcount-match=<option>     <options: all|any>
  --excluded-company-lists=<value>...       List IDs
  --headcount-growth-period=<option>        <options: mom|qoq|six_months|yoy>
  --included-company-lists=<value>...       List IDs
  --last-funding-within-days=<value>        Last round raised within this many days
  --max-headcount=<value>
  --max-headcount-growth=<value>
  --max-last-funding-amount=<value>
  --max-monthly-visitor-growth=<value>
  --max-monthly-visitors=<value>
  --max-year-founded=<value>
  --min-headcount=<value>                   Exact headcount range, replaces --company-size
  --min-headcount-growth=<value>            Company headcount growth, in percent
  --min-last-funding-amount=<value>         Last round size, in USD millions
  --min-monthly-visitor-growth=<value>      Website traffic growth, in percent
  --min-monthly-visitors=<value>
  --min-year-founded=<value>
  --monthly-visitor-growth-period=<option>  <options: mom|qoq>
  --with-job-titles=<value>...              Companies where someone holds one of these titles (up to 25)
  --without-job-titles=<value>...           Companies where no one holds any of these titles (up to 25)

DESCRIPTION
  Start a company search. Returns a job ID — poll with `pipecorn jobs status <id>`.

  Runs on LinkedIn Sales Navigator by default. Pass --no-live to search the Pipecorn database instead, which needs no
  Sales Navigator account and takes every filter of the app's company search. Departments: Accounting, Administrative,
  Arts and Design, Business Development, Community and Social Services, Consulting, Customer Success and Support,
  Education, Engineering, Entrepreneurship, Finance, Healthcare Services, Human Resources, Information Technology,
  Legal, Marketing, Media and Communication, Military and Protective Services, Operations, Product Management, Program
  and Project Management, Purchasing, Quality Assurance, Real Estate, Research, Sales.

EXAMPLES
  $ pipecorn accounts search --keyword '"sales agency"' --company-size 11-50 --limit 100 --webhook-url https://my.app/hook

  $ pipecorn accounts search --preview --keyword 'fintech'   # synchronous count + sample

  $ pipecorn accounts search --preview --no-live --company-types 'Privately Held' --min-year-founded 2018 --last-funding-within-days 365 --department-growth 'Sales:20:'

  $ pipecorn accounts search --preview --no-live --business-models saas --with-job-titles 'Head of Sales' --without-job-titles RevOps
```

_See code: [src/commands/accounts/search.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/accounts/search.ts)_

## `pipecorn accounts stack`

Look up a company's tech stack.

```
USAGE
  $ pipecorn accounts stack [--api-key <value>] [--format json|csv|table] [--quiet] [-o <value>] [--domain <value>]
    [--name <value>] [--linkedin-url <value>]

FLAGS
  --domain=<value>        Company website domain
  --linkedin-url=<value>  LinkedIn company URL
  --name=<value>          Company name

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  Look up a company's tech stack.
```

_See code: [src/commands/accounts/stack.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/accounts/stack.ts)_

## `pipecorn autocomplete [SHELL]`

Display autocomplete installation instructions.

```
USAGE
  $ pipecorn autocomplete [SHELL] [-r]

ARGUMENTS
  [SHELL]  (zsh|bash|powershell) Shell type

FLAGS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

DESCRIPTION
  Display autocomplete installation instructions.

EXAMPLES
  $ pipecorn autocomplete

  $ pipecorn autocomplete bash

  $ pipecorn autocomplete zsh

  $ pipecorn autocomplete powershell

  $ pipecorn autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v3.2.49/src/commands/autocomplete/index.ts)_

## `pipecorn config get KEY`

Read a CLI configuration value.

```
USAGE
  $ pipecorn config get KEY

ARGUMENTS
  KEY  Config key

DESCRIPTION
  Read a CLI configuration value.
```

_See code: [src/commands/config/get.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/config/get.ts)_

## `pipecorn config list`

List all CLI configuration values.

```
USAGE
  $ pipecorn config list

DESCRIPTION
  List all CLI configuration values.
```

_See code: [src/commands/config/list.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/config/list.ts)_

## `pipecorn config set KEY VALUE`

Set a CLI configuration value.

```
USAGE
  $ pipecorn config set KEY VALUE

ARGUMENTS
  KEY    Config key
  VALUE  Value

DESCRIPTION
  Set a CLI configuration value.
```

_See code: [src/commands/config/set.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/config/set.ts)_

## `pipecorn contacts enrich`

Enrich contacts with email or phone. Pass --batch to enqueue a CSV (async; returns enrichment_id).

```
USAGE
  $ pipecorn contacts enrich [--api-key <value>] [--format json|csv|table] [--quiet] [-o <value>] [--firstname
    <value>] [--lastname <value>] [--domain <value>] [--company-name <value>] [--linkedin-url <value>] [--batch <value>]
    [--enrichment email|phone|personal_email] [--webhook-url <value>] [--dry-run]

FLAGS
  --batch=<value>         Path to a CSV file (batch mode)
  --company-name=<value>  Company name (single mode)
  --domain=<value>        Company domain (single mode)
  --dry-run               Report how many contacts would be enqueued without spending credits
  --enrichment=<option>   [default: email] Enrichment type
                          <options: email|phone|personal_email>
  --firstname=<value>     First name (single mode)
  --lastname=<value>      Last name (single mode)
  --linkedin-url=<value>  LinkedIn URL (single mode)
  --webhook-url=<value>   Webhook URL to receive completed records

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  Enrich contacts with email or phone. Pass --batch to enqueue a CSV (async; returns enrichment_id).

EXAMPLES
  $ pipecorn contacts enrich --firstname Ada --lastname Lovelace --domain mathmatics.example

  $ pipecorn contacts enrich --batch contacts.csv --enrichment email --webhook-url https://my.app/hook

  $ pipecorn contacts enrich --batch contacts.csv --enrichment phone --dry-run
```

_See code: [src/commands/contacts/enrich.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/contacts/enrich.ts)_

## `pipecorn contacts get ID`

Fetch a previously-enriched contact by enrichment id.

```
USAGE
  $ pipecorn contacts get ID [--api-key <value>] [--format json|csv|table] [--quiet] [-o <value>]

ARGUMENTS
  ID  Enrichment ID

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  Fetch a previously-enriched contact by enrichment id.
```

_See code: [src/commands/contacts/get.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/contacts/get.ts)_

## `pipecorn credits`

Show the current credit balance for the authenticated account.

```
USAGE
  $ pipecorn credits [--api-key <value>] [--format json|csv|table] [--quiet] [-o <value>]

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  Show the current credit balance for the authenticated account.
```

_See code: [src/commands/credits.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/credits.ts)_

## `pipecorn help [COMMAND]`

Display help for pipecorn.

```
USAGE
  $ pipecorn help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for pipecorn.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/6.2.49/src/commands/help.ts)_

## `pipecorn jobs`

List recent searches. Each search corresponds to an async lead/account job.

```
USAGE
  $ pipecorn jobs [--api-key <value>] [--format json|csv|table] [--quiet] [-o <value>]

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  List recent searches. Each search corresponds to an async lead/account job.
```

_See code: [src/commands/jobs/index.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/jobs/index.ts)_

## `pipecorn jobs delete ID`

Delete a saved search.

```
USAGE
  $ pipecorn jobs delete ID [--api-key <value>] [--format json|csv|table] [--quiet] [-o <value>]

ARGUMENTS
  ID  Search/job ID

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  Delete a saved search.
```

_See code: [src/commands/jobs/delete.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/jobs/delete.ts)_

## `pipecorn jobs status ID`

Show the status of a search (job). Use --watch to poll until it finishes.

```
USAGE
  $ pipecorn jobs status ID [--api-key <value>] [--format json|csv|table] [--quiet] [-o <value>] [--watch]
    [--interval <value>] [--timeout <value>]

ARGUMENTS
  ID  Search/job ID

FLAGS
  --interval=<value>  [default: 5] Polling interval in seconds (with --watch)
  --timeout=<value>   [default: 1800] Give up after N seconds (with --watch)
  --watch             Poll until the job reaches a terminal status

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  Show the status of a search (job). Use --watch to poll until it finishes.
```

_See code: [src/commands/jobs/status.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/jobs/status.ts)_

## `pipecorn leads enrich`

Enrich a single LinkedIn profile.

```
USAGE
  $ pipecorn leads enrich --linkedin-url <value> [--api-key <value>] [--format json|csv|table] [--quiet] [-o
    <value>]

FLAGS
  --linkedin-url=<value>  (required) LinkedIn profile URL

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  Enrich a single LinkedIn profile.
```

_See code: [src/commands/leads/enrich.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/leads/enrich.ts)_

## `pipecorn leads search`

Run an advanced lead search (Sales Navigator-style filters). Returns a job ID; poll with `pipecorn jobs status`.

```
USAGE
  $ pipecorn leads search [--api-key <value>] [--format json|csv|table] [--quiet] [-o <value>] [--name <value>]
    [--keyword <value>] [--persona-id <value> | --job-titles <value>... | --excluded-job-titles <value>...]
    [--past-titles <value>...] [--included-locations <value>...] [--excluded-locations <value>...]
    [--company-headquarters <value>...] [--included-industries <value>...] [--excluded-industries <value>...]
    [--included-companies <value>...] [--excluded-companies <value>...] [--functions <value>...] [--seniority-levels
    <value>...] [--company-size <value>...] [--included-account-lists <value>...] [--included-lead-lists <value>...]
    [--limit <value>] [--streaming] [--scale] [--preview]

FLAGS
  --company-headquarters=<value>...
  --company-size=<value>...
  --excluded-companies=<value>...
  --excluded-industries=<value>...
  --excluded-job-titles=<value>...
  --excluded-locations=<value>...
  --functions=<value>...
  --included-account-lists=<value>...
  --included-companies=<value>...
  --included-industries=<value>...
  --included-lead-lists=<value>...
  --included-locations=<value>...
  --job-titles=<value>...
  --keyword=<value>                    Free-text keyword
  --limit=<value>
  --name=<value>                       Display name for this search
  --past-titles=<value>...
  --persona-id=<value>                 Persona UUID (from `pipecorn personas`): searches its included and excluded job
                                       titles
  --preview                            Synchronous preview (count + sample) instead of async search
  --scale
  --seniority-levels=<value>...
  --streaming

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  Run an advanced lead search (Sales Navigator-style filters). Returns a job ID; poll with `pipecorn jobs status`.

EXAMPLES
  $ pipecorn leads search --job-titles 'Head of Sales' --seniority-levels 130 --limit 50

  $ pipecorn leads search --preview --keyword 'GTM' --company-size 51-200

  $ pipecorn leads search --persona-id 1f6b0f5a-2d8e-4c3a-9b8f-1a2b3c4d5e6f --included-locations 105015875
```

_See code: [src/commands/leads/search.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/leads/search.ts)_

## `pipecorn lists`

List all account and lead lists.

```
USAGE
  $ pipecorn lists [--api-key <value>] [--format json|csv|table] [--quiet] [-o <value>]

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  List all account and lead lists.
```

_See code: [src/commands/lists/index.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/lists/index.ts)_

## `pipecorn lists create NAME`

Create an empty list.

```
USAGE
  $ pipecorn lists create NAME [--api-key <value>] [--format json|csv|table] [--quiet] [-o <value>] [--kind
    account|lead]

ARGUMENTS
  NAME  List name

FLAGS
  --kind=<option>  List kind
                   <options: account|lead>

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  Create an empty list.
```

_See code: [src/commands/lists/create.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/lists/create.ts)_

## `pipecorn lists export ID`

Export a list to CSV. Writes to stdout by default; use -o to write a file.

```
USAGE
  $ pipecorn lists export ID [--api-key <value>] [--format json|csv|table] [--quiet] [-o <value>]

ARGUMENTS
  ID  List ID

FLAGS
  -o, --output=<value>  Output file (default: stdout)

GLOBAL FLAGS
  --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
  --format=<option>  Output format (default: table on TTY, json otherwise)
                     <options: json|csv|table>
  --quiet            Suppress spinners and progress output

DESCRIPTION
  Export a list to CSV. Writes to stdout by default; use -o to write a file.
```

_See code: [src/commands/lists/export.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/lists/export.ts)_

## `pipecorn lists show ID`

Show a single list and its members.

```
USAGE
  $ pipecorn lists show ID [--api-key <value>] [--format json|csv|table] [--quiet] [-o <value>]

ARGUMENTS
  ID  List ID

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  Show a single list and its members.
```

_See code: [src/commands/lists/show.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/lists/show.ts)_

## `pipecorn lists update ID`

Rename a list.

```
USAGE
  $ pipecorn lists update ID --name <value> [--api-key <value>] [--format json|csv|table] [--quiet] [-o <value>]

ARGUMENTS
  ID  List ID

FLAGS
  --name=<value>  (required) New list name

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  Rename a list.
```

_See code: [src/commands/lists/update.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/lists/update.ts)_

## `pipecorn locations QUERY`

Resolve a free-text location to LinkedIn geoRegion IDs (use with --included-locations).

```
USAGE
  $ pipecorn locations QUERY [--api-key <value>] [--format json|csv|table] [--quiet] [-o <value>]

ARGUMENTS
  QUERY  Location query (e.g. 'Paris')

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  Resolve a free-text location to LinkedIn geoRegion IDs (use with --included-locations).
```

_See code: [src/commands/locations.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/locations.ts)_

## `pipecorn login [KEY]`

Save a Pipecorn API key locally after validating it against the API.

```
USAGE
  $ pipecorn login [KEY] [--api-key <value>] [--format json|csv|table] [--quiet] [-o <value>] [--base-url
    <value>]

ARGUMENTS
  [KEY]  API key (omit to read from --api-key or env)

FLAGS
  --api-key=<value>   [env: PIPECORN_API_KEY] API key value
  --base-url=<value>  Override API base URL (default: https://app.pipecorn.com/api/v2)

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  Save a Pipecorn API key locally after validating it against the API.

EXAMPLES
  $ pipecorn login --api-key YOUR_API_KEY

  $ PIPECORN_API_KEY=YOUR_API_KEY pipecorn login
```

_See code: [src/commands/login.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/login.ts)_

## `pipecorn logout`

Remove saved Pipecorn credentials from this machine.

```
USAGE
  $ pipecorn logout [--api-key <value>] [--format json|csv|table] [--quiet] [-o <value>]

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  Remove saved Pipecorn credentials from this machine.
```

_See code: [src/commands/logout.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/logout.ts)_

## `pipecorn personas`

List ICP personas.

```
USAGE
  $ pipecorn personas [--api-key <value>] [--format json|csv|table] [--quiet] [-o <value>]

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  List ICP personas.
```

_See code: [src/commands/personas/index.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/personas/index.ts)_

## `pipecorn personas show UUID`

Show a single persona.

```
USAGE
  $ pipecorn personas show UUID [--api-key <value>] [--format json|csv|table] [--quiet] [-o <value>]

ARGUMENTS
  UUID  Persona UUID

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  Show a single persona.
```

_See code: [src/commands/personas/show.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/personas/show.ts)_

## `pipecorn signals growth`

Find companies with notable headcount growth. Streams to --webhook-url.

```
USAGE
  $ pipecorn signals growth --webhook-url <value> [--api-key <value>] [--format json|csv|table] [--quiet] [-o
    <value>] [--min-growth-percent <value>] [--min-headcount <value>] [--max-headcount <value>] [--included-industries
    <value>...] [--included-locations <value>...] [--company-size <value>...]

FLAGS
  --company-size=<value>...
  --included-industries=<value>...
  --included-locations=<value>...
  --max-headcount=<value>
  --min-growth-percent=<value>
  --min-headcount=<value>
  --webhook-url=<value>             (required)

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  Find companies with notable headcount growth. Streams to --webhook-url.
```

_See code: [src/commands/signals/growth.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/signals/growth.ts)_

## `pipecorn signals hiring`

Find companies actively hiring. Results stream to --webhook-url.

```
USAGE
  $ pipecorn signals hiring --webhook-url <value> [--api-key <value>] [--format json|csv|table] [--quiet] [-o
    <value>] [--selected-keywords <value>...] [--excluded-keywords <value>...] [--selected-titles <value>...]
    [--excluded-titles <value>...] [--exclude-consulting-recruiting] [--exclude-internships] [--published-date <value>]
    [--included-locations <value>...] [--excluded-locations <value>...] [--company-size <value>...]
    [--included-industries <value>...]

FLAGS
  --company-size=<value>...
  --exclude-consulting-recruiting
  --exclude-internships
  --excluded-keywords=<value>...
  --excluded-locations=<value>...
  --excluded-titles=<value>...
  --included-industries=<value>...
  --included-locations=<value>...
  --published-date=<value>          e.g. last_24_hours, last_7_days, last_30_days
  --selected-keywords=<value>...
  --selected-titles=<value>...
  --webhook-url=<value>             (required) Webhook URL to receive matches

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  Find companies actively hiring. Results stream to --webhook-url.
```

_See code: [src/commands/signals/hiring.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/signals/hiring.ts)_

## `pipecorn signals job-changes`

Track when leads in a list change jobs. Streams to --webhook-url.

```
USAGE
  $ pipecorn signals job-changes --webhook-url <value> --lead-list-id <value> [--api-key <value>] [--format
    json|csv|table] [--quiet] [-o <value>]

FLAGS
  --lead-list-id=<value>  (required) Lead list to monitor
  --webhook-url=<value>   (required)

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  Track when leads in a list change jobs. Streams to --webhook-url.

ALIASES
  $ pipecorn signals track-job-changes
```

_See code: [src/commands/signals/job-changes.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/signals/job-changes.ts)_

## `pipecorn signals track-job-changes`

Track when leads in a list change jobs. Streams to --webhook-url.

```
USAGE
  $ pipecorn signals track-job-changes --webhook-url <value> --lead-list-id <value> [--api-key <value>] [--format
    json|csv|table] [--quiet] [-o <value>]

FLAGS
  --lead-list-id=<value>  (required) Lead list to monitor
  --webhook-url=<value>   (required)

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  Track when leads in a list change jobs. Streams to --webhook-url.

ALIASES
  $ pipecorn signals track-job-changes
```

## `pipecorn whoami`

Show the authenticated account and credit balance.

```
USAGE
  $ pipecorn whoami [--api-key <value>] [--format json|csv|table] [--quiet] [-o <value>]

GLOBAL FLAGS
  -o, --output=<value>   Write output to a file instead of stdout
      --api-key=<value>  [env: PIPECORN_API_KEY] Pipecorn API key (overrides env + saved credentials)
      --format=<option>  Output format (default: table on TTY, json otherwise)
                         <options: json|csv|table>
      --quiet            Suppress spinners and progress output

DESCRIPTION
  Show the authenticated account and credit balance.
```

_See code: [src/commands/whoami.ts](https://github.com/Pipecorn/cli-pipecorn/blob/v0.4.0/src/commands/whoami.ts)_
<!-- commandsstop -->

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
