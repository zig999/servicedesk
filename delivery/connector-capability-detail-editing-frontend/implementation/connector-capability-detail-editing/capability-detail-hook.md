---
title: Capability single-record edit hook (useCapabilityDetail)
summary: A new hook, use-capability-detail.ts, loading one capability by its (name,
  version) identity through its own GET, tracking dirty/save state across every field
  plus both JSON schemas, exposed through a loading/load-error/ready phase union.
task: sha256:e3fcb501359eae1838f3b2b3d98b7d5fdb206a02e28530d94061c78c67d08085
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-capability-detail-editing-capability-detail-hook-build
files:
- path: src/hooks/use-capability-detail.ts
  effect: 'Exports useCapabilityDetail(name, version): CapabilityDetailState. Issues
    its own GET /v1/capabilities/{name}/{version} (query key ["capability", name,
    version]) independent of use-capabilities.ts list query, plus a useConceptOptions
    read for the concept single-select own vocabulary, both gated behind one loading
    | load-error | ready phase union. On load, re-seeds a react-hook-form instance
    (capabilityFormSchema: name, version, nature, timeout, connector, concept) and
    both input_schema/output_schema plain-state fields (each paired with its own validity
    flag reported by JsonTextareaField onChange) plus their own baselines. In the
    ready phase, isDirty is form.formState.isDirty OR either JSON field minified text
    differing from its own minified baseline. onSubmit guards double-submit via an
    isSubmittingRef, blocks while either JSON field is invalid, and PUTs /v1/capabilities/{name}/{version}
    on submit. A successful save re-baselines the form and both JSON fields to their
    just-submitted values, then invalidates both ["capabilities"] and ["capability",
    name, version]. query.isError or conceptOptions.isError produces the load-error
    phase with a retryLoad action that refetches both reads.'
criteria:
- criterion: The hook issues its own GET for the capability identified by both name
    and version, independent of any list screen having already fetched it.
  met: true
  how: useCapabilityDetail useQuery calls apiFetch against /v1/capabilities/{name}/{version}
    on its own query key ["capability", name, version], unconditionally on every mount
    -- never reading from or depending on use-capabilities.ts own ["capabilities"]
    list query.
- criterion: The hook exposes a loading | load-error | ready phase union, mirroring
    use-edit-draft-version-form.ts's shape.
  met: true
  how: CapabilityDetailState is exactly that three-member discriminated union; the
    load-error branch carries a typed retryLoad action, mirroring use-edit-draft-version-form.ts
    own EditDraftVersionFormState and use-connector-configuration-detail.ts own sibling
    shape.
- criterion: In the ready phase, isDirty is true only when at least one form field,
    input_schema, or output_schema differs from the values most recently loaded or
    saved.
  met: true
  how: isDirty is form.formState.isDirty OR either minified JSON schema value differing
    from its own minified baseline -- form.formState.isDirty covers name/version/nature/timeout/connector/concept,
    and the two explicit comparisons cover the two fields outside react-hook-form.
- criterion: Returning every field, including input_schema and output_schema, to its
    most recently loaded or saved value flips isDirty back to false.
  met: true
  how: react-hook-form's own formState.isDirty already returns to false once every
    registered field matches its last reset() baseline; the two JSON comparisons read
    the current state against their own baselines, which change only on load or a
    successful save.
- criterion: A successful save re-baselines the originally loaded values, including
    both JSON schema fields, to what was just saved, so isDirty is false immediately
    after a save with no further edits.
  met: true
  how: the mutation's onSuccess calls form.reset(values) (the values just submitted)
    and re-baselines both JSON field baselines to their just-submitted text -- every
    isDirty comparison reads false immediately afterward.
- criterion: A successful save invalidates or updates both the "capabilities" list
    query and this hook's own single-record query so neither screen is left reading
    stale data.
  met: true
  how: onSuccess calls queryClient.invalidateQueries with queryKey ["capabilities"]
    and with ["capability", name, version], both unconditionally on every successful
    save.
- criterion: The hook reports a load-error phase, with a typed retry action, when
    the GET fails or the identified (name, version) capability does not exist.
  met: true
  how: Both the failed-request case and the not-registered case reach the frontend
    as a non-2xx response (a 404 CapabilityIdentityNotFoundError for the latter),
    which apiFetch turns into a thrown ApiError, surfaced by react-query as query.isError
    -- both collapse onto the one load-error branch, whose retryLoad refetches both
    reads.
nodes:
- node: domain/integration/capability
  encoded_at:
  - src/hooks/use-capability-detail.ts
  how: Reads and writes the capability's full declared contract by its own (name,
    version) identity -- the useQuery/mutation both address /v1/capabilities/{name}/{version},
    and the Capability type this hook reads through already carries every one of the
    eight declared attributes; this hook adds no attribute and narrows none away.
- node: contracts/integration/capability-registry
  encoded_at:
  - src/hooks/use-capability-detail.ts
  how: Consumes the published surface's read-capability-by-identity operation (the
    GET this hook issues) and reuses register-capability (the PUT use-capability-form.ts's
    dialog already dispatches) for the save path, rather than inventing a third wire
    shape.
inferences:
- inferred: This hook also reads the glossary concept vocabulary (via useConceptOptions)
    and exposes it in the ready phase as conceptOptions, gated into the same loading/load-error
    phases as the identity GET.
  from: this task's own What it is calls this hook the data layer the new capability
    route depends on, concept is one of the fields this task's own read-first list
    points at, and this app's established convention for a routed detail hook is that
    every read a ready-phase render needs comes from that one hook rather than a second
    fetch the later screen task would otherwise add.
- inferred: This hook exposes no isEditingIdentity flag, and always treats name/version
    as belonging to an already-registered record.
  from: the task's own objective describes this hook as always loading an existing
    capability by identity, never creating one; use-connector-configuration-detail.ts
    makes the identical choice for its own identity field and does not expose such
    a flag either.
- inferred: A save that register-capability refuses is left to the mutation's own
    default onError-less settling here -- no toast, no distinguishable message --
    beyond isSubmitting returning to false.
  from: 'no criterion of this task names failure wording, and use-connector-configuration-detail.ts''s
    own header comment states the identical reasoning: showing the registry''s refusal
    to the operator is the later, separate route task''s own concern.'
preserved:
- capability-form-dialog.tsx, capability-form-fields.tsx, capabilities-browser-screen.tsx
  and use-capability-form.ts are untouched -- the existing popup create/edit dialog
  and its own hook keep behaving exactly as they did before this file existed.
- use-capabilities.ts's own capabilities list query and its shape are untouched; this
  hook only invalidates that key on a successful save, the same way use-capability-form.ts's
  own dialog already does.
deferred:
- what: No routed screen or route registration consumes this hook yet.
  why: this task's own Notes state the screen is a separate, later task (capability-detail-route);
    building it here would widen this task past the data layer it was cut to deliver.
---

## What it is

A new hook exposing one capability by (name, version) identity through a loading/load-error/ready phase union, with isDirty computed against a re-seeded baseline covering both JSON schema fields, re-baselined on every successful save.
No existing file was touched -- the popup dialog, its hook, and the list hooks stay exactly as they were.

## Notes

None.
