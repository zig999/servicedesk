---
subject: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
given:
  - case version 1 of a case is in draft state
  - its manifest places hypothesis alpha at position 1, pinning alpha's revision 1, itself in
    released state
  - its manifest places hypothesis beta at position 2, pinning beta's revision 1, itself in
    draft state
when:
  - the curator releases case version 1
then:
  - the release is refused, reporting a CaseVersionNotReleasableError that names beta among its
    violations
  - case version 1 stays in draft state
  - alpha's revision 1 and beta's revision 1 are both unaltered
involves:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
---

## Description

The manifest entry for beta was always free to place — nothing about pointing at a draft revision was ever refused. Only release reads it, and only release refuses on it, naming beta so the curator knows exactly which hypothesis to release before trying again.
