---
target: frontend
title: capability-payload-notes-frontend, first review
summary: Four passes over the four delivered tasks carrying an operator-authored payload_notes field onto
  the capability registration and detail surfaces.
reviewed:
- src/hooks/use-capabilities.spec.ts
- src/hooks/use-capabilities.ts
- src/hooks/use-capability-detail-payload-notes-submission.spec.ts
- src/hooks/use-capability-detail-view.spec.ts
- src/hooks/use-capability-detail.spec.ts
- src/hooks/use-capability-detail.ts
- src/hooks/use-capability-form-payload-notes-submission.spec.ts
- src/hooks/use-capability-form.spec.ts
- src/hooks/use-capability-form.ts
- src/routes/capability-form-fields-payload-notes.spec.ts
- src/routes/capability-form-fields.tsx
- src/services/capability-form-schema.spec.ts
- src/services/capability-form-schema.ts
tasks:
- task/capability-payload-notes-surface/payload-notes-declared-in-the-frontend-capability-contract
- task/capability-payload-notes-surface/payload-notes-seeded-from-the-read-answer
- task/capability-payload-notes-surface/payload-notes-carried-in-the-submitted-registration
- task/capability-payload-notes-surface/payload-notes-field-rendered-on-the-capability-form
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/capability-payload-notes-frontend) passed cleanly on every step including
    test; there was no failure to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
coverage:
- criterion: capabilityFormSchema parses a form value object carrying a payload_notes string and yields
    that same string on the parsed result.
  state: covered
  tests:
  - file: src/services/capability-form-schema.spec.ts
    name: yields the supplied payload_notes string unchanged on the parsed result
- criterion: capabilityFormSchema parses a form value object carrying no payload_notes and reports no
    validation issue for that field.
  state: covered
  tests:
  - file: src/services/capability-form-schema.spec.ts
    name: reports no validation issue when payload_notes is left out of the form value
- criterion: capabilityFormSchema reports no validation issue for a payload_notes value that is an empty
    string.
  state: covered
  tests:
  - file: src/services/capability-form-schema.spec.ts
    name: reports no validation issue for a payload_notes value that is an empty string
- criterion: The Capability read type declares payload_notes, and a read answer carrying a payload_notes
    string typechecks against it.
  state: covered
  tests:
  - file: src/hooks/use-capabilities.spec.ts
    name: typechecks and preserves a payload_notes string carried on a read answer
  why: 'The declaration half is asserted by the annotation `const answer: Capability = {...}`, which fails
    under the project''s `typecheck` script (`tsc --noEmit`) and not under `vitest run`; the runtime expectation
    alone would still pass if the type stopped declaring payload_notes. A reader routing this should know
    the proof spans two gates.'
- criterion: A read answer carrying no payload_notes typechecks against the Capability read type.
  state: covered
  tests:
  - file: src/hooks/use-capabilities.spec.ts
    name: typechecks a read answer that carries no payload_notes
  why: 'As above: the optionality is asserted by the type annotation, which fails under `tsc --noEmit`
    rather than under the vitest run; the runtime `toBeUndefined()` would pass whether or not the type
    made the field required.'
- criterion: Where the identity read answers a capability whose payload_notes carries content, the form
    values use-capability-detail presents carry that same content for payload_notes.
  state: covered
  tests:
  - file: src/hooks/use-capability-detail.spec.ts
    name: carries the read answer's own payload_notes content in the ready-phase form values
- criterion: Where the identity read answers a capability carrying no payload_notes, the form values use-capability-detail
    presents state no payload_notes content.
  state: covered
  tests:
  - file: src/hooks/use-capability-detail.spec.ts
    name: states no payload_notes content in the ready-phase form values
- criterion: Where an existing capability is loaded into use-capability-form, the payload_notes that answer
    carried is the payload_notes that hook's form values hold.
  state: covered
  tests:
  - file: src/hooks/use-capability-form.spec.ts
    name: holds the existing capability's own payload_notes content in the ready-phase form values
  - file: src/hooks/use-capability-form.spec.ts
    name: holds no payload_notes content in the ready-phase form values
