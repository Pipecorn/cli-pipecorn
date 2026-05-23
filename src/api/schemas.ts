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

export const searchAccountsSchema = z.object({
  name: z.string().optional(),
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
