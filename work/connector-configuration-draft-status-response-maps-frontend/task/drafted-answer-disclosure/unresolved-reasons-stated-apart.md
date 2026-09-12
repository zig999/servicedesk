---
title: An unresolved item is stated by one of exactly three reasons
summary: Each unresolved item carries its name and its reason, the three reasons the draft's vocabulary
  holds stand apart from one another, and no reason outside those three is named.
rationale: Cut apart from the wording work because the label standing for a reason the vocabulary does
  not hold is a defect of the enumeration this surface reads, not of how a message is phrased, and it
  would change again only if that enumeration changed.
objective: The surface names, for the unresolved items of an answered draft, exactly the three reasons
  the draft's unresolved-reason vocabulary holds.
criteria:
- Each unresolved item the answer carries is stated with the name that answer gave it.
- Each unresolved item is stated with the reason that answer named for it.
- Each of no-capability-registered, security-scheme-not-reducible-to-a-credential and drafted-key-occupied-by-another-security-scheme
  is stated distinguishably from the other two, none presented as another.
- No reason outside those three is named by the surface for any unresolved item.
- No unresolved name the answer did not carry is stated.
sources:
- intake/scope.md
implements:
- rules/integration/an-answered-draft-request-states-its-draft-to-the-operator
- domain/integration/connector-configuration-draft
- domain/integration/connector-configuration-draft-unresolved-item
- domain/integration/connector-configuration-draft-unresolved-reason
---

## What it is
The correction of the surface's reason dictionary to the closed set of three the specification holds.
The dictionary today carries a fourth key that the vocabulary does not hold.

## Notes
REMAINDER, from the specification -- The clause requiring the surface to state the drafted configuration text reaches no criterion of this task. Belongs to the sibling task of this epic that states the answered draft's configuration text on the surface.
REMAINDER, from the specification -- The clause requiring every generated credential the answer carries, each by the generated name and by the security scheme's own name, reaches no criterion of this task. Belongs to the sibling task of this epic that states the answer's generated credentials.
REMAINDER, from the specification -- The clause requiring every status reading the answer carries, each by its status, its ending and what the document declared it as, reaches no criterion of this task. Belongs to the sibling task of this epic that states the answer's status readings.
REMAINDER, from the specification -- The clause requiring every response field the answer carries, each by its name, its path and the status it was read from and, where carried, its declared type, its declared required listing and the envelope it was read through, reaches no criterion of this task. Belongs to the sibling task of this epic that states the answer's response fields.
REMAINDER, from the specification -- The clause requiring every reading note the answer carries, each by its kind and its subject and, where carried, its detail, each kind stated apart from every other kind the draft's own note-kind vocabulary holds, reaches no criterion of this task. Belongs to the sibling task of this epic that states the answer's reading notes by kind and subject.
REMAINDER, from the specification -- The clause requiring that, where the answer carries a method mismatch, the surface state the method named as currently registered together with the method named as the drafted operation's, neither standing for the other, and that where the answer carries none no mismatch is stated at all, reaches no criterion of this task. Belongs to the sibling task of this epic that states the answer's method mismatch.
ADVISORY, from the specification -- rules/integration/a-connector-configuration-draft-response-carries-no-capability is among the candidates and speaks of the same three-reason vocabulary, but it constrains the shape of the answer draft-connector-configuration-from-openapi returns, not what a surface states about it, so no criterion of this surface task answers it. The reason names this task's third criterion distinguishes are held by domain/integration/connector-configuration-draft-unresolved-reason, which currently holds exactly the three the task names.
