---
title: Review of hypothesis-revision-editable-until-published (frontend)
summary: Four-pass evidence over the two delivered tasks of the epic hypothesis-revision-repin-affordance — coverage, specification conformance (via reconciliation), standard conformance, and a captured run that passed cleanly.
reviewed:
  - src/hooks/use-hypothesis-revision-form-pinned-revision.spec.ts
  - src/hooks/use-hypothesis-revision-form-repin-offer.spec.ts
  - src/hooks/use-hypothesis-revision-form.test-support.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/case-simulation-case-result-panel.tsx
  - src/routes/hypothesis-revision-screen-repin-offer.spec.ts
  - src/routes/hypothesis-revision-screen.tsx
tasks:
  - task/hypothesis-revision-repin-affordance/pinned-revision-in-hand-before-a-save
  - task/hypothesis-revision-repin-affordance/repin-offered-only-when-the-pin-fell-behind
passes:
  - pass: coverage
  - pass: conformance
  - pass: standard
  - pass: failures
    missing: the captured run passed every step; there was no failure to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
reconciliation: siegard-reconcile/hypothesis-revision-editable-until-published-frontend.md
coverage:
  - criterion: With a draft case version whose manifest entry for the hypothesis being revised pins revision 2, the form reports 2 as that hypothesis's pinned revision.
    state: covered
    tests:
      - file: src/hooks/use-hypothesis-revision-form-pinned-revision.spec.ts
        name: "useHypothesisRevisionForm — the draft's pinned revision for the hypothesis being revised (criterion 1) > reports the revision number the draft's own manifest entry pins for that hypothesis"
    why: The manifest fixture carries a second entry (H2 pinned at 5) alongside H1 pinned at 2, so the assertion fails if the form reports any manifest entry other than the revised hypothesis's own.
  - criterion: Where the hypothesis being revised has no entry in that draft case version's manifest, the form reports no pinned revision for it rather than a number.
    state: covered
    tests:
      - file: src/hooks/use-hypothesis-revision-form-pinned-revision.spec.ts
        name: "useHypothesisRevisionForm — no manifest entry for the hypothesis being revised (criterion 2) > reports null rather than a number when the manifest holds entries for other hypotheses only"
      - file: src/hooks/use-hypothesis-revision-form-pinned-revision.spec.ts
        name: "useHypothesisRevisionForm — no manifest entry for the hypothesis being revised (criterion 2) > also reports null when the draft's manifest holds no entries at all"
  - criterion: Where the screen is opened for a hypothesis identity that does not exist yet, the form reports no pinned revision.
    state: partial
    tests:
      - file: src/hooks/use-hypothesis-revision-form-pinned-revision.spec.ts
        name: "useHypothesisRevisionForm — a hypothesis identity that does not exist yet (criterion 3) > reports no pinned revision when opened for a hypothesis not yet created"
    why: The only case exercised is the hook called with a null hypothesis identity — the screen opened with no name at all — against a manifest that pins H1 at 2. "Opened for a hypothesis identity that does not exist yet" also reads as the screen opened on a named hypothesis that has no revisions yet, and nothing in the set opens it on such a name; which of the two readings the criterion states is not settled here.
  - criterion: Where the draft's manifest entry pins a revision number that the answered page of that hypothesis's revisions does not carry, the form still reports that pinned revision number.
    state: covered
    tests:
      - file: src/hooks/use-hypothesis-revision-form-pinned-revision.spec.ts
        name: "useHypothesisRevisionForm — a pin the answered revisions page does not carry (criterion 4) > still reports the manifest's own pinned number even though the paged revisions list never carries it"
    why: The pin (9) is disjoint from the answered page ([1, 2, 3]), so the assertion fails if the form derives the pin from the revisions page or clamps it to a number the page carries.
  - criterion: Opening the screen requests no path it does not request today.
    state: covered
    tests:
      - file: src/hooks/use-hypothesis-revision-form-pinned-revision.spec.ts
        name: "useHypothesisRevisionForm — no path beyond what opening the screen already requested (criterion 5) > computes the pinned revision from the same request set the screen already issues, requesting nothing further"
    why: The set equality is over GET requests issued by the hook only, and the count assertion pins only the case-version path to one call; a request the screen component itself issues outside the hook, or one issued by a non-GET method, would not fail this test. The asserted list also fixes the four glossary paths, which no criterion of this task names.
  - criterion: Where the case-version read fails, the form reports its existing load-error state rather than any state carrying a pinned revision.
    state: covered
    tests:
      - file: src/hooks/use-hypothesis-revision-form-pinned-revision.spec.ts
        name: "useHypothesisRevisionForm — the case-version read failing (criterion 6) > reports the load-error phase, carrying no pinned revision, rather than any state carrying one"
  - criterion: After a save answering the same revision number the draft's manifest entry pinned going into it, the screen offers no manifest-builder step.
    state: covered
    tests:
      - file: src/routes/hypothesis-revision-screen-repin-offer.spec.ts
        name: "a save that answers the same revision the draft's manifest entry already pinned (criterion 1) > offers no manifest-builder step"
      - file: src/hooks/use-hypothesis-revision-form-repin-offer.spec.ts
        name: "the pin compared against a save's answer is the one held immediately before that save, not one re-read when the save completes > still reports no manifest-builder offer for a same-revision save even though the draft's own manifest entry has since moved to a lower pin while that save was still in flight"
  - criterion: After a save answering the same revision number the draft's manifest entry pinned going into it, the screen still states that the hypothesis was saved as that revision number.
    state: covered
    tests:
      - file: src/routes/hypothesis-revision-screen-repin-offer.spec.ts
        name: "a save that answers the same revision the draft's manifest entry already pinned (criterion 2) > still states the hypothesis was saved as that revision number"
  - criterion: After a save answering a revision number higher than the one the draft's manifest entry pinned going into it, the screen offers the manifest-builder step.
    state: covered
    tests:
      - file: src/routes/hypothesis-revision-screen-repin-offer.spec.ts
        name: "a save that answers a revision higher than the one the draft's manifest entry pinned (criteria 3 and 7) > offers the manifest-builder step even though the save's response carries no field distinguishing an overwrite from a created revision"
      - file: src/routes/hypothesis-revision-screen-repin-offer.spec.ts
        name: "a save that answers a revision higher than the one the draft's manifest entry pinned (the saved revision number is stated in this branch too) > states the saved revision number after a save that moved the pin forward, not only after one that left it in place"
  - criterion: Activating the offered step navigates to the manifest of the draft case version the screen was opened on, at the same route it navigates to today.
    state: covered
    tests:
      - file: src/routes/hypothesis-revision-screen-repin-offer.spec.ts
        name: "activating the offered manifest-builder step (criterion 4) > navigates to the manifest of the draft case version the screen was opened on"
    why: The route shape itself is fixed by the MANIFEST_PATH constant in the shared test-support module rather than derived from the router's own route definitions.
  - criterion: After a save of a hypothesis that had no entry in the draft case version's manifest, the screen offers the manifest-builder step.
    state: covered
    tests:
      - file: src/routes/hypothesis-revision-screen-repin-offer.spec.ts
        name: "a save of a hypothesis that had no entry in the draft's manifest (criterion 5) > offers the manifest-builder step"
    why: The case exercised is the new-hypothesis route over an empty manifest; a hypothesis absent from a manifest that holds entries for other hypotheses is exercised for the pinned-revision read but not for the offer decision.
  - criterion: Three successive saves that each answer the revision number the draft's manifest entry pins leave the screen offering no manifest-builder step after each of them.
    state: partial
    tests:
      - file: src/routes/hypothesis-revision-screen-repin-offer.spec.ts
        name: "three successive saves of the same hypothesis that each answer the revision its manifest entry already pins (criterion 6) > leaves the screen offering no manifest-builder step after save number 1"
      - file: src/routes/hypothesis-revision-screen-repin-offer.spec.ts
        name: "three successive saves of the same hypothesis that each answer the revision its manifest entry already pins (criterion 6) > leaves the screen offering no manifest-builder step after save number 2"
      - file: src/routes/hypothesis-revision-screen-repin-offer.spec.ts
        name: "three successive saves of the same hypothesis that each answer the revision its manifest entry already pins (criterion 6) > leaves the screen offering no manifest-builder step after save number 3"
    why: The succession is unexercised. Each of the three loop iterations mounts a fresh screen and performs one save, so all three bodies are the same single-save scenario as the criterion-1 test; no test in the set performs a second or third save on a screen that has already saved, which is what "successive" and "after each of them" name.
  - criterion: The screen decides the offer from the two revision numbers alone, and offers the step where the answered revision is higher even though the save's answer carries no field distinguishing an overwrite from a created revision.
    state: partial
    tests:
      - file: src/routes/hypothesis-revision-screen-repin-offer.spec.ts
        name: "a save that answers a revision higher than the one the draft's manifest entry pinned (criteria 3 and 7) > offers the manifest-builder step even though the save's response carries no field distinguishing an overwrite from a created revision"
      - file: src/routes/hypothesis-revision-screen-repin-offer.spec.ts
        name: "a save that answers the same revision the draft's manifest entry already pinned (criterion 1) > offers no manifest-builder step"
      - file: src/hooks/use-hypothesis-revision-form-repin-offer.spec.ts
        name: "the pin compared against a save's answer is the one held immediately before that save, not one re-read when the save completes > still reports no manifest-builder offer for a same-revision save even though the draft's own manifest entry has since moved to a lower pin while that save was still in flight"
    why: The second half is exercised — the save response carries only hypothesis_name and revision, and the offer still appears. The "from the two revision numbers alone" half is only exercised by the absence of any other field in the fixtures; no test supplies a distinguishing field and asserts the offer ignores it, and no test answers a revision lower than the pin.
