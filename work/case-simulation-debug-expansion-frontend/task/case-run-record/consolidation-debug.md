---
title: The consolidation call's record under Case result
summary: A Debug block beneath Case result presenting the prompt, token usage, elapsed
  time and register of the call that wrote the text.
objective: 'A Debug block under the Case result section presents the shown run''s
  consolidation call record: its prompt, its input and output token counts, its elapsed_ms
  and the register it wrote in.'
criteria:
- After a case simulation run, a Debug block is presented under the Case result section.
- The block presents the consolidation prompt the run's assessment carries, whole.
- The block presents the consolidation call's input token count and its output token
  count.
- The block presents the consolidation call's elapsed_ms.
- The block presents the register that call used, as one of formal or plain.
- The values presented are the shown run's own, so selecting an earlier run in the
  session history presents that run's consolidation record.
depends_on:
- task/case-run-record/run-carries-its-record
rationale: The Debug block is introduced together with this first tab rather than
  as a task of its own, because a block holding no tab is nothing a reviewer could
  falsify; that pairing is my cut, and it is why the other two presentation tasks
  build on this one.
sources:
- work/case-simulation-debug-expansion-frontend/intake/scope.md
implements:
- contracts/investigation/case-simulation
- rules/investigation/a-simulation-session-retains-its-runs-and-shows-one
- rules/investigation/a-presented-consolidation-prompt-is-shown-whole
- domain/investigation/assessment
- domain/investigation/usage
- domain/knowledge/consolidation-register
---

## What it is
The case-level mirror of the per-hypothesis Debug's Prompt tab, for the one call that produces the text the requester would see.
Today the screen shows an aggregate writing duration and nothing else about that call.

## Notes
The inventory names the Tabs composition of the per-hypothesis Debug panel as the structure this block reuses rather than duplicates.
domain/investigation/assessment requires usage, elapsed_ms, prompt and register on every assessment, so a case run always carries all four.
REMAINDER, from the specification — rules/investigation/a-simulated-hypothesis-returns-the-runs-cost-and-durations reaches no criterion of this task; that rule's own text says a hypothesis run makes no consolidation call, with writing absent from its durations.
Belongs to: the task presenting a simulate-hypothesis run's cost and stage durations on the curator's simulation surface.
REMAINDER, from the specification — rules/investigation/a-presented-evidence-items-inputs-are-shown-with-a-resolved-credential-masked reaches no criterion of this task; this task presents only the consolidation call's record, and the prompt-shown-whole rule states expressly that a consolidation prompt is not the text that rule governs.
Belongs to: the task presenting collected evidence items and their inputs on the curator's simulation surface.
REMAINDER, from the specification — rules/investigation/the-customer-sees-only-the-text reaches no criterion of this task; every criterion here concerns a curator-facing Debug block.
Belongs to: the act delivering the end-customer-facing diagnosis response.
