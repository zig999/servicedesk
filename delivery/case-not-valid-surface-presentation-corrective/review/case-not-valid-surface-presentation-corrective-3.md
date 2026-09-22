---
target: frontend
title: Case-not-valid surface presentation corrective — full review
summary: >-
  Coverage, conformance, standard and failures passes over the four delivered tasks that keep the
  version editor, manifest builder, hypothesis composition and cases listing reachable once a
  case's current version fails validation.
reviewed:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/case-version-editor-screen.tsx
  - src/routes/new-case-draft-screen.tsx
  - src/routes/case-version-editor-screen.test-support.ts
  - src/routes/case-version-editor-screen-not-valid.spec.ts
  - src/routes/case-version-editor-screen-view-released.spec.ts
  - src/routes/case-version-editor-screen-view-released-manifest-state.spec.ts
  - src/hooks/use-manifest-builder.ts
  - src/routes/version-manifest-screen.tsx
  - src/routes/version-manifest-screen.test-support.ts
  - src/routes/version-manifest-screen-not-valid.spec.ts
  - src/routes/version-manifest-screen-remove-refusal-telling.spec.ts
  - src/hooks/use-manifest-builder-unnamed-refusal-disclosure.spec.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-screen.tsx
  - src/routes/hypothesis-revision-form-fields.tsx
  - src/routes/hypothesis-revision-screen.test-support.ts
  - src/routes/hypothesis-revision-screen-case-not-valid.spec.ts
  - src/hooks/use-cases-list.ts
  - src/hooks/use-cases-list-invalid-case-isolation.spec.ts
  - src/routes/cases-list-screen.tsx
  - src/routes/cases-list-screen-invalid-case-isolation.spec.ts
tasks:
  - task/case-not-valid-surface-presentation/version-editor-states-a-version-that-does-not-read-back
  - task/case-not-valid-surface-presentation/manifest-builder-composes-a-version-that-does-not-read-back
  - task/case-not-valid-surface-presentation/hypothesis-composition-opens-for-a-version-that-does-not-read-back
  - task/case-not-valid-surface-presentation/isolate-invalid-case-from-listing
passes:
  - pass: coverage
  - pass: conformance
  - pass: standard
  - pass: failures
    missing: >-
      no run was captured for this review invocation and none of the three implementation/proof
      runs this review reaches failed, so there was nothing to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
