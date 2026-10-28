import { z } from "zod";

export const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5001-10000",
  "10001+",
] as const;

export const SENIORITY_LEVELS = [
  "100",
  "110",
  "120",
  "130",
  "200",
  "210",
  "220",
  "300",
  "310",
  "320",
] as const;

export const COMPANY_TYPES = [
  "Public Company",
  "Privately Held",
  "Non Profit",
  "Educational Institution",
  "Partnership",
  "Self-Employed",
  "Self Owned",
  "Government Agency",
] as const;

export const DEPARTMENTS = [
  "Accounting",
  "Administrative",
  "Arts and Design",
  "Business Development",
  "Community and Social Services",
  "Consulting",
  "Customer Success and Support",
  "Education",
  "Engineering",
  "Entrepreneurship",
  "Finance",
  "Healthcare Services",
  "Human Resources",
  "Information Technology",
  "Legal",
  "Marketing",
  "Media and Communication",
  "Military and Protective Services",
  "Operations",
  "Product Management",
  "Program and Project Management",
  "Purchasing",
  "Quality Assurance",
  "Real Estate",
  "Research",
  "Sales",
] as const;

const departmentRuleSchema = z.object({
  department: z.enum(DEPARTMENTS),
  min: z.number().optional(),
  max: z.number().optional(),
});

/** Parses a `<department>:<min>:<max>` rule; a blank bound is open (`Sales:10:`). */
export function parseDepartmentRule(rule: string): unknown {
  const [department, min, max] = rule.split(":").map((part) => part.trim());
  const bound = (value: string | undefined) => (value ? Number(value) : undefined);
  return { department, min: bound(min), max: bound(max) };
}

const databaseFilters = {
  company_types: z.array(z.enum(COMPANY_TYPES)).optional(),
  business_models: z.array(z.enum(["saas"])).optional(),
  min_headcount: z.number().int().nonnegative().optional(),
  max_headcount: z.number().int().nonnegative().optional(),
  min_year_founded: z.number().int().positive().optional(),
  max_year_founded: z.number().int().positive().optional(),
  last_funding_within_days: z.number().int().positive().optional(),
  min_last_funding_amount: z.number().nonnegative().optional(),
  max_last_funding_amount: z.number().nonnegative().optional(),
  headcount_growth_period: z.enum(["mom", "qoq", "six_months", "yoy"]).optional(),
  min_headcount_growth: z.number().optional(),
  max_headcount_growth: z.number().optional(),
  department_headcounts: z.array(departmentRuleSchema).optional(),
  department_headcount_match: z.enum(["all", "any"]).optional(),
  department_growths: z.array(departmentRuleSchema).optional(),
  department_growth_match: z.enum(["all", "any"]).optional(),
  min_monthly_visitors: z.number().int().nonnegative().optional(),
  max_monthly_visitors: z.number().int().nonnegative().optional(),
  monthly_visitor_growth_period: z.enum(["mom", "qoq"]).optional(),
  min_monthly_visitor_growth: z.number().optional(),
  max_monthly_visitor_growth: z.number().optional(),
  included_company_lists: z.array(z.string()).optional(),
  excluded_company_lists: z.array(z.string()).optional(),
  competitors_of: z.array(z.string()).max(10).optional(),
  with_job_titles: z.array(z.string()).max(25).optional(),
  without_job_titles: z.array(z.string()).max(25).optional(),
};

const DATABASE_FILTER_KEYS = Object.keys(databaseFilters) as (keyof typeof databaseFilters)[];

export const searchAccountsSchema = z
  .object({
    name: z.string().optional(),
    live: z.boolean().optional(),
    webhook_url: z.string().url().optional(),
    keyword: z.string().optional(),
    included_industries: z.array(z.string()).optional(),
    excluded_industries: z.array(z.string()).optional(),
    included_locations: z.array(z.string()).optional(),
    excluded_locations: z.array(z.string()).optional(),
    company_size: z.array(z.enum(COMPANY_SIZES)).optional(),
    min_revenue: z.number().optional(),
    max_revenue: z.number().optional(),
    revenue_currency: z.string().optional(),
    limit: z.number().int().positive().optional(),
    ...databaseFilters,
  })
  .superRefine((search, ctx) => {
    if (search.live === false) return;
    for (const key of DATABASE_FILTER_KEYS) {
      if (search[key] === undefined) continue;
      ctx.addIssue({
        code: "custom",
        path: [key],
        message: "only works on the Pipecorn database: add --no-live",
      });
    }
  });

export const enrichAccountSchema = z
  .object({
    company_linkedin_url: z.string().url().optional(),
    name: z.string().optional(),
    domain: z.string().optional(),
    country: z.string().optional(),
  })
  .refine(
    (v) => v.company_linkedin_url || v.name || v.domain,
    "At least one of --linkedin-url, --name, or --domain is required",
  );

export const advancedSearchLeadsSchema = z.object({
  name: z.string().optional(),
  keyword: z.string().optional(),
  job_titles: z.array(z.string()).optional(),
  excluded_job_titles: z.array(z.string()).optional(),
  persona_id: z.uuid().optional(),
  past_titles: z.array(z.string()).optional(),
  excluded_past_titles: z.array(z.string()).optional(),
  included_locations: z.array(z.string()).optional(),
  excluded_locations: z.array(z.string()).optional(),
  company_headquarters: z.array(z.string()).optional(),
  included_industries: z.array(z.string()).optional(),
  excluded_industries: z.array(z.string()).optional(),
  included_companies: z.array(z.string()).optional(),
  excluded_companies: z.array(z.string()).optional(),
  past_companies: z.array(z.string()).optional(),
  functions: z.array(z.string()).optional(),
  seniority_levels: z.array(z.enum(SENIORITY_LEVELS)).optional(),
  years_of_experience: z.array(z.string()).optional(),
  years_at_current_company: z.array(z.string()).optional(),
  years_in_current_position: z.array(z.string()).optional(),
  company_size: z.array(z.enum(COMPANY_SIZES)).optional(),
  company_type: z.array(z.string()).optional(),
  included_account_lists: z.array(z.string()).optional(),
  excluded_account_lists: z.array(z.string()).optional(),
  included_lead_lists: z.array(z.string()).optional(),
  excluded_lead_lists: z.array(z.string()).optional(),
  limit: z.number().int().positive().optional(),
  streaming: z.boolean().optional(),
  scale: z.boolean().optional(),
});

const contactInputSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  domain: z.string().optional(),
  company_name: z.string().optional(),
  linkedin_url: z.string().url().optional(),
  custom: z.record(z.string(), z.unknown()).optional(),
});

export type ContactInput = z.infer<typeof contactInputSchema>;

export const bulkEnrichContactsSchema = z.object({
  contacts: z.array(contactInputSchema).min(2).max(100),
  enrichment_type: z.array(z.enum(["email", "phone", "personal_email"])).length(1),
  webhook_url: z.string().url().optional(),
});

export const singleEnrichContactSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  domain: z.string().optional(),
  company_name: z.string().optional(),
  linkedin_url: z.string().url().optional(),
  enrichment_type: z
    .array(z.enum(["email", "phone", "personal_email"]))
    .length(1),
  webhook_url: z.string().url().optional(),
});

export const createListSchema = z.object({
  name: z.string(),
  kind: z.enum(["account", "lead"]).optional(),
});

export const contactSchema = contactInputSchema;
