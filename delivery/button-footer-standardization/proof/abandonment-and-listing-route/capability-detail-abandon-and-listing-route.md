---
title: Capability detail surface's return-to-origin and listing-route split, across every reading
summary: New tests prove the return act's origin-aware landing, the unconditional listing route, their presence and side-effect-freedom across all four readings including the new nothing-registered reading, and the reattempt's exclusivity to the failed reading; five pre-existing specs the split falsified are corrected in place, four owned by earlier tasks of this plan and the fifth owned by no record at all.
implementation: sha256:1eac85ec153e8801879fbcb76ec948f275b34d6bc7527ce666fb342e755d2b98
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/abandonment-and-listing-route-four-surfaces-suite-2
tests:
- file: src/routes/capability-detail-screen-cancel.spec.ts
  name: renders Cancel as a button distinct from Discard, alongside a separate Capabilities link addressed at the listing
  proves: Correction of a test the split falsified — the return act is no longer the link addressed at the listing; a separate link carries that destination. Proves criterion 9's control-distinctness half and the disclosed inference that both controls keep the sibling surface's own labels.
  fails_when: The return act stops rendering as a button distinct from the field-restoring control, or the separate listing link disappears or stops addressing the listing.
- file: src/routes/capability-detail-screen-cancel.spec.ts
  name: navigates to the capabilities listing when Cancel is clicked while an edit is pending, issuing no PUT
  proves: Criterion 3 and the no-register half of criterion 9, corrected only in which role the control now renders as.
  fails_when: Taking the control no longer lands the router on the listing, or a register call is issued.
- file: src/routes/capability-detail-screen-route.spec.ts
  name: renders a Capabilities route to the listing while the capability read is still pending -- an implementation withholding the route here would fail this
  proves: Criterion 10 in the outstanding-read reading, corrected from asserting this of the control that no longer carries this destination to the control that actually does.
  fails_when: The listing link is absent, or does not address the listing, while the read is outstanding.
- file: src/routes/capability-detail-screen.spec.ts
  name: navigates back to the capabilities list when Cancel is clicked
  proves: Criterion 2's ready-reading case, corrected only in which role the control now renders as.
  fails_when: Taking the control no longer navigates to the listing from the ready reading.
- file: src/routes/capability-detail-screen.spec.ts
  name: 'keeps a Capabilities route to the listing available when the load fails (edge case: a dependency that fails)'
  proves: Criterion 10 for the failed-read reading, corrected from asserting the listing destination of the pre-split control to the one that actually carries it.
  fails_when: The listing link is absent, or stops addressing the listing, once the load fails.
- file: src/routes/capability-detail-screen.spec.ts
  name: withholds Retry and keeps Cancel and Capabilities available when the read fails because the identity itself is unregistered -- an implementation rendering this as the failed-read reading would fail this
  proves: 'Criteria 7, 10 and 15 for the nothing-registered reading, corrected from the earlier task''s own permitted-but-not-required rendering, identical to the failed reading with the reattempt included, to what this task''s criteria 14 and 15 force: a reading carrying both acts and no reattempt.'
  fails_when: A reattempt control renders in this reading, or either of the two owed controls is absent from it.
- file: src/hooks/use-capability-detail-load-error.spec.ts
  name: reports the not-registered phase, with no retryLoad exposed, when the identified (name, version) capability does not exist
  proves: Criteria 7 and 15 at the hook level, corrected from asserting the pre-split failed phase to the delivered nothing-registered phase, which carries the return act and no reattempt.
  fails_when: The hook reports the failed phase instead for this identity, or the returned state carries a reattempt, or the return act is not exposed.
- file: src/routes/capability-form-fields-action-footer.spec.ts
  name: renders the detail surface's own Discard and Cancel controls beside Save, inside the same Actions group
  proves: Correction of a shared-component test owned by an earlier task of this plan, whose return-act assertion the split falsified by pinning the link role. Corrected to query the control by whichever role it renders as, matching the role-agnostic pattern the create-surface case in this same file already uses, so the assertion holds what the owning criterion establishes without pinning a role the specification leaves to the interface.
  fails_when: Neither a button nor a link of that name is found beside Save inside the Actions group, or the Save or field-restoring controls stop rendering there.
- file: src/routes/capability-detail-screen-return-to-origin.spec.ts
  name: returns to the surface the detail screen was reached from, rather than the capabilities listing, and issues no register-capability call
  proves: Criterion 1 and the origin-destination half of criterion 9, and the disclosed inference that the act's shape is a guarded history walk taken from the sibling surface's own act.
  fails_when: Taking the control from a detail screen reached from an existing origin lands anywhere but that origin, or issues a register call.
- file: src/routes/capability-detail-screen-return-to-origin.spec.ts
  name: lands on the capabilities listing from the outstanding-read reading
  proves: Criterion 2 for the outstanding-read reading, and the listing-destination half of criterion 9 for it.
  fails_when: Taking the control with no back-history from that reading fails to land on the listing, or issues a register call.