reconciliation: siegard-reconcile/case-not-valid-surface-presentation-corrective-3.md
coverage:
  - criterion: >-
      Opening the version editor for a version whose read is refused because a validator rule of
      validation-runs-at-every-read does not hold for that version at that reading states
      explicitly that the version does not read back as a case.
    state: covered
    tests:
      - file: src/routes/case-version-editor-screen-not-valid.spec.ts
        name: >-
          CaseVersionEditorScreen — a version refused for validation states explicitly that it does
          not read back as a case
  - criterion: >-
      What that screen states for a version that does not read back as a case is distinguishable
      from what the same screen states for a read of that version that did not complete, and
      neither is presented in place of the other.
    state: covered
    tests:
      - file: src/routes/case-version-editor-screen-not-valid.spec.ts
        name: >-
          CaseVersionEditorScreen — a version refused for validation states explicitly that it does
          not read back as a case
      - file: src/routes/case-version-editor-screen-not-valid.spec.ts
        name: >-
          CaseVersionEditorScreen — a refusal carrying an error code the screen holds no
          presentation of its own for states only the read-did-not-complete statement
      - file: src/routes/version-manifest-screen-not-valid.spec.ts
        name: >-
          VersionManifestScreen — a version refused for validation states explicitly that it does
          not read back as a case
      - file: src/routes/version-manifest-screen-not-valid.spec.ts
        name: >-
          VersionManifestScreen — a refusal carrying an error code the screen holds no presentation
          of its own for states only the read-did-not-complete statement
  - criterion: >-
      The route that screen carries to that version's own manifest is offered on that same
      reading, with no read of the version having read back as a case first.
    state: covered
    tests:
      - file: src/routes/case-version-editor-screen-not-valid.spec.ts
        name: >-
          CaseVersionEditorScreen — the route to this version's own manifest on the reading refused
          for validation (criterion 3)
  - criterion: >-
      A refusal of that screen's read of the version carrying an error code the screen holds no
      presentation of its own for still presents exactly what the screen states for a read that did
      not complete, disclosing neither the error code, nor the refusal's message, nor any value the
      refusal carries.
    state: covered
    tests:
      - file: src/routes/case-version-editor-screen-not-valid.spec.ts
        name: >-
          CaseVersionEditorScreen — a refusal carrying an error code the screen holds no
          presentation of its own for states only the read-did-not-complete statement
      - file: src/routes/version-manifest-screen-not-valid.spec.ts
        name: >-
          VersionManifestScreen — a refusal carrying an error code the screen holds no presentation
          of its own for states only the read-did-not-complete statement
  - criterion: >-
      Opening the manifest builder for a version whose read is refused because a validator rule of
      validation-runs-at-every-read does not hold for that version at that reading states
      explicitly that the version does not read back as a case.
    state: covered
    tests:
      - file: src/routes/version-manifest-screen-not-valid.spec.ts
        name: >-
          VersionManifestScreen — a version refused for validation states explicitly that it does
          not read back as a case
  - criterion: >-
      On that same reading the screen offers the act of adding a hypothesis to that version's
      manifest, including for a version whose manifest currently holds no entry at all.
    state: covered
    tests:
      - file: src/routes/version-manifest-screen-not-valid.spec.ts
        name: >-
          VersionManifestScreen — the add-hypothesis act on the reading refused for validation
          (criterion 3)
      - file: src/routes/version-manifest-screen-not-valid.spec.ts
        name: >-
          VersionManifestScreen — the add-hypothesis act is offered on every reading short of one
          answering the version released
  - criterion: >-
      A refusal of a move, a repin or a remove made through that screen still presents the
      statement that screen already holds for that named refusal, unchanged by this task.
    state: partial
    tests:
      - file: src/routes/version-manifest-screen-remove-refusal-telling.spec.ts
        name: >-
          VersionManifestScreen — the manifest surface's own presentation for each composing
          refusal it names, and the generic notice for every other one
      - file: src/hooks/use-manifest-builder-unnamed-refusal-disclosure.spec.ts
        name: >-
          useManifestBuilder — a move refused for a reason this hook holds no classification of
          its own for discloses neither the refusal's own error code nor its own message
    why: >-
      A repin refusal is never exercised at all, so its already-held statement is untested. For
      the two acts that are reached (move, remove) no test asserts what either statement says —
      only that each row alert is non-empty and the two differ from each other — so a telling
      reworded into a sentence the screen never held would still pass. The implementation record
      discloses that the remove telling was in fact changed by this task (from a silent
      invalidate to a new alert), and no test distinguishes what the screen already held from
      what this task introduced.
  - criterion: >-
      Opening the New Hypothesis screen for a case's draft version whose read is refused because a
      validator rule of validation-runs-at-every-read does not hold for that draft version at that
      reading presents the hypothesis composition form.
    state: covered
    tests:
      - file: src/routes/hypothesis-revision-screen-case-not-valid.spec.ts
        name: >-
          HypothesisRevisionScreen — the composition form is presented, on both entry points, while
          the draft version's own read is refused (criterion 1, criterion 3)
  - criterion: >-
      A hypothesis composed on that screen and submitted lands in that same draft version's
      manifest, with no read of that draft version having read back as a case first.
    state: partial
    tests:
      - file: src/routes/hypothesis-revision-screen-case-not-valid.spec.ts
        name: >-
          HypothesisRevisionScreen — composing and submitting a hypothesis while the draft
          version's own read is refused for failing validation lands it through the offered
          manifest route (criterion 2)
      - file: src/routes/hypothesis-revision-screen-case-not-valid.spec.ts
        name: >-
          HypothesisRevisionScreen — a successful compose-and-submit on the refused reading leaves
          the placement into the manifest to the curator's own subsequent act (UNDERDETERMINED,
          from the specification, entry 1)
    why: >-
      The "no read of the draft version having read back first" half is exercised. The "lands in
      that same draft version's manifest" half is not: nothing in the set observes the composed
      hypothesis actually standing in that version's manifest, and the second test asserts
      affirmatively that no placement request against the manifest is ever issued — the
      implementation reads the landing as route-reachability alone, and no test tells a reachable
      route apart from an entry that never lands.
  - criterion: >-
      Opening the Revise Hypothesis screen for a case's draft version in that same condition
      presents the composition form on the same terms as the New Hypothesis screen.
    state: covered
    tests:
      - file: src/routes/hypothesis-revision-screen-case-not-valid.spec.ts
        name: >-
          HypothesisRevisionScreen — the composition form is presented, on both entry points, while
          the draft version's own read is refused (criterion 1, criterion 3)
  - criterion: >-
      A failure of that screen's read of the glossary, or of its read of the revisions, still
      presents the statement the screen makes for a read that did not complete, distinct from what
      it presents for its read of the draft version.
    state: covered
    tests:
      - file: src/routes/hypothesis-revision-screen-case-not-valid.spec.ts
        name: >-
          HypothesisRevisionScreen — a failure reading the glossary, or reading the hypothesis's
          own revisions, still presents the read-did-not-complete statement, distinct from the
          case-version statement (criterion 4)
      - file: src/routes/hypothesis-revision-screen-case-not-valid.spec.ts
        name: >-
          HypothesisRevisionScreen — the read-did-not-complete statement for a revisions read
          failure shows nothing a prior successful read of that same data left cached
          (UNDERDETERMINED, from the specification, entry 2)
  - criterion: >-
      A refusal of that screen's read of the draft version carrying an error code the screen holds
      no presentation of its own for still presents exactly what the screen states for a read that
      did not complete, disclosing neither the error code, nor the refusal's message, nor any value
      the refusal carries.
    state: covered
    tests:
      - file: src/routes/hypothesis-revision-screen-case-not-valid.spec.ts
        name: >-
          HypothesisRevisionScreen — a refusal of the draft version's own read carrying an error
          code the screen holds no presentation of its own for is presented exactly as a read that
          did not complete, disclosing nothing further (criterion 5)
  - criterion: >-
      A listing of every case, read while one case's current version fails a validator rule of
      validation-runs-at-every-read at that reading, still presents every other case's own summary,
      exactly as it would be presented were every validator rule to hold for that one case's current
      version.
    state: covered
    tests:
      - file: src/hooks/use-cases-list-invalid-case-isolation.spec.ts
        name: >-
          resolves every other case's own summary unaffected and the failing case's own entry to
          only its slug and the not-valid marker when one case's current version fails validation
      - file: src/routes/cases-list-screen-invalid-case-isolation.spec.ts
        name: >-
          renders every other case's own row unaffected and a row carrying the failing case's slug
          and the not-valid statement with no summary values, when one case's current version fails
          validation
  - criterion: >-
      That same listing still presents an entry for the case whose current version fails validation,
      carrying that case's own slug and the explicit statement that its current version does not
      read back as a case, and none of that case's summary (no current_state, version_count,
      last_updated, title, when_to_use, or released_version).
    state: covered
    tests:
      - file: src/hooks/use-cases-list-invalid-case-isolation.spec.ts
        name: >-
          resolves every other case's own summary unaffected and the failing case's own entry to
          only its slug and the not-valid marker when one case's current version fails validation
      - file: src/routes/cases-list-screen-invalid-case-isolation.spec.ts
        name: >-
          renders every other case's own row unaffected and a row carrying the failing case's slug
          and the not-valid statement with no summary values, when one case's current version fails
          validation
