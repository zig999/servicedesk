---
type: invariant
statement: A case version's requires-evaluation-of lists exactly the hypothesis names its own manifest's entries reference, and never the version's fallback.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
---

## Description

requires-evaluation-of is a derivation over the version's own manifest, the same as the collection plan already is: each entry contributes the name of the hypothesis whose revision it references, and nothing outside the manifest contributes at all.
The fallback is a disguised default hypothesis, but it is a resolution rather than a manifested hypothesis and it claims nothing about the world, so there is nothing about it to evaluate: it answers when no listed hypothesis confirms, never by holding an evaluation of its own.
This is the set one-evaluation-per-required-hypothesis holds its totality against, so evaluations covering every hypothesis the manifest names cover requires-evaluation-of whole.
