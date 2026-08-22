---
title: Glossary Browser screen proof
summary: Tests proving the six-tab, read-only Glossary Browser at /glossary — its listing, formatting,
  loading/error/empty and no-control criteria across all six tabs, tab-switching, the new use-glossary-concepts
  hook, and the repaired route-tree wiring.
implementation: sha256:66a2f704e0a4283de33ed5d530767e1b429cf08a4f36c224025c9fb8401f6595
run: run/glossary-and-capabilities-browser-onda-6-full-suite
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
tests:
- file: src/hooks/use-glossary-concepts.spec.ts
  name: issues a GET to /v1/glossary/concepts and returns each concept's own name, accepts and ttl intact
  proves: The Concepts tab renders one row per concept GET /v1/glossary/concepts returns, each showing
    that concept's own name, accepts and ttl. (at the hook layer)
  fails_when: the hook requests a path other than /v1/glossary/concepts, or resolves to anything other
    than each concept's own name/accepts/ttl unchanged
- file: src/hooks/use-glossary-concepts.spec.ts
  name: returns an empty concepts array, rather than throwing or leaving it undefined, when the concepts
    page holds none yet
  proves: the empty-collection edge case at the hook layer underlying the Concepts tab's own empty state
  fails_when: the hook throws, or leaves concepts undefined/null, instead of resolving to []
- file: src/hooks/use-glossary-concepts.spec.ts
  name: reports isError, with concepts staying empty, when the request fails
  proves: the failing-dependency edge case at the hook layer underlying the Concepts-tab error state
  fails_when: isError stays false after a rejected fetch, or concepts is populated despite the failure
- file: src/hooks/use-glossary-concepts.spec.ts
  name: caches under its own key, ["glossary", "concepts-with-ttl"], distinct from use-concept-options.ts's
    own ["glossary", "concepts"] key (disclosed inference)
  proves: 'the disclosed inference: useGlossaryConcepts uses its own query key, ["glossary", "concepts-with-ttl"],
    distinct from use-concept-options.ts''s own ["glossary", "concepts"]'
  fails_when: useGlossaryConcepts reads or writes under ["glossary","concepts"] instead of (or in addition
    to) its own key
- file: src/routes/glossary-browser-screen.spec.ts
  name: renders six tabs labeled Concepts, Subject types, Subject attributes, Outcomes, Actions and Recipients,
    with Concepts selected by default
  proves: Visiting /glossary renders six tabs labeled Concepts, Subject types, Subject attributes, Outcomes,
    Actions and Recipients.
  fails_when: any of the six labels is missing, misspelled or reordered into a seventh tab, or a tab other
    than Concepts is selected on first render
- file: src/routes/glossary-browser-screen.spec.ts
  name: renders one row per concept GET /v1/glossary/concepts returns, each showing its own name, accepts
    and ttl
  proves: The Concepts tab renders one row per concept GET /v1/glossary/concepts returns, each showing
    that concept's own name, accepts and ttl.
  fails_when: the Concepts tab renders a different row count than the response's own concepts, or omits/misrenders
    any one concept's own name, accepts or ttl
- file: src/routes/glossary-browser-screen.spec.ts
  name: suffixes a concept's own ttl with 's' rather than rendering a bare number
  proves: 'the disclosed inference: a concept''s ttl is displayed suffixed with "s" rather than as a bare
    number'
  fails_when: the ttl cell renders the bare number (e.g. "42") instead of "42s"
- file: src/routes/glossary-browser-screen.spec.ts
  name: renders a concept's own accepts list as one comma-joined string cell, not one cell per accepted
    subject type
  proves: 'the disclosed inference: a concept''s own accepts list renders as a single comma-joined string
    cell'
  fails_when: accepts renders as separate cells/rows per entry, or a differently-joined string
- file: src/routes/glossary-browser-screen.spec.ts
  name: shows a loading placeholder before GET /v1/glossary/concepts responds
  proves: the loading precondition for the Concepts tab
  fails_when: no loading text appears, or a table renders before the response resolves
- file: src/routes/glossary-browser-screen.spec.ts
  name: shows a generic load-failure message plus a Retry button when GET /v1/glossary/concepts fails,
    and Retry re-issues the same request
  proves: the disclosed inference that a load failure in any of the six tabs renders a generic message
    plus a Retry button calling that tab's own hook's refetch
  fails_when: no error message or no Retry button appears on failure, or clicking Retry issues no further
    request to /v1/glossary/concepts
- file: src/routes/glossary-browser-screen.spec.ts
  name: renders an explicit empty-state message and no table when GET /v1/glossary/concepts returns zero
    concepts
  proves: the empty-collection edge case for the Concepts tab
  fails_when: an empty response is shown as still loading, as an error, or renders an empty table instead
    of the explicit message
