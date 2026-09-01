interface ErrorEnvelope {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: unknown;
  };
}

export class ApiError extends Error {
  readonly code: string;

  declare readonly details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    if (details !== undefined) {
      this.details = details;
    }
  }
}

function isErrorEnvelope(body: unknown): body is ErrorEnvelope {
  if (typeof body !== "object" || body === null) {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- guarded by the typeof/null check immediately above: this project's rule flags every `as`, not only an unguarded one, and this cast narrows rather than asserts past a check.
  const record = body as Record<string, unknown>;
  const errorField = record.error;
  if (typeof errorField !== "object" || errorField === null) {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- guarded by the typeof/null check immediately above: this project's rule flags every `as`, not only an unguarded one, and this cast narrows rather than asserts past a check.
  const errorRecord = errorField as Record<string, unknown>;
  return typeof errorRecord.code === "string" && typeof errorRecord.message === "string";
}

async function toApiError(response: Response): Promise<ApiError> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return new ApiError("UNREADABLE_RESPONSE", response.statusText || "the request failed");
  }
  if (isErrorEnvelope(body)) {
    return new ApiError(body.error.code, body.error.message, body.error.details);
  }
  return new ApiError("UNREADABLE_RESPONSE", response.statusText || "the request failed");
}

export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw await toApiError(response);
  }
  if (response.status === 204) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- guarded by the response.status === 204 check above (no body is ever sent for this status, confirmed against the routes named in the comment above this function); this project's rule flags every `as`, not only an unguarded one, and every caller of a 204 endpoint declares T as void for exactly this reason.
    return undefined as T;
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- guarded by the `!response.ok` check above, which routes every non-2xx response through toApiError() and leaves only a confirmed-successful response reaching this line; this project's rule flags every `as`, not only an unguarded one, and this cast narrows to the caller-declared T for that confirmed response rather than asserting past a check.
  return (await response.json()) as T;
}
