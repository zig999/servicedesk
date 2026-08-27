---
title: Case result panel
summary: Renders the outcome/referral/text of the last full-case run, the in-memory run history, and the compare and stale-marking behavior.
sources:
  - work/case-simulation-frontend/intake/scope.md
objective: The Case result region, shown only after a full-case run, presents the outcome/referral/determining line and the customer-facing text in a box labeled by the register actually used, keeps this session's run history in memory with a side-by-side "Compare" by hypothesis, and marks the last run "stale" when told the underlying version has changed.
criteria:
  - The region renders nothing until at least one full-case run has completed this session, and shows the outcome, the referral, and the determining hypothesis (absent when the fallback answered) once one has.
  - The customer-facing text box shows exactly assessment.text, labeled with assessment.register (the register the writing call actually used), and shows no other field of the record next to it.
  - Every full-case run this session is kept in an in-memory list, never persisted, never sent to any endpoint, never entering any cache — satisfying rules/investigation/a-simulation-writes-no-investigation.
  - A "Compare" action shows two runs from the in-memory history side by side, hypothesis by hypothesis.
  - The last run is marked "stale" once told the version has changed underneath it, without requiring a new run to clear the marking itself.
depends_on:
  - task/simulation-cockpit/use-simulate-case
reference:
  - layout/simulation-screen.md
implements:
  - contracts/investigation/case-simulation
  - domain/investigation/assessment
  - domain/investigation/evaluation
  - domain/investigation/verdict
  - domain/knowledge/resolution
  - domain/knowledge/referral
  - domain/knowledge/case-version
  - contracts/knowledge/case-lifecycle
  - rules/investigation/a-simulation-writes-no-investigation
  - scenarios/investigation/a-draft-case-version-is-simulated
  - scenarios/investigation/a-single-hypothesis-is-simulated
---

## What it is

The bottom region of the layout, described in the scope's "Case result" section, including D9's tokens-not-currency and D10's in-memory-only history.

## Notes

Criterion 2 originally asked for a register the response "actually used" without a stated fact backing it. This was a genuine specification silence, settled during this same planning session: `domain/investigation/assessment` now carries a required `register` attribute (the version's own declared register when it holds one, the consolidation adapter's own default otherwise) — logged in `knowledge/decision-log.md` at `domain/investigation/assessment.md`/`attributes`. Criterion 2 reads directly from that field now.