- file: src/routes/capability-detail-screen-return-to-origin.spec.ts
  name: lands on the capabilities listing from the failed-read reading
  proves: Criterion 2 for the failed-read reading, and the listing-destination half of criterion 9 for it.
  fails_when: Taking the control with no back-history from that reading fails to land on the listing, or issues a register call.
- file: src/routes/capability-detail-screen-return-to-origin.spec.ts
  name: lands on the capabilities listing from the nothing-registered reading
  proves: Criterion 2 for the nothing-registered reading, and the listing-destination half of criterion 9 for it.
  fails_when: Taking the control with no back-history from that reading fails to land on the listing, or issues a register call.
- file: src/routes/capability-detail-screen-return-to-origin.spec.ts
  name: lands on the capabilities listing from the ready reading
  proves: Criterion 2 for the ready reading, and the listing-destination half of criterion 9 for it.
  fails_when: Taking the control with no back-history from that reading fails to land on the listing, or issues a register call.
- file: src/routes/capability-detail-screen-return-to-origin.spec.ts
  name: lands on the capabilities listing from the ready reading even once a field has been edited away from what the read answered
  proves: Criterion 3, and the disclosed inference that the act's destination does not depend on the form's dirty state.
  fails_when: Taking the control with an edited field and no reached-from surface lands anywhere but the listing, or issues a register call.
- file: src/routes/capability-detail-screen-return-to-origin.spec.ts
  name: renders while the read is outstanding
  proves: Criterion 4.
  fails_when: The return act is absent from the Actions footer while the read is outstanding.
- file: src/routes/capability-detail-screen-return-to-origin.spec.ts
  name: renders once the read has failed
  proves: Criterion 5.
  fails_when: The return act is absent from the Actions footer once the read has failed.
- file: src/routes/capability-detail-screen-return-to-origin.spec.ts
  name: renders once the capability has been read and is shown
  proves: Criterion 6.
  fails_when: The return act is absent from the Actions footer in the ready reading.
- file: src/routes/capability-detail-screen-return-to-origin.spec.ts
  name: renders where the read answered that no capability is registered at that name and version
  proves: Criterion 7.
  fails_when: The return act is absent from the Actions footer in the nothing-registered reading.
- file: src/routes/capability-detail-screen-listing-control.spec.ts
  name: renders while the read is outstanding
  proves: Criterion 10 for the outstanding-read reading.
  fails_when: The listing link is absent, or does not address the listing, while the read is outstanding.
- file: src/routes/capability-detail-screen-listing-control.spec.ts
  name: renders once the read has failed
  proves: Criterion 10 for the failed-read reading.
  fails_when: The listing link is absent, or does not address the listing, once the read has failed.
- file: src/routes/capability-detail-screen-listing-control.spec.ts
  name: renders once the capability has been read and is shown
  proves: Criterion 10 for the ready reading.
  fails_when: The listing link is absent, or does not address the listing, in the ready reading.
- file: src/routes/capability-detail-screen-listing-control.spec.ts
  name: renders where the read answered that no capability is registered at that name and version
  proves: Criterion 10 for the nothing-registered reading.
  fails_when: The listing link is absent, or does not address the listing, in that reading.
- file: src/routes/capability-detail-screen-listing-control.spec.ts
  name: issues no PUT when the Capabilities link is clicked from the ready reading
  proves: Criterion 11.
  fails_when: Taking the listing link issues a register call.
- file: src/routes/capability-detail-screen-origin-independence.spec.ts
  name: renders both controls when reached from one surface that is not the capabilities listing
  proves: Criterion 8, first origin.
  fails_when: Either control is absent when the detail screen is reached from this origin.
- file: src/routes/capability-detail-screen-origin-independence.spec.ts
  name: renders both controls when reached from a different surface that is not the capabilities listing
  proves: Criterion 8, second, differing origin.
  fails_when: Either control is absent when the detail screen is reached from this second origin.
- file: src/routes/capability-detail-screen-origin-independence.spec.ts
  name: renders both controls when reached from the capabilities listing itself
  proves: Criterion 8, the listing named explicitly as a possible origin.
  fails_when: Either control is absent when the detail screen is reached from the listing itself.
- file: src/routes/capability-detail-screen-not-registered-reading.spec.ts
  name: renders no Discard control in the nothing-registered reading
  proves: Criterion 18 for the nothing-registered reading — the one reading this criterion reaches that no pre-existing test covered, since the reading did not exist before this task.
  fails_when: A field-restoring control renders in the nothing-registered reading.
- file: src/routes/capability-detail-screen-reattempt-exclusivity.spec.ts
  name: renders no Retry control while the read is still outstanding
  proves: Criterion 15's exclusivity half for the outstanding-read reading.
  fails_when: A reattempt control renders while the read is outstanding.
- file: src/routes/capability-detail-screen-reattempt-exclusivity.spec.ts
  name: renders no Retry control once the capability has been read and is shown
  proves: Criterion 15's exclusivity half for the ready reading.
  fails_when: A reattempt control renders in the ready reading.
