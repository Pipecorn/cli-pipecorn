import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { PipecornClient } from "../../src/api/client.js";
import { Searches } from "../../src/api/endpoints.js";
import { PipecornError } from "../../src/api/errors.js";

const BASE = "https://example.test/api/v2";
const SEARCH_ID = "0d6f1c5e-1b7a-4c1e-9a43-6f8e2a1b9c77";
const LEAD_ID = "0b9c7d2e-3f4a-4b5c-8d6e-7f8a9b0c1d2e";

let receivedBody: unknown;

const server = setupServer(
  http.patch(`${BASE}/searches/${SEARCH_ID}/leads/status`, async ({ request }) => {
    receivedBody = await request.json();
    return HttpResponse.json({
      search_id: SEARCH_ID,
      status: "disqualified",
      rejection_reasons: ["Not in our ICP"],
      updated: 1,
      unknown_lead_ids: [],
    });
  }),
  http.patch(`${BASE}/searches/missing/leads/status`, () =>
    HttpResponse.json({ error: "Search not found" }, { status: 404 }),
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const client = new PipecornClient({ apiKey: "good", baseUrl: BASE });
const body = { lead_ids: [LEAD_ID], status: "disqualified", reason: "Not in our ICP" };

describe("Searches.updateLeadStatus", () => {
  it("sends the body to PATCH /searches/{id}/leads/status", async () => {
    await Searches.updateLeadStatus(client, SEARCH_ID, body);

    expect(receivedBody).toEqual(body);
  });

  it("returns the update summary", async () => {
    const result = await Searches.updateLeadStatus(client, SEARCH_ID, body);

    expect(result.updated).toBe(1);
  });

  it("throws a PipecornError for an unknown search", async () => {
    await expect(Searches.updateLeadStatus(client, "missing", body)).rejects.toBeInstanceOf(
      PipecornError,
    );
  });
});
