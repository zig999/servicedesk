---
title: Case-not-valid read answered with the wrong status
summary: 'Corrective increment: a read of a case version failing validation answers HTTP 500 instead of
  the specification''s own decided HTTP 409.'
rationale: One corrective task, its own epic, seeded mechanically from trace.py --encodes over the one
  file the human named (src/errors/status-map.ts) plus the one node the correction answers to -- rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  -- which is not among the file's existing bindings precisely because the bug is that this node's requirement
  is not yet encoded there.
sources:
- work/case-not-valid-read-status-hotfix/intake/scope.md
covers:
- constraints/the-capability-identity-read-refuses-an-unregistered-identity
- contracts/integration/connector-configuration-registry
- contracts/investigation/diagnosis
- contracts/knowledge/case-lifecycle
- rules/glossary/a-concept-declares-its-description
- rules/integration/a-capability-input-schema-holds-a-well-formed-object
- rules/integration/a-connector-configuration-holds-a-well-formed-object
- rules/integration/a-connector-configuration-names-its-connector
- rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
- rules/integration/a-connector-placeholder-is-declared-by-its-capability
- rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
- rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
- rules/investigation/no-stage-aborts-on-its-deadline
- rules/knowledge/a-concept-accepts-the-declared-subject-type
- rules/knowledge/a-hypothesis-collects-at-least-one-concept
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
- rules/knowledge/a-released-hypothesis-revision-is-never-altered
- rules/knowledge/case-terms-exist-in-the-glossary
- scenarios/glossary/a-concept-with-no-description-is-refused
- scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
- rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
- rules/knowledge/validation-runs-at-every-read
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
- rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
uncovered:
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  why: already bound to src/errors/status-map.ts for an unrelated domain error's status code, untouched
    by this correction, which adds one missing entry rather than reworking the map's existing entries.
- node: contracts/integration/connector-configuration-registry
  why: already bound to src/errors/status-map.ts for an unrelated domain error's status code, untouched
    by this correction, which adds one missing entry rather than reworking the map's existing entries.
- node: contracts/investigation/diagnosis
  why: already bound to src/errors/status-map.ts for an unrelated domain error's status code, untouched
    by this correction, which adds one missing entry rather than reworking the map's existing entries.
- node: contracts/knowledge/case-lifecycle
  why: already bound to src/errors/status-map.ts for an unrelated domain error's status code, untouched
    by this correction, which adds one missing entry rather than reworking the map's existing entries.
- node: rules/glossary/a-concept-declares-its-description
  why: already bound to src/errors/status-map.ts for an unrelated domain error's status code, untouched
    by this correction, which adds one missing entry rather than reworking the map's existing entries.
- node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
  why: already bound to src/errors/status-map.ts for an unrelated domain error's status code, untouched
    by this correction, which adds one missing entry rather than reworking the map's existing entries.
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  why: already bound to src/errors/status-map.ts for an unrelated domain error's status code, untouched
    by this correction, which adds one missing entry rather than reworking the map's existing entries.
- node: rules/integration/a-connector-configuration-names-its-connector
  why: already bound to src/errors/status-map.ts for an unrelated domain error's status code, untouched
    by this correction, which adds one missing entry rather than reworking the map's existing entries.
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  why: already bound to src/errors/status-map.ts for an unrelated domain error's status code, untouched
    by this correction, which adds one missing entry rather than reworking the map's existing entries.
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  why: already bound to src/errors/status-map.ts for an unrelated domain error's status code, untouched
    by this correction, which adds one missing entry rather than reworking the map's existing entries.
- node: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
  why: already bound to src/errors/status-map.ts for an unrelated domain error's status code, untouched
    by this correction, which adds one missing entry rather than reworking the map's existing entries.
- node: rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  why: already bound to src/errors/status-map.ts for an unrelated domain error's status code, untouched
    by this correction, which adds one missing entry rather than reworking the map's existing entries.
- node: rules/investigation/no-stage-aborts-on-its-deadline
  why: already bound to src/errors/status-map.ts for an unrelated domain error's status code, untouched
    by this correction, which adds one missing entry rather than reworking the map's existing entries.
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  why: already bound to src/errors/status-map.ts for an unrelated domain error's status code, untouched
    by this correction, which adds one missing entry rather than reworking the map's existing entries.
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  why: already bound to src/errors/status-map.ts for an unrelated domain error's status code, untouched
    by this correction, which adds one missing entry rather than reworking the map's existing entries.
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  why: already bound to src/errors/status-map.ts for an unrelated domain error's status code, untouched
    by this correction, which adds one missing entry rather than reworking the map's existing entries.
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  why: already bound to src/errors/status-map.ts for an unrelated domain error's status code, untouched
    by this correction, which adds one missing entry rather than reworking the map's existing entries.
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  why: already bound to src/errors/status-map.ts for an unrelated domain error's status code, untouched
    by this correction, which adds one missing entry rather than reworking the map's existing entries.
- node: rules/knowledge/case-terms-exist-in-the-glossary
  why: already bound to src/errors/status-map.ts for an unrelated domain error's status code, untouched
    by this correction, which adds one missing entry rather than reworking the map's existing entries.
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  why: already bound to src/errors/status-map.ts for an unrelated domain error's status code, untouched
    by this correction, which adds one missing entry rather than reworking the map's existing entries.
- node: scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
  why: already bound to src/errors/status-map.ts for an unrelated domain error's status code, untouched
    by this correction, which adds one missing entry rather than reworking the map's existing entries.
---

## What it is
A corrective increment: src/errors/status-map.ts's STATUS_BY_ERROR_CLASS map has no entry for CaseNotValidError, so a read that throws it falls through to the generic unmapped-error fallback (HTTP 500) instead of the HTTP 409 rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name requires.
This epic claims the file's existing 21 bindings (declared untouched, one per unrelated domain error already mapped correctly) plus the one node the correction actually answers to.

## Notes
Seeded mechanically from `trace.py --encodes src src/errors/status-map.ts`, verbatim, per the corrective-increment route.
The class is not renamed to CaseVersionNotValidError as part of this correction; that is named as a remainder for the task itself, not this epic's to decide.
