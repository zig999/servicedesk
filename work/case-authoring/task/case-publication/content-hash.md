---
title: The published case's hash over the whole file
summary: The content hash a published case carries, computed over the whole of its file, curator prose included.
rationale: The decomposition cut the hash apart from the publication transition because the hash is a property of the file and the transition is a move between two shapes, and the two change for different reasons.
sources:
  - intake/scope.md
objective: The hash a published case carries is computed over the whole of the case file, curator prose included.
criteria:
  - The hash changes when a byte of the file's structured part changes.
  - The hash changes when a byte of the file's curator prose changes.
  - The hash of an unchanged file is the same on a second computation.
  - The hash is computed from the file's bytes rather than from a re-serialisation of the parsed case.
depends_on:
  - task/case-shape/case-file-reader
nodes:
  - node: definition/knowledge/case
    digest: sha256:af4dd5b0b02ad4bb87ea9c39ee864a88115d87f2ede68504fa81e858d24ae48c
  - node: definition/knowledge/draft-case
    digest: sha256:d462aa67ef753d09497e314fa00d0d9b5279bf0c5cea0063c6dd12a2e1bdcced
  - node: rule/knowledge/the-content-hash-covers-the-whole-file
    digest: sha256:4874d358e10ea040974b075a80a5ef12ff4e9c77dae165ac048df88aa5ae7728
unresolved:
  - question: No node states which hash function computes a published case's content hash, nor the encoding of the content_hash string that definition/knowledge/case declares required and as part of the published case's identity. The value is business-visible, because an investigation pins it to stay replayable, so an implementer picking one would write a domain-visible identity value the business never stated.
waived:
  - gap: definition/knowledge/case#attributes.version.derivation
    why: The gap is over what sets a published case's version, the second component of its identity. This task's objective and all four criteria concern only what the content hash is computed over and that it is computed from the file's bytes; no criterion reads, writes or derives a version, and the hash of a file is the same whatever the version turns out to be.
---
## What it is

One computation over the bytes of a case file, and the value a published case carries as its hash.
It covers the curator prose, so a change there changes the hash.

## Notes

The last criterion is what makes the first two hold for prose that no parse retains.
REMAINDER, from the binding — the second example and body of `rule/knowledge/the-content-hash-covers-the-whole-file` state that the index keeps every published version, that a corrected prose byte publishes a different published case, and that an investigation which pinned an earlier hash still reaches the version it read, and the criteria stop at the hash changing.
REMAINDER belongs — `task/case-publication/publish-transition`, which delivers publication and the index of published versions.
REMAINDER, from the binding — the clause of `definition/knowledge/draft-case` that publication adds the version and the hash reaches this task only in its hash half.
REMAINDER belongs — `task/case-publication/publish-transition`, which is also where `definition/knowledge/case#attributes.version.derivation` must be answered.
UNDERDETERMINED, from the binding — all four criteria are properties of a pure function over file bytes, and none of them says the hash is assigned once, at publication, and then carried immutably by the published value.
UNDERDETERMINED passes — an implementation that recomputes the content hash from the current case file on every read of an already-published case, so editing that file silently changes the identity of the case already published rather than producing a new published one, which meets every criterion as written.
From the binding — `lifecycle/knowledge/case-publication` is a candidate left unbound, because it states when publication happens and what it verifies rather than what the hash covers, and its open gap over how a further version begins from a published one is carried by the task that delivers publication rather than waived here.
From the binding — the only place the base says a case is one markdown file versioned in git is inside the why of an open gap, prose explaining an absence rather than a declared fact, and this task leans on it to hash the file whole.
From the binding — the remaining candidates govern the publication contract check and the validation's refusals rather than what the hash is computed over, and the epic's other tasks bind them.