findings:
  - pass: conformance
    file: src/routes/case-simulation-case-result-panel.tsx
    where: "the unconditional Outcome/Referral rendering, e.g. `Outcome {lastRun.outcome} · Referral {lastRun.referral.action} /{\" \"}`"
    evidence: "every rendered run is read for an outcome and a referral unconditionally, so this file has no branch representing a hypothesis-only simulation that resolves neither"
    cost: scenarios/investigation/a-single-hypothesis-is-simulated is not surfaced by any code this reviewed file set holds — a reader looking for where a single-hypothesis (non-case) simulation's own result is rendered will not find a distinct branch here
  - pass: standard
    file: src/routes/case-simulation-case-result-panel.tsx
    where: "lines 24-26, the empty-runs guard at the top of the component"
    cites: API-04
    evidence: |-
      if (runs.length === 0) {
        return null;
      }
    cost: "When a case has produced zero runs the whole \"Case result\" section vanishes rather than showing an explicit empty state, so a user cannot tell \"no runs yet\" apart from the section simply not having rendered yet or being broken."
    correction: Render an explicit empty-state message inside the section instead of returning null when runs.length === 0.
  - pass: standard
    file: src/routes/case-simulation-case-result-panel.tsx
    where: "lines 52-58, the customer-facing text block"
    cites: ARC-03
    evidence: |-
      {lastRun.text.split(/\n{2,}/).map((paragraph) => (
                  <p key={paragraph} className="whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
    cost: The paragraph-splitting transformation of the fetched run text is written inline in JSX rather than in the sibling case-simulation-case-result-types module this same file already imports formatRunTime, resolveCompareRuns and toggleCompareSelection from, so it can only be exercised by rendering the whole panel, and a second screen needing the same split re-derives the regex.
    correction: Extract the split into a named function (e.g. alongside formatRunTime in case-simulation-case-result-types.ts) and call it here.
  - pass: standard
    file: src/routes/case-simulation-case-result-panel.tsx
    where: "line 85, the compare section revealed after clicking Compare"
    cites: ACC-07
    evidence: "{compareOpen && compareRuns && <CaseSimulationCaseResultCompare runs={compareRuns} />}"
    cost: Clicking Compare inserts a whole new comparison section into the page with no page navigation, no aria-live region and no focus moved to it; a screen-reader user who activated the button has no way to notice that new content appeared.
    correction: Wrap the revealed section in an aria-live region, or move focus to it when compareOpen becomes true.
  - pass: standard
    file: src/routes/hypothesis-revision-screen.tsx
    where: "lines 35-49, the success-phase render branch"
    cites: ACC-07
    evidence: |-
      if (state.phase === "success") {
        return (
          <section>
            <p>
              Hypothesis "{state.hypothesisName}" saved as revision {state.revision}.
    cost: On a successful save the entire form is silently swapped for a confirmation message with no navigation, no aria-live announcement and no focus management; a screen-reader user who just submitted has no way to learn the save succeeded or what revision it was saved as.
    correction: Announce the confirmation through an aria-live region, or move focus to the confirmation message when the phase becomes "success".
---
## What it is
Four-pass evidence over the two tasks of epic hypothesis-revision-repin-affordance: the hypothesis-editing form's own read of the draft manifest's pinned revision, and the success surface's conditional offer to reach the manifest builder only where a save moved that pin.

## Notes
The captured run over this delivery executed install, typecheck, lint, style, build, a11y, secret-scan and test once and every step passed, which is why the failures pass carries no findings and is recorded as not run: a run with nothing to diagnose is the one case that pass does not enter.
The conformance pass ran through `trace.py --stage --review` and its return is folded into siegard-reconcile/hypothesis-revision-editable-until-published-frontend.md: 22 node bindings cleared and were restamped by `trace.py --bind-record`; 1 (scenarios/investigation/a-single-hypothesis-is-simulated) did not clear and is carried here as a finding. That finding is pre-existing: case-simulation-case-result-panel.tsx's only change under this delivery was keying its rendered paragraphs by text instead of array index (a direct edit, frontend being edits_freely), and the file's outcome/referral rendering was already unconditional before this delivery touched it.
Coverage reports three partial criteria. Two share one shape with the backend review's own partial criteria — a read-back or an assertion checks less than the criterion's full breadth (which of two readings "a hypothesis identity that does not exist yet" states; the three-successive-saves criterion is exercised as three independent single saves, never a second save issued from an already-saved screen). The third (the offer decided from the two numbers alone) is exercised on its negative half only through the absence of a distinguishing field in the fixtures, not through a fixture that supplies one and asserts it is ignored.
The standard pass's four findings are all new: three ACC-07/API-04 accessibility gaps (no `aria-live` or focus management on the two silent state-swaps this delivery reads over, plus a pre-existing empty-state gap the whole-tree lint step reached) and one ARC-03 maintainability gap (the paragraph-split transformation written inline in JSX instead of the sibling types module this same file already draws helpers from). None of the four standard findings sit on either task's own new code — `use-hypothesis-revision-form.ts` and `use-hypothesis-revision-form-repin-offer.spec.ts`/`use-hypothesis-revision-form-pinned-revision.spec.ts` read cleanly against every rule in scope — they land on the two screens the tasks' new state (`offerManifestBuilder`, `pinnedRevision`) is rendered through, and on the file touched only for its own pre-existing lint fix.
