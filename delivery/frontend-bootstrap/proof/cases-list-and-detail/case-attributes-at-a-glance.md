---
title: Case attributes at a glance, proof
summary: Tests proving Case Detail's new Attributes view -- its current-version resolution, its one state-sensitive
  action, its explicit case-not-valid state, and the tab-strip and route-schema wiring that carry it --
  against the implementation record for task/cases-list-and-detail/case-attributes-at-a-glance.
implementation: sha256:817ed4419ad4e9ce1f8e908106779bd9882a1dec314830fd78e40c309ba06798
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/cases-list-and-detail-case-attributes-at-a-glance-suite-2
tests:
- file: src/hooks/use-case-attributes-at-a-glance.spec.ts
  name: resolves to the case's own draft version even when a released version numbered higher than it
    also exists, never to the plain highest-numbered item
  proves: The current version resolved for that view is the case's own draft version when it holds one,
    otherwise its latest released version.
  fails_when: the hook resolves `current` to the highest-numbered item regardless of draft state (e.g.
    picks version 5, released) instead of the draft (version 2), or returns a version/versionState/record
    not matching the draft's own values
- file: src/hooks/use-case-attributes-at-a-glance.spec.ts
  name: resolves to the case's latest released version -- its highest-numbered item -- when the case holds
    no draft
  proves: The current version resolved for that view is the case's own draft version when it holds one,
    otherwise its latest released version.
  fails_when: the hook resolves to any version other than 3 (the highest-numbered item) when no draft
    exists, e.g. picks the first item in list order instead of the highest-numbered one
- file: src/hooks/use-case-attributes-at-a-glance.spec.ts
  name: resolves to the "no-version" phase, rather than staying indefinitely "loading", when the version
    list is empty
  proves: 'the implementation''s own inference: a case currently holding no version at all resolves to
    its own "no-version" phase rather than staying indefinitely "loading" (API-04, EDG-02)'
  fails_when: the hook keeps reporting phase "loading" (or any phase other than "no-version") once the
    version list resolves to an empty array
- file: src/hooks/use-case-attributes-at-a-glance.spec.ts
  name: reports the "loading" phase before the version list resolves
  proves: EDG-02's precondition that a view has an explicit loading state before any of the other phase
    transitions it establishes are observable
  fails_when: the hook reports any phase other than "loading" synchronously, before the version-list fetch
    has resolved
- file: src/hooks/use-case-attributes-at-a-glance.spec.ts
  name: reports the "load-error" phase, with a retryLoad that reissues the request, when the version list
    itself fails
  proves: EDG-02 (a view that fails to load degrades to a typed error state offering a retry), applied
    to the list-case-versions dependency criterion 2's resolution reads from
  fails_when: the hook does not report "load-error" when the version-list request throws, or its retryLoad
    function does not reissue the request (the fetch call count does not increase after calling retryLoad)
- file: src/hooks/use-case-attributes-at-a-glance.spec.ts
  name: resolves to the "case-not-valid" phase, carrying the version number, when read-case refuses the
    coherence check
  proves: Where the current version's own read via read-case itself refuses -- e.g. a draft whose manifest
    currently holds no hypothesis -- the view renders that refusal as its own explicit named state, distinguishable
    from a generic load error, offering the same "Continue editing" link the draft's own state would otherwise
    show.
  fails_when: the hook does not report phase "case-not-valid" (or omits the version number) when the whole-version
    read fails with CaseNotValidError
- file: src/hooks/use-case-attributes-at-a-glance.spec.ts
  name: resolves to the generic "load-error" phase, distinct from "case-not-valid", when the current version's
    own read fails for any other reason
  proves: criterion 5's own "distinguishable from a generic load error" clause
  fails_when: the hook reports "case-not-valid" (rather than the generic "load-error") for a whole-version-read
    failure whose error class is not CaseNotValidError
