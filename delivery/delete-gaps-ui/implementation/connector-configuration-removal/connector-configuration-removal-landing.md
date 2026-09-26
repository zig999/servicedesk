---
target: frontend
title: Land connector configuration removal on the connectors listing
summary: Wires a successful (HTTP 204) connector configuration DELETE to navigate
  the operator to /connectors unconditionally, never leaving them on the removed configuration's
  own surface.
task: sha256:be5a516dad114924369e46878e0e06917d4b879d4e9530304f4fb86387048f76
files:
- path: src/hooks/use-connector-configuration-detail.ts
  effect: 'Added navigate({ to: "/connectors" }) inside removeMutation''s onSuccess,
    alongside the existing invalidateQueries calls.'
criteria:
- criterion: After a removal answered with HTTP 204, the operator is at /connectors.
  met: true
  how: 'onSuccess calls navigate({ to: "/connectors" }).'
- criterion: After a removal answered with HTTP 204, the operator is at /connectors
    even when navigation history holds an earlier entry.
  met: true
  how: The call performs no history check, unlike onCancel's fallback.
- criterion: After a removal answered with HTTP 204, the connectors listing shows
    no row for the removed connector's name.
  met: true
  how: onSuccess already invalidates ["connector-configurations"]; navigating there
    refetches it.
- criterion: After a removal answered with HTTP 204, the refusal of a read of the
    removed connector's name is never shown.
  met: true
  how: Navigating unmounts the detail screen and its own query as soon as onSuccess
    fires.
nodes:
- node: rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: The connector-configuration branch (identity resolves nowhere after removal,
    so destination is the listing) is encoded as the unconditional navigate.
- node: domain/integration/connector-configuration
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: No attribute changes; reached only because the removal is keyed by this element's
    own identity.
- node: constraints/a-successful-connector-configuration-removal-answers-with-no-content
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: The navigate call fires only once the DELETE answers 204.
inferences:
- inferred: A plain (push) navigate rather than replace satisfies the criteria.
  from: The ADVISORY note plus this hook's own existing onCancel fallback already
    using a plain navigate to /connectors.
preserved:
- onCancel's history-aware fallback is unchanged.
- The save mutation's own onSuccess is unchanged.
- The invalidateQueries calls already added by the sibling control task are unchanged.
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/connector-configuration-removal-connector-configuration-removal-landing-build
---

## What it is
Navigates to /connectors on a successful connector configuration removal.

## Notes
None.
