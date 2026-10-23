import { describe, expect, it } from "vitest";
import {
  advancedSearchLeadsSchema,
  bulkEnrichContactsSchema,
  enrichAccountSchema,
  parseDepartmentRule,
  searchAccountsSchema,
} from "../../src/api/schemas.js";

describe("schemas", () => {
  it("accepts a minimal account search", () => {
    expect(() =>
      searchAccountsSchema.parse({ keyword: "agency", limit: 50 }),
    ).not.toThrow();
  });

  it("rejects bad company_size values", () => {
    expect(() =>
      searchAccountsSchema.parse({ company_size: ["bogus"] }),
    ).toThrow();
  });

  it("requires one of domain / name / linkedin_url for enrich", () => {
    expect(() => enrichAccountSchema.parse({})).toThrow();
    expect(() =>
      enrichAccountSchema.parse({ domain: "stripe.com" }),
    ).not.toThrow();
  });

  it("validates seniority levels in lead search", () => {
    expect(() =>
      advancedSearchLeadsSchema.parse({ seniority_levels: ["120", "130"] }),
    ).not.toThrow();
    expect(() =>
      advancedSearchLeadsSchema.parse({ seniority_levels: ["VP"] }),
    ).toThrow();
  });

  it("bulk enrich requires 2-100 contacts and exactly one enrichment_type", () => {
    expect(() =>
      bulkEnrichContactsSchema.parse({
        contacts: [{ firstname: "A", lastname: "B" }],
        enrichment_type: ["email"],
      }),
    ).toThrow();
    expect(() =>
      bulkEnrichContactsSchema.parse({
        contacts: [
          { firstname: "A", lastname: "B" },
          { firstname: "C", lastname: "D" },
        ],
        enrichment_type: ["email", "phone"],
      }),
    ).toThrow();
    expect(() =>
      bulkEnrichContactsSchema.parse({
        contacts: [
          { firstname: "A", lastname: "B" },
          { firstname: "C", lastname: "D" },
        ],
        enrichment_type: ["email"],
      }),
    ).not.toThrow();
  });

  it("accepts database filters with live: false", () => {
    expect(() =>
      searchAccountsSchema.parse({
        live: false,
        company_types: ["Privately Held"],
        min_year_founded: 2018,
        department_growths: [{ department: "Sales", min: 20 }],
      }),
    ).not.toThrow();
  });

  it("rejects database filters without live: false", () => {
    expect(() =>
      searchAccountsSchema.parse({ min_year_founded: 2018 }),
    ).toThrow(/--no-live/);
  });

  it("rejects an unknown department", () => {
    expect(() =>
      searchAccountsSchema.parse({
        live: false,
        department_headcounts: [{ department: "Wizardry" }],
      }),
    ).toThrow();
  });

  it("parses a department rule with an open upper bound", () => {
    expect(parseDepartmentRule("Sales:10:")).toEqual({
      department: "Sales",
      min: 10,
      max: undefined,
    });
  });

  it("parses a department rule whose name has spaces", () => {
    expect(parseDepartmentRule("Customer Success and Support::5")).toEqual({
      department: "Customer Success and Support",
      min: undefined,
      max: 5,
    });
  });
});
