import {
  AuthError,
  CreditError,
  PlanLimitError,
  PipecornError,
  RateLimitError,
} from "./errors.js";

export const DEFAULT_BASE_URL = "https://app.pipecorn.com/api/v2";
export const KEY_HEADER = "X-API-KEY";

export interface PipecornClientOptions {
  apiKey: string;
  baseUrl?: string;
  userAgent?: string;
  timeoutMs?: number;
}

export class PipecornClient {
  private readonly apiKey: string;
  readonly baseUrl: string;
  private readonly userAgent: string;
  private readonly timeoutMs: number;

  constructor(opts: PipecornClientOptions) {
    this.apiKey = opts.apiKey;
    this.baseUrl = opts.baseUrl ?? DEFAULT_BASE_URL;
    this.userAgent = opts.userAgent ?? "pipecorn-cli";
    this.timeoutMs = opts.timeoutMs ?? 60_000;
  }

  get<T>(path: string): Promise<T> {
    return this.send<T>("GET", path);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.send<T>("POST", path, body);
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.send<T>("PUT", path, body);
  }

  delete<T>(path: string): Promise<T> {
    return this.send<T>("DELETE", path);
  }

  private async send<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), this.timeoutMs);
    let res: Response;
    try {
      res = await fetch(url, {
        method,
        headers: {
          [KEY_HEADER]: this.apiKey,
          "content-type": "application/json",
          "user-agent": this.userAgent,
          accept: "application/json",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: ac.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    const text = await res.text();
    const parsed = parseJson(text);

    if (res.ok) return parsed as T;

    throw buildError(res.status, res.headers, parsed);
  }
}

function parseJson(text: string): unknown {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function buildError(
  status: number,
  headers: Headers,
  body: unknown,
): PipecornError {
  const message = extractMessage(body) ?? `HTTP ${status}`;

  if (status === 401 || status === 403) return new AuthError(body);

  if (status === 429) {
    const ra = headers.get("retry-after");
    const parsed = ra ? Number.parseInt(ra, 10) : Number.NaN;
    return new RateLimitError(body, Number.isFinite(parsed) ? parsed : undefined);
  }

  if (status === 422) {
    if (/enrichment credits|insufficient credits/i.test(message)) {
      return new CreditError(message, body);
    }
    if (/import limits|plan limit/i.test(message)) {
      return new PlanLimitError(message, body);
    }
  }

  return new PipecornError(`Pipecorn API error ${status}: ${message}`, status, body);
}

function extractMessage(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  const obj = body as Record<string, unknown>;
  if (typeof obj.error === "string") return obj.error;
  if (typeof obj.message === "string") return obj.message;
  if (Array.isArray(obj.errors) && obj.errors.length > 0) {
    return obj.errors.map((e) => String(e)).join("; ");
  }
  return undefined;
}
