import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { PipecornClient } from "../../src/api/client.js";
import { Contacts } from "../../src/api/endpoints.js";
import { PipecornError } from "../../src/api/errors.js";

const BASE = "https://example.test/api/v2";
const ENRICHMENT_ID = "6d1f4e2a-8b3c-4a5d-9e7f-0a1b2c3d4e5f";
const UNKNOWN_PHONE = "+33699999999";

let receivedBody: unknown;

const server = setupServer(
  http.post(`${BASE}/contacts/report_phone`, async ({ request }) => {
    receivedBody = await request.json();
    if ((receivedBody as { phone: string }).phone === UNKNOWN_PHONE) {
      return HttpResponse.json({ error: "Phone not found on this contact" }, { status: 404 });
    }
    return HttpResponse.json({
      enrichment_id: ENRICHMENT_ID,
      reported: true,
      replacement: "searching",
      status_url: `${BASE}/contacts/${ENRICHMENT_ID}`,
    });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const client = new PipecornClient({ apiKey: "good", baseUrl: BASE });
const body = {
  linkedin_url: "https://www.linkedin.com/in/william-hewish",
  phone: "+33612345678",
  reason: "wrong_person",
  find_replacement: true,
};

describe("Contacts.reportPhone", () => {
  it("sends the body to POST /contacts/report_phone", async () => {
    await Contacts.reportPhone(client, body);

    expect(receivedBody).toEqual(body);
  });

  it("returns the replacement status", async () => {
    const result = await Contacts.reportPhone(client, body);

    expect(result.replacement).toBe("searching");
  });

  it("throws a PipecornError when the number is not on the contact", async () => {
    await expect(
      Contacts.reportPhone(client, { ...body, phone: UNKNOWN_PHONE }),
    ).rejects.toBeInstanceOf(PipecornError);
  });
});
