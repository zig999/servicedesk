---
title: The case catalog carries each case's summary
summary: The list-cases read answers each case with the summary derived from that case's own versions,
  instead of its slug alone.
rationale: One epic rather than several because the whole scope is one read of one published operation,
  and its two tasks part along a single seam inside that read; the epic claims the knowledge context's
  catalog read and the lifecycle, wholeness and persistence statements that bound it, and claims none
  of the investigation, glossary, evidence or consolidation nodes the impact set also carries, because
  a backend-only catalog read reaches none of them.
sources:
- intake/scope.md
covers:
- domain/knowledge/case-summary
- rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
- scenarios/knowledge/a-catalog-entry-follows-the-released-version
- rules/knowledge/a-case-listing-answers-cases-in-slug-order
- contracts/knowledge/case-query
- constraints/listings-are-paged
- domain/knowledge/case
- domain/knowledge/case-version
- domain/knowledge/case-version-state
- rules/knowledge/a-case-has-at-most-one-draft
- rules/knowledge/every-case-version-remains-readable
- rules/knowledge/a-case-version-number-is-never-reused
- rules/knowledge/only-a-draft-case-version-may-be-discarded
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
- rules/knowledge/validation-runs-at-every-read
- rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
- rules/investigation/only-a-released-case-version-is-diagnosed
- scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly
- constraints/a-case-is-read-whole
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/no-route-enforces-authentication
- constraints/the-stored-schema-mirrors-the-declared-model
- constraints/the-schema-replays-from-its-scripts
- constraints/the-system-persists-to-one-relational-database
- constraints/the-database-is-externally-provisioned
- constraints/the-domain-depends-on-no-infrastructure
- contracts/investigation/case-source
uncovered:
- node: domain/knowledge/case
  why: The summary is read off a case's versions rather than declared by its identity, and this plan adds
    no attribute and no operation to the identity itself.
- node: domain/knowledge/case-version
  why: The derivation reads title, when_to_use, authored_at and state off versions that already hold them
    and changes nothing this element declares.
- node: domain/knowledge/case-version-state
  why: The two states are already what the store records; the summary reports one of them and adds none.
- node: rules/knowledge/a-case-has-at-most-one-draft
  why: It is why a draft can sit above a released version at all, which the derivation reads as a given;
    no create-draft path is touched.
- node: rules/knowledge/every-case-version-remains-readable
  why: It is why every version a case holds is there to be counted; the store already keeps them and this
    plan changes no retention.
- node: rules/knowledge/a-case-version-number-is-never-reused
  why: It is why the highest-numbered version a case holds is its most recently authored one; no numbering
    is written here.
- node: rules/knowledge/only-a-draft-case-version-may-be-discarded
  why: It is why a case may currently hold no version at all, a case the derivation must still answer
    for; no discard path is touched.
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  why: The catalog read triggers no lifecycle transition and raises none of the refusals this state machine
    states.
- node: rules/knowledge/validation-runs-at-every-read
  why: It decides whether a stored version reads back as a case, and the summary reads attributes off
    a case's versions rather than reading any version as a case.
- node: rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
  why: It refuses a read naming a slug and version, and the catalog names neither; the listing answers
    over the cases currently held.
- node: rules/investigation/only-a-released-case-version-is-diagnosed
  why: It is why released_version names the version a diagnosis may pin to, and no diagnosis path is changed
    by exposing that same version in the catalog.
- node: scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly
  why: It states what list-case-versions owes a curator for one named case, a different operation from
    the catalog listing this plan changes.
- node: constraints/a-case-is-read-whole
  why: Wholeness binds the case version read for diagnosis, and it states other reads may stand alone,
    so the summary read assembles no version whole.
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  why: The catalog request keeps the shape it already declares, so the refusal this constraint states
    is unchanged.
- node: constraints/no-route-enforces-authentication
  why: No route is added and no guard is introduced, so this build's perimeter is exactly where it stood.
- node: constraints/the-stored-schema-mirrors-the-declared-model
  why: The summary is held by no aggregate and stored nowhere, and every column the derivation reads already
    pairs with a declared case-version attribute, so no column is added.
- node: constraints/the-schema-replays-from-its-scripts
  why: The derivation writes no migration script, so what replays on an empty database is unchanged.
- node: constraints/the-system-persists-to-one-relational-database
  why: The derivation answers from the same connection every other record answers from and holds nothing
    in a file.
- node: constraints/the-database-is-externally-provisioned
  why: No deployment or connection configuration is touched by a read added over the existing store.
- node: constraints/the-domain-depends-on-no-infrastructure
  why: The summary is declared where the listing's port already is and imports nothing infrastructural,
    so the dependency direction the constraint states is unmoved.
- node: contracts/investigation/case-source
  why: The consumed edge names read-case alone, and this plan changes only list-cases.
---

## What it is

The plan's one epic: the case catalog's entries carry each case's own summary rather than its slug alone.
It holds two things — the derivation of that summary off a case's existing versions, and the published read that answers it inside the paged envelope.
Its claimed slice of the impact set is the knowledge context's catalog read plus the lifecycle, wholeness and persistence statements that bound what the derivation may read and what it must not change.

## Notes

The domain fact this epic delivers is already stated by domain/knowledge/case-summary, rules/knowledge/a-case-summary-is-derived-from-its-existing-versions and scenarios/knowledge/a-catalog-entry-follows-the-released-version, so no task here decides one.
Per the inventory, title, when_to_use, state and authored_at already exist as columns on case_versions and the summary is stored nowhere, so nothing in this epic writes a migration script.
The remainder of the impact set — the investigation path, the glossary, the evidence and consolidation statements and the case authoring operations — is claimed by no epic in this plan, because a backend-only change to one listing reaches none of it.
