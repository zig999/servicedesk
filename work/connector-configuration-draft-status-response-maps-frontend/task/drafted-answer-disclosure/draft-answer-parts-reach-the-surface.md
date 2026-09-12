---
title: The grown draft answer reaches the surface whole
summary: The frontend's own reading of a draft answer admits the status readings, response fields and
  reading notes it now carries, instead of dropping them.
rationale: Cut as its own task because it changes one seam -- what the frontend admits from the draft
  answer -- and the statements made over those parts are each a separate consumer of that seam.
objective: Every attribute the connector configuration draft element declares survives the frontend's
  reading of a draft answer and is available to the surface that states it.
criteria:
- A draft answer carrying status readings yields, on the frontend's reading of it, each status reading
  with its status, its ending and, where the answer carried it, what the document declared that status
  as.
- A draft answer carrying response fields yields each response field with its name, its path and its status,
  and with its declared type, its declared required listing and its envelope where the answer carried
  them.
- A draft answer carrying reading notes yields each reading note with its kind and its subject, and with
  its detail where the answer carried one.
- The frontend's reading admits each of the nine kinds the draft's reading-note vocabulary holds and no
  kind outside it.
- The frontend's reading of a draft answer admits one field per attribute the draft element declares and
  no capability name, version or count.
- No module of the frontend issues a request to the OpenAPI document link the operator named; the draft
  and the operations listing are read only through the backend operations that fetch it.
sources:
- intake/scope.md
implements:
- contracts/integration/connector-configuration-draft
- domain/integration/connector-configuration-draft
- domain/integration/connector-configuration-draft-status-reading
- domain/integration/connector-configuration-draft-response-field
- domain/integration/connector-configuration-draft-reading-note
- domain/integration/connector-configuration-draft-reading-note-kind
- rules/integration/a-connector-configuration-draft-response-carries-no-capability
- constraints/the-openapi-document-is-fetched-by-the-backend
---

## What it is
The frontend type of a connector configuration draft and the allow-list that filters the answer into it, both grown to admit the answer's three new parts.
It is the one place those parts are currently discarded before any surface could state them.

## Notes
UNDERDETERMINED, from the specification -- Criterion 1 requires each status reading's ending to survive the reading but bounds its vocabulary nowhere, while criterion 4 does exactly that bounding for the reading-note kinds. domain/integration/connector-configuration-draft-status-reading declares ending's type as domain/investigation/evidence-result, which is not among the candidates, so the executor has the type named and no values to admit or refuse against it. A frontend reading that admits a status reading's ending as an unconstrained string, carrying an answer whose ending is not one of evidence-result's own values as an ending like any other, satisfies the criterion as written.
Decision, beyond the covers — stand: domain/investigation/evidence-result is an unrelated, unchanged element this epic does not touch; growing the claim to cover it would be scope creep for a reference this task only reads, never redefines.
ADVISORY, from the specification -- Criterion 5 is total over the draft element: it requires one field per attribute domain/integration/connector-configuration-draft declares, which includes generated_credentials typed connector-configuration-draft-generated-credential and method_mismatch typed connector-configuration-draft-method-mismatch. Neither of those two elements is among the candidates, so the member shapes the reading must admit for those two attributes are not readable from this task's nodes.
Decision, beyond the covers — stand: domain/integration/connector-configuration-draft-generated-credential and domain/integration/connector-configuration-draft-method-mismatch are unrelated, unchanged elements this epic does not touch; growing the claim to cover them would be scope creep for references this task only reads, never redefines.
REMAINDER, from the specification -- The clause of rules/integration/a-connector-configuration-draft-response-carries-no-capability's statement holding that what the draft could not resolve for want of a registered capability reaches the answer only as an unresolved item with reason no-capability-registered reaches no criterion of this task; this task's criteria read an answer already produced and decide nothing about how a generation-time capability read becomes an unresolved reason. Belongs to the backend task that generates the draft answer, under the connector-configuration-draft backend epic.
ADVISORY, from the specification -- rules/integration/an-answered-draft-request-states-its-draft-to-the-operator is the candidate whose statement demands the surface state each status reading, each response field and each reading note. No criterion of this task demonstrates anything stated to the operator -- the criteria stop at what the reading yields and at availability -- so that rule is left to the consumer tasks. Nothing here fails if the reading admits every attribute and no surface ever states one.
