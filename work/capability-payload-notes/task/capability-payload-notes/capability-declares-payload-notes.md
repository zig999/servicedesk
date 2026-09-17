---
title: A capability holds its payload notes
summary: The optional payload_notes attribute on the Capability element, on the register-capability
  submission, and in the relation that stores a registered capability.
rationale: The scope states the attribute and its optionality but not where the work
  is cut; this task takes registration and storage together because a registered attribute
  nothing stores is not held at all, and because the registry write is one decision
  with one reason to change.
sources:
- work/capability-payload-notes/intake/scope.md
objective: A capability registered with payload notes holds exactly that text at its
  name and version, and a capability registered without them holds none.
criteria:
- A register-capability submission carrying payload_notes is accepted and the capability
  standing at that name and version holds the same payload_notes text.
- A register-capability submission carrying no payload_notes is not refused for that
  absence by the contract-completeness check.
- A registration whose payload_notes is an empty string yields a capability holding
  no payload notes, the same as one stating none at all.
- A capability re-registered whole at the same name and version without payload_notes
  holds none afterwards, never the text an earlier registration carried.
- The relation holding a registered capability has one column pairing with payload_notes
  and no column pairing with no declared attribute.
- Applying the numbered migration scripts in order to an empty database produces that
  column with no step performed by hand.
- A capability row stored before that column existed reads back as a capability holding
  no payload notes, never as a read failure.
implements:
- domain/integration/capability
- rules/integration/a-capability-declares-its-contract
- constraints/the-stored-schema-mirrors-the-declared-model
- constraints/the-schema-replays-from-its-scripts
---

## What it is

The task makes payload_notes an attribute a capability may declare at registration and one the registry stores and answers with.
It carries the attribute through the registration submission's own shape, through the held capability the registry builds, and through the three enumerations the relational store keeps of a capability's attributes.

## Notes

The store enumerates a capability's attributes separately for its row shape, its reading and its write statement, so the attribute standing in one of them and not the others is the shape this task's criteria are meant to falsify.
The declared attribute is optional and absent, not required-and-possibly-empty, which is a different shape from the one the evidence snapshot takes of it.
REMAINDER, from the specification -- clauses of rules/integration/a-capability-declares-its-contract's statement that no criterion of this task reaches: the declaration of input schema, output schema and timeout as a positive integer count of milliseconds, the sixty-second default for an unstated timeout, and the positive half of the HTTP 422 IncompleteCapabilityContractError refusal; this task reaches only that an attribute absent or an empty string is undeclared, and that an absent optional attribute is not refused. These clauses belong to the already-delivered capability-registration work that implements contract-completeness and the timeout default; no criterion here alters them.
REMAINDER, from the specification -- rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them states that payload_notes may stand absent throughout a capability presentation and stands absent exactly where the identity read's answer carried none; no criterion of this task addresses any presentation, so it belongs to the sibling task presenting a registered capability's declared attributes as the read answered them.
REMAINDER, from the specification -- rules/investigation/judgment-reads-the-evidence-snapshot states that a hypothesis's judgment reads only its own evidence's snapshotted concept, field semantics and capability payload notes, never re-reading the capability registry; this task never collects, snapshots or judges, so it belongs to the sibling task that snapshots capability payload notes onto evidence and feeds them to judgment.
ADVISORY, from the specification -- domain/investigation/evidence and domain/investigation/hypothesis-evaluator are candidates that neighbor this task without governing it: both speak of the snapshot taken from a capability's payload_notes at collection, not of registering, storing or migrating the attribute on the capability itself. They are left unimplemented here deliberately, not overlooked.
ADVISORY, from the specification -- criteria 1, 2 and 4 exercise the register-capability submission and its whole-replacement of whatever stood at a name and version; within the candidates, the submission is backed only by domain/integration/capability's own Responsibility, and the whole-replacement fact appears only as prose inside two candidates this task does not implement. contracts/integration/capability-registry, the node publishing register-capability and its create-or-replace keying, is outside the candidates.
Decision, beyond the covers — stand: this note is advisory only, observing where the write's create-or-replace keying is stated in contracts/integration/capability-registry's own text; no criterion of this task rests on that contract, and growing the epic's claim to a contract this task does not implement would misstate what the epic actually covers.
