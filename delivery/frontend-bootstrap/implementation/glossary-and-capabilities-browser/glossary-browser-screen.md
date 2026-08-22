---
title: Glossary Browser screen
summary: Replaces GlossaryPlaceholder with a six-tab, read-only Glossary Browser at /glossary -- Concepts
  (via a new ttl-preserving sibling hook) plus the five term vocabularies, each composing an existing
  or new hook and rendering through StatusTable inside TUI's Tabs.
task: sha256:e114d71ff5b11e1f4f4862c792a33f61270e4741adb00932e27e4f8d6b63474e
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/glossary-and-capabilities-browser-onda-6-full-suite
files:
- path: src/hooks/use-glossary-concepts.ts
  effect: New hook reading GET /v1/glossary/concepts and returning {concepts, isLoading, isError, refetch},
    keeping each concept's own name, accepts and ttl intact -- a sibling of use-concept-options.ts (which
    deliberately narrows ttl away) rather than a widening of it, mirroring both existing glossary hooks'
    apiFetch/queryKey/data-only convention with its own distinct query key ["glossary", "concepts-with-ttl"].
- path: src/routes/glossary-browser-screen.tsx
  effect: New screen exporting GlossaryBrowserScreen -- six @tui/ui/tabs tabs (Concepts, Subject types,
    Subject attributes, Outcomes, Actions, Recipients), each TabsContent mounting its own function component
    (ConceptsPanel, or a VocabularyPanel parametrized per vocabulary) that owns its own query, renders
    through StatusTable, and degrades to an explicit loading state, an explicit empty state, or a generic
    error state with a Retry button wired to that hook's own refetch.
- path: src/routes/route-tree.tsx
  effect: '"/glossary" route''s component changed from GlossaryPlaceholder to GlossaryBrowserScreen; the
    now-unused GlossaryPlaceholder import removed from this file (GlossaryPlaceholder itself left in place,
    unused, in route-placeholders.tsx); capabilitiesRoute and every other route left untouched.'
criteria:
- criterion: Visiting /glossary renders six tabs labeled Concepts, Subject types, Subject attributes,
    Outcomes, Actions and Recipients.
  met: true
  how: GlossaryBrowserScreen's Tabs/TabsList renders exactly six TabsTrigger elements with those six labels,
    in that order, and route-tree.tsx's glossaryRoute now renders GlossaryBrowserScreen at /glossary.
- criterion: The Concepts tab renders one row per concept GET /v1/glossary/concepts returns, each showing
    that concept's own name, accepts and ttl.
  met: true
  how: ConceptsPanel reads useGlossaryConcepts() (the new hook, backed by GET /v1/glossary/concepts) and
    maps every concept in its data page to one StatusTable row through toConceptRow, which reads that
    same concept's own name, accepts (joined into text) and ttl (formatted with its unit).
- criterion: The Subject types tab renders one row per term GET /v1/glossary/subject-type returns, by
    name.
  met: true
  how: the Subject types TabsContent mounts VocabularyPanel with vocabulary="subject-type", which reads
    useGlossaryVocabularyOptions("subject-type") (GET /v1/glossary/subject-type) and renders one StatusTable
    row per returned option, keyed and labeled by that term's own name.
- criterion: The Subject attributes tab renders one row per term GET /v1/glossary/subject-attribute returns,
    by name.
  met: true
  how: the Subject attributes TabsContent mounts VocabularyPanel with vocabulary="subject-attribute" --
    reachable only because the dependency task widened GlossaryVocabulary to include this fifth member
    -- reading useGlossaryVocabularyOptions("subject-attribute") (GET /v1/glossary/subject-attribute)
    and rendering one row per returned term, by name.
- criterion: The Outcomes tab renders one row per term GET /v1/glossary/outcome returns, by name.
  met: true
  how: the Outcomes TabsContent mounts VocabularyPanel with vocabulary="outcome", reading useGlossaryVocabularyOptions("outcome")
    (GET /v1/glossary/outcome) and rendering one row per returned term, by name.
- criterion: The Actions tab renders one row per term GET /v1/glossary/action returns, by name.
  met: true
  how: the Actions TabsContent mounts VocabularyPanel with vocabulary="action", reading useGlossaryVocabularyOptions("action")
    (GET /v1/glossary/action) and rendering one row per returned term, by name.
- criterion: The Recipients tab renders one row per term GET /v1/glossary/recipient returns, by name.
  met: true
  how: the Recipients TabsContent mounts VocabularyPanel with vocabulary="recipient", reading useGlossaryVocabularyOptions("recipient")
    (GET /v1/glossary/recipient) and rendering one row per returned term, by name.
- criterion: No tab renders a control that creates, edits or deletes a glossary term or concept.
  met: true
  how: every tab's body (ConceptsPanel, VocabularyPanel) renders only StatusTable plus a loading/empty/error
    message and, on error, a Retry button that only re-fetches; no form, input or mutation of any kind
    is rendered anywhere in glossary-browser-screen.tsx.
- criterion: No tab renders a pagination control.
  met: true
  how: every tab's body reads its hook's own data page and renders it directly through StatusTable with
    no page-size, page-number or next/previous control; both hooks (useGlossaryConcepts, useGlossaryVocabularyOptions)
    read only a page's data field and never surface total/limit/offset/pageCount to this screen.
nodes:
- node: domain/glossary/action
  encoded_at:
  - src/routes/glossary-browser-screen.tsx
  how: the Actions tab renders one row per action term, by its own name field, through VocabularyPanel
    composing the existing useGlossaryVocabularyOptions("action") hook.