findings:
  - pass: conformance
    file: src/routes/case-version-editor-screen.tsx
    where: the state.phase === "not-valid" branch, the paragraph text
    evidence: >-
      <p>This case&apos;s current version does not read back as a case.</p>
    cost: >-
      This screen is reached by naming both the case's slug and a specific version number; the
      version named may not be the case's current, highest-numbered version. Telling the curator
      "the case's current version" fails to read back states a different fact than the one the
      read actually answered, and points a curator who opened an older or superseded version at
      the wrong version to correct.
    correction: >-
      State that the version named (s, n) does not read back as a case, not that the case's
      current version does not — that phrasing belongs to the case-keyed surface reached by slug
      alone, not to this surface reached by slug and version together.
  - pass: conformance
    file: src/routes/version-manifest-screen.tsx
    where: the state.phase === "not-valid" branch, the paragraph shown to the curator
    evidence: >-
      <p>This case&apos;s current version does not read back as a case.</p>
    cost: >-
      The same wording mismatch as case-version-editor-screen.tsx: this screen is also reached by
      slug together with a specific version number, and the "current version" statement is a
      different fact than the one the version-keyed read actually answered.
    correction: >-
      State that the version named (s, n) does not read back as a case, not that the case's
      current version does not.
  - pass: conformance
    file: src/hooks/use-manifest-builder.ts
    where: >-
      the case-version-not-draft branch of placeMutation.onError and of removeMutation.onError
    evidence: |-
      if (kind === "case-version-not-draft") {
        setIsBlocked(true);
        return;
      }
    cost: >-
      The governing node holds a presentation of its own for exactly two refusals of the acts
      that compose the manifest; every other refusal is meant to fall to the same generic notice.
      CaseVersionNotDraftError instead gets a third, distinct, persistent state (isBlocked, never
      reset back to false), a distinction the specification does not grant it.
    correction: >-
      Fold the case-version-not-draft outcome into the same fallthrough as every other
      unrecognised refusal, or have the specification grant this refusal a presentation of its
      own before the code gives it one.
  - pass: conformance
    file: src/hooks/use-manifest-builder.ts
    where: the repin fallback in placeMutation.onError
    evidence: |-
      if (vars.kind === "repin") {
        setRevisionError({ hypothesisName: vars.hypothesisName, message: REVISION_FAILURE_MESSAGE });
      }
      toast.error(GENERIC_FAILURE_MESSAGE);
    cost: >-
      Whenever the underlying call was a repin, an unrecognised refusal additionally sets a
      row-scoped message naming which act failed, on top of the generic toast — a third named
      presentation the specification forecloses for refusals other than the two it names.
    correction: >-
      Drop the repin-specific message for refusals other than the two the specification names, or
      have the specification grant repin failures a presentation of their own before the code
      adds one.
  - pass: conformance
    file: src/hooks/use-hypothesis-revision-form.ts
    where: >-
      the load-error phase variant and the branch that returns it
    evidence: |-
      if (isGlossaryError || isRevisionsError || (versionQuery.isError && !isVersionNotValid)) {
        return { phase: "load-error", retryLoad: () => { ... } };
      }
    cost: >-
      A curator whose glossary read failed, whose read of the hypothesis's own revisions failed,
      and whose read of the case version itself failed for an unrecognised reason all land on the
      identical load-error phase, with one shared retryLoad that refetches everything together.
      Nothing says which read is the one that did not complete.
    correction: >-
      The returned state would need to carry which read failed, so a consuming surface can state
      each apart from the other two, as the specification requires.
  - pass: conformance
    file: src/routes/hypothesis-revision-screen.tsx
    where: the load-error branch
    evidence: |-
      <p>Unable to load this form right now.</p>
    cost: >-
      Same defect as its own hook: a curator whose glossary read, revisions read, or anchoring
      case-version read failed for an unrecognised reason sees the identical text and Retry
      control, with nothing naming which read to retry.
    correction: >-
      The load-error phase would need to carry which read failed, and this branch would need to
      render a statement naming the glossary or the revisions distinctly from the statement made
      for the case version's own read not completing.
  - pass: conformance
    file: src/routes/hypothesis-revision-screen-case-not-valid.spec.ts
    where: >-
      the LOAD_ERROR_TEXT constant, asserted identically for the glossary/revisions-read failures
      and for the draft version's own read failing to complete or being refused unrecognised
    evidence: |-
      const LOAD_ERROR_TEXT = "Unable to load this form right now.";
    cost: >-
      The proof asserts the same undifferentiated statement the source renders, so it locks in
      the gap above rather than catching it.
    correction: >-
      The test would need to assert a statement worded distinctly for the anchoring version's own
      read not completing, separate from the text used for a glossary or revisions read not
      completing.
  - pass: conformance
    file: src/routes/new-case-draft-screen.tsx
    where: the isFirstVersion disclosure inside the final return block
    evidence: >-
      {state.isFirstVersion && <p>This is the case&apos;s first version.</p>}
    cost: >-
      No node in the specification authorizes a new-draft-authoring surface to disclose whether
      the draft is the case's first version, fixes when it should be shown, or states the
      wording. A later reader auditing what this screen is entitled to tell a curator will not
      find this fact in the specification.
    correction: >-
      Either record, in a specification node over domain/knowledge/case or
      domain/knowledge/case-version, that a new-draft-authoring surface discloses whether the
      draft is the case's first version, or remove the disclosure if it was never meant to be a
      specification-governed fact.
  - pass: conformance
    file: src/hooks/use-cases-list.ts
    where: "the CaseVersionState type declaration"
    evidence: |-
      export type CaseVersionState = "draft" | "released";
    cost: >-
      The two literal values are decided by the specification's own case-version-state
      enumeration; this hook (and, independently, use-case-versions.ts) each carry a private copy
      rather than deriving it from one shared declaration. If the specification's set of states
      ever changes, nothing here reads that change.
    correction: >-
      Replace the locally authored union with a single shared declaration derived from the
      specification's case-version-state enumeration, so the values are declared once.
  - pass: standard
    file: src/hooks/use-cases-list.ts
    where: "export type CaseSummary"
    evidence: |-
      readonly versionCount: number;
      readonly currentState?: CaseVersionState;
      readonly lastUpdated?: string;
      readonly title?: string;
      readonly whenToUse?: string;
      readonly releasedVersion?: number;
    cost: >-
      fetchCaseListEntry only ever produces three correlated shapes, but CaseSummary types this
      as six independent optionals. Nothing stops a caller from constructing a combination this
      listing's own logic never produces, and the compiler cannot refuse it.
    correction: >-
      Model CaseSummary as a discriminated union over the three actual shapes instead of six
      independent optional fields.
    cites: TYP-04
  - pass: standard
    file: src/hooks/use-edit-draft-version-form.ts
    where: "EditDraftVersionFormState's \"ready\" variant"
    evidence: |-
      readonly release?: ReleaseControlState;
      readonly discard?: DiscardControlState;
      readonly isFirstVersion?: boolean;
      readonly isReadOnly?: boolean;
      readonly manifest?: readonly CaseVersionManifestEntry[];
    cost: >-
      The single "ready" variant bundles two mutually exclusive screens' fields as optionals on
      one shape; nothing stops a future change from returning isFirstVersion alongside
      release/discard/manifest — a combination describing a version both already created and not
      yet created — and the type gives no compiler signal that this cannot happen.
    correction: >-
      Split the "ready" variant into two shapes — one carrying release/discard/manifest/isReadOnly
      for editing an existing version, one carrying isFirstVersion for a version not yet created.
    cites: TYP-04
  - pass: standard
    file: src/routes/cases-list-screen.tsx
    where: "const casesQuery = useCasesList(); and the isPending/isError branches"
    evidence: |-
      const casesQuery = useCasesList();
      if (casesQuery.isPending) {
        return <p>Loading cases…</p>;
      }
    cost: >-
      Each row is an independently browsable case, yet the whole table's render is gated on one
      query object; any failure on one case's read rejects the whole query and blanks every row,
      including ones that already resolved.
    correction: >-
      Fetch each case's own summary as its own query so one case's slow or failing read no longer
      gates the render of the others.
    cites: PRF-04
  - pass: standard
    file: src/routes/hypothesis-revision-screen.tsx
    where: "the \"success\" phase branch"
    evidence: |-
      {state.phase === "success" && (
        <p>Hypothesis &quot;{state.hypothesisName}&quot; saved as revision {state.revision}.</p>
      )}
    cost: >-
      On a successful submit the whole screen silently swaps from the composition form to this
      confirmation sentence, with no aria-live region and no focus moved to the new content; a
      screen-reader user gets no signal that the submission succeeded.
    correction: >-
      Wrap the confirmation paragraph in an aria-live region, or move focus to it, when the phase
      becomes "success".
    cites: ACC-07