- file: src/routes/case-attributes-tab.spec.ts
  name: renders the current version's own title, when_to_use, subject, fallback outcome/referral and consolidation_register
  proves: Case Detail renders a third view, alongside Versions and Hypotheses, surfacing the case's current
    version's own title, when_to_use, subject, fallback outcome/referral and consolidation_register.
  fails_when: any of the seven rendered values (title, when_to_use, subject, fallback outcome, fallback
    referral action, fallback referral recipient, consolidation_register) is missing or wrong once the
    tab mounts against a ready current version
- file: src/routes/case-attributes-tab.spec.ts
  name: renders "Not set" for consolidation_register when the current version leaves it absent
  proves: domain/knowledge/consolidation-register's own optional-value handling, as the implementation
    record's nodeAnswer for that node states it ("Not set" standing in for a version whose curator left
    it absent)
  fails_when: the tab renders nothing, an empty string, or throws for consolidation_register instead of
    the literal "Not set" when the field is absent from the record
- file: src/routes/case-attributes-tab.spec.ts
  name: renders only "Continue editing", navigating to that draft version's own route, when the current
    version is a draft
  proves: Where the current version is a draft, the view's action reads "Continue editing" and navigates
    to that draft's own route.
  fails_when: the "Continue editing" link is absent, its href does not address the draft's own version
    number, or either released-only action ("View released…"/"New draft from…") also renders for a draft
    current version
- file: src/routes/case-attributes-tab.spec.ts
  name: renders both "View released vX" navigating to that version's own route, and "New draft from vX"
    navigating into the New Draft flow addressed by that same version's own number, when the current version
    is released
  proves: Where the current version is released, the view renders "View released vX" (X its own version
    number) navigating to that version's own read-only route, and "New draft from vX" navigating into
    the New Draft flow, addressed by that same version's own number.
  fails_when: either link is missing, "View released v6" does not navigate to /cases/{slug}/versions/6,
    "New draft from v6" does not navigate to /cases/{slug}/versions/new with sourceVersion=6, or "Continue
    editing" also renders for a released current version
- file: src/routes/case-attributes-tab.spec.ts
  name: renders an explicit, distinguishable state offering Continue editing to that same version when
    read-case refuses the current version's own coherence check
  proves: Where the current version's own read via read-case itself refuses -- e.g. a draft whose manifest
    currently holds no hypothesis -- the view renders that refusal as its own explicit named state, distinguishable
    from a generic load error, offering the same "Continue editing" link the draft's own state would otherwise
    show.
  fails_when: the case-not-valid sentence is absent, the "Continue editing" link it offers does not address
    the same version number, or the generic load-error sentence also renders
- file: src/routes/case-attributes-tab.spec.ts
  name: renders the generic load-error state, not the case-not-valid state, when the current version's
    own read fails for an unrelated reason
  proves: criterion 5's own distinguishability clause, at the rendered-UI layer
  fails_when: the case-not-valid sentence renders (rather than the generic load-error sentence) for a
    whole-version-read failure whose error class is not CaseNotValidError
- file: src/routes/case-attributes-tab.spec.ts
  name: retries the current version's own read when Retry is clicked after a load failure
  proves: EDG-02's retry requirement, applied to the version-level (not list-level) load-error phase this
    task's hook introduces
  fails_when: clicking Retry does not reissue the whole-version read, so the tab stays on the load-error
    state instead of transitioning to the ready state once the dependency recovers
- file: src/routes/case-attributes-tab.spec.ts
  name: renders the same explicit sentence the Versions tab already established, instead of staying indefinitely
    loading, when the case currently holds no version
  proves: the implementation's own "no-version" inference, at the rendered-UI layer (API-04, EDG-02)
  fails_when: the tab does not render "This case currently holds no version." (or renders a different
    sentence) when the version list resolves empty
- file: src/routes/case-attributes-tab.spec.ts
  name: shows a loading state before the version list arrives
  proves: EDG-01, as it bears on this tab
  fails_when: the tab renders nothing, or a blank screen, before the version-list request resolves
