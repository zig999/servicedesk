---
title: Fix the ready-phase render lag in the capability and connector configuration
  detail hooks
summary: 'useCapabilityDetail and useConnectorConfigurationDetail report phase: "ready"
  one render before the schema/configuration text state they expose reflects the data
  that just loaded.'
objective: The very first render in which useCapabilityDetail or useConnectorConfigurationDetail
  reports phase "ready" already carries the just-loaded data in every field the ready
  state exposes — never the empty string or stale text queued from the hook's state
  before the load resolved.
criteria:
- The first render in which useCapabilityDetail reports phase "ready" carries the
  loaded capability's input_schema text in inputSchema.value.
- The first render in which useCapabilityDetail reports phase "ready" carries the
  loaded capability's output_schema text in outputSchema.value.
- The first render in which useConnectorConfigurationDetail reports phase "ready"
  carries the loaded connector's configuration text in configuration.value.
- Clicking Add attribute immediately after the connector configuration detail screen
  finishes loading (before any edit) reads the placeholders in the just-loaded configuration
  text, not an empty or stale registered baseline.
implements:
- rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
- rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read
- rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
sources:
- intake/scope.md
---

## What it is

The merge of `worktree-buttonfooter` into `main` surfaced this by running the delivered system:
`npm test` in `frontend/app` failed two specs that were green on each side before the merge —

- `src/hooks/use-capability-detail.spec.ts`, criterion 1 ("resolves the ready phase from its own
  direct GET..."): `inputSchema.value` comes back as `""` instead of the loaded schema once
  `phase` first reads "ready".
- `src/routes/connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts`,
  criterion 3: clicking Add attribute right after the screen loads finds no placeholders in the
  configuration text, because the view's registered baseline was captured on a render where the
  hook's own `configuration.value` was still `""`.

Both hooks populate their schema/configuration text state inside a `useEffect` gated on
`[query.data]`, one render after `query.data` itself makes `phase` read "ready" for the first
time — the exact lag `1c643a65` ("implement-task: hook-computes-validity-before-ready") named as
deferred for `useConnectorConfigurationDetail`'s own `configuration.value` and left untouched for
`useCapabilityDetail`'s `inputSchema`/`outputSchema`. A consumer reading state at the earliest
"ready" render — `waitFor` resolving on the phase alone, or a downstream hook seeding a baseline
from the first ready render, as `use-connector-configuration-detail-view.ts` does — reads that gap.

## Notes

UNDERDETERMINED, from the specification — rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them states that the surface carries name, version, nature, input_schema, output_schema, timeout, connector and concept from the first moment the read-and-shown presentation stands, and that at no point in it does an attribute stand absent or empty.
Criteria 1 and 2 reach only the two schemas, so the clause covering nature, timeout, connector, concept, name and version reaches no criterion, while the objective ("every field the ready state exposes") does claim them.
Passes: a useCapabilityDetail whose first phase "ready" render carries the loaded input_schema and output_schema text but leaves nature, timeout, connector, concept or name/version at the empty or pre-load value for one further render, filling them on a later render.

UNDERDETERMINED, from the specification — the same rule states that the presented values come from that identity read's own answer and from nothing else, expressly not a page of list-capabilities the caller already held, not read-capability's concept-keyed answer, and not the content a register-capability submission carried.
Criteria 1 and 2 constrain only what the value equals at the first ready render, never where it was read from, so that sourcing clause reaches no criterion.
Passes: a useCapabilityDetail that seeds inputSchema.value and outputSchema.value at the first ready render from a list-capabilities page (or a read-capability answer, or the submission the operator last posted) held in client state for that identity, never from the read-capability-by-identity answer — passing criteria 1 and 2 whenever the two happen to agree and presenting the other answer's content whenever they do not.

UNDERDETERMINED, from the specification — rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read states that where the read returned the screen presents the connector name and the configuration exactly as the read answered them and states no value that answer did not carry.
Criterion 3 reaches configuration.value alone; the connector-name half of that clause reaches no criterion, while the objective's "every field the ready state exposes — never the empty string or stale text" does claim it.
Passes: a useConnectorConfigurationDetail whose first phase "ready" render carries the just-loaded configuration text but exposes a connector name still holding the previously loaded configuration's name (or the empty string) for one further render.

UNDERDETERMINED, from the specification — criterion 4 bounds itself to "before any edit", so it says nothing about where the placeholder set is read from once the operator has changed the configuration text.
rules/integration/a-connector-configuration-is-tested-through-a-registered-capability states that the subject a test assembles carries exactly the Subject attributes named by the ${subject:<attribute-name>} placeholders embedded in the configuration currently registered under that connector name, never configuration text an operator holds unsaved in an authoring surface.
Passes: a useConnectorConfigurationDetail whose Add attribute derives its attribute names from the live editable configuration field on every click, so an operator who edits the text without registering it is offered attribute rows for placeholders that exist only in unsaved text — while still reading the just-loaded text correctly before any edit, which is all criterion 4 checks.

UNDERDETERMINED, from the specification — criterion 4 names the "registered baseline" as the state that must not be empty or stale, but no criterion reaches the act that baseline exists for.
rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface states that the discard sets every field of the surface to the content of the registration the read answered, which a baseline still holding its pre-load value cannot do.
Passes: a fix that synchronises only the exposed text fields and the placeholder source at the first ready render while leaving the hook's registered baseline at its pre-load value, so a discard taken immediately after the load resolves sets every field to the empty string instead of to the configuration or schemas the read answered.
