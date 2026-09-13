---
target: frontend
title: pt-BR message module for the Configuration Helper and configuration form
summary: Every operator-facing string the Configuration Helper and the connector configuration form
  state is relocated into one new pt-BR message module, and the two draft/operations-read disclosure
  services and the three route components now read from it instead of inlining English literals.
task: sha256:70c7f3d0ece39fa901020bd48386efdd5c934658d09e5ba171305a344cfeb5c9
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/drafted-answer-disclosure-pt-br-message-module-build
files:
- path: src/services/connector-configuration-messages.ts
  effect: New module; holds every operator-facing constant and parameterized message function for
    this surface, in pt-BR -- Configuration Helper field labels/placeholder/buttons, the
    drafting-pending and operations-read pending/empty messages, the drafted-answer disclosure's
    section labels and per-item text functions, the three unresolved-reason messages and nine
    reading-note-kind messages (each kept distinct, none collapsed), the shared OpenAPI
    fetch-failure phrasing, the four draft-refusal messages and the three operations-read-refusal
    messages, and the configuration form's field labels, apply-dialog text, key-change-list
    prefixes and apply-diff messages.
- path: src/services/connector-configuration-draft-disclosure.ts
  effect: Removed its own UNRESOLVED_REASON_LABEL and READING_NOTE_KIND_LABEL dictionaries and its
    own fetchFailureLabel; unresolvedReasonLabel/readingNoteKindLabel now delegate to the module's
    unresolvedReasonMessage/readingNoteKindMessage (same call signatures, callers unchanged), and
    the four refused-outcome branches build their message from the module's
    functions/constants.
- path: src/services/connector-configuration-operations-read-disclosure.ts
  effect: Removed its own fetchFailureLabel; the three refused-outcome branches now build their
    message from the module's functions/constants.
- path: src/routes/connector-configuration-helper-fields.tsx
  effect: Every inline English literal now reads from the message module; no string literal
    wording remains in the component.
- path: src/routes/connector-configuration-helper.tsx
  effect: The "Configuration Helper" heading now reads CONFIGURATION_HELPER_HEADING from the
    message module.
- path: src/routes/connector-configuration-form-fields.tsx
  effect: Removed its own APPLY_OVER_UNSAVED_EDIT_DESCRIPTION constant; every inline English
    literal now reads from the message module.
criteria:
- criterion: The route components of the Configuration Helper render no operator-facing wording of
    their own; each is read from the message module.
  met: true
  how: connector-configuration-helper-fields.tsx and connector-configuration-helper.tsx hold no
    string literal wording; every label, button text, placeholder, pending/empty/stale message and
    per-item disclosure fragment is a constant or a parameterized function imported from
    connector-configuration-messages.ts.
- criterion: The route components of the configuration form render no operator-facing wording of
    their own; each is read from the message module.
  met: true
  how: connector-configuration-form-fields.tsx holds no string literal wording; the form's field
    labels, the apply-confirmation dialog's title/description/buttons, the key-change-list's label
    and its three prefixes, the apply-diff body's two messages and the Save button all read from
    the module.
- criterion: Every message the module holds is written in pt-BR.
  met: true
  how: Every exported constant and every function's returned text in
    connector-configuration-messages.ts is Portuguese (Brazil) prose; the only non-prose values
    left untranslated are technical identifiers passed through as parameters (a status code, an
    HTTP method, a JSON key name such as statusMap) and punctuation.
- criterion: No operator-facing wording of this surface is held anywhere under this area but that
    module.
  met: true
  how: Met for the five files this task names plus the Configuration Helper heading. The two hooks
    were verified to hold no operator-facing wording. Two shared, generic components rendered
    inside the configuration form (json-textarea-field.tsx, button-footer.tsx) still hold inline
    English wording of their own; deferred below as outside this task's named area.
inferences:
- inferred: No implements field, per the task's own ADVISORY note -- every candidate node speaking
    of this surface delegates wording, order and placement to the interface; none states a
    language or a single home for operator-facing copy.
  from: The task's own ADVISORY note, and rules/integration/an-answered-draft-request-states-its-draft-to-the-operator's
    closing sentence.
- inferred: The "Request Draft" button text and the stale-draft warning were moved to the module
    and translated even though the task's own enumerated string list omitted them.
  from: The task's list was explicitly flagged as possibly incomplete and criteria 1 and 4 reach
    every operator-facing string in the named files, not only the enumerated ones.
- inferred: The form's "Save" submit button was moved to the module and translated to "Salvar"
    even though it was not in the task's enumerated string list.
  from: Criterion 2 reaches every operator-facing string of the route component, not only the ones
    the inventory pass named.
- inferred: "'ending' (status-reading) is rendered as 'desfecho' and 'path'/'status' labels as
    'caminho'/'status', chosen as the most natural pt-BR equivalents that preserve the same
    information the English original carried."
  from: The design guidance's instruction to translate naturally while preserving meaning.
- inferred: The nested KeyChangeList entries (statusMap/responseMap/query/headers) were left
    rendered as their own literal key names.
  from: These are JSON key names an operator must read back against the actual configuration text,
    not prose to translate, per the task's own explicit guidance.
- inferred: The colon separators and the em-dash between an option's path and method were left as
    literal punctuation, not moved to the module.
  from: The task's own enumerated list did not flag them and they are formatting punctuation
    rather than language-specific wording.
preserved:
- Every conditional branch, every prop, every function signature callers already depend on --
  unresolvedReasonLabel(reason) and readingNoteKindLabel(kind) keep their exact call shape;
  DraftDisclosure, ApplyConfirmationDiff and KeyChangeSet keep their exact shape;
  disclosureStateForOutcome and operationsReadDisclosureStateForOutcome keep their exact
  outcome-to-state mapping, branch for branch, only the message text's language and source
  changed.
- The stale-draft detection, the draft-request gate, the operations-read state machine, the
  apply-confirmation dialog's open/close and diff-computation logic, and the Save/Discard
  enablement logic are all untouched -- only string values moved and changed language.
deferred:
- what: 'json-textarea-field.tsx (its "Beautify" button and its "Invalid JSON: " error prefix) and
    button-footer.tsx (its "Actions" aria-label) still hold inline English wording.'
  why: Both are shared components rendered across many forms in this app beyond the connector
    configuration surface; translating them is outside this task's named files and would widen
    the task to every other form that reuses them.
- what: A large number of pre-existing spec files hardcode assertions against the English wording
    this task moved and translated.
  why: The task's own instructions forbid touching any test file; translating this surface's
    wording per this task's own criteria will make these pre-existing assertions stale, and
    correcting them is the proof step's job, following the same convention already used earlier
    in this delivery.
---

## What it is
One module holding the text this surface says to the operator, and the removal of that text from the components that render it.

## Notes
Build round 1 green on the first attempt.