- file: src/routes/capability-detail-screen-reading-distinctness.spec.ts
  name: shows only the outstanding-read text, naming this capability's own name and version, while the read is pending
  proves: Criterion 17 for the outstanding-read reading, and criterion 12's own wording, naming this capability's name and version.
  fails_when: The outstanding-read text does not name this capability's own name and version, or either of the other two readings' distinguishing content also appears.
- file: src/routes/capability-detail-screen-reading-distinctness.spec.ts
  name: shows only the failed-read text once the read fails, neither the outstanding-read text nor the loaded form
  proves: Criterion 17 for the failed-read reading, and criterion 14's own wording — that this reading states the capability could not be read.
  fails_when: The failed-read text is absent or altered, or either of the other two readings' distinguishing content also appears.
- file: src/routes/capability-detail-screen-reading-distinctness.spec.ts
  name: shows only the loaded form once the capability is read and shown, neither the outstanding-read text nor the failed-read text
  proves: Criterion 17 for the ready reading.
  fails_when: The ready heading is absent, or either of the other two readings' distinguishing content also appears.
- file: src/routes/capability-detail-screen-preready-fields-withheld.spec.ts
  name: presents no capability field while the read is outstanding
  proves: Criterion 13 for the outstanding-read reading.
  fails_when: Any of the nature, input schema, output schema, timeout, connector or concept fields renders while the read is outstanding.
- file: src/routes/capability-detail-screen-preready-fields-withheld.spec.ts
  name: presents no capability field once the read has failed
  proves: Criterion 13 for the failed-read reading.
  fails_when: Any of those same fields renders once the read has failed.
not_applicable:
- edge_case: Two operations against one subject at once — a register-capability submission racing the return act
  why: No criterion addresses simultaneity between the save mutation and either control; the mutation flow itself is unchanged by this task, per the implementation's own preserved list, and belongs to the work that owns it.
- edge_case: An operation against a state that forbids it
  why: Every criterion requires both controls to render unconditionally across all four readings; the task states no reading or state in which either is refused, so there is no forbidden-state case for these two acts to exercise.
- edge_case: An empty collection, a duplicate, or a boundary of a range
  why: Neither act reads or writes a collection, a range or a uniqueness constraint; both are pure navigation over a single named capability.
untested:
- Criterion 16 — the surface reissues the read only where the operator takes the reattempt, never on its own initiative — has no test in this proof. The implementation's own record marks that behaviour unchanged from before this task, and no test in the existing suite asserts the negative. It is a pre-existing gap this task's criteria restate rather than a behaviour this delivery changed.
- 'The nothing-registered reading''s own wording is not tested for being right or wrong, only for existing: no node states what that reading should say, the decision log records the silence as noticed and not decided, and asserting the wording would pin a fact no node holds. This is the same silence the implementation''s own divergence names.'
contested:
- what: The nothing-registered reading states that the capability could not be read — wording that says the read failed — on a reading where the read in fact succeeded and answered that nothing is registered at that name and version.
  why: This reads as potentially misleading to an operator, who is told a read failure occurred when the registry gave a definite negative answer. No node settles it, so it is recorded as a disagreement rather than fixed by a test that would pin a fact no node holds — the same asymmetry the implementation's own divergence discloses against the connector surface's own node.
---

## What it is
Thirty-four tests over the split and over the fourth reading it introduced: the return act's two destinations across all four readings, the listing route across all four, origin-independence over three origins including the listing itself, the reattempt's exclusivity, the three named readings' mutual distinctness, and the withholding of every capability field before the read answers.

## Notes
The run this record points at is shared with the three sibling proofs of this epic, and that is the only honest option rather than a convenience.
The four surfaces' specs are mutually entangled — the two shared form-fields specs each carry a create-surface case and a detail-surface case, and each surface's split falsified assertions in files the others also touch — so no per-task suite run could have been green while any of the other three surfaces' specs still stood against the pre-split form.
One run over all four, after all four sets of tests existed, is what actually validates each of them.

Files earlier tasks of this plan own were corrected by this proof, which is not the route the framework offers.
That route is a proof-only re-delivery over the owning task, and it was attempted: its own precondition requires the owning task's implementation not to have moved, and later tasks of this plan had already rewritten those files, so the mode refused for every one of the four owning tasks.
The caller was told this twice — once as a stop that ended a delivery without a proof, and once when the guard refused — and chose to have each surface's own test author correct the assertions on its own surface instead.
Every test touched is named in `tests` above, so the diff and this record say the same thing.

Five specs were corrected, and one of the five is different in kind: `src/hooks/use-capability-detail-load-error.spec.ts` is named by no record this framework holds.
Nothing delivered it, which on a target the project declares freely edited means a person most likely wrote it outside any task — so unlike the other four it had no owning proof for a re-delivery to have run over even had the guard allowed one.
The `contested` entry above is this proof's author disagreeing with the implementation, and it stands unresolved on purpose: settling it here would let one producer overrule the other where nobody would see it, and what it disagrees about is a fact no node holds.
