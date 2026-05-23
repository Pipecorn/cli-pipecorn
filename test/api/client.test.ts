import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { ProntoClient } from "../../src/api/client.js";
import {
  AuthError,
  CreditError,
  PlanLimitError,
  ProntoError,
  RateLimitError,
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

describe("ProntoClient", () => {
  it("returns parsed JSON on 2xx", async () => {
    const c = new ProntoClient({ apiKey: "good", baseUrl: BASE });
    const result = await c.get<{ email: string }>("/account");
    expect(result.email).toBe("user@example.com");
  });

  it("throws AuthError on 401", async () => {
    const c = new ProntoClient({ apiKey: "bad", baseUrl: BASE });
    await expect(c.get("/account")).rejects.toBeInstanceOf(AuthError);
  });

  it("throws CreditError when message mentions enrichment credits", async () => {
    const c = new ProntoClient({ apiKey: "good", baseUrl: BASE });
    await expect(c.post("/contacts/bulk_enrich", {})).rejects.toBeInstanceOf(CreditError);
  });

  it("throws PlanLimitError when message mentions import limits", async () => {
    const c = new ProntoClient({ apiKey: "good", baseUrl: BASE });
    await expect(c.post("/accounts/search", {})).rejects.toBeInstanceOf(PlanLimitError);
  });

  it("parses Retry-After on 429", async () => {
    const c = new ProntoClient({ apiKey: "good", baseUrl: BASE });
    try {
      await c.get("/credits");
      throw new Error("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitError);
      expect((err as RateLimitError).retryAfterSeconds).toBe(12);
    }
  });

  it("ProntoError exposes status and body", async () => {
    const c = new ProntoClient({ apiKey: "bad", baseUrl: BASE });
    try {
      await c.get("/account");
      throw new Error("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ProntoError);
      expect((err as ProntoError).status).toBe(401);
    }
  });
});