- criterion: payload_notes holds the answered content from the first moment the form values stand, and
    not from a later moment inside the presentation.
  state: partial
  tests:
  - file: src/hooks/use-capability-detail.spec.ts
    name: carries the read answer's payload_notes already in the render log's first ready entry, not a
      later one
  why: The criterion names no single hook, and only use-capability-detail's first ready render is inspected
    through a render log. The use-capability-form tests read form values after waitFor(phase === "ready")
    has already settled, and the rendered-surface tests read the control only after findByLabelText resolves;
    so if use-capability-form or the form-fields surface seeded payload_notes one render after its form
    values first stood, nothing in the set would fail.
- criterion: The act that returns the surface's fields to the registration the surface last read returns
    payload_notes to the content that read answered.
  state: covered
  tests:
  - file: src/hooks/use-capability-detail-view.spec.ts
    name: returns an edited payload_notes field to the read answer's own content once discard is performed
- criterion: No payload_notes content is presented that the identity read's own answer did not carry.
  state: covered
  tests:
  - file: src/hooks/use-capability-detail.spec.ts
    name: presents the identity GET's own payload_notes, not a different value a stale capabilities-list
      cache entry for this same (name, version) already carried
  - file: src/hooks/use-capability-detail.spec.ts
    name: states no payload_notes content in the ready-phase form values
- criterion: The registration body use-capability-detail submits carries payload_notes as the form value
    holds it.
  state: covered
  tests:
  - file: src/hooks/use-capability-detail-payload-notes-submission.spec.ts
    name: forwards a payload_notes value the operator just set into the PUT body, unchanged
- criterion: The registration body use-capability-form submits carries payload_notes as the form value
    holds it.
  state: covered
  tests:
  - file: src/hooks/use-capability-form-payload-notes-submission.spec.ts
    name: forwards a payload_notes value the operator just set into the PUT body, unchanged
- criterion: Where the operator declared no payload notes, the submitted body states payload_notes as
    absent or as an empty string and as no other content.
  state: partial
  tests:
  - file: src/hooks/use-capability-detail-payload-notes-submission.spec.ts
    name: carries no payload_notes property in the submitted body, and still dispatches the PUT, when
      the field was never edited
  - file: src/hooks/use-capability-detail-payload-notes-submission.spec.ts
    name: carries payload_notes as an empty string in the submitted body, and no other content
  why: Both permitted forms of "no payload notes declared" are exercised, but only through use-capability-detail.
    Nothing submits through use-capability-form, nor through the capability registration screen, with
    payload notes left undeclared, so a submission path that substituted a placeholder or carried a stale
    value for an undeclared field on those routes would pass the set unchanged.
- criterion: Where every required attribute is declared and payload notes is left undeclared, the contract
    rule does not refuse the submission and the register-capability call is issued.
  state: covered
  tests:
  - file: src/hooks/use-capability-detail-payload-notes-submission.spec.ts
    name: carries no payload_notes property in the submitted body, and still dispatches the PUT, when
      the field was never edited
- criterion: capability-form-fields renders a control bound to the form's payload_notes field.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-payload-notes.spec.ts
    name: binds a uniquely labeled Payload notes control to the payload_notes field, with no error region
      shown absent an error
  - file: src/routes/capability-form-fields-payload-notes.spec.ts
    name: submits exactly the free text typed into Payload notes
- criterion: That control sits inside the same FormField label and error wrapper the component's other
    capability attribute fields use, with no second wrapper introduced beside it.
  state: partial
  tests:
  - file: src/routes/capability-form-fields-payload-notes.spec.ts
    name: binds a uniquely labeled Payload notes control to the payload_notes field, with no error region
      shown absent an error
  why: 'What is exercised is that a label is associated with the control and that aria-describedby is
    absent when there is no error. Unexercised: sameness with the other capability attribute fields is
    never asserted, and the error half of the wrapper is never reached, since no case drives payload_notes
    into an invalid state.'
- criterion: The control accepts free text an operator types, and what is typed becomes the form's payload_notes
    value.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-payload-notes.spec.ts
    name: submits exactly the free text typed into Payload notes
- criterion: The control accepts text spanning more than one line.
  state: partial
  tests:
  - file: src/routes/capability-form-fields-payload-notes.spec.ts
    name: renders a native multi-line textarea control for Payload notes, rather than a single-line input
  why: The only assertion is on the rendered element's tag name; no test types, holds or submits text
    containing a newline. What would close it is submitting text carrying a line break through the control
    and asserting the break survives into the form value.