- file: src/routes/case-attributes-tab.spec.ts
  name: shows the generic load-error state, with a retry action, when the version list itself fails to
    load
  proves: EDG-02, applied to the list-load dependency criterion 2's resolution depends on
  fails_when: the tab does not render the load-error sentence and Retry button when the version-list request
    throws
- file: src/routes/case-detail-screen-attributes-tab.spec.ts
  name: renders an Attributes tab beside the existing Versions and Hypotheses tabs, unselected by default
  proves: Case Detail renders a third view, alongside Versions and Hypotheses -- (the tab-strip wiring
    half of criterion 1)
  fails_when: no tab named "Attributes" exists in the tab strip, or it is selected (aria-selected=true)
    by default instead of Versions
- file: src/routes/case-detail-screen-attributes-tab.spec.ts
  name: renders CaseAttributesTab's own content, not the Versions tab's, once Attributes is selected
  proves: criterion 1's own tab-strip wiring
  fails_when: the Versions table is still visible, or CaseAttributesTab's own content ("View released
    v5") does not appear, once the Attributes tab is clicked
- file: src/routes/case-detail-screen-attributes-tab.spec.ts
  name: re-mounts the Versions tab's own content when switching back to it from Attributes
  proves: the implementation record's own `preserved` claim that the Versions tab's existing rendering
    is unchanged by this task
  fails_when: the Versions table does not reappear, or Attributes' own content ("View released v5") leaks
    into the Versions tab, after switching back
- file: src/routes/route-tree.spec.ts
  name: parses an absent sourceVersion as {}, so the pre-existing blank 'New draft' entry point keeps
    resolving unaffected
  proves: the implementation's own inference that the New Draft route's sourceVersion search field is
    optional, and the record's own `preserved` claim that the existing plain "New draft" Link keeps resolving
    to the same href
  fails_when: parsing {} throws, or returns anything other than {} (e.g. a default sourceVersion value),
    which would change what the pre-existing blank New-draft Link resolves to
- file: src/routes/route-tree.spec.ts
  name: coerces a numeric-string sourceVersion query value into a number, so 'New draft from vX' can address
    the flow by that version's own number
  proves: criterion 4's "New draft from vX" navigation, at the route-schema layer that carries it
  fails_when: 'parsing { sourceVersion: "3" } does not return { sourceVersion: 3 } as a number, e.g. leaves
    it as the string "3"'
- file: src/routes/route-tree.spec.ts
  name: accepts the smallest valid sourceVersion, 1
  proves: the boundary of the version-number domain this search field addresses (a version is numbered
    from 1)
  fails_when: 'parsing { sourceVersion: "1" } throws or is refused'
- file: src/routes/route-tree.spec.ts
  name: refuses a sourceVersion of zero or below
  proves: the same boundary from its other side
  fails_when: 'parsing { sourceVersion: "0" } or { sourceVersion: "-1" } does not throw'
- file: src/services/error-ui-state.spec.ts
  name: resolves CaseNotValidError to its own distinct case-not-valid state, no longer the shared generic-error
    fallback
  proves: criterion 5's own explicit-state requirement, at the error-mapping layer the hook and the tab
    both depend on
  fails_when: uiStateForApiError maps CaseNotValidError to "generic-error" (or any kind other than "case-not-valid"),
    or maps it to the same kind some other error class already holds
not_applicable:
- edge_case: two concurrent reads of the same current version (e.g. two mounted tabs, or a background
    refetch racing a manual retry)
  why: react-query's own cache key (["case-version", slug, version]) is the boundary this task reuses
    rather than introduces, and no node this task implements states a concurrency guarantee of its own
    for a test to hold it to
- edge_case: a version list response holding two items sharing the same version number
  why: list-case-versions' own contract (established by case-detail-timeline) is presumed well-formed
    by every consumer of it, including this task; asserting a specific reading over a malformed response
    the backend's own contract already forbids is not a decision this task's criteria state
