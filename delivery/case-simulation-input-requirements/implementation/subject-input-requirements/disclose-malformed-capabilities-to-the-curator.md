---
title: Disclose a malformed capability to the composing curator
summary: The Subject region now renders a section listing every capability state.capabilitiesWithMalformedInputSchema
  names, by name and version alone, and renders nothing when that array is empty.
task: sha256:1f79335af2b076f792cfd3f92b5a1253bc3e033a1fb2502f96da8be381acf1a3
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/subject-input-requirements-disclose-malformed-build-2
files:
- path: src/routes/case-simulation-subject-panel.tsx
  effect: renders a new section immediately after the requirement list, disclosing every capability in
    state.capabilitiesWithMalformedInputSchema by its bare {name, version} identity when that array is
    non-empty (gated on the same isLoadingRegistries/isRegistriesError flags the requirement list already
    reads), and renders no heading, list or empty-state message at all when the array is empty; the requirement
    list, the curator's "+ attribute" row, the dispatch-adjacent markup and the "View subject JSON" block
    are all left byte-for-byte as they were except for the insertion itself, and the component-level header
    comment was extended with one paragraph describing the new section.
criteria:
- criterion: Each capability the state carries apart from its field set is disclosed by its own name and
    version where the subject is composed.
  met: true
  how: state.capabilitiesWithMalformedInputSchema.map renders one <li> per entry reading only {capability.name}
    {capability.version}, inside a new section placed right after the requirement list -- no connector,
    no concept, no schema hint beside it.
- criterion: The presence of such a capability does not refuse the simulate-case or the simulate-hypothesis
    dispatch.
  met: true
  how: the new block is a pure rendering addition; it reads no dispatch handler, no button and no isReady
    value, and nothing in use-simulation-subject.ts's isReady/dispatch logic was touched by this task.
- criterion: The presence of such a capability removes no input from the presented requirement set.
  met: true
  how: the requirement-list block (state.requiredFields rendering) is untouched; the new section is inserted
    after its closing tag as an independent sibling, never nested inside or conditioned on it.
- criterion: A read naming no such capability discloses nothing in its place.
  met: true
  how: the whole section is gated by state.capabilitiesWithMalformedInputSchema.length > 0 -- an empty
    array short-circuits the && to false and the section (no heading, no list) is not rendered at all,
    unlike the requirement list's own explicit empty-state message.
nodes:
- node: domain/integration/capability
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
  how: the source honors the node by disclosing exactly the identity attributes (name, version) this node
    declares as required, never the nature/schemas/timeout/connector/concept attributes it also declares.
- node: domain/knowledge/case-input-requirement
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
  how: honors the node's own closing clause -- a capability referenced by no requirement because its stored
    input schema is malformed reaches whoever reads this entry by its identity alone -- by rendering state.capabilitiesWithMalformedInputSchema
    (which carries exactly that identity, per the sibling task's delivery) with nothing else attached.
- node: rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
  how: encodes the rule's statement directly -- the interface assembling the subject before a simulate-case/simulate-hypothesis
    call discloses the identity of a capability the case-input-requirements read names apart from the
    requirement set, and does so as a disclosure, gating and refusing nothing.
- node: scenarios/investigation/a-malformed-capability-is-disclosed-to-the-composing-curator
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
  how: the rendered section is exactly the scenario's `then` -- that capability's identity is disclosed
    to the person composing the subject -- realized as the given/when this component already sits in (assembling
    the subject before either dispatch).
inferences:
- inferred: the disclosure section is gated on the same state.isLoadingRegistries/state.isRegistriesError
    flags the requirement list above already reads, rather than rendered unconditionally whenever the
    array is non-empty.
  from: use-case-input-requirements.ts resolves capabilitiesWithMalformedInputSchema to [] while its own
    read is loading or unsettled, so the array is already empty during that window and the length>0 gate
    alone would produce the same visible result; the extra flags were added only to keep this section's
    visibility rule textually aligned with the requirement list's own established convention for the same
    registry read, not because any criterion or node demands the extra condition.
- inferred: the section is placed as its own block, immediately after the requirement-list block and before
    the curator's "+ attribute" rows, rather than inside the requirement-list's own conditional or beside
    the "View subject JSON" details block.
  from: the task's own text leaves placement to this delivery's judgment; placing it directly under the
    list it is a counterpart to (capabilities that could not join that list) reads most naturally, and
    mirrors the file's existing pattern of following a registry-derived list immediately with anything
    else that same registry read produced.
- inferred: each disclosed row's own visible text is "{capability.name} {capability.version}" with no
    connecting punctuation beyond a space, reusing the exact <li> key convention and text-sm/text-muted-foreground
    styling the requirement list's own per-field capability rows already use.
  from: the codebase-surveyor inventory's convention that a cross-registry reference is carried by bare
    identity -- name and version only -- and this file's own established <li key> pattern, reused unwidened
    rather than inventing a second list-row shape for an identically-shaped identity.
preserved:
- the requirement list's own conditional rendering (state.requiredFields, its empty-state message, each
  field's Label/Input/asterisk markup and its own per-field capabilities sub-list)
- the curator "+ attribute" rows (addedAttributes map, onAttributeChange, onRemoveAttribute, onAddAttribute)
  and their Select/Input/Button wiring
- the "View subject JSON" <details>/<summary>/<pre> block
- every existing loading/error branch (isLoadingSubjectTypeOptions, isSubjectTypeOptionsError, state.isLoadingRegistries,
  state.isRegistriesError, isLoadingSubjectAttributeOptions, isSubjectAttributeOptionsError) and their
  exact JSX
- the subject-type Select and its doNotChangeSubjectType no-op handler
- isReady and the dispatch gating in use-simulation-subject.ts, which this task's own file (use-simulation-subject.ts)
  was not modified to touch
deferred:
- what: rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability's diagnose
    limb (the same disclosure ahead of a diagnose call, distinct from simulate-case/simulate-hypothesis)
    reaches no criterion of this task.
  why: the task's own Notes record this as a REMAINDER outside its criteria, which name only the simulate-case
    and simulate-hypothesis dispatches this Subject panel precedes; a diagnose-side surface, if one exists
    elsewhere in the app, is outside this task's own candidate set.
---

## What it is
The one thing that tells a curator why a concept in this version's plan is asking them for nothing at all, stated as an identity alone.

## Notes
None.
