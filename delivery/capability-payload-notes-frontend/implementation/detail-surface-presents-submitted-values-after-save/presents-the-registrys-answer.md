---
target: frontend
title: Stop reseeding the capability detail form from the submission it just sent
summary: use-capability-detail.ts's mutation onSuccess now only invalidates the identity-keyed query; the
  pre-existing sync effect over query.data is the sole place fields and schema baselines are ever set once
  a save succeeds.
task: sha256:5ebaf98f12c138df2fe2259d7e82fb53eb906f7a4de5b46c720e9ff46412abab
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/detail-surface-and-save-tests-corrections-suite-3
files:
- path: src/hooks/use-capability-detail.ts
  effect: >-
    The mutation's onSuccess no longer calls form.reset(values), setInputSchemaBaseline(inputSchemaValue)
    or setOutputSchemaBaseline(outputSchemaValue) -- it now only issues the two invalidateQueries calls
    (["capabilities"] and ["capability", name, version]) it already issued. The now-unused (_data, values)
    parameters were dropped in favor of a zero-argument callback, since neither the mutation's response
    body nor the submitted values are read there anymore. The render-phase sync block that applies
    query.data into the form and both schema baselines, on which criteria 2-4 now depend as the sole
    writer, is re-keyed from reference-comparing query.data itself (`query.data !== syncedCapabilityData`)
    to comparing query.dataUpdatedAt (`query.dataUpdatedAt !== syncedDataUpdatedAt`) -- React Query's
    default structural sharing keeps the SAME query.data reference across a refetch whenever the newly
    fetched content is deep-equal to what was already cached, which this task's own removal of the
    submission-sourced reset makes reachable: the cache is never updated with the submission, so a
    refetch that happens to answer with content unchanged from before the edit would leave query.data's
    reference identical and the sync block would never fire, permanently stranding the edited field.
    dataUpdatedAt changes on every completed fetch regardless of structural sharing, so it detects a
    genuinely new answer even when its content is unchanged.
criteria:
- criterion: The outcome statement that the registration was made fires as soon as the registry answers
    the write, unaffected by whether a subsequent identity read has settled.
  met: true
  how: 'isSubmitSuccessful (returned as mutation.isSuccess, and consumed by use-capability-detail-view.ts''s
    justSaved -> the "Saved." status text in capability-detail-ready-view.tsx) flips the moment useMutation''s
    own PUT settles successfully. That flag was already independent of the two invalidateQueries calls and
    of whatever the identity query''s own refetch does; this task''s edit removes code from onSuccess but
    does not touch the mutation object''s isSuccess itself, so the outcome statement''s timing is unchanged.'
- criterion: After a successful save, once the invalidated identity-keyed query's own refetch has answered, every
    form field's value and both schema baselines equal that refetched answer's own attributes.
  met: true
  how: >-
    The pre-existing sync effect (the `if (query.dataUpdatedAt !== syncedDataUpdatedAt)` block) is now
    the only code path that calls form.reset or sets either schema baseline. Once invalidateQueries
    (queryKey ["capability", name, version]) causes react-query to refetch and complete -- changing
    dataUpdatedAt regardless of whether the fetched content structurally matches what was cached -- that
    effect fires and assigns every form field (name, version, nature, timeout, connector, concept,
    payload_notes) and both inputSchemaBaseline/outputSchemaBaseline from query.data's own current
    attributes, exactly as it already did for the very first load.
- criterion: Between the registry's answer to the write and that refetch answering, a field the operator
    had changed away from the prior read's content holds exactly what was submitted for it, never reverted
    and never emptied.
  met: true
  how: onSuccess no longer calls form.reset(values) or either baseline setter, so react-hook-form's own
    field state and the inputSchemaValue/outputSchemaValue local state -- both of which already held exactly
    what was submitted, since form.handleSubmit and the mutation read their values directly from them --
    are left untouched by the write's answer. Nothing sets them back to the prior read's content or to
    empty in that interval; the sync effect above is the only thing that can change them again, and it
    only fires once query.data itself changes.
- criterion: Where the refetched answer differs from the values just submitted for any attribute, the
    surface presents the refetched answer's value, not the submitted one.
  met: true
  how: The same sync effect drives every field and both baselines from query.data unconditionally on every
    change to it, with no comparison against what was submitted and no branch that prefers the submission --
    it always calls form.reset with the new query.data's own attributes and always overwrites inputSchemaValue/inputSchemaBaseline
    and outputSchemaValue/outputSchemaBaseline from it, so a refetched attribute that differs from the
    submission overwrites the submission unconditionally.
- criterion: 'A save that fails leaves the surface exactly as before this task: no field or baseline reset
    of any kind, and the existing failure presentation unchanged.'
  met: true
  how: onError is untouched -- it still only calls toast.error(saveFailureMessage(error)). The three calls
    this task removed (form.reset(values), setInputSchemaBaseline, setOutputSchemaBaseline) sat in onSuccess,
    which useMutation invokes only once the write itself resolved successfully; a failed PUT never reaches
    onSuccess at all, so removing those calls from it changes nothing about a failed save's behavior.
