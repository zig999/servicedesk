---
title: Detail panel
summary: Renders the selected hypothesis's verdict, criterion, evidence and judgment metadata across three tabs.
sources:
  - work/case-simulation-frontend/intake/scope.md
objective: The Detail region, opened on selecting a hypothesis row, shows that hypothesis's verdict and citations, its criterion text, its evidence per concept, and its judgment metadata, across three tabs — Evidence (default), Prompt and JSON.
criteria:
  - The panel shows the selected hypothesis's verdict and every citation (concept and field) it carries.
  - The panel shows the hypothesis revision's own criterion text, per domain/knowledge/hypothesis-revision.
  - The Evidence tab shows, per collected concept, its result, the capability reference that produced it, its elapsed_ms, its observation in a collapsible JSON block, and its result_detail when present.
  - The Prompt tab shows the evaluation's own prompt exactly as materialized, in a monospace <pre>, for an evaluation a judgment call happened for; for an evaluation with reason no-data, the tab shows no prompt and states instead that judgment was never called.
  - The JSON tab shows the raw response for that hypothesis, verbatim and unsummarized.
  - The panel shows the judgment's model, prompt version, token usage and elapsed time when a judgment call happened.
  - The panel is composed only into this operator-facing cockpit route, never into any customer-facing surface, consistent with rules/investigation/the-customer-sees-only-the-text reserving this operational detail to the operation.
reference:
  - layout/simulation-screen.md
implements:
  - domain/investigation/investigation
  - domain/investigation/evidence
  - domain/investigation/evaluation
  - domain/investigation/citation
  - domain/investigation/verdict
  - domain/investigation/evidence-result
  - domain/investigation/evaluation-reason
  - domain/investigation/usage
  - domain/knowledge/hypothesis-revision
  - rules/investigation/the-customer-sees-only-the-text
  - contracts/investigation/case-simulation
---

## What it is

The bottom-left region of the layout, described in the scope's "Detail" section, including D11's prompt tab.

## Notes

The connector that produced each evidence item is not a fact `domain/investigation/evidence` itself carries — it holds only a reference to the capability, whose own `connector` attribute (`domain/integration/capability`) names it. Criterion 3 shows the capability reference; the connector name is read through it in the implementation, not modeled as a second fact on this task.
Decision, beyond the covers — stand: `domain/integration/capability` is named only to point at where the connector name lives, never as a fact this task implements — this task reads the reference `domain/investigation/evidence` already carries and shows the capability, nothing more.
REMAINDER, from the specification — `rules/investigation/the-customer-sees-only-the-text`'s first clause ("what an assessment exposes to the end customer is its text alone") is not reached by this task's criteria, which answer only the second clause (operator-only visibility of verdicts and evidence). Belongs to whatever customer-facing surface renders `assessment.text` to the end customer — no task in either case-simulation plan builds one, since neither operation is customer-facing.
