---
subject: domain/knowledge/manifest-entry
given:
  - case version 1 of a case is in draft state
  - hypothesis alpha holds one revision, revision 1, in draft state
when:
  - the curator places alpha at position 1, pinning revision 1
then:
  - place-hypothesis succeeds
  - case version 1's manifest holds the entry, pinning alpha's revision 1
  - revision 1's own state stays draft, unaffected by being placed
involves:
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis-revision
---

## Description

Composing a draft's manifest stays exactly as free as `case-version` already promises: pointing at a hypothesis-revision never releases or freezes it, whatever state it is in, so a curator can place, remove and simulate against an unreleased hypothesis without that revision's own state ever entering the check.
