---
title: Typed fetch client over the backend's error envelope
summary: apiFetch() wraps fetch(), parsing a non-2xx response's {error:{code,message,details?}} envelope into a typed ApiError, and passing a 2xx JSON body through unwrapped.
task: sha256:8590700002c26ceb2c3cae7daa39abb78adba03e34fa39bfbbcd82179c6fa6a8
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:154d391b6346febbd273d5806c95730da5db7e6ffa3df544a9792398002295e5
run: run/frontend-console-foundation-onda-1-full-suite-2
files:
  - path: src/services/api-client.ts
    effect: exports apiFetch<T>(), the app's one fetch wrapper -- a 2xx response's JSON body returns unwrapped, and a non-2xx response is parsed by toApiError() into an ApiError carrying code, message and an optional details, verbatim from the backend's envelope confirmed at src/src/http/error-handler.middleware.ts
criteria:
  - criterion: A non-2xx response whose body matches the {error:{code,message,details?}} envelope is parsed into an ApiError exposing code, message and details.
    met: true
    how: apiFetch() checks response.ok; on a non-2xx response it calls toApiError(), which reads the JSON body, narrows it with the isErrorEnvelope() guard, and constructs new ApiError(body.error.code, body.error.message, body.error.details)
  - criterion: ApiError.code holds exactly the thrown error's class name string as the backend sends it (e.g. "CaseNotFoundError"), never a re-derived enum value.
    met: true
    how: toApiError() assigns body.error.code straight into ApiError's code field with no lookup table, switch or status-derived mapping anywhere in the file
  - criterion: ApiError.details is present on the parsed ApiError only when the response envelope's details field is present.
    met: true
    how: 'ApiError''s constructor only executes `this.details = details` inside `if (details !== undefined)`; the class field itself is declared `declare readonly details?: unknown` so the declaration creates no own property on its own -- with this project''s `useDefineForClassFields: true` (tsconfig.json, target ES2022), a plain (non-`declare`) field declaration compiles to an own-property initialization in the constructor regardless of whether the conditional body ever runs, which would have made every ApiError carry an own `details` property set to `undefined` and failed this exact criterion'
  - criterion: A successful (2xx) response reaches the caller without being wrapped as an ApiError.
    met: true
    how: apiFetch() only calls toApiError() inside the `if (!response.ok)` branch; a 2xx response falls through to `return (await response.json()) as T`
  - criterion: The client is the one fetch wrapper this wave's code calls the backend through; no second envelope-parsing path exists.
    met: true
    how: apiFetch() is the only exported call boundary in api-client.ts; isErrorEnvelope/toApiError are its private helpers, not separately exported, and no other file this task reaches opens a second fetch()/XHR path
inferences:
  - inferred: a non-2xx body that is not JSON, or is JSON that does not carry error.code/error.message as strings, is still surfaced as an ApiError (code "UNREADABLE_RESPONSE") rather than left to throw a raw parse error or a generic Error.
    from: the task's objective states that a failed call surfaces a typed ApiError rather than a raw Response or a generic Error; the criteria only exercise a body that matches the envelope, so the malformed-body case is extended from that objective
  - inferred: ApiError.details must be declared with TypeScript's `declare` modifier rather than as an ordinary typed field.
    from: 'a captured test failure once the suite actually ran against jsdom for the first time (`"details" in apiError` returned true where the criterion requires false): this project''s tsconfig.json sets `useDefineForClassFields: true` at target ES2022, under which an ordinary `readonly details?: unknown` field declaration itself emits an own-property initialization in the constructor before the constructor body runs, independent of the guarded `this.details = details` assignment the original delivery already relied on to satisfy this criterion -- the criterion was correctly understood from the start, but the language runtime silently defeated it until this was found by running the suite for real'
divergences:
  - cites: TYP-02
    file: src/services/api-client.ts
    departure: this project's eslint.config.js configures @typescript-eslint/consistent-type-assertions with assertionStyle "never", which flags every `as` type assertion -- including the three type-narrowing casts inside isErrorEnvelope() (guarded by a preceding typeof/null check) and apiFetch() (guarded by the preceding !response.ok check, which already diverts every non-2xx response through toApiError()) -- rather than only an unguarded assertion past a check.
    why: no stock ESLint rule can verify at the AST level that a guard accompanies a given assertion; assertionStyle "never" is the tool-decidable approximation, stricter than TYP-02's actual statement, which permits a guarded assertion. Each of the three is suppressed individually with the guard it relies on stated, per PRH-03
preserved:
  - src/src/http/error-handler.middleware.ts's {error:{code,message,details?}} envelope shape, which this client reads but does not modify
  - the rest of the frontend/app tree (build config, other services, the design-system substrate) -- this task added no import of api-client.ts elsewhere and changed no other file
---

## What it is
The typed fetch wrapper the scope asks for, parsing the real backend envelope confirmed at src/src/http/error-handler.middleware.ts into an ApiError. It has never yet been exercised against a running server.

## Notes
None.