- file: src/routes/glossary-browser-screen.spec.ts
  name: renders no control that creates, edits or deletes a term or concept, in each of the six tabs (Concepts,
    Subject types, Subject attributes, Outcomes, Actions, Recipients)
  proves: No tab renders a control that creates, edits or deletes a glossary term or concept. (all six
    tabs)
  fails_when: any of the six tabs renders a textbox, a combobox, or a button whose accessible name matches
    create/edit/delete
- file: src/routes/glossary-browser-screen.spec.ts
  name: renders no pagination control in each of the six tabs
  proves: No tab renders a pagination control. (all six tabs)
  fails_when: any of the six tabs renders a navigation landmark or a next/previous/page-numbered button
- file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
  name: renders one row per term GET /v1/glossary/{vocabulary} returns, by name, in each of the five term-vocabulary
    tabs (Subject types, Subject attributes, Outcomes, Actions, Recipients)
  proves: 'criteria 3-7: each of the five term-vocabulary tabs renders one row per term its own GET /v1/glossary/{vocabulary}
    returns, by name'
  fails_when: any of the five tabs renders a different row count than the response's own terms, or a row
    does not show that term's own name
- file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
  name: renders its own explicit empty-state message and no table when its own GET returns zero terms,
    in each of the five vocabulary tabs
  proves: the empty-collection edge case for each of the five term-vocabulary tabs
  fails_when: an empty vocabulary is shown as loading, as an error, or renders an empty table instead
    of that tab's own message
- file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
  name: shows a generic error message plus a Retry button when its own GET fails, and Retry re-issues
    the same request, in each of the five vocabulary tabs
  proves: the generic-message inference, for each of the five term-vocabulary tabs
  fails_when: a failure on any of the five tabs shows no message or no Retry, or Retry issues no further
    request to that same path
- file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
  name: renders the newly active tab's own data in place of the previously active tab's, and issues no
    request for the other four vocabulary paths
  proves: the edge case of a tab switch actually rendering the newly active tab's own data, distinct from
    the previous tab's, and the composition's own one-fetch-per-active-section design
  fails_when: switching tabs leaves the previous tab's content visible, fails to show the newly active
    tab's own data, or a vocabulary path never selected is nonetheless requested
- file: src/routes/route-tree.spec.ts
  name: renders the /glossary route through GlossaryBrowserScreen (task/glossary-and-capabilities-browser/glossary-browser-screen)
  proves: the objective's premise that visiting /glossary is now wired to the real screen rather than
    GlossaryPlaceholder
  fails_when: route-tree.tsx's "/glossary" route's component is anything other than GlossaryBrowserScreen
not_applicable:
- edge_case: absent or empty caller-supplied input
  why: GlossaryBrowserScreen takes no user input at all -- no form, no filter, no search field -- every
    one of its six tabs is a pure read view.
- edge_case: a boundary at each end of a stated range
  why: no criterion of this task states a numeric range; ttl is displayed verbatim (suffixed, not clamped
    or bounded).
- edge_case: a duplicate where uniqueness is claimed
  why: no criterion of this task claims a term's or a concept's own name is unique within its own vocabulary
    or catalog.
- edge_case: an operation against state that forbids it
  why: criteria 8 and 9 already establish this screen performs no operation at all beyond reading and
    retrying.
- edge_case: two operations against one subject at once
  why: the screen performs no mutation, and each of its six tabs' own queries is independent.
untested:
- behavior beyond the first page of any of the six paginated endpoints -- total/limit/offset/pageCount
  are never read by any of the hooks this screen composes, so what a curator sees once a vocabulary or
  the concept catalog exceeds one page is unproven.
- rapid or concurrent tab-switching (clicking a second tab before the first one's own fetch has resolved)
  -- only one clean, settled switch is proven.
divergences:
- cites: TST-04
  file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
  departure: the file sits beside glossary-browser-screen.tsx but is named with an extra "-vocabulary-tabs"
    segment rather than exactly the unit's own name plus .spec, so it is not literally "named for it plus
    .spec".
  why: keeps each spec file under MNT-01's three-hundred-line cap by splitting one screen's proof by concern
    -- the same split this codebase already keeps for exactly this situation (capabilities-browser-screen.spec.ts
    / capabilities-browser-screen-detail.spec.ts, and the several suffixed spec files beside version-manifest-screen.tsx
    and hypothesis-revision-screen.tsx).
---

## What it is
Nineteen tests across four spec files (three new, plus a repair to route-tree.spec.ts) proving the Glossary Browser's six tabs, their listing/formatting/loading/error/empty states, the no-control/no-pagination criteria, tab-switching, and the new use-glossary-concepts hook.

## Notes
route-tree.spec.ts's own EXPECTED_COMPONENT_BY_PATH still asserted "/glossary": GlossaryPlaceholder, which the delivered route-tree.tsx made false; repaired the stale entry, its surrounding count/comment, and added a dedicated test asserting /glossary now renders GlossaryBrowserScreen.
