---
title: Orphaned-connector-placeholder check refuses on any capability, not every capability
summary: Fixes the registration-time orphaned-placeholder check to refuse when a placeholder naming a
  Subject attribute is absent from any one currently-registered capability sharing the connector, not
  only when it is absent from every one of them.
sources:
- intake/connector-placeholder-orphan-union-scope.md
objective: Registering a connector configuration is refused when its own text names a placeholder for
  a Subject attribute absent from any one currently-registered capability sharing that connector's name,
  not only when absent from every one of them.
criteria:
- Registering a connector configuration against a connector with two currently-registered capabilities,
  where a placeholder naming a Subject attribute is present in one capability's input schema properties
  and absent from the other's, is refused.
- Registering a connector configuration whose every placeholder naming a Subject attribute is present
  in every currently-registered capability sharing that connector succeeds.
- Registering a connector configuration against a connector with no capability currently registered against
  it succeeds.
- Registering a connector configuration whose placeholder names the requester or a credential, present
  or absent from any capability's input schema, is not refused on that account.
implements:
- rules/integration/a-connector-placeholder-is-declared-by-its-capability
- scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused
- domain/integration/connector-configuration-registry
---

## What it is

Rewrites the connector-configuration registration's orphaned-placeholder check
(orphanedAcrossEveryCapability in connector-configuration-registry.service.ts) from an
intersection over every currently-registered capability's own orphaned-placeholder set to a
union, so a placeholder absent from any one capability sharing the connector is refused rather
than only one absent from all of them.

## Notes

ADVISORY, from the specification -- rules/integration/a-connector-placeholder-is-declared-by-its-capability's first clause already reads as "any one capability", matching the objective; the decision log's entry on the draft rule backs this reading ("can only ever be names every capability naming that connector declares").
UNDERDETERMINED, from the specification -- no criterion checks what the refusal reports. rules/integration/a-connector-placeholder-refusal-reports-every-orphaned-placeholder (not a candidate of this task) requires the error to name every orphaned placeholder together with the capability that fails to declare it, and the decision log already flags an open ambiguity on whether "the capability" means every failing capability or only one. Passes: a check that computes orphans by the any-one-capability rule this task requires, but still pairs each orphan with every capability sharing the connector (declaring or not), or throws with an empty or partial orphan list.
REMAINDER, from the specification -- the second clause of rules/integration/a-connector-placeholder-is-declared-by-its-capability, refusing a capability registration when the connector it names already holds a configuration embedding a placeholder absent from that registration's own input schema, reaches no criterion here.
Belongs: the capability registry's register-capability act, a task separate from this connector-configuration-registry task.
Decision, beyond the covers — stand: rules/integration/a-connector-placeholder-refusal-reports-every-orphaned-placeholder is not claimed in implements; this task changes only which placeholders are found orphaned, not what the refusal reports.
ADVISORY, from the specification -- criteria 2 and 3 assume a well-formed configuration; a test should register well-formed configurations so rules/integration/a-connector-configuration-holds-a-well-formed-object is not set against this task.
Decision, beyond the covers — stand: rules/integration/a-connector-configuration-holds-a-well-formed-object is not claimed in implements; this task assumes well-formed input and does not change that check.
