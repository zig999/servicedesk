---
contract_version: siegard-reconcile/1
title: Concept permanence resolved by shape, blocked on citation — port and repository
summary: 'Second round of reconcile-glossary-files.md, after /analyse wrote
  rules/glossary/a-registered-concept-is-never-removed. Both files'' actual create-or-replace/upsert
  behavior matches the new node, taken as correct and unchanged since the first round; what each
  file''s own doc comment still names as the authority for that behavior is a closed plan task
  rather than the new node, which this round''s delegations read as a second home for the fact
  rather than a cleared citation. One delegation each also opened
  rules/glossary/the-non-conclusion-outcomes-precede-the-first-case on its own account and found
  writeTerms'' whole-table replace capable of violating its never-removed clause if ever reached
  with the outcome vocabulary — a pre-existing fact about both files, not something the two rounds''
  premise changed.'
target: backend
files:
- path: src/glossary/glossary-store.port.ts
  change: unchanged since reconcile-glossary-files.md
- path: src/persistence/relational-glossary-store.repository.ts
  change: unchanged since reconcile-glossary-files.md
nodes:
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: glossary-store.port.ts imports only './terms.js' and declares the store's own port
    interface; no framework, driver or client import appears in the file. (Its header comment also
    names a no-file-access claim under this same citation; that claim belongs to
    constraints/the-system-persists-to-one-relational-database and is reported there.)
  encoded_at:
  - src/glossary/glossary-store.port.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: false
  how: 'relational-glossary-store.repository.ts itself conforms: its constructor takes the
    injected connection and every statement runs through it, with no file access anywhere.
    glossary-store.port.ts''s header comment, though, attributes a no-file-access claim to
    constraints/the-domain-depends-on-no-infrastructure ("no vocabulary module opens a file, and
    no framework, driver or client is imported here" under one citation to that node) when the
    no-file half is this node''s own statement ("no record is held in a file the deployment ships
    or writes"), not the import-boundary node''s. The node itself is not contradicted anywhere;
    what is wrong is which node a claim about it is attributed to in glossary-store.port.ts.'
  observed_at:
  - src/glossary/glossary-store.port.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: contracts/glossary/glossary-authoring
  conforms: true
  how: 'glossary-store.port.ts''s writeConcepts and relational-glossary-store.repository.ts''s
    upsertConceptStatement (INSERT ... ON CONFLICT (name) DO UPDATE) both match create-at-a-new-name-or-replace-in-place
    for the named concept alone. The permanence half these two files'' comments also state is
    rules/glossary/a-registered-concept-is-never-removed''s own fact, reported there rather than
    here — this node''s own operation says nothing about a concept the call does not name.'
  encoded_at:
  - src/glossary/glossary-store.port.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/action
  conforms: true
  how: relational-glossary-store.repository.ts's VOCABULARY_TABLES entry and readTerms/insertTermStatement
    carry it as a bare name; no action-specific fact is stated.
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/concept
  conforms: true
  how: glossary-store.port.ts's readConcepts/writeConcepts and relational-glossary-store.repository.ts's
    IConceptRow/upsertConceptStatement both carry exactly the four declared attributes.
  encoded_at:
  - src/glossary/glossary-store.port.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/outcome
  conforms: true
  how: relational-glossary-store.repository.ts's VOCABULARY_TABLES entry carries the vocabulary as
    a bare name; the two non-conclusion names are not spelled in this file. (What writeTerms does
    to this vocabulary once written is the separate finding below, against the rule rather than
    this attribute.)
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/recipient
  conforms: true
  how: relational-glossary-store.repository.ts's VOCABULARY_TABLES entry, no recipient-specific
    fact stated.
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/subject-attribute
  conforms: true
  how: relational-glossary-store.repository.ts's VOCABULARY_TABLES entry, an open discovered
    vocabulary with no attribute name fixed in source.
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/subject-type
  conforms: true
  how: relational-glossary-store.repository.ts's VOCABULARY_TABLES entry and IConceptAcceptRow's
    subject_type_name column, a discovered vocabulary named and never described.
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
- node: rules/glossary/a-vocabulary-holds-each-name-once
  conforms: true
  how: upsertConceptStatement and insertMissingTermStatement rely on each table's own name primary
    key so no name is ever held twice on the write side; the read side answers rows as read without
    contradicting the rule's refusal, which the rule locates elsewhere.
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  conforms: false
  how: 'insertMissingTerms (both files) and writeTerms'' additive-only INSERT ... ON CONFLICT DO
    NOTHING path conform for the adds-only half. But relational-glossary-store.repository.ts''s
    writeTerms is a whole-table `DELETE FROM ${table}` followed by reinsertion, reachable with
    vocabulary=''outcome'' since VOCABULARY_TABLES maps it to the outcomes table; the port declares
    writeTerms with the identical whole-replace contract. Reached that way, it removes every
    outcome the given set does not name, which the rule''s closing clause forbids for a released
    case version or hypothesis-revision''s named outcome. No caller in this codebase currently
    passes ''outcome'' to writeTerms (grep found none outside the store''s own test suites; a stale
    comment in vitest-global-setup.ts still describes GlossaryService topping up outcomes through
    writeTerms, but glossary.service.ts''s withNonConclusionOutcomes already uses the additive
    insertMissingTerms instead) — so this is a latent capability of the port''s declared shape, not
    a behavior anything currently exercises.'
  observed_at:
  - src/glossary/glossary-store.port.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
  conforms: true
  how: relational-glossary-store.repository.ts's IConceptRow and readWholeConcepts read a legacy
    row's description back as the empty string, never SQL NULL.
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
- node: rules/glossary/a-registered-concept-is-never-removed
  conforms: false
  how: 'Both files'' actual behavior matches the node — glossary-store.port.ts''s writeConcepts
    never deletes a concept the call does not name, and relational-glossary-store.repository.ts''s
    upsertConceptStatement issues no DELETE against "concepts" at all. But each file''s own doc
    comment still cites task/glossary-concept-write-upsert-hotfix (a closed plan''s task) as the
    authority for that permanence, rather than this node — the fact this node now states is
    Registering concepts adds a concept at a new name or replaces the concept already held at that
    name, and removes no concept already held; a concept a registered capability answers, a
    collected evidence item or its citation names, or a case version''s manifested
    hypothesis-revision collects is never removed from the glossary, and neither comment names it.
    A closed plan''s task is not something a reader can still consult once its work root is
    archived, so the comment is a second home for a fact that now has one node — the behavior needs
    no change, only the citation.'
  observed_at:
  - src/glossary/glossary-store.port.ts
  - src/persistence/relational-glossary-store.repository.ts
notes: 'One specification-conformance-reviewer delegation per file (second round for this batch),
  each handed its own trace-bound node set plus the sibling file''s nodes and
  rules/glossary/a-registered-concept-is-never-removed as candidates. 10 of 13 nodes clear,
  including contracts/glossary/glossary-authoring, unbound in the first round and now clear once
  the permanence half moved to its own node. Three stay unbound: the new node itself, over a stale
  citation rather than a behavioral gap; the outcome-removal rule, over writeTerms'' latent
  whole-replace capability, currently unreached by any caller; and
  constraints/the-system-persists-to-one-relational-database, over a misattributed citation in
  glossary-store.port.ts''s header rather than anything relational-glossary-store.repository.ts
  itself states wrong. None of the three is a behavioral departure this round found — all three are
  either a citation that has not caught up to a node that only now exists, or a capability nothing
  currently calls. Each is a documentation or a scoping decision for a human, not a rebind this
  record can make.'
---