- criterion: The control presents the payload_notes value the form holds, and presents nothing where the
    form holds none.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-payload-notes.spec.ts
    name: presents the identity read's own payload_notes content, where the read answered with content
  - file: src/routes/capability-form-fields-payload-notes.spec.ts
    name: presents no payload_notes content, where the read answered with none
- criterion: The control is rendered on the capability registration screen's reading of this component.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-payload-notes.spec.ts
    name: binds a uniquely labeled Payload notes control to the payload_notes field, with no error region
      shown absent an error
  - file: src/routes/capability-form-fields-payload-notes.spec.ts
    name: submits exactly the free text typed into Payload notes
- criterion: The control is rendered on the capability detail surface's reading of this component.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-payload-notes.spec.ts
    name: presents the identity read's own payload_notes content, where the read answered with content
  - file: src/routes/capability-form-fields-payload-notes.spec.ts
    name: presents no payload_notes content, where the read answered with none
findings:
- pass: conformance
  file: src/hooks/use-capability-detail-view.spec.ts
  where: the describe block at lines 75-109, "onDiscard resets to what was just saved rather than the
    original pre-save values (an inference the implementation recorded)", and its assertions at lines
    106-107
  evidence: "describe(\"useCapabilityDetailView -- onDiscard resets to what was just saved rather than\
    \ the original pre-save values (an inference the implementation recorded)\", () => {\n  it(\"discards\
    \ back to the just-saved schema values after a successful save, not the values loaded before it\"\
    , async () => {\n...\n    expect(readyState(result.current).inputSchema.value).toBe(UPDATED_INPUT_SCHEMA);\n\
    \    expect(readyState(result.current).outputSchema.value).toBe(UPDATED_OUTPUT_SCHEMA);"
  cost: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface ties
    discard strictly to "the content of the registration that read answered ... and to the content of
    no other answer," and its own description states that what a surface's read does after a successful
    submission is untouched by that rule; the sibling rules (a-successful-capability-registration-lands-on-the-capabilitys-own-surface,
    a-submitted-registration-states-its-outcome-to-the-operator) each explicitly disclaim deciding what
    follows a successful save. Whether a save's own response — rather than a subsequent read-capability-by-identity
    — becomes the new baseline onDiscard reverts to is a business decision about which answer the surface
    may treat as "that read answered," and it exists only in this hook and this test, flagged by its own
    title as "an inference the implementation recorded" rather than something the specification decided.
    A future change to either the discard rule or to what a save's response is allowed to stand in for
    could silently disagree with this baseline, and nobody reading the specification would find it.
  correction: Decide, into the specification (most naturally alongside a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
    or a-successful-capability-registration-lands-on-the-capabilitys-own-surface) and disclose in the
    decision log, whether a successful register-capability response becomes the content onDiscard reverts
    to ahead of any further read-capability-by-identity — then let this test cite that decision instead
    of calling it an inference.
- pass: conformance
  file: src/hooks/use-capability-detail.ts
  where: the mutationFn PUT body, lines 112-114
  evidence: "...(form.formState.dirtyFields.payload_notes\n          ? { payload_notes: values.payload_notes\
    \ }\n          : {}),"
  cost: Every other declared attribute (nature, timeout, connector, concept, both schemas) is forwarded
    unconditionally on every submission, but payload_notes alone is included only when react-hook-form
    marks it dirty in this session. An operator who loads a capability that already carries payload notes,
    edits some other field (e.g. connector) without touching the notes textarea, and submits, sends a
    PUT body with no payload_notes key at all; since register-capability replaces whatever stood at the
    identity with the whole declared contract submitted, and an absent declaration is read as "a capability
    that simply has none," the existing payload notes are silently wiped even though the operator never
    declared or cleared them. No node decided that an untouched optional field should be dropped from
    a total-replace submission rather than resubmitted with its current value.
  correction: Forward payload_notes by name unconditionally, the same way every other field already is,
    or have the specification decide how an edit that leaves payload_notes untouched should be submitted.
