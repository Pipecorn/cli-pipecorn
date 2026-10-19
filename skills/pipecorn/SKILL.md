---
name: pipecorn
description: Find B2B companies and people, enrich them with a verified work email and mobile number, and read buying signals (hiring, job changes, lookalikes, LinkedIn posts) with Pipecorn over MCP, REST or CLI. Use when a user asks to build a lead list, size a market, enrich contacts, or find warm intros.
---

# Pipecorn

Pipecorn is a B2B sales intelligence platform. It does three jobs. It finds companies that match a profile (firmographics, technographics, buying signals). It finds people at those companies (titles, seniority, locations, industries). It enriches contacts with a verified work email and mobile number from 100+ providers.

## Pick a surface

- **MCP** (`https://mcp.pipecorn.com/mcp`) if you are an LLM client. It covers the common workflows and handles auth, polling and credit warnings. Setup: https://docs.pipecorn.com/mcp/overview
- **REST** (https://app.pipecorn.com/api/v2) for backend code or workflow tools. OpenAPI: https://pipecorn.com/openapi.json
- **CLI** (`@pipecorn/cli`) for shell scripts and CI. JSON output. Exit codes: 0 success, 1 API error, 2 input error, 3 auth, 4 rate limit, 5 credits or plan limit exhausted.

Authentication for each: https://pipecorn.com/auth.md

## Rules that protect the user's credits

1. Preview before extracting. For lead and account searches, run the preview first to see the result count, and extract only after the user confirms.
2. Resolve industries and locations by name with the lookup endpoints before filtering on them. Never guess an ID.
3. Poll asynchronous jobs with exponential backoff, from 2 seconds up to 30. Never poll in a tight loop.
4. Check the credit balance before bulk enrichment or a large extraction. Only `credits.enrichment` is spendable. The other counters are plan quotas that reset on their own.
5. Enrich two or more contacts with the bulk call (up to 100 a call), not one by one.
6. An email costs 3 credits and a mobile number costs 30. Ask before enriching mobiles in bulk.

## When a call fails

- `402` `insufficient_credits`: the balance is empty. Show the `top_up_url` and stop.
- `403` `workspace_limit_exceeded`: an admin capped this member. Stop and say so.
- `422` `Plan limit reached.`: an extraction quota ran out. It resets daily or monthly.
- `429`: back off and retry.

## Reference

- Agent guide: https://docs.pipecorn.com/agents.md
- Full docs in one file: https://docs.pipecorn.com/llms-full.txt
- Pricing and credits: https://pipecorn.com/pricing.md
