---
target: frontend
title: Route the simulation screen to the version's editor on every reading -- proof
summary: One sequential test walks the simulation screen through its five declared readings (pending,
  failed, refused for validation, answered draft, answered released) and confirms the route to the named
  version's own editor survives each, discharging the task's six criteria and the node's fact whole; a
  second test covers the task's own UNDERDETERMINED entry on a refusal carrying an unrecognized error
  code.
implementation: sha256:db95c2dbb82762ba54553563d33acad53bb77111dd17bc05d6d835458404d1ae
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/draft-editor-correction-while-invalid-route-the-simulation-screen-to-the-version-editor-full-2
tests:
- file: src/routes/case-simulation-screen.spec.ts
  name: CaseSimulationScreen -- route to the named version's own editor across every reading (rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading;
    criteria 1-6) > carries the route while pending, once failed to complete, once refused for validation,
    and once answered for a draft and for a released version, always addressed by the screen's own path
    version
  proves: Criterion 1 -- while the simulation screen's read has not answered, the screen carries a route
    to the named version's editing surface
  fails_when: the 'loading' phase of case-simulation-screen.tsx stops rendering a link to the named version's
    own editor
- file: src/routes/case-simulation-screen.spec.ts
  name: CaseSimulationScreen -- route to the named version's own editor across every reading (rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading;
    criteria 1-6) > carries the route while pending, once failed to complete, once refused for validation,
    and once answered for a draft and for a released version, always addressed by the screen's own path
    version
  proves: Criterion 2 -- where the simulation screen's read did not complete, the screen carries a route
    to the named version's editing surface
  fails_when: the 'load-error' phase stops rendering the route for a generic failed read
- file: src/routes/case-simulation-screen.spec.ts
  name: CaseSimulationScreen -- route to the named version's own editor across every reading (rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading;
    criteria 1-6) > carries the route while pending, once failed to complete, once refused for validation,
    and once answered for a draft and for a released version, always addressed by the screen's own path
    version
  proves: Criterion 3 -- where the simulation screen's read was refused with CaseVersionNotValidError,
    the screen carries a route to the named version's editing surface
  fails_when: the 'load-error' phase stops carrying the route specifically when refused with CaseVersionNotValidError
- file: src/routes/case-simulation-screen.spec.ts
  name: CaseSimulationScreen -- route to the named version's own editor across every reading (rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading;
    criteria 1-6) > carries the route while pending, once failed to complete, once refused for validation,
    and once answered for a draft and for a released version, always addressed by the screen's own path
    version
  proves: Criterion 4 -- on a reading that answered a draft version, the screen carries a route to the
    named version's editing surface
  fails_when: the ready reading for a draft version stops rendering an 'Edit version' link whose href
    is the named version's own editor path
- file: src/routes/case-simulation-screen.spec.ts
  name: CaseSimulationScreen -- route to the named version's own editor across every reading (rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading;
    criteria 1-6) > carries the route while pending, once failed to complete, once refused for validation,
    and once answered for a draft and for a released version, always addressed by the screen's own path
    version
  proves: Criterion 5 -- on a reading that answered a released version, the screen carries a route to
    the named version's editing surface, alongside the pre-existing 'Edit version' route to a new sourced
    draft
  fails_when: the ready reading for a released version stops carrying a second, distinct link whose href
    is exactly the named version's own editor path
- file: src/routes/case-simulation-screen.spec.ts
  name: CaseSimulationScreen -- route to the named version's own editor across every reading (rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading;
    criteria 1-6) > carries the route while pending, once failed to complete, once refused for validation,
    and once answered for a draft and for a released version, always addressed by the screen's own path
    version
  proves: Criterion 6 -- the route's version number is the version number in the simulation screen's own
    path
  fails_when: the route rendered in any of the five readings addresses a version number other than the
    screen's own path version
- file: src/routes/case-simulation-screen.spec.ts
  name: CaseSimulationScreen -- route to the named version's own editor across every reading (rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading;
    criteria 1-6) > carries the route while pending, once failed to complete, once refused for validation,
    and once answered for a draft and for a released version, always addressed by the screen's own path
    version
  proves: 'the node''s fact, decided whole for the simulation screen: the surface offers a route to the
    named version''s own editing surface on every reading it is stated to hold for'
  fails_when: the route to the version's own editor is absent, replaced, or withheld in any one of the
    five readings the node's expression names
  demonstrates: rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading
- file: src/routes/case-simulation-screen.spec.ts
  name: CaseSimulationScreen -- editor route on a refusal the screen holds no specific presentation for
    (UNDERDETERMINED entry 1) > still carries the route to the named version's own editor when the read
    is refused with an error code other than CaseVersionNotValidError
  proves: the task's own Notes, UNDERDETERMINED entry 1
  fails_when: the screen withholds the route once the read is refused with an error code other than CaseVersionNotValidError,
    showing only the read-did-not-complete statement
not_applicable:
- edge_case: A malformed or non-numeric version path parameter.
  why: no criterion or the node's expression conditions the route on the path version's own validity,
    and this task changes no routing or param validation
- edge_case: Concurrent or duplicated reads of the same version (e.g. a re-fetch racing the initial load,
    or React re-render duplicating a request).
  why: no criterion or the node's expression makes the route's presence turn on request timing or on how
    many outstanding reads exist
- edge_case: A record whose state is neither draft nor released.
  why: not reached by any criterion of this task; the hook's existing throw for an undefined state predates
    this task
---

## What it is

One test walking the simulation screen through five readings, asserting the route to the version's own editor on each; a second test for a refusal the screen holds no presentation of its own for.

## Notes

None.
