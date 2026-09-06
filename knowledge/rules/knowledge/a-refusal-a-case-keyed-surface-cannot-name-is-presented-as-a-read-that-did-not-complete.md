---
type: invariant
statement: >-
  A surface presenting one case a reader named, meeting a refusal of a read it made for
  that case whose error code it holds no presentation of its own for, presents that
  refusal as a read of the case that did not complete — the same statement it makes for
  any read of that case that did not complete — and discloses nothing further about the
  refusal: neither the error code, nor the refusal's own message, nor any value the
  refusal carries.
expression: >-
  For a case c and a surface presenting c to a reader who named c: where a read that
  surface made for c is refused, and the error code that refusal carries is one the
  surface holds no presentation of its own for, the surface states of c exactly what it
  states where a read of c did not complete, indistinguishable from it, and states
  nothing else about the refusal — not the error code, not the refusal's message, not
  any value the refusal carries, and no attribute of c or of any version of c. Where the
  error code the refusal carries is one the surface does hold a presentation of its own
  for, the surface states that presentation and this says nothing about what it states.
constrains:
  - domain/knowledge/case
---

## Description

What a surface can tell a reader about a refusal is finite: a refusal arrives as an error code, and the surface states a condition for that code only where this specification has said what the condition is told as. A code it holds no presentation for is precisely the case nobody anticipated at the surface, and what an unanticipated failure is told as is already decided one level below. `constraints/a-domain-error-unmapped-by-status-is-refused-generically` answers a domain error the status map does not name with a fixed text that discloses nothing about it — not the error's own message, not any context it carries. This is that same reading taken at the surface which renders what the wire answered.

Which of the surface's own statements it lands in is not a new choice. `a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case` already holds three statements apart — a case that currently holds no version, a current version that does not read back as a case, and a read that did not complete — and each sends the reader to a different act: author a version, correct the version, attempt the read again. A refusal the surface cannot interpret leaves the outcome unknown, and attempting the read again is the only one of those three acts an unknown outcome supports. So it is presented as the read that did not complete, and never as either of the other two, each of which asserts a state of the case this surface has not learned.

Nothing further is disclosed for the same reason the wire-side fallback discloses nothing. A code the surface holds no presentation for is one whose meaning it cannot state, and putting the raw code, the refusal's message or a value it carries on the surface beside the statement would show the reader a fact in a form no node holds and no act follows from; a refusal's own message may also describe internal state, which the fallback below already keeps from the caller.

This decides nothing about which refusals a surface does hold a presentation of its own for. Wherever a node states what a reader is told for a named condition — `a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case` for a current version that fails validation at a read, itself refused by name over the wire by `a-case-version-failing-validation-at-a-read-is-refused-by-name`, and `a-case-holding-no-versions-is-told-explicitly` for a case that holds no version — that statement is owed and this rule never reaches it. The fallback is what remains after every such statement, never an alternative to one. `scenarios/knowledge/releasing-an-already-released-revision-tells-the-curator-so` already reads a surface this way from the other side, requiring a named refusal be told apart from the notice a failure whose reason the surface does not recognise receives; this states what that notice is on a case-keyed surface.

The rule adds no attribute, moves no pin and refuses no call. Which control carries the statement, how it is worded and where it sits are form and belong to the interface, as they do everywhere else this specification states what a surface tells a reader.