---

## What it is
The full `/review-change` pass over the case-not-valid-surface-presentation-corrective initiative's four delivered tasks: coverage (16 criteria across the three not-valid tasks), conformance (22 files, 33 delegations folded into `siegard-reconcile/case-not-valid-surface-presentation-corrective-3.md`, 40 node-bindings written), the project's frontend-typescript standard, and failures (not run — nothing captured failed).

## Notes
Two tests from a closed, archived initiative (`case-version-editor-screen-view-released.spec.ts`, `case-version-editor-screen-view-released-manifest-state.spec.ts`) were edited directly, outside the formal task route, per explicit user authorization: they asserted `screen.queryByText("Manifest")` and had come to contradict the newly widened Manifest link, which is now also reachable as a link rather than only a heading; the formal corrective-increment route in `/plan-work` refused because `trace.py --encodes` does not bind test files. This review's own `reviewed` list includes them for completeness but the conformance pass found nothing against either.

The conformance pass surfaced one real, recurring defect: the "does not read back as a case" statement uses case-keyed wording ("the case's current version") on two version-keyed surfaces (`case-version-editor-screen.tsx`, `version-manifest-screen.tsx`) that are reached by slug together with a specific version number, not by slug alone — a curator viewing an older version who hits this branch is told the wrong thing. It also surfaced that `use-hypothesis-revision-form.ts` and `hypothesis-revision-screen.tsx` fold three distinct incomplete-read cases (glossary, revisions, case-version-unrecognised) into one undifferentiated `load-error` statement, which the task's own Notes already flagged as an accepted UNDERDETERMINED gap for criterion 4's narrower reading — but the specification's fuller node still states the three should be told apart, so this stands as a real, if previously disclosed, gap rather than a surprise. `use-manifest-builder.ts` grants two refusals (`CaseVersionNotDraftError`, an unrecognised repin) presentations the naming node does not authorize. `new-case-draft-screen.tsx` discloses whether a draft is the case's first version, a fact no specification node states. `use-cases-list.ts` duplicates the case-version-state enumeration locally rather than deriving it.

Coverage found two `partial` criteria, both already disclosed by the delivering tasks' own Notes as UNDERDETERMINED: the manifest surface's already-held refusal statements are asserted non-empty and mutually distinct but never checked against their actual wording, and a repin refusal is never exercised at all; and a submitted hypothesis's "landing" in the manifest is proven only as route-reachability, never as the entry actually standing in the manifest — the pre-existing, explicitly out-of-scope gap that no UI control lets a curator place an already-composed hypothesis revision remains open.

The standard pass found four findings, none blocking: two TYP-04 (a hand-typed union duplicating a derivable enumeration; a "ready" state shape wide enough to describe a version both created and not-yet-created), one PRF-04 (the cases list gates every row's render on one shared query), one ACC-07 (a successful hypothesis submission swaps content with no aria-live announcement).

No verdict is computed here. What to do with each finding — fix now, defer, or accept — is the human's.