- pass: conformance
  file: src/hooks/use-capability-detail.ts
  where: the mutation's onSuccess callback, lines 118-121
  evidence: "onSuccess: (_data, values) => {\n    form.reset(values);\n    setInputSchemaBaseline(inputSchemaValue);\n\
    \    setOutputSchemaBaseline(outputSchemaValue);"
  cost: The registry's own response to the PUT call is received as `_data` and discarded unused; the fields
    presented right after a successful save are reset to `values` — the content the register-capability
    submission carried — and the schema baselines are taken from the in-memory textarea values rather
    than from any answer the registry gave back. Until the invalidated ["capability", name, version] query
    refetches and overwrites this, the surface is showing exactly the source of content the rule names
    and forbids by name ("not... the content a register-capability submission carried"), so an operator
    inspecting the surface immediately after saving is shown the submission, not a confirmed read.
  correction: Source the post-save presentation from the registry's own answer (the mutation's response,
    or the awaited refetch of read-capability-by-identity) rather than from the submitted form values.
- pass: conformance
  file: src/hooks/use-capability-detail.ts
  where: the "ready" phase's returned state, lines 193-212
  evidence: "return {\n    phase: \"ready\",\n    form,\n    conceptOptions: conceptOptions.concepts,\n\
    \    inputSchema: { value: inputSchemaValue, isValid: inputSchemaValid, onChange: handleInputSchemaChange\
    \ },\n    outputSchema: { value: outputSchemaValue, isValid: outputSchemaValid, onChange: handleOutputSchemaChange\
    \ },\n    isDirty,\n    isSubmitting: mutation.isPending,\n    isSubmitSuccessful: mutation.isSuccess,\n\
    \    onSubmit,\n    onCancel,\n  };"
  cost: No act in the returned state sets every field back to the content the read last answered while
    staying on the surface — onCancel only ever leaves the surface (back, or to the capabilities listing).
    The data such an act would need (query.data and the schema baselines inputSchemaBaseline/outputSchemaBaseline)
    is tracked internally but never exposed, so no consuming component could implement the act even by
    calling into `form` directly. An operator who wants to put an edit down and keep working from the
    loaded content has only the full leave-and-return-through-the-listing route, paying navigation for
    something the specification says should cost the registry, and the operator, nothing.
  correction: Expose an act (and the baseline data it needs) from the hook that resets form fields and
    both schema values/baselines to the last-read content without leaving the surface, taking effect only
    on a further explicit confirmation.
- pass: conformance
  file: src/hooks/use-capability-form.ts
  where: SAVE_FAILURE_MESSAGE_BY_KIND, lines 43-52
  evidence: "const SAVE_FAILURE_MESSAGE_BY_KIND: Partial<Record<UiErrorStateKind, string>> = {\n  \"capability-not-read-only\"\
    :\n    \"This capability's declared nature is not read-only; the registry only accepts read-only capabilities.\"\
    ,\n  \"incomplete-capability-contract\":\n    \"This capability does not declare its contract completely;\
    \ every field of its contract is required.\",\n  \"capability-schema-not-well-formed\":\n    \"The\
    \ input schema or the output schema is not syntactically valid JSON.\",\n  \"concept-already-answered\"\
    :\n    \"Another capability already answers this concept; each concept resolves to exactly one capability.\"\
    ,\n};"
  cost: domain/integration/capability-registry's own Responsibility names six distinct grounds on which
    the registry refuses a capability registration — not read-only, an incomplete contract, a schema that
    is not valid JSON, an input schema that does not hold a well-formed shape, a connector whose registered
    configuration already embeds an undeclared placeholder, and a concept another capability already answers
    — but this table gives a distinguishing message to only four of the six. A registration refused on
    either of the other two grounds falls through `?? GENERIC_SAVE_FAILURE_MESSAGE` via saveFailureMessage,
    the same text an operator sees for a refusal whose condition the surface does not recognise at all,
    so an operator told a named refusal answered their submission cannot tell it apart from one the surface
    never named.
  correction: add a distinguishing message for a refusal on the input schema's well-formed shape and for
    a refusal on an undeclared connector placeholder, so every condition register-capability can name
    is stated apart from the others and apart from an unrecognised refusal.
