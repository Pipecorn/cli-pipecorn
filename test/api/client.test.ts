import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { PipecornClient } from "../../src/api/client.js";
import {
  AuthError,
  CreditError,
  PlanLimitError,
  PipecornError,
  RateLimitError,
  WorkspaceLimitError,
  exitCodeFor,
} from "../../src/api/errors.js";

const BASE = "https://example.test/api/v2";

const server = setupServer(
  http.get(`${BASE}/account`, ({ request }) => {
    const key = request.headers.get("x-api-key");
    if (key !== "good") {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return HttpResponse.json({ email: "user@example.com" });
  }),
  http.post(`${BASE}/contacts/bulk_enrich`, async () =>
    HttpResponse.json(
      { error: "Insufficient enrichment credits" },
      { status: 422 },
    ),
  ),
  http.post(`${BASE}/accounts/search`, async () =>
    HttpResponse.json(
      { error: "Search exceeds your monthly import limits" },
      { status: 422 },
    ),
  ),
  http.post(`${BASE}/contacts/single_enrich`, async () =>
    HttpResponse.json(
      {
        error: "Not enough enrichment credits left",
        code: "insufficient_credits",
        top_up_url: "https://app.pipecorn.com/settings/subscriptions/credits",
      },
      { status: 402 },
    ),
  ),
  http.post(`${BASE}/accounts/company_stack`, async () =>
    HttpResponse.json(
      { error: "Workspace weekly credit limit reached", code: "workspace_limit_exceeded" },
      { status: 403 },
    ),
  ),
  http.get(`${BASE}/credits`, () =>
    HttpResponse.json({ error: "Slow down" }, {
      status: 429,
      headers: { "retry-after": "12" },
    }),
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("PipecornClient", () => {
  it("returns parsed JSON on 2xx", async () => {
    const c = new PipecornClient({ apiKey: "good", baseUrl: BASE });
    const result = await c.get<{ email: string }>("/account");
    expect(result.email).toBe("user@example.com");
  });

  it("throws AuthError on 401", async () => {
    const c = new PipecornClient({ apiKey: "bad", baseUrl: BASE });
    await expect(c.get("/account")).rejects.toBeInstanceOf(AuthError);
  });

  it("throws CreditError when message mentions enrichment credits", async () => {
    const c = new PipecornClient({ apiKey: "good", baseUrl: BASE });
    await expect(c.post("/contacts/bulk_enrich", {})).rejects.toBeInstanceOf(CreditError);
  });

  it("throws PlanLimitError when message mentions import limits", async () => {
    const c = new PipecornClient({ apiKey: "good", baseUrl: BASE });
    await expect(c.post("/accounts/search", {})).rejects.toBeInstanceOf(PlanLimitError);
  });

  it("throws CreditError on 402", async () => {
    const c = new PipecornClient({ apiKey: "good", baseUrl: BASE });
    await expect(c.post("/contacts/single_enrich", {})).rejects.toBeInstanceOf(CreditError);
  });

  it("exits 5 on 402", async () => {
    const c = new PipecornClient({ apiKey: "good", baseUrl: BASE });
    const err = await c.post("/contacts/single_enrich", {}).catch((e: unknown) => e);
    expect(exitCodeFor(err)).toBe(5);
  });

  it("throws WorkspaceLimitError on a 403 workspace_limit_exceeded", async () => {
    const c = new PipecornClient({ apiKey: "good", baseUrl: BASE });
    await expect(c.post("/accounts/company_stack", {})).rejects.toBeInstanceOf(
      WorkspaceLimitError,
    );
  });

  it("exits 5 on a 403 workspace_limit_exceeded, not 3", async () => {
    const c = new PipecornClient({ apiKey: "good", baseUrl: BASE });
    const err = await c.post("/accounts/company_stack", {}).catch((e: unknown) => e);
    expect(exitCodeFor(err)).toBe(5);
  });

  it("parses Retry-After on 429", async () => {
    const c = new PipecornClient({ apiKey: "good", baseUrl: BASE });
    try {
      await c.get("/credits");
      throw new Error("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitError);
      expect((err as RateLimitError).retryAfterSeconds).toBe(12);
    }
  });

  it("PipecornError exposes status and body", async () => {
    const c = new PipecornClient({ apiKey: "bad", baseUrl: BASE });
    try {
      await c.get("/account");
      throw new Error("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(PipecornError);
      expect((err as PipecornError).status).toBe(401);
    }
  });
});