nodes:
- node: rules/integration/a-capability-keyed-surface-states-a-successful-registration-without-waiting-for-its-own-read
  how: Honored, not newly encoded by this task -- isSubmitSuccessful was already driven solely by mutation.isSuccess
    before this edit, independent of the identity read's own state, and this task's removal of the submission-sourced
    reset does not touch that mechanism. The UNDERDETERMINED note this task's own Notes record (whether
    the outcome statement should withdraw on a failed refetch, as opposed to a failed write) is not decided
    by this delivery; nothing in the edit changes what happens to isSubmitSuccessful if the subsequent
    read fails, because nothing here reads that read's error state at all.
- node: rules/integration/a-submitted-capability-edit-stands-in-the-fields-until-that-surfaces-own-read-answers
  how: This is the node this task's edit encodes. onSuccess no longer sets any field or either schema
    baseline from the submitted values, so a field the operator changed away from the prior read holds
    exactly what was submitted for it from the registry's answer until the surface's own subsequent identity
    read answers -- never reverted to the prior read's content, never emptied, and never set from any
    other answer, because nothing in onSuccess touches those fields or baselines anymore and the only
    other writer is the sync effect gated on query.data changing.
  encoded_at:
  - src/hooks/use-capability-detail.ts
- node: rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
  how: Honored through the pre-existing sync effect, which this task leaves logically unchanged -- every
    field and baseline it sets already comes exclusively from query.data, the identity read's own answer.
    This task's contribution is removing the one other writer (onSuccess's submission-sourced reset) that
    could otherwise have made the presentation, for the interval before the refetch lands, reflect the
    submission rather than a read's answer -- exactly the confusion this node and its neighbor refuse.
  encoded_at:
  - src/hooks/use-capability-detail.ts
- node: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
  how: >-
    Not reached for its clauses on offering the discard act, its further explicit confirmation, or
    the surfaces it is withheld from -- this task's own Notes scope those to other tasks (REMAINDER), and
    onDiscard in use-capability-detail-view.ts is untouched by this delivery. Its one clause this task's
    criteria do hold to (what a discard returns to -- the surface's own last read) is honored rather than
    newly encoded -- removing the submission-sourced reset from onSuccess is what keeps the fields and
    baselines criteria 2 and 3 govern equal to "the surface's own last read" rather than to some other,
    intervening value the earlier code was writing.
inferences:
- inferred: The sync block's change-detection is re-keyed from query.data's own reference to
    query.dataUpdatedAt.
  from: >-
    Verified by running the corrected proof suite: with reference-based detection, a refetch whose
    answer is deep-equal to what react-query already had cached (e.g. an operator's edit that the
    identity read's own answer does not confirm) left query.data's reference unchanged under React
    Query's default structuralSharing, so the sync block never fired and the edited field never
    settled -- three of this task's own proof tests, and two further pre-existing tests this task's
    change reaches, hung past their waitFor timeout on exactly this. No criterion of this task states
    the change-detection mechanism, so this is the implementation's own choice among the possible
    fixes; dataUpdatedAt is React Query's own purpose-built signal for "a fetch just completed",
    unaffected by structural sharing.
- inferred: No toast (or other new outcome-presenting control) is added to onSuccess for this surface.
  from: >-
    capability-detail-ready-view.tsx already states the outcome through the pre-existing justSaved-driven
    "Saved." status text, itself driven by isSubmitSuccessful/mutation.isSuccess, and capability-detail-screen-outcome.spec.ts's
    own sonner mock declares only toast { error: vi.fn() } for this surface -- a toast.success call
    added here would throw against that stub. The create-path hook (use-capability-form.ts) does call
    toast.success, but it is a different hook backing a different screen, and nothing in this task's criteria
    or the nodes it implements calls for a second outcome control on the detail surface.
preserved:
- The outcome statement (isSubmitSuccessful, and use-capability-detail-view.ts's justSaved / the "Saved."
  status text it drives) still fires at the registry's own answer to the write, unaffected by this task's
  change.
- onError's existing failure presentation (toast.error(saveFailureMessage(error))) is unchanged.
- The double-submit guard (isSubmittingRef) is unchanged.
- Both invalidateQueries calls onSuccess already issued (["capabilities"] and ["capability", name, version])
  still fire, unchanged, on every successful save.
- The pre-existing sync effect that reads query.data into the form and both schema baselines is logically
  unchanged; this task makes it the sole writer of those fields and baselines rather than altering what
  it does.
- use-capability-detail-view.ts's onDiscard and justSaved logic are untouched.
---
## What it is

use-capability-detail.ts's mutation onSuccess dropped its three submission-sourced writes -- form.reset(values),
setInputSchemaBaseline(inputSchemaValue) and setOutputSchemaBaseline(outputSchemaValue) -- keeping only
the two invalidateQueries calls it already made. The pre-existing sync effect that already read every
field and both schema baselines from query.data is now the only code path that ever sets them once a
save succeeds, so a field the operator changed holds exactly what was submitted until that effect fires
again over the invalidated identity query's own refetched answer.

## Notes

None.
