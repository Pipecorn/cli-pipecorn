import type { ProntoClient } from "./client.js";

export interface AccountInfo {
  email?: string;
  name?: string;
  organization?: { id?: string; name?: string };
  [key: string]: unknown;
}

export interface Credits {
  [key: string]: unknown;
}

export interface SearchSummary {
  id: string;
  name?: string;
  status?: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface Search extends SearchSummary {
  leads?: unknown[];
  results?: unknown[];
}

export interface PronListItem {
  id: string;
  name?: string;
  kind?: string;
  [key: string]: unknown;
}

export interface Persona {
  uuid?: string;
  id?: string;
  name?: string;
  [key: string]: unknown;
}

export const Account = {
  me: (c: ProntoClient) => c.get<AccountInfo>("/account"),
  credits: (c: ProntoClient) => c.get<Credits>("/credits"),
};

export const Accounts = {
  search: (c: ProntoClient, body: unknown) =>
    c.post<{ id?: string; preview?: unknown; total?: number }>(
      "/accounts/search",
      body,
    ),
  searchPreview: (c: ProntoClient, body: unknown) =>
    c.post<{ total_count?: number; preview?: unknown[] }>(
      "/accounts/search/preview",
      body,
    ),
  enrich: (c: ProntoClient, body: unknown) =>
    c.post<unknown>("/accounts/single_enrich", body),
  bulkEnrich: (c: ProntoClient, body: unknown) =>
    c.post<{ enrichment_id?: string }>("/accounts/bulk_enrich", body),
  companyStack: (c: ProntoClient, body: unknown) =>
    c.post<unknown>("/accounts/company_stack", body),
  headcount: (c: ProntoClient, body: unknown) =>
    c.post<unknown>("/accounts/headcount", body),
  countProfiles: (c: ProntoClient, body: unknown) =>
    c.post<unknown>("/accounts/count_profiles", body),
  extract: (c: ProntoClient, body: unknown) =>
    c.post<unknown>("/accounts/", body),
};

export const Leads = {
  advancedSearch: (c: ProntoClient, body: unknown) =>
    c.post<{ id?: string; preview?: unknown; total?: number }>(
      "/leads/advanced_search",
      body,
    ),
  advancedSearchPreview: (c: ProntoClient, body: unknown) =>
    c.post<{ total_count?: number; preview?: unknown[] }>(
      "/leads/advanced_search/preview",
      body,
    ),
  enrich: (c: ProntoClient, body: unknown) =>
    c.post<unknown>("/leads/single_enrich", body),
  bulkEnrich: (c: ProntoClient, body: unknown) =>
    c.post<{ enrichment_id?: string }>("/leads/bulk_enrich", body),
  searchInCompany: (c: ProntoClient, body: unknown) =>
    c.post<{ id?: string }>("/leads/search", body),
  fromSalesNav: (c: ProntoClient, body: unknown) =>
    c.post<{ id?: string }>("/leads", body),
};

export const Contacts = {
  singleEnrich: (c: ProntoClient, body: unknown) =>
    c.post<{ enrichment_id?: string }>("/contacts/single_enrich", body),
  get: (c: ProntoClient, id: string) =>
    c.get<unknown>(`/contacts/${encodeURIComponent(id)}`),
  bulkEnrich: (c: ProntoClient, body: unknown) =>
    c.post<{ enrichment_id?: string }>("/contacts/bulk_enrich", body),
  checkAvailability: (c: ProntoClient, body: unknown) =>
    c.post<unknown>("/contacts/check_data_availability", body),
};

export const Searches = {
  list: (c: ProntoClient) => c.get<SearchSummary[]>("/searches"),
  get: (c: ProntoClient, id: string) =>
    c.get<Search>(`/searches/${encodeURIComponent(id)}`),
  delete: (c: ProntoClient, id: string) =>
    c.delete<unknown>(`/searches/${encodeURIComponent(id)}`),
};

export const Lists = {
  list: (c: ProntoClient) => c.get<PronListItem[]>("/lists"),
  create: (c: ProntoClient, body: unknown) =>
    c.post<PronListItem>("/lists", body),
  get: (c: ProntoClient, id: string) =>
    c.get<PronListItem>(`/lists/${encodeURIComponent(id)}`),
  update: (c: ProntoClient, id: string, body: unknown) =>
    c.put<PronListItem>(`/lists/${encodeURIComponent(id)}`, body),
};

export const Personas = {
  list: (c: ProntoClient) => c.get<Persona[]>("/personas"),
  get: (c: ProntoClient, uuid: string) =>
    c.get<Persona>(`/personas/${encodeURIComponent(uuid)}`),
};

export const Locations = {
  search: (c: ProntoClient, body: { query: string }) =>
    c.post<unknown>("/locations", body),
};

export const Intents = {
  hiring: (c: ProntoClient, body: unknown) =>
    c.post<{ id?: string }>("/intents/accounts/hiring", body),
  growth: (c: ProntoClient, body: unknown) =>
    c.post<{ id?: string }>("/intents/accounts/growth", body),
  lookalikes: (c: ProntoClient, body: unknown) =>
    c.post<{ id?: string }>("/intents/accounts/lookalikes", body),
  postEngagers: (c: ProntoClient, body: unknown) =>
    c.post<{ id?: string }>("/intents/leads/posts_engagers", body),
  posts: (c: ProntoClient, body: unknown) =>
    c.post<{ id?: string }>("/intents/leads/posts", body),
  reactions: (c: ProntoClient, body: unknown) =>
    c.post<{ id?: string }>("/intents/leads/reactions", body),
  comments: (c: ProntoClient, body: unknown) =>
    c.post<{ id?: string }>("/intents/leads/comments", body),
  trackJobChanges: (c: ProntoClient, body: unknown) =>
    c.post<{ id?: string }>("/intents/leads/track_job_changes", body),
  findNewHires: (c: ProntoClient, body: unknown) =>
    c.post<{ id?: string }>("/intents/leads/find_new_hires", body),
};
