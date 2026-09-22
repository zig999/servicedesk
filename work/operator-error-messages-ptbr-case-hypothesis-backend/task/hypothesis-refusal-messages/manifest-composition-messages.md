---
title: PT-br messages for the three refusals a case version's manifest raises
summary: HypothesisNotInManifestError, ManifestPositionOccupiedError and ManifestWouldHoldNoHypothesisError
  rewritten in PT-br, each naming the case version's manifest and what about it refused the act.
rationale: These three are cut together because they share one reason to change — how the manifest of
  a case version is told to an operator whose composing act it refused — and all three name the same case
  and version in the same position.
sources:
- /home/siegfriedneto/projects/servicedeskn1/work/operator-error-messages-ptbr-case-hypothesis-backend/intake/scope.md
implements:
- rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
- rules/knowledge/a-hypothesis-position-is-unique-within-its-case
- rules/knowledge/a-case-has-at-least-one-hypothesis
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
objective: The three refusals raised by a case version's manifest carry PT-br messages stating the same
  fact their English text stated.
criteria:
- HypothesisNotInManifestError's message is in PT-br and names the hypothesis, the case slug and the version
  number whose manifest does not hold it.
- ManifestPositionOccupiedError's message is in PT-br, names the case slug, the version number and the
  occupied position, and states that a manifest position is unique within its case version.
- ManifestWouldHoldNoHypothesisError's message is in PT-br, names the case slug and the version number,
  and states that removing the entry would leave that manifest holding no hypothesis and that a manifest
  declares at least one entry.
- The three messages are distinguishable from one another by their text alone, so an operator reading
  one can tell which of the three conditions occurred.
- The three messages name the case and the version in the same order and with the same PT-br wording as
  one another.
- No message states a fact its English original did not state, and every interpolated value in each PT-br
  message also appeared in that class's English message.
- Each message uses "caso" for a case, "versão" for a case version, "hipótese" for a hypothesis, "manifesto"
  for a manifest and "posição" for a manifest position, and uses no English domain noun.
- Each of the three classes' name property still holds its unchanged class-name string.
- src/src/errors/status-map.ts is unchanged and still maps each of the three classes to the HTTP status
  it mapped to before.
- Each of the three classes' context property holds exactly the properties and values it held before,
  with no value moved into or out of it.
- The suite under src/src/__tests__ passes with no test file changed.
---
## What it is
The three refusals whose subject is what a case version's manifest holds: a hypothesis it does not hold, a position already taken, and a removal that would empty it.
Two of them are the composing refusals the specification already states a distinct frontend presentation for, which makes their text the operator's only reading of them on any other client.

## Notes
The frontend manifest surface presents its own wording for two of these three and never repeats the backend message, so the PT-br text here is read by API clients and logs rather than by that screen.
None of the three is asserted against literal message text by any existing test.
REMAINDER, from the specification — the enforcement clauses of a-hypothesis-position-is-unique-within-its-case and a-case-has-at-least-one-hypothesis (that no two entries share a position, that a manifest keeps at least one entry) belong to the already-delivered place-hypothesis/remove-hypothesis act, not to this message-rewrite task.
ADVISORY, from the specification — a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for governs the frontend manifest surface's own wording for two of these three refusals and is outside this epic's covers; a frontend that rendered the rewritten wire message in place of its own telling would be governed by that node.
