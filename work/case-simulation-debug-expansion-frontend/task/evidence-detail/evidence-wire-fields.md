---
title: The simulate response evidence types carry the whole item
summary: Both wire-shaped evidence types declare every attribute the response already
  sends, including capability_payload_notes.
objective: The frontend's two simulate-response evidence types declare and carry inputs,
  observed_at, ttl and capability_payload_notes, so no attribute the response sends
  is lost at the type boundary.
criteria:
- SimulateEvidenceItem in use-simulate-case.ts declares capability_payload_notes as
  a string field.
- The hypothesis-run Evidence type in use-simulate-hypothesis.ts declares capability_payload_notes
  as a string field.
- Both types declare inputs, observed_at and ttl.
- A simulate-case response whose evidence items carry capability_payload_notes reaches
  the hook's caller with that value intact.
- An evidence item whose capability declared no payload notes reaches the caller as
  the empty string the response sent, not as an absent field and not as substituted
  text.
rationale: The scope names evidence enrichment as one item; it is cut here at the
  wire boundary because the type declaring what the backend sends and the adapter
  deciding what the UI shows change for different reasons, and the inventory records
  capability_payload_notes as never having reached the wire types at all rather than
  merely being dropped in conversion.
sources:
- work/case-simulation-debug-expansion-frontend/intake/scope.md
implements:
- contracts/investigation/case-simulation
- domain/investigation/evidence
- rules/investigation/presentation-reads-the-evidence-snapshot
- rules/investigation/an-evidence-items-observed-at-is-a-utc-instant
- rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation
---

## What it is
The two response types that stand between a simulate call and everything that renders it.
They already carry inputs, observed_at and ttl; capability_payload_notes is absent from both.
This task closes that gap on both, since neither type imports the other.

## Notes
The inventory records the snake_case convention for these wire types, with renaming left to the adapter.
UNDERDETERMINED, from the specification — The criteria pin that observed_at and ttl are declared, but nothing pins what value crosses the boundary. rules/investigation/an-evidence-items-observed-at-is-a-utc-instant requires the instant to be carried as UTC "wherever the item is stored, returned, presented or judged", and rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation fixes ttl as a count of seconds from that same observed_at; a criterion demanding the response's own values reach the caller unconverted is what would demonstrate either.
A passing implementation that would defeat this as written: both simulate-response evidence types declare observed_at and ttl, with the hooks parsing observed_at into a browser-local Date and exposing ttl as a milliseconds figure derived from it.
UNDERDETERMINED, from the specification — Criterion five protects capability_payload_notes' empty string across the boundary, but no criterion does the same for inputs. rules/investigation/an-evidence-item-that-sent-no-inputs-records-an-empty-object fixes that a parameterless collection records the empty JSON object text `{}`, and rules/investigation/a-presented-evidence-items-inputs-are-shown-with-a-resolved-credential-masked states that an item recorded with empty inputs shows that emptiness.
A passing implementation that would defeat this as written: both types declare inputs, and the hook maps an item whose inputs are `{}` to a placeholder text (or to an absent field) before handing it to its caller.
UNDERDETERMINED, from the specification — The criteria enumerate four attributes, while domain/investigation/evidence also declares observation, result_detail, fields and concept_description on the same element, and rules/investigation/presentation-reads-the-evidence-snapshot holds a surface to showing fields and concept_description too. The objective's "no attribute the response sends is lost" is therefore demonstrated for four attributes only.
A passing implementation that would defeat this as written: both types declare only concept, result, inputs, observed_at, ttl and capability_payload_notes — fields, concept_description and result_detail never cross the boundary.
REMAINDER, from the specification — The masking clause of rules/investigation/a-presented-evidence-items-inputs-are-shown-with-a-resolved-credential-masked reaches no criterion of this task; this task only carries inputs across the type boundary.
Belongs to: the task that renders an evidence item's inputs on the curator's simulation surface.
REMAINDER, from the specification — rules/investigation/a-simulation-session-retains-its-runs-and-shows-one reaches no criterion of this task; no criterion here addresses retention or selection.
Belongs to: the task implementing the simulation surface's run history and run selection.
