---
title: The identity read answers payload notes
summary: The read-capability-by-identity answer stating payload_notes as the registration
  holds it, and admitting it absent where the registration declared none.
rationale: The scope states that the presentation must admit payload notes as the
  one legitimately absent attribute but not that this is separate work; the plan cuts
  it from the registration task because the read's answer is a seam the registration
  task's consumers stand behind, and it is demonstrable on its own against a capability
  already registered.
sources:
- work/capability-payload-notes/intake/scope.md
objective: The identity-keyed read of a capability answers payload_notes exactly as
  that capability's own registration holds it, absent exactly where it holds none.
criteria:
- The identity read of a capability registered with payload notes answers that same
  text.
- The identity read of a capability registered without payload notes answers no payload_notes
  value, rather than an empty or substituted one.
- The answer's own validation does not refuse an answer in which payload_notes stands
  absent and every other declared attribute stands present.
- The answer's own validation refuses an answer in which nature, input_schema, output_schema,
  timeout, connector or concept stands absent, so payload_notes is the only attribute
  admitted absent.
- The payload_notes the identity read answers is drawn from the registration standing
  at that name and version, never from the content a register-capability submission
  carried.
depends_on:
- task/capability-payload-notes/capability-declares-payload-notes
implements:
- domain/integration/capability
- rules/integration/a-capability-declares-its-contract
- rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
---

## What it is

The task makes the identity-keyed capability read answer the new attribute, and makes its response shape admit that one attribute standing absent.
It states what the read answers for a capability that declared payload notes and for one that did not.

## Notes

The response shape currently requires every capability attribute with no attribute admitting absence, so admitting payload_notes absent without narrowing any other attribute is what separates this task from a blanket loosening of that shape.
What an operator-facing surface renders from this answer is not this task's outcome; the target named by the scope is the backend.
REMAINDER, from the specification -- clauses of rules/integration/a-capability-declares-its-contract's statement no criterion of this task reaches: the sixty-second default for an unstated timeout, the positive-integer millisecond bound, and the HTTP 422 IncompleteCapabilityContractError refusal; only its clause that an attribute absent or an empty string is undeclared reaches this task, fixing what "registered without payload notes" means for the read. It belongs to the epic's registration task -- the registration's own validation and refusal, not the identity read.
UNDERDETERMINED, from the specification -- no criterion says what the identity read answers for a capability whose stored registration holds payload_notes as an empty string. rules/integration/a-capability-declares-its-contract states an empty string is undeclared and domain/integration/capability's Responsibility states an absent declaration is a capability that simply has none, so an implementation reading "registered without payload notes" as literally-absent-only satisfies every criterion as written while answering a value the registration declares nothing by. Would pass: the identity read answering payload_notes as the empty string for a capability whose registration holds payload_notes as an empty string, treating only a literally absent stored value as "registered without payload notes" -- every criterion as written still passes, since none names the empty-string registration.
REMAINDER, from the specification -- constraints/the-stored-schema-mirrors-the-declared-model and constraints/the-schema-replays-from-its-scripts reach no criterion of this task; criterion 5 presupposes a column pairing with domain/integration/capability's declared payload_notes attribute and reachable by numbered-script replay, but no criterion here creates, alters or replays any relation. Both belong to the epic's task that makes a capability registration hold payload_notes in the store, with its migration script.
REMAINDER, from the specification -- most of rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them's statement is about the surface rather than the read (stating name, version and every declared attribute exactly as the answer carried each, carrying all of them from the first moment the presentation stands, drawing none of them from a list-capabilities page or the concept-keyed read-capability, and leaving an operator's own edit untouched); this task reaches only that rule's read-side premises. It belongs to the epic's frontend task for the capability detail surface keyed on name and version.
ADVISORY, from the specification -- within rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them, the statement speaks of the answer "carrying none" and payload notes "standing absent", while the expression still speaks of "that answer's own payload_notes was empty" and payload_notes "presented empty". This task fixes the read's answer to absence rather than an empty value (criterion 2), leaving the expression's empty-answer branch describing a shape this task's read never produces; the decision log records the absence fact as gained by that node's statement field, so the statement is the reading taken here.
ADVISORY, from the specification -- domain/investigation/evidence, domain/investigation/hypothesis-evaluator and rules/investigation/judgment-reads-the-evidence-snapshot govern the collection-time snapshot and the judgment's reading of it, not the identity read, and are not implemented here. domain/investigation/evidence states that a capability registered with none, and an observation whose capability never resolved, both snapshot capability_payload_notes as an empty string; that snapshot's empty string must not be carried into this identity read's answer.
