import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { PipecornClient } from "../../src/api/client.js";
import { Contacts } from "../../src/api/endpoints.js";
import { PipecornError } from "../../src/api/errors.js";

const BASE = "https://example.test/api/v2";
const ENRICHMENT_ID = "6d1f4e2a-8b3c-4a5d-9e7f-0a1b2c3d4e5f";
const UNKNOWN_PHONE = "+33699999999";
const UNKNOWN_EMAIL = "nobody@acme.com";

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
  http.post(`${BASE}/contacts/report_email`, async ({ request }) => {
    receivedBody = await request.json();
    if ((receivedBody as { email: string }).email === UNKNOWN_EMAIL) {
      return HttpResponse.json({ error: "Email not found on this contact" }, { status: 404 });
    }
    return HttpResponse.json({
      enrichment_id: ENRICHMENT_ID,
      reported: true,
      replacement: "other_email_kept",
      status_url: `${BASE}/contacts/${ENRICHMENT_ID}`,
    });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const client = new PipecornClient({ apiKey: "good", baseUrl: BASE });
const phoneBody = {
  linkedin_url: "https://www.linkedin.com/in/william-hewish",
  phone: "+33612345678",
  reason: "wrong_person",
  find_replacement: true,
};
const emailBody = {
  linkedin_url: "https://www.linkedin.com/in/william-hewish",
  email: "william@oldcompany.com",
  reason: "wrong_domain",
  find_replacement: true,
};

describe("Contacts.reportPhone", () => {
  it("sends the body to POST /contacts/report_phone", async () => {
    await Contacts.reportPhone(client, phoneBody);

    expect(receivedBody).toEqual(phoneBody);
  });

  it("returns the replacement status", async () => {
    const result = await Contacts.reportPhone(client, phoneBody);

    expect(result.replacement).toBe("searching");
  });

  it("throws a PipecornError when the number is not on the contact", async () => {
    await expect(
      Contacts.reportPhone(client, { ...phoneBody, phone: UNKNOWN_PHONE }),
    ).rejects.toBeInstanceOf(PipecornError);
  });
});

describe("Contacts.reportEmail", () => {
  it("sends the body to POST /contacts/report_email", async () => {
    await Contacts.reportEmail(client, emailBody);

    expect(receivedBody).toEqual(emailBody);
  });

  it("returns the replacement status", async () => {
    const result = await Contacts.reportEmail(client, emailBody);

    expect(result.replacement).toBe("other_email_kept");
  });

  it("throws a PipecornError when the address is not on the contact", async () => {
    await expect(
      Contacts.reportEmail(client, { ...emailBody, email: UNKNOWN_EMAIL }),
    ).rejects.toBeInstanceOf(PipecornError);
  });
});
