---
type: policy
statement: A simulate-hypothesis request naming a hypothesis absent from the named case version's manifest is refused with an HTTP 404 response reporting a HypothesisNotInManifestError.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis
consistency: eventual
---

## Description

`simulate-hypothesis` narrows its run to one hypothesis named by the request; a name the pinned case version's manifest currently holds no entry for is not an ordinary empty result the caller could read as though something answered to it, but a refusal of its own — the same distinction `a-case-read-by-an-unknown-slug-or-version-is-refused`, `a-connector-configuration-read-by-an-unregistered-name-is-refused` and `a-glossary-read-by-an-unheld-name-is-refused` already draw for a miss elsewhere in this specification.
