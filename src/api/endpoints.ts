import type { PipecornClient } from "./client.js";

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

export interface PipecornListItem {
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
  me: (c: PipecornClient) => c.get<AccountInfo>("/account"),
  credits: (c: PipecornClient) => c.get<Credits>("/credits"),
};

export const Accounts = {
  search: (c: PipecornClient, body: unknown) =>
    c.post<{ id?: string; preview?: unknown; total?: number }>(
      "/accounts/search",
      body,
    ),
  searchPreview: (c: PipecornClient, body: unknown) =>
    c.post<{ total_count?: number; preview?: unknown[] }>(
      "/accounts/search/preview",
      body,
    ),
  enrich: (c: PipecornClient, body: unknown) =>
    c.post<unknown>("/accounts/single_enrich", body),
  bulkEnrich: (c: PipecornClient, body: unknown) =>
    c.post<{ enrichment_id?: string }>("/accounts/bulk_enrich", body),
  companyStack: (c: PipecornClient, body: unknown) =>
    c.post<unknown>("/accounts/company_stack", body),
  headcount: (c: PipecornClient, body: unknown) =>
    c.post<unknown>("/accounts/headcount", body),
  countProfiles: (c: PipecornClient, body: unknown) =>
    c.post<unknown>("/accounts/count_profiles", body),
  extract: (c: PipecornClient, body: unknown) =>
    c.post<unknown>("/accounts/", body),
};

export const Leads = {
  advancedSearch: (c: PipecornClient, body: unknown) =>
    c.post<{ id?: string; preview?: unknown; total?: number }>(
      "/leads/advanced_search",
      body,
    ),
  advancedSearchPreview: (c: PipecornClient, body: unknown) =>
    c.post<{ total_count?: number; preview?: unknown[] }>(
      "/leads/advanced_search/preview",
      body,
    ),
  enrich: (c: PipecornClient, body: unknown) =>
    c.post<unknown>("/leads/single_enrich", body),
  bulkEnrich: (c: PipecornClient, body: unknown) =>
    c.post<{ enrichment_id?: string }>("/leads/bulk_enrich", body),
  searchInCompany: (c: PipecornClient, body: unknown) =>
    c.post<{ id?: string }>("/leads/search", body),
  fromSalesNav: (c: PipecornClient, body: unknown) =>
    c.post<{ id?: string }>("/leads", body),
};

export const Contacts = {
  singleEnrich: (c: PipecornClient, body: unknown) =>
    c.post<{ enrichment_id?: string }>("/contacts/single_enrich", body),
  get: (c: PipecornClient, id: string) =>
    c.get<unknown>(`/contacts/${encodeURIComponent(id)}`),
  bulkEnrich: (c: PipecornClient, body: unknown) =>
    c.post<{ enrichment_id?: string }>("/contacts/bulk_enrich", body),
  checkAvailability: (c: PipecornClient, body: unknown) =>
    c.post<unknown>("/contacts/check_data_availability", body),
};

export const Searches = {
  list: (c: PipecornClient) => c.get<SearchSummary[]>("/searches"),
  get: (c: PipecornClient, id: string) =>
    c.get<Search>(`/searches/${encodeURIComponent(id)}`),
  delete: (c: PipecornClient, id: string) =>
    c.delete<unknown>(`/searches/${encodeURIComponent(id)}`),
};

export const Lists = {
  list: (c: PipecornClient) => c.get<PipecornListItem[]>("/lists"),
  create: (c: PipecornClient, body: unknown) =>
    c.post<PipecornListItem>("/lists", body),
  get: (c: PipecornClient, id: string) =>
    c.get<PipecornListItem>(`/lists/${encodeURIComponent(id)}`),
  update: (c: PipecornClient, id: string, body: unknown) =>
    c.put<PipecornListItem>(`/lists/${encodeURIComponent(id)}`, body),
};

export const Personas = {
  list: (c: PipecornClient) => c.get<Persona[]>("/personas"),
  get: (c: PipecornClient, uuid: string) =>
    c.get<Persona>(`/personas/${encodeURIComponent(uuid)}`),
};

export const Locations = {
  search: (c: PipecornClient, body: { query: string }) =>
    c.post<unknown>("/locations", body),
};

export const Intents = {
  hiring: (c: PipecornClient, body: unknown) =>
    c.post<{ id?: string }>("/intents/accounts/hiring", body),
  growth: (c: PipecornClient, body: unknown) =>
    c.post<{ id?: string }>("/intents/accounts/growth", body),
  lookalikes: (c: PipecornClient, body: unknown) =>
    c.post<{ id?: string }>("/intents/accounts/lookalikes", body),
  postEngagers: (c: PipecornClient, body: unknown) =>
    c.post<{ id?: string }>("/intents/leads/posts_engagers", body),
  posts: (c: PipecornClient, body: unknown) =>
    c.post<{ id?: string }>("/intents/leads/posts", body),
  reactions: (c: PipecornClient, body: unknown) =>
    c.post<{ id?: string }>("/intents/leads/reactions", body),
  comments: (c: PipecornClient, body: unknown) =>
    c.post<{ id?: string }>("/intents/leads/comments", body),
  trackJobChanges: (c: PipecornClient, body: unknown) =>
    c.post<{ id?: string }>("/intents/leads/track_job_changes", body),
  findNewHires: (c: PipecornClient, body: unknown) =>
    c.post<{ id?: string }>("/intents/leads/find_new_hires", body),
};
