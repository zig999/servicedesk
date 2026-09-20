# Wrong behavior

Files: src/config/env.ts and src/http/build-app.ts (target: backend / src root)

`Fastify()` is instantiated with no options in `src/http/build-app.ts` (`const app = Fastify();`),
so the HTTP server's request-body size ceiling is whatever Fastify's own internal default happens
to be, never a value this project configures. `src/config/env.ts`'s `envSchema` declares no field
for it at all -- no environment variable exists to raise, lower or even observe the ceiling in
force.

This is exactly the gap the project's own standard rule EDG-06 names:
"A payload above the configured size limit is refused at the middleware boundary." (because: "A
body read into memory before it is measured is a body that can exhaust the process.") EDG-06
applies to files under src/config (suffix .ts) and to *.middleware.ts files; it is decided_by
reading (a standard-conformance-reviewer finding, not a tool-enforced check), so nothing in the
project's own CI currently catches its absence.

Reproduction: send a request with an arbitrarily large body to any route; the size ceiling in
force is Fastify's own undocumented, unconfigured default rather than a value this project's own
configuration states or a human ever decided.

Fix direction (not yet decided, no human-supplied value existed for this before this increment):
add a configured ceiling, following the same pattern DATABASE_POOL_MAX_CONNECTIONS,
DATABASE_POOL_IDLE_TIMEOUT_MS and DATABASE_POOL_STATEMENT_TIMEOUT_MS already use in envSchema (a
z.coerce.number().int().positive() field with a sensible .default()), and pass it to Fastify()'s
own bodyLimit option in build-app.ts.