- edge_case: the current version's own state field carrying anything other than "draft" or "released"
  why: domain/knowledge/case-version-state names exactly two values, and CaseVersionState's own TypeScript
    discriminated union makes a third value a compile-time error rather than a runtime path any test could
    reach
- edge_case: the case slug itself being absent or malformed
  why: CaseAttributesTab takes slug as a required prop from CaseDetailScreen, already resolved from the
    route param by that pre-existing screen; no criterion of this task concerns slug validation, which
    belongs to the route that already renders it
- edge_case: an actually malformed sourceVersion reaching "/cases/$slug/versions/new" through a real navigation
  why: this task adds no reader of that search field (deferred to task/version-editor/seed-new-draft-from-latest-released,
    per the task's own Notes), so nothing yet consumes it differently for a malformed value than for an
    absent one -- there is no observable behavior here for a test to assert
untested:
- 'the hook''s resolution when a case holds more than one draft simultaneously (two list items both carrying
  state "draft"): the resolution''s tie-break (versions?.find, which returns the first match in list order)
  is unproven here, because rules/knowledge/a-case-has-at-most-one-draft is presupposed by this task''s
  own ADVISORY note but sits outside this task''s own candidate set -- asserting one particular tie-break
  would pin behavior nothing decided rather than prove a stated criterion'
- whether the read-only view renders no Save button or other editable control -- the implementation record's
  own inference is that AttributesSummary deliberately does not reuse CaseVersionEditorFormFields' form
  markup, but no test in this proof asserts the absence of a form or a Save action, only the presence
  of the read-only rows and links
- 'the transient "loading" phase the hook reports after the version list has resolved but before the individual
  whole-version read has: every "ready"-phase test observes this transition only by awaiting past it with
  waitFor, and no test asserts on that intermediate render directly'
- URL-encoding of the slug on the individual read-case request (GET /v1/cases/{slug}/versions/{version})
  when the slug holds characters needing escaping -- only the sibling list-case-versions request's own
  encoding is exercised elsewhere; this hook's second, new request carries no equivalent test
---

## What it is
Tests for Case Detail's new Attributes view: the hook's current-version resolution and its five discriminated phases (loading, no-version, load-error, case-not-valid, ready), the tab's own rendering of each phase and its state-sensitive action, the tab-strip wiring alongside Versions and Hypotheses, the new optional sourceVersion search field on the New Draft route, and the error-ui-state mapping change the explicit-refusal criterion depends on.

## Notes
The first pass of these tests failed `tsc --noEmit` before ever reaching the suite: two fixtures (in use-case-attributes-at-a-glance.spec.ts and case-attributes-tab.spec.ts) set consolidation_register to the invented literal "consolidated-note", which is not a member of the domain vocabulary CONSOLIDATION_REGISTERS = ["formal", "plain"]. Both fixtures (and the one rendered-value assertion depending on the wrong literal) were corrected to use "formal" before the suite run recorded here; the earlier failing attempt is at run/cases-list-and-detail-case-attributes-at-a-glance-suite, kept alongside this passing one.
error-ui-state.spec.ts's own pre-existing assertion that CaseNotValidError resolves to "generic-error" was true before this task and is false against the delivered mapping; it was updated to assert the new "case-not-valid" kind, which is exactly this task's own criterion 5 mapping restated as a test rather than a new departure.
The project's own eslint.config.js documents TST-04 (file-beside-its-unit placement) as a reading with no stock lint rule behind it, while frontend-typescript.yaml declares TST-04 as decided_by: tool -- a pre-existing inconsistency in the project's own registry noticed while writing these tests, not introduced here. Every test file here still sits beside the unit it covers, matching the codebase's own existing precedent (case-detail-screen-hypotheses-tab.spec.ts / case-hypotheses-tab.spec.ts).