- pass: conformance
  file: src/hooks/use-capability-form.ts
  where: the mutationFn request body, lines 106-116
  evidence: "body: JSON.stringify({\n  nature: values.nature,\n  input_schema: getJsonTextareaMinifiedValue(inputSchemaValue),\n\
    \  output_schema: getJsonTextareaMinifiedValue(outputSchemaValue),\n  timeout: values.timeout,\n \
    \ connector: values.connector,\n  concept: values.concept,\n  ...(form.formState.dirtyFields.payload_notes\n\
    \    ? { payload_notes: values.payload_notes }\n    : {}),\n}),"
  cost: 'Every other attribute is sent from the form''s current value regardless of whether the operator
    touched it, so an untouched field still carries forward what was loaded. payload_notes alone is singled
    out: it is included only when `dirtyFields.payload_notes` is true, even though `values.payload_notes`
    already holds the correct, previously-declared text when untouched. Since register-capability "replac[es]
    whatever already stood at that identity" (contracts/integration/capability-registry), an operator
    who edits an existing capability''s timeout or connector without retyping its payload notes submits
    a write that omits payload_notes entirely, and the registered capability''s previously-declared notes
    is silently gone — a rule about which loaded, unedited attribute may drop out of a resubmission that
    no node states, and that applies to this one attribute alone.'
  correction: state, for the one optional attribute a registration may leave undeclared, whether an untouched
    but previously-loaded value participates in a resubmission the way every other declared attribute
    already does — and if so, send it unconditionally as the other fields are sent.
- pass: conformance
  file: src/routes/capability-form-fields.tsx
  where: the Name and Version Input fields, lines 124-140
  evidence: "<Input\n  {...register(\"name\")}\n  disabled={isEditingIdentity || isSubmitting}\n...\n\
    <Input\n  {...register(\"version\")}\n  disabled={isEditingIdentity || isSubmitting}"
  cost: An operator opening an existing capability's edit surface cannot change Name or Version at all,
    while Nature, Timeout and Connector on that same surface stay editable — a distinction drawn only
    for the two attributes that form the capability's identity. Nothing in domain/integration/capability
    or in the rules governing register-capability's create-or-replace states that an identity, once registered,
    may not be re-typed on the surface that loaded it; the specification only ever distinguishes "creating
    a capability at a new name and version" from "replacing whatever already stood at that identity" as
    two branches of one write. The rule that forecloses one of those branches from this screen lives only
    in this disabled prop, so a reader checking what governs a capability's identity will not find this
    restriction in the specification, and a later change to it would not be recognized as touching anything
    the business decided.
  correction: A node constraining domain/integration/capability (or a surface rule alongside the other
    capability-form-fields rules already in this pack) would need to state whether an operator editing
    a registered capability may change its name or version, so that this disablement follows a decided
    fact rather than standing as the only place the decision is recorded.
- pass: conformance
  file: src/services/capability-form-schema.ts
  where: line 3, the CAPABILITY_NATURES constant
  evidence: export const CAPABILITY_NATURES = ["read-only", "mutating"] as const;
  cost: The enumeration's two values now live in two places — the specification's node and this frontend
    constant used to build the form's zod enum. A future change to domain/integration/capability-nature
    (a renamed value, a third nature added) has no reason to touch this file, so the form's accepted values
    can silently drift from what the specification declares, and whoever edits the node will not know
    a second copy needs the same edit.
  correction: Derive the form's allowed nature values from a single shared source (the specification's
    own enumeration, surfaced once) instead of restating "read-only" and "mutating" as a local TypeScript
    constant.
reconciliation: siegard-reconcile/capability-payload-notes-frontend.md
---
## What it is

Four passes over the four delivered `capability-payload-notes-frontend` tasks, together carrying
an operator-authored, optional, free-text `payload_notes` attribute onto the frontend's shared
capability type, Zod form schema, both form hooks (read-seed and write-submit paths), and the
shared `capability-form-fields` rendering component reaching both the registration screen and the
capability detail surface. The whole-change build and suite (`run/capability-payload-notes-frontend`)
passed cleanly, so the failures pass found nothing to diagnose. The conformance pass's own
reconciliation record, folded into `siegard-reconcile/capability-payload-notes-frontend.md` and
bound into `siegard-trace.json`, is the authoritative account of which of the 21 candidate
node/file pairs cleared and which of the 9 remaining nodes carry an open finding.

## Notes

Three of the eight conformance findings surfaced in files outside this initiative's own new work
(`capability-form-fields.tsx`'s name/version disablement, `capability-form-schema.ts`'s
CAPABILITY_NATURES duplication, `use-capability-form.ts`'s incomplete refusal-message table) —
pre-existing conditions the payload_notes change did not introduce, caught because the conformance
pass reads every candidate node against the whole file, not only the lines this initiative touched.
