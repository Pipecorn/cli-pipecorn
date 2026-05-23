export class ProntoError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ProntoError";
    this.status = status;
    this.body = body;
  }
}

export class AuthError extends ProntoError {
  constructor(body: unknown, message?: string) {
    super(
      message ?? "Authentication failed. Run `pronto login` or check PRONTO_API_KEY.",
      401,
      body,
    );
    this.name = "AuthError";
  }
}

export class RateLimitError extends ProntoError {
  readonly retryAfterSeconds: number | undefined;

  constructor(body: unknown, retryAfterSeconds: number | undefined) {
    super(
      retryAfterSeconds
        ? `Rate limit reached. Retry after ${retryAfterSeconds}s.`
        : "Rate limit reached. Slow down and retry.",
      429,
      body,
    );
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class CreditError extends ProntoError {
  constructor(message: string, body: unknown) {
    super(
      `${message}\nRecharge credits at https://app.prontohq.com/settings/subscriptions/credits`,
      422,
      body,
    );
    this.name = "CreditError";
  }
}

export class PlanLimitError extends ProntoError {
  constructor(message: string, body: unknown) {
    super(
      `${message}\nUpgrade your plan at https://app.prontohq.com/settings/subscriptions`,
      422,
      body,
    );
    this.name = "PlanLimitError";
  }
}

export function exitCodeFor(err: unknown): number {
  if (err instanceof AuthError) return 3;
  if (err instanceof RateLimitError) return 4;
  if (err instanceof CreditError || err instanceof PlanLimitError) return 5;
  if (err instanceof ProntoError) return 1;
  return 2;
}
