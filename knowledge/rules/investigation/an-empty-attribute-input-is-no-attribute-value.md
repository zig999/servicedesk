---
type: invariant
statement: An attribute input left empty at the interface assembling a subject, empty meaning holding no content or holding whitespace alone, contributes no attribute-value — the interface assembles no attribute-value pairing that attribute's name with an empty value, and the subject it assembles omits that attribute exactly as one whose input was never offered.
constrains:
  - domain/investigation/subject
---

## Description

The interface presents one input per the pinned case version's own case-input-requirements and nothing beyond that set (`a-composed-subject-presents-every-case-input-requirement`), so leaving an input empty is the only way the composer can say they hold no value for the attribute it names — including a required one, which a simulation deliberately lets them run without (`a-simulated-subject-missing-a-requirement-degrades-not-refuses`).

An empty value assembled as a pair would occupy the place of a fact about the instance while identifying nothing by it, and each consumer of the set would have to read it back as an absence on its own account: the coverage check at the diagnose door already does (`a-diagnosed-subject-covers-its-cases-required-attributes`), while at assembly an empty first arrival would hold the attribute's one place against a later real value (`a-subject-holds-one-value-per-attribute`). Assembling nothing keeps the set to what the composer actually supplied, so a subject every one of whose inputs was left empty carries no attribute-value at all and meets `a-subject-carries-at-least-one-attribute`'s own refusal rather than passing it holding pairs that identify nothing. This is the reading this specification already gives an empty attribute elsewhere, stated for a different field by `an-empty-ticket-reference-is-no-ticket-reference`.

An input holding whitespace alone is empty in the sense this rule means: the composer who typed only spaces has supplied nothing that identifies the instance, and no capability's connector could derive a call from it — the same reading `rules/integration/a-draft-request-is-offered-only-over-a-named-connector-and-a-chosen-operation` and `rules/knowledge/a-case-authoring-surface-offers-no-submission-while-required-content-is-absent` each already take of a surface field holding whitespace alone.

What this governs is what the composing interface assembles, not what a call must accept: the diagnose door's own reading of an empty attribute-value stands for a subject that reached it from anywhere else.
