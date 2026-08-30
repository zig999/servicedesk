---
title: Extract the subject-placeholder parsing primitives into a shared module
summary: The placeholder regex, kind/argument split and subject-kind filter move out
  of simulation-subject-derivation.ts into a feature-neutral module that file itself
  then imports.
rationale: The scope recommends this extraction but leaves whether it stands as its
  own task or folds into the button-behavior change to the decomposition. It is cut
  separately here because its own outcome is independently demonstrable -- simulation-subject-derivation.ts's
  existing exports and its own two specs prove it before any button behavior changes
  -- and because it relocates already-proven parsing code without asserting a new
  domain fact.
sources:
- intake/scope.md
objective: The subject-placeholder parsing primitives currently declared inside simulation-subject-derivation.ts
  are available from a new, feature-neutral module that simulation-subject-derivation.ts
  itself imports, with its own exported behavior unchanged.
criteria:
- A module under frontend/app/src/shared/services/ exports the placeholder regex,
  the kind/argument split at the first ':', and the filter keeping only kind === "subject"
  that simulation-subject-derivation.ts used to declare directly.
- simulation-subject-derivation.ts imports these primitives from that new module rather
  than declaring them itself.
- simulation-subject-derivation.spec.ts and use-simulation-subject.spec.ts pass unchanged,
  evidencing subjectPlaceholderNamesInConfiguration's own observable behavior did
  not change.
- Configuration text that is not valid JSON, or not a plain object, still resolves
  to no placeholders through the extracted primitives, exactly as before the extraction.
implements:
- domain/integration/connector-configuration
- rules/integration/an-http-connector-configuration-declares-its-call
---

## What it is
The subject-placeholder parsing primitives simulation-subject-derivation.ts already implements, moved to a shared, feature-neutral module.
simulation-subject-derivation.ts kept as an unchanged consumer of that module, proven by its own existing specs.

## Notes
frontend/app/src/shared holds only a components/ subdirectory today, so a shared/services/ module is new territory this task creates rather than an existing one it reuses.
REMAINDER, from the specification -- rules/integration/an-http-connector-configuration-declares-its-call.md's statement covers far more than the placeholder token grammar this task's criteria address: method, responseMap and statusMap validation; the malformed-request refusal for a missing address or malformed query/headers; the unrecognized-kind and missing-required-argument refusals; the unresolvable-Subject-attribute-or-credential ending; and the unavailable-ending behavior with its named result-detail errors.
None of that is reached by this task's four criteria, which only extract the placeholder regex, the kind/argument split and the subject-kind filter.
Belongs: the backend HTTP connector implementation task(s) that assemble and issue the connector call and record its evidence-result ending (method/responseMap/statusMap validation, malformed query/headers refusal, unrecognized-kind and missing-argument refusal, Subject-attribute and credential resolution failure, and the unavailable ending with its result-detail errors) -- a different task from this frontend subject-placeholder-primitive extraction, and very likely a different epic (backend HTTP connector work rather than the frontend connector authoring feature).
