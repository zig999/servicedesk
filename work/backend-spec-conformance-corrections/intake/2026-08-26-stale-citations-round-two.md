A second round of stale-comment corrections, found by two reconciliation sessions
(siegard-reconcile/backend-post-corrections-code-drift.md and
siegard-reconcile/post-analyse-timeout-malformed-credential-drift.md) run after two
same-day analysis increments (b6012c3, 5427816) and one earlier round of citation
corrections (task/stale-specification-citations/citations-corrected) already landed.
None of the six locations below changes observable behavior — each comment or docstring
still describes what the code does correctly, but misdescribes whether, or how, the
specification governs it.

1. src/errors/status-map.ts's header comment still describes
   ConnectorConfigurationNotWellFormedError's 422 status as "this project's own
   engineering decision, not a fact the specification holds" — the opposite of what
   rules/integration/a-connector-configuration-holds-a-well-formed-object states, and of
   what this same file's own 422 map entry already cites correctly a few lines later.

2. src/investigation/fake-observation-source.adapter.ts's observeConcept() docstring
   types the four evidence-result endings ("not one of the four evidence-result
   endings") as free prose, with no citation of domain/investigation/evidence-result,
   unlike every other specification-derived fact in this file's comments.

3. src/glossary/glossary-store.port.ts's readConcepts() docstring states "ttl absent
   where the registration stated none" without citing
   rules/knowledge/a-collected-concept-declares-a-ttl, the node that actually settles the
   registration-versus-resolved-concept distinction this claim rests on.

4. src/capability-registry/capability-registry.service.ts's refuseContractDepartures
   docstring describes only the non-integer timeout boundary and cites the schema as
   `z.number().int()`, naming nothing about the positivity clause
   rules/integration/a-capability-declares-its-contract gained in commit b6012c3.

5. src/connector-registry/connector-configuration-registry.service.ts's
   wellFormedConfiguration docstring still says "the node does not clearly decide
   whether an entirely absent configuration is malformed or incomplete" — superseded by
   the same commit, which decided exactly that.

6. src/http/test-connector.controller.ts's header comment still says the credential
   masking it performs is "this controller's own inference" and that "no specification
   node or task criterion states" it — superseded by
   rules/integration/a-diagnostic-response-masks-a-resolved-credential, written in
   commit b6012c3.

Scope: update each of the six comments/docstrings above to state, or cite, the
specification as it currently stands. No behavior changes in any of the six files.
