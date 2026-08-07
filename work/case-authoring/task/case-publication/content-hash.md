---
title: The published case's hash over the whole file
summary: The content hash a published case carries, computed over the bytes of the whole of its file and written with its algorithm named inside the value.
objective: The hash a published case carries is a SHA-256 over the bytes of the whole case file, curator prose included, written with the algorithm's name inside the value.
rationale: The decomposition cut the hash apart from the publication transition because the hash is a property of the file and the transition is a move between two shapes, and the two change for different reasons. Criteria five through eight were added after commit a50f278 stated the algorithm and the written form of the value, which this task carried as an open question because the value is business-visible and an implementer picking one would have written an identity the business never stated.
sources:
- intake/scope.md
- intake/scope-2026-08-07.md
criteria:
- The hash changes when a byte of the file's frontmatter changes.
- The hash changes when a byte of the file's body changes.
- The hash of an unchanged file is the same on a second computation.
- The hash is computed from the file's bytes rather than from a re-serialisation of the parsed case.
- The digest is the SHA-256 of those bytes.
- The value is written as the name sha256, a colon, and sixty-four hexadecimal characters.
- The sixty-four hexadecimal characters are lowercase.
- A value whose hexadecimal characters are uppercase is not read as a content hash.
- A case is hashed from exactly one file.
depends_on:
- task/case-shape/case-file-reader
nodes:
- node: definition/knowledge/case
  digest: sha256:d512d19003a13abdf718191e259fb2a9d22a8389ad46c5461aa43bdd6eebe32f
- node: definition/knowledge/draft-case
  digest: sha256:9c3360b04b1eb11db3c2d54299b2909173b3ec7bfdfb6a4e5d47e69acbc668e9
- node: rule/knowledge/a-case-is-one-file
  digest: sha256:58b96adc27a29ee585501b48210ed953e0575736fe400d200014277e8a4e6593
- node: rule/knowledge/the-content-hash-covers-the-whole-file
  digest: sha256:ff34ab8bff09ffeb96aff532289e784ed6087dbdb6b3b8d820a82cb1a47885ea
- node: rule/knowledge/the-content-hash-is-a-named-sha-256
  digest: sha256:6397fe1f41e13c6ba22d6784d73e51e2a1ec987c1054994380d8199431317286
unresolved:
- question: The base does not say which state of the case file supplies the bytes that are hashed. rule/knowledge/a-case-is-one-file requires the file to be kept under version control and rule/knowledge/the-content-hash-covers-the-whole-file says the hash is over the bytes of the whole case file, but neither says whether publication hashes the bytes of the file as it sits in the working tree at the moment of publication or the bytes of the revision committed under version control. The two differ whenever a curator publishes an unsaved or uncommitted edit, and they identify different published cases.
---
## What it is

The digest that identifies a published case, taken over the whole file rather than over what parsed out of it.

## Notes

The fourth criterion is what makes the first two hold for prose that no parse retains.
Criteria five through eight are new and they close the question this task carried: the base now names the algorithm and fixes the encoding, so nothing about the value is left to whoever writes it.
Criterion nine is new and rests on the base now stating as a rule that a case is held by exactly one file, which this task previously leaned on through the why of an open gap.
No bound node carries an open gap, so this task waives none — the absence is a fact the binder checked node by node, not an omission.
UNDERDETERMINED, from the binding — the kept-under-version-control clause of `rule/knowledge/a-case-is-one-file` reaches no criterion, since criterion 9 takes only the exactly-one-file half.
UNDERDETERMINED passes — a hasher that takes the case file from any path, a staging directory or a copy outside the repository.
UNDERDETERMINED, from the binding — no criterion says when the hash is computed relative to reading the case, and hashing bytes never needs the parse.
UNDERDETERMINED passes — a hasher that returns a value for any file's bytes, including a case file whose frontmatter does not parse and for which the base admits no case at all.
UNDERDETERMINED, from the binding — criteria 1 through 5 are satisfiable by an implementation that hashes a decoded-and-re-encoded form of the file, because criterion 4 excludes only a re-serialisation of the parsed case and text decoding is not a parse of the case.
UNDERDETERMINED passes — a hasher applying universal newline translation, dropping a byte-order mark, or stripping a trailing newline.
REMAINDER, from the binding — the two bound definitions carry rules this task's criteria do not reach: that publication counts the version, that a case declares at least one hypothesis and both fallbacks, that the curator notes never reach any prompt, that a case under edit becomes published only through publication, that a publication check refuses it, and that nothing approves its publication.
REMAINDER belongs — the sibling tasks of `epic/case-publication` that count the version, run the contract check, answer the refusals and gate the trigger; the curator notes never reaching a prompt belongs to the investigation act.
From the binding — criteria 1 and 2 divide the case file into frontmatter and body, and the node that states that partition, `rule/knowledge/the-frontmatter-holds-everything-the-case-declares`, is outside this epic's candidates, so the criteria stay demonstrable from the bound nodes while the executor writing the two tests names a partition the base states elsewhere.
Decision, beyond the covers — stand: `rule/knowledge/the-frontmatter-holds-everything-the-case-declares` and `rule/knowledge/the-body-does-not-change-what-is-collected` are `epic/case-shape`'s claim, bound by `task/case-shape/case-file-reader`, which this task depends on, so the partition is delivered once where the file is read rather than restated where it is hashed.
From the binding — the base places the curator's prose two ways, as a declared `curator_notes` attribute and as the body below the frontmatter, and nothing about this task's outcome turns on which is right since the hash covers both regions; a test that edits the body and calls that edit the curator prose conflates two things the base keeps apart.
