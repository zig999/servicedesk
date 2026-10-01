---
entries:
- field: attributes
  unstated: The material's own worked example nests, per asking capability, that capability's version, connector and answered concept, and a schema hint (the property's own declared type and description), alongside the attribute and whether it is required.
  decided: The element declares only attribute and required; the capability itself is a relationship, by reference, to domain/integration/capability — never a restatement of its version, connector or concept, each already that capability's own declared fact, and never the schema's hint, which is presentation guidance for an operator's panel rather than a domain fact this specification holds.
  why: constraints/the-stored-schema-mirrors-the-declared-model already refuses a column no attribute declares for a stored fact; the same reasoning, applied to a derived read instead of a stored one, refuses a field that only restates what the referenced capability's own aggregate already answers, and SPEC-001's own floor admits no technical artifact such as a schema's free-text hint.
- field: attributes
  unstated: Whether the requirement's attribute field keeps its type domain/glossary/subject-attribute once that vocabulary is eliminated, or is restated as a bare string, and whether its description keeps naming "which glossary subject-attribute it is".
  found: 'temp/analise-subject-attribute-para-input-schema.md, section 4: "domain/knowledge/case-input-requirement — o campo attribute idem; a descrição deixa de dizer ''which glossary subject-attribute it is''"'
---
