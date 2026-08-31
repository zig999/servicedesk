---
title: Read a case version's input requirements
summary: A hook over GET /v1/cases/{slug}/versions/{version}/input-requirements returning both halves
  of what that read answers.
rationale: Cut as its own task because this endpoint has no frontend consumer at all today, so the read
  is a new interface and every other item of the scope is one of its consumers; the app's own registry
  list-hook shape is what it has to follow rather than a second fetch convention.
sources:
- work/case-simulation-input-requirements/intake/scope.md
objective: A hook returns, for a pinned case slug and version, that case version's derived input requirements
  and, apart from them, the capabilities the read names as holding no well-formed input schema.
criteria:
- The hook reads /v1/cases/{slug}/versions/{version}/input-requirements for the slug and version it is
  given, through the app's own apiFetch rather than a fetch of its own.
- Each requirement it returns carries its own attribute name, its own required flag, and the capabilities
  that ask for that attribute.
- Each capability a requirement names is carried by name and version alone, with no other field of that
  capability's registration restated.
- The capabilities the read names apart from the requirements are returned as their own list, never merged
  into any requirement's own capabilities.
- A read answering no requirements at all returns an empty requirement list rather than an error state.
- The hook reports its own loading state, its own error state and a void-returning refetch, in the registry
  list-hook shape use-capabilities.ts already keeps.
implements:
- contracts/knowledge/case-input-requirements
- domain/knowledge/case-input-requirement
- domain/integration/capability
---

## What it is
The first frontend read of the published read-case-input-requirements operation, returning the requirements and the malformed-schema capabilities as two separate things because the response names them separately.
It reads the response's fields and nothing more, the same narrowing every sibling list hook in this app already keeps.

## Notes
contracts/knowledge/case-input-requirements answers for a case version in either state, draft included, so this read is not conditioned on the pinned version having been released.
domain/knowledge/case-input-requirement states that a capability referenced there already carries its own name, version, connector and concept and that nothing restates them, which is why the capability identity this hook returns is bare.
UNDERDETERMINED, from the specification -- criterion 4 constrains where the separately-named malformed-schema list sits but not what each of its entries carries; domain/knowledge/case-input-requirement states that such a capability is named apart from the attributes, by identity alone, and that is the whole of what reaches the person composing a subject about it, so a passing implementation must not restate that capability's nature, connector, schemas, timeout or answered concept alongside its name and version.
REMAINDER, from the specification -- rules/investigation/a-composed-subject-presents-every-case-input-requirement (presenting one input per requirement, carrying the required flag, naming every asking capability with its connector, and disclosing an empty requirement set) reaches no criterion of this task: this task returns data and presents nothing.
Belongs: the task that presents the composed-subject attribute inputs before a simulate-case or simulate-hypothesis call.
REMAINDER, from the specification -- rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability (disclosing the malformed capability's identity to the composer) reaches no criterion of this task: this task carries the list in its return and discloses it to nobody.
Belongs: the task that renders the composed-subject panel.
REMAINDER, from the specification -- rules/investigation/a-subject-attribute-is-drawn-from-the-glossary, rules/investigation/a-subject-carries-at-least-one-attribute and rules/investigation/a-subject-holds-one-value-per-attribute each state a condition over an assembled subject's attribute-values; this task returns a case version's derived requirements, not attribute-values.
Belongs: the task that assembles and holds the composed subject's attribute-values.
REMAINDER, from the specification -- rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses, rules/investigation/a-simulation-carries-its-requester and rules/investigation/a-pending-simulation-call-is-not-dispatched-again each state a condition over the simulate-case and simulate-hypothesis calls; this task calls neither operation.
Belongs: the task that dispatches the simulate-case and simulate-hypothesis calls, and the backend act that runs the collection.
Advisory: domain/investigation/subject and the scenarios grounding presentation, degradation and disclosure are candidates this task's criteria do not answer; they need the presenting and dispatching tasks to stay covered.
