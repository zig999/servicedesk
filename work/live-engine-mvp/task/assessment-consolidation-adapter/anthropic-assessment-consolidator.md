---
title: Production assessment-consolidator adapter backed by the Anthropic API
summary: A new IAssessmentConsolidator implementation calls the Anthropic API through @anthropic-ai/sdk, assembling a closed, delimited prompt from exactly the required evaluations, the evidence they cite, and the case's consolidation register.
objective: A production IAssessmentConsolidator adapter writes the assessment's text by calling the Anthropic API, with a prompt that is a pure function of the given evaluations, evidence and register, and no tool calling.
criteria:
  - The adapter's prompt-assembly step is a pure function of the given evaluations, evidence and consolidation register — the same three inputs produce byte-identical prompt content across two calls.
  - The provider request grants the model no tools.
  - The evaluations, the evidence and the register sit inside one delimited data block; no hypothesis's own criterion and no case when_to_use enters the prompt.
  - consolidate() returns the text alone — never an outcome, a referral or a determining hypothesis, none of which this call is given enough to decide.
  - The adapter imports @anthropic-ai/sdk for the call and no other HTTP client library.
depends_on:
  - task/hypothesis-judgment-adapter/declare-runtime-dependencies
implements:
  - domain/investigation/assessment-consolidator
  - constraints/consolidation-runs-behind-a-port
  - constraints/the-consolidation-prompt-is-closed
  - constraints/the-domain-depends-on-no-infrastructure
sources:
  - intake/scope.md
---

## What it is

One new class implements the existing assessment-consolidator port against a live model.
It sits beside the existing fake adapter, never imported by anything the domain layer itself depends on.

## Notes

constraints/consolidation-runs-behind-a-port's first clause — consolidation is invoked only through the port — is not reached by any criterion here; every criterion concerns only the new adapter's own internals, never the call site that invokes consolidate(). Belongs to task/diagnose-composition-root/wire-diagnose-runner, which wires the diagnose pipeline to call consolidate() through the port.
No criterion demonstrates that this adapter sits outside the domain layer, as constraints/consolidation-runs-behind-a-port's own fitness and constraints/the-domain-depends-on-no-infrastructure's statement both require. An implementation placing this adapter class inside the domain/investigation module itself would satisfy every criterion literally as written while both nodes refuse it — the placement itself (a separate file, outside domain/investigation, importing @anthropic-ai/sdk only there) is what makes this demonstrable, and the test author should assert the import boundary, not only the adapter's own behavior.