- node: domain/glossary/concept
  encoded_at:
  - src/hooks/use-glossary-concepts.ts
  - src/routes/glossary-browser-screen.tsx
  how: GlossaryConcept (use-glossary-concepts.ts) models exactly the concept's three attributes -- name,
    accepts, ttl -- and ConceptsPanel's toConceptRow renders all three per row, the first task in this
    codebase to surface a concept's own ttl in the UI.
- node: domain/glossary/outcome
  encoded_at:
  - src/routes/glossary-browser-screen.tsx
  how: the Outcomes tab renders one row per outcome term, by its own name field, through VocabularyPanel
    composing the existing useGlossaryVocabularyOptions("outcome") hook.
- node: domain/glossary/recipient
  encoded_at:
  - src/routes/glossary-browser-screen.tsx
  how: the Recipients tab renders one row per recipient term, by its own name field, through VocabularyPanel
    composing the existing useGlossaryVocabularyOptions("recipient") hook.
- node: domain/glossary/subject-attribute
  encoded_at:
  - src/routes/glossary-browser-screen.tsx
  how: the Subject attributes tab renders one row per subject-attribute term, by its own name field, through
    VocabularyPanel composing useGlossaryVocabularyOptions("subject-attribute") -- the fifth GlossaryVocabulary
    member the dependency task added, first consumed by this screen.
- node: domain/glossary/subject-type
  encoded_at:
  - src/routes/glossary-browser-screen.tsx
  how: the Subject types tab renders one row per subject-type term, by its own name field, through VocabularyPanel
    composing the existing useGlossaryVocabularyOptions("subject-type") hook.
- node: contracts/glossary/glossary-query
  encoded_at:
  - src/hooks/use-glossary-concepts.ts
  - src/routes/glossary-browser-screen.tsx
  how: 'this screen exercises exactly two of the contract''s four operations -- list-vocabulary-terms
    (composed via the existing useGlossaryVocabularyOptions across five vocabularies) and list-concepts
    (via the new useGlossaryConcepts, GET /v1/glossary/concepts) -- since every tab is a listing. The
    contract''s other two operations, read-vocabulary-term and read-concept, are not reached: no criterion
    of this task asks for a single-term or single-concept lookup view.'
inferences:
- inferred: a concept's ttl (in seconds, per domain/glossary/concept's own description) is displayed suffixed
    with "s" (e.g. "3600s") rather than as a bare number.
  from: no criterion states a display format, and the bare number alone would leave a reader guessing
    the unit; the same kind of call capabilities-browser-screen.tsx's own formatTimeout already made for
    domain/integration/capability's own timeout, disclosed the same way there.
- inferred: a concept's own accepts list renders as a single comma-joined string cell rather than, say,
    one sub-row or badge per accepted subject type.
  from: no criterion states a display format for a list-valued cell, and StatusTable's own cell contract
    renders a plain value as text or an {color,label} status or a React element -- a joined string is
    the plain-text rendering that fits without extending StatusTable itself.
- inferred: useGlossaryConcepts uses its own query key, ["glossary", "concepts-with-ttl"], distinct from
    use-concept-options.ts's own ["glossary", "concepts"].
  from: both hooks read the same endpoint (GET /v1/glossary/concepts) into two different TypeScript shapes;
    sharing one TanStack Query cache key would let either hook's fetch populate the entry the other reads
    under its own, different typed assumption about which fields are present.
- inferred: a load failure in any of the six tabs renders a generic message ("Unable to load …") plus
    a Retry button calling that tab's own hook's refetch, rather than a per-error-code message.
  from: GET /v1/glossary/{vocabulary} and GET /v1/glossary/concepts throw no domain error error-ui-state.ts
    names, so every failure here collapses onto that table's own generic-error fallback -- the same pattern
    case-hypotheses-tab.tsx and capabilities-browser-screen.tsx already use for the same reason.
preserved:
- route-tree.tsx's other nine routes (casesListRoute, caseDetailRoute, caseVersionRoute, newCaseVersionRoute,
  versionManifestRoute, manifestHypothesisRoute, newManifestHypothesisRoute, versionReleaseRoute, versionDiscardRoute,
  caseHypothesesRoute) and capabilitiesRoute, none of which this task touches.
- app-shell.tsx's SIDEBAR_ENTRIES and ROUTE_LABELS, which already map "/glossary" to the sidebar's "Glossary"
  entry and the breadcrumb's "Glossary Browser" label -- untouched.
- use-glossary-vocabulary.ts's own GlossaryVocabulary union, GlossaryTermsPage shape and useGlossaryVocabularyOptions's
  {options, isLoading, isError, refetch} return shape, read here but not modified.
- use-concept-options.ts and its one existing consumer, use-hypothesis-revision-form.ts -- left untouched;
  the Concepts tab reads the new sibling hook instead.
- GlossaryPlaceholder, left exported and unused in route-placeholders.tsx, per that file's own established
  precedent.
deferred:
- what: Both GET /v1/glossary/{vocabulary} and GET /v1/glossary/concepts are genuinely paginated backend
    endpoints, but every hook this screen reads reads only the first page's data, the same inherited convention
    both pre-existing glossary hooks already keep.
  why: criterion 9 explicitly forbids a pagination control, and this app's own inventory already discloses
    this as an inherited risk rather than something this task introduces.
---

## What it is
The section 2.8 screen the scope describes, over the two existing glossary-reading hooks (widened to a fifth vocabulary), a new sibling hook preserving each concept's own ttl, and TUI's Tabs primitive composed the same way case-detail-screen.tsx already does.
Depends on the union-widening task because the Subject attributes tab cannot request its own vocabulary through the existing hook until that type accepts it.

## Notes
None.
