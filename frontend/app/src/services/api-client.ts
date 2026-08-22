/**
 * The one fetch wrapper this app's code calls the backend through
 * (task/frontend-console-foundation/typed-api-client: "Cliente de API
 * tipado" in work/frontend-bootstrap/intake/onda-1-scope.md). Every call
 * this wave and the ones after it make to the backend goes through
 * apiFetch(); no other module opens a second fetch()/XHR path to the same
 * server, so there is exactly one place a non-2xx response is turned into a
 * typed error (API-03: "A network or service call is wrapped in a typed
 * error before it reaches a component; no raw or unknown error crosses that
 * boundary").
 *
 * The envelope this parses is exactly what
 * src/src/http/error-handler.middleware.ts sends on a non-2xx response --
 * confirmed by reading that file and src/src/errors/status-map.ts before
 * writing this one:
 *
 *   { error: { code: string; message: string; details?: unknown } }
 *
 * where `code` is the thrown domain error's own class name, verbatim
 * (error.name in domainEnvelope()), never a status-derived or re-encoded
 * value, and `details` mirrors the error's own `context` field, present in
 * the envelope only when that error carried one.
 */

/** The shape of a non-2xx response body this backend's error handler sends. */
interface ErrorEnvelope {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: unknown;
  };
}

/**
 * A failed backend call, typed to the envelope above. `code` holds exactly
 * what the response's `error.code` field held -- the thrown error's own
 * class name as the backend sent it (e.g. "CaseNotFoundError"), never a
 * value this client re-derives. `details` is an own property only when the
 * envelope carried one: a caller checking `"details" in apiError` sees
 * exactly what the response body showed, not an `undefined` standing in for
 * its absence.
 */
export class ApiError extends Error {
  readonly code: string;
  // `declare` tells TypeScript this field is typing-only: with this project's
  // `useDefineForClassFields: true` (target ES2022), a plain `readonly
  // details?: unknown` field declaration compiles to an own-property
  // initialization in the constructor regardless of whether it is ever
  // assigned -- every ApiError would carry an own `details` property set to
  // `undefined`, which is exactly what the conditional assignment below
  // exists to avoid. `declare` opts this field out of that emission, so the
  // `if` below is the only thing that ever creates the own property.
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

/**
 * Narrows an unknown JSON body to the error envelope shape, so the cast
 * inside is a guard rather than an unaccompanied assertion (TYP-01/TYP-02):
 * every field the type claims is checked at runtime before it is read.
 */
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

/**
 * Parses a non-2xx Response's JSON body into an ApiError carrying the
 * envelope's own code, message and (where present) details. A body that
 * does not match the envelope this backend sends -- not JSON at all, or
 * JSON that does not carry `error.code`/`error.message` as strings -- is
 * still surfaced as an ApiError rather than left to throw a second, raw
 * error out of an error-handling path; its code names that this client
 * could not read the envelope, not a code the backend sent.
 */
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

/**
 * The typed fetch wrapper: a 2xx response's JSON body is returned to the
 * caller unwrapped, exactly as the response carried it; a non-2xx response
 * is parsed into an ApiError and thrown, never returned as a raw Response
 * or a generic Error.
 */
export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw await toApiError(response);
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- guarded by the `!response.ok` check above, which routes every non-2xx response through toApiError() and leaves only a confirmed-successful response reaching this line; this project's rule flags every `as`, not only an unguarded one, and this cast narrows to the caller-declared T for that confirmed response rather than asserting past a check.
  return (await response.json()) as T;
}
