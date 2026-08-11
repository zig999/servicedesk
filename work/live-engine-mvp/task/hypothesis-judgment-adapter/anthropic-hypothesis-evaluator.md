---
title: Production hypothesis-evaluator adapter backed by the Anthropic API
summary: A new IHypothesisEvaluator implementation calls the Anthropic API through @anthropic-ai/sdk, assembling a closed, delimited prompt from exactly the hypothesis's criterion, its own evidence, and the pinned case's title and when_to_use.
rationale: The scope's front 1 states this adapter's shape and prompt content directly; the one decomposition choice here is depending on the port-widening task rather than folding the signature change into this same delivery, since a widened interface and a new implementer of it are different reasons to change.
objective: A production IHypothesisEvaluator adapter judges one hypothesis by calling the Anthropic API, with a prompt that is a pure function of the criterion, the evidence and the case's title/when_to_use, and no tool calling.
criteria:
  - The adapter's prompt-assembly step is a pure function of the hypothesis's criterion, its evidence, and the case's title and when_to_use — the same four inputs produce byte-identical prompt content across two calls.
  - The provider request grants the model no tools.
  - The criterion, the evidence, and the case's title and when_to_use sit inside one delimited data block; no other hypothesis's criterion and no subject attribute-value enters the prompt.
  - A confirmed or refuted answer is returned with at least one citation; an answer the model does not ground in the given evidence is returned as inconclusive with a reason — the adapter never throws for any of the three verdicts and never infers beyond what the evidence supports.
  - The adapter imports @anthropic-ai/sdk for the call and no other HTTP client library.
depends_on:
  - task/hypothesis-judgment-adapter/widen-evaluator-port-with-case-context
  - task/hypothesis-judgment-adapter/declare-runtime-dependencies
implements:
  - domain/investigation/hypothesis-evaluator
  - constraints/judgment-runs-behind-a-port
  - constraints/the-judgment-prompt-is-closed
  - rules/investigation/judgment-does-not-infer
  - rules/investigation/a-decided-evaluation-cites-evidence
  - rules/investigation/an-inconclusive-evaluation-declares-its-reason
sources:
  - intake/scope.md
---

## What it is

One new class implements the widened hypothesis-evaluator port against a live model.
It sits beside the existing fake adapter, never imported by anything the domain layer itself depends on.

## Notes

rules/investigation/an-inconclusive-evaluation-declares-its-reason's own second clause — a no-data reason cites the evidence whose result is not ok — has no criterion of its own here; criterion 4 only requires "a reason," not that a no-data reason also carry the citation to the not-ok evidence. An adapter returning `{verdict: inconclusive, reason: no-data, citations: []}` whenever the model does not ground its answer would satisfy criterion 4's literal text while failing this clause. Whoever writes this task's tests should exclude an uncited no-data reason as a failing case, not just an absent reason.
constraints/the-domain-depends-on-no-infrastructure was read but left out of implements: it audits the domain layer as a whole, and the more precisely-scoped constraints/judgment-runs-behind-a-port already carries the fitness bearing directly on this adapter ("the investigation domain module imports no LLM client; adapters are the only classes implementing the port").
