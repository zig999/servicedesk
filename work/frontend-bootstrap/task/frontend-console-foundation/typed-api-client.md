---
title: Typed fetch client over the backend's error envelope
summary: A fetch wrapper that parses the backend's {error:{code,message,details?}} envelope into a typed ApiError, matching src/src/http/error-handler.middleware.ts.
rationale: >-
  The scope describes the typed client and the error-to-UI-state table as two bullet points; I
  keep the client as its own task because it is the interface (ApiError's shape) the mapping
  table depends on as a consumer, and a task changing an interface and its consumers together
  is two tasks joined by a dependency rather than one. The binder confirmed no candidate
  governs this task: the envelope shape, the class-name pass-through and the single-client
  constraint are technical/integration facts anchored to an existing code artifact
  (src/src/http/error-handler.middleware.ts), not a domain fact the specification would hold.
objective: A failed backend call surfaces a typed ApiError carrying the response's code, message and optional details, rather than a raw Response or a generic Error.
criteria:
  - A non-2xx response whose body matches the {error:{code,message,details?}} envelope is parsed into an ApiError exposing code, message and details.
  - ApiError.code holds exactly the thrown error's class name string as the backend sends it (e.g. "CaseNotFoundError"), never a re-derived enum value.
  - ApiError.details is present on the parsed ApiError only when the response envelope's details field is present.
  - A successful (2xx) response reaches the caller without being wrapped as an ApiError.
  - The client is the one fetch wrapper this wave's code calls the backend through; no second envelope-parsing path exists.
sources:
  - intake/onda-1-scope.md
---

## What it is
The typed fetch wrapper the scope asks for, parsing the real backend envelope confirmed at src/src/http/error-handler.middleware.ts into an ApiError.
It has never yet been exercised against a running server, per the inventory's risk on this contract.

## Notes
None.
