import { Flags } from "@oclif/core";
import { Accounts } from "../../api/endpoints.js";
import { DEPARTMENTS, parseDepartmentRule, searchAccountsSchema } from "../../api/schemas.js";
import { PipecornCommand } from "../../lib/base-command.js";
import { numberFlag } from "../../lib/flags.js";

const DATABASE = { helpGroup: "PIPECORN DATABASE (--no-live)" };

export default class AccountsSearch extends PipecornCommand {
  static override description = `Start a company search. Returns a job ID — poll with \`pipecorn jobs status <id>\`.

Runs on LinkedIn Sales Navigator by default. Pass --no-live to search the Pipecorn database instead, which needs no Sales Navigator account and takes every filter of the app's company search. Departments: ${DEPARTMENTS.join(", ")}.`;

  static override examples = [
    "$ pipecorn accounts search --keyword '\"sales agency\"' --company-size 11-50 --limit 100 --webhook-url https://my.app/hook",
    "$ pipecorn accounts search --preview --keyword 'fintech'   # synchronous count + sample",
    "$ pipecorn accounts search --preview --no-live --company-types 'Privately Held' --min-year-founded 2018 --last-funding-within-days 365 --department-growth 'Sales:20:'",
  ];

  static override flags = {
    ...PipecornCommand.baseFlags,
    name: Flags.string({ description: "Display name for the saved search" }),
    live: Flags.boolean({
      allowNo: true,
      description:
        "Search LinkedIn Sales Navigator (default). --no-live searches the Pipecorn database",
    }),
    "webhook-url": Flags.string({
      description: "URL that receives the results (required unless --preview)",
    }),
    keyword: Flags.string({ description: "Boolean keyword query" }),
    "included-industries": Flags.string({ multiple: true }),
    "excluded-industries": Flags.string({ multiple: true }),
    "included-locations": Flags.string({ multiple: true }),
    "excluded-locations": Flags.string({ multiple: true }),
    "company-size": Flags.string({ multiple: true }),
    "min-revenue": numberFlag({ description: "Minimum annual revenue, in millions" }),
    "max-revenue": numberFlag({ description: "Maximum annual revenue, in millions" }),
    "revenue-currency": Flags.string(),
    "company-types": Flags.string({ multiple: true, ...DATABASE }),
    "business-models": Flags.string({ multiple: true, options: ["saas"], ...DATABASE }),
    "min-headcount": Flags.integer({
      description: "Exact headcount range, replaces --company-size",
      ...DATABASE,
    }),
    "max-headcount": Flags.integer({ ...DATABASE }),
    "min-year-founded": Flags.integer({ ...DATABASE }),
    "max-year-founded": Flags.integer({ ...DATABASE }),
    "last-funding-within-days": Flags.integer({
      description: "Last round raised within this many days",
      ...DATABASE,
    }),
    "min-last-funding-amount": numberFlag({
      description: "Last round size, in USD millions",
      ...DATABASE,
    }),
    "max-last-funding-amount": numberFlag({ ...DATABASE }),
    "headcount-growth-period": Flags.string({
      options: ["mom", "qoq", "six_months", "yoy"],
      ...DATABASE,
    }),
    "min-headcount-growth": numberFlag({
      description: "Company headcount growth, in percent",
      ...DATABASE,
    }),
    "max-headcount-growth": numberFlag({ ...DATABASE }),
    "department-headcount": Flags.string({
      multiple: true,
      description: "<department>:<min>:<max>, a blank bound is open (e.g. 'Sales:10:')",
      ...DATABASE,
    }),
    "department-headcount-match": Flags.string({ options: ["all", "any"], ...DATABASE }),
    "department-growth": Flags.string({
      multiple: true,
      description: "<department>:<min>:<max> growth in percent (e.g. 'Engineering:20:')",
      ...DATABASE,
    }),
    "department-growth-match": Flags.string({ options: ["all", "any"], ...DATABASE }),
    "min-monthly-visitors": Flags.integer({ ...DATABASE }),
    "max-monthly-visitors": Flags.integer({ ...DATABASE }),
    "monthly-visitor-growth-period": Flags.string({ options: ["mom", "qoq"], ...DATABASE }),
    "min-monthly-visitor-growth": numberFlag({
      description: "Website traffic growth, in percent",
      ...DATABASE,
    }),
    "max-monthly-visitor-growth": numberFlag({ ...DATABASE }),
    "included-company-lists": Flags.string({
      multiple: true,
      description: "List IDs",
      ...DATABASE,
    }),
    "excluded-company-lists": Flags.string({
      multiple: true,
      description: "List IDs",
      ...DATABASE,
    }),
    "competitors-of": Flags.string({
      multiple: true,
      description: "LinkedIn company IDs (up to 10)",
      ...DATABASE,
    }),
    limit: Flags.integer({
      description:
        "Max companies. Up to your company import quota with --no-live, at most 1000 on Sales Navigator",
    }),
    preview: Flags.boolean({
      description: "Synchronous preview (count + small sample) instead of async search",
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AccountsSearch);
    if (!flags.preview && !flags["webhook-url"]) {
      this.error("--webhook-url is required unless you pass --preview", { exit: 2 });
    }
    const body = searchAccountsSchema.parse({
      name: flags.name,
      live: flags.live,
      webhook_url: flags.preview ? undefined : flags["webhook-url"],
      keyword: flags.keyword,
      included_industries: flags["included-industries"],
      excluded_industries: flags["excluded-industries"],
      included_locations: flags["included-locations"],
      excluded_locations: flags["excluded-locations"],
      company_size: flags["company-size"],
      min_revenue: flags["min-revenue"],
      max_revenue: flags["max-revenue"],
      revenue_currency: flags["revenue-currency"],
      company_types: flags["company-types"],
      business_models: flags["business-models"],
      min_headcount: flags["min-headcount"],
      max_headcount: flags["max-headcount"],
      min_year_founded: flags["min-year-founded"],
      max_year_founded: flags["max-year-founded"],
      last_funding_within_days: flags["last-funding-within-days"],
      min_last_funding_amount: flags["min-last-funding-amount"],
      max_last_funding_amount: flags["max-last-funding-amount"],
      headcount_growth_period: flags["headcount-growth-period"],
      min_headcount_growth: flags["min-headcount-growth"],
      max_headcount_growth: flags["max-headcount-growth"],
      department_headcounts: flags["department-headcount"]?.map(parseDepartmentRule),
      department_headcount_match: flags["department-headcount-match"],
      department_growths: flags["department-growth"]?.map(parseDepartmentRule),
      department_growth_match: flags["department-growth-match"],
      min_monthly_visitors: flags["min-monthly-visitors"],
      max_monthly_visitors: flags["max-monthly-visitors"],
      monthly_visitor_growth_period: flags["monthly-visitor-growth-period"],
      min_monthly_visitor_growth: flags["min-monthly-visitor-growth"],
      max_monthly_visitor_growth: flags["max-monthly-visitor-growth"],
      included_company_lists: flags["included-company-lists"],
      excluded_company_lists: flags["excluded-company-lists"],
      competitors_of: flags["competitors-of"],
      limit: flags.limit,
    });
    const client = await this.client(flags["api-key"]);
    const result = flags.preview
      ? await Accounts.searchPreview(client, body)
      : await Accounts.search(client, body);
    this.emit(result, flags.format);
  }
}
