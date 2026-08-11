---
title: Production hypothesis-evaluator adapter backed by the Anthropic API
summary: A new AnthropicHypothesisEvaluator class implements IHypothesisEvaluator over @anthropic-ai/sdk,
  assembling a closed, delimited prompt from exactly one hypothesis's criterion, its own evidence and
  the pinned case's title/when_to_use, granting the model no tools, and never throwing across all three
  verdicts.
task: sha256:db96e5b1fef38ec1a1908d48fb91fac90ab0150ba6073c097bbe5410a6fb3c57
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/hypothesis-judgment-adapter-anthropic-hypothesis-evaluator-build
files:
- path: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  effect: adds AnthropicHypothesisEvaluator, a new IHypothesisEvaluator implementation. evaluate() first
    checks for any non-'ok' evidence, answering inconclusive/no-data citing exactly those items without
    calling the provider; otherwise it calls the Anthropic API once via a fixed system prompt plus a pure
    buildUserPrompt() over (criterion, evidence, title, whenToUse) inside one delimited block, with no
    tools field; the model's answer is parsed into confirmed/refuted (non-empty citations) or demoted
    to inconclusive/judgment-failure on any malformed or unparseable response
criteria:
- criterion: The adapter's prompt-assembly step is a pure function of the hypothesis's criterion, its
    evidence, and the case's title and when_to_use — the same four inputs produce byte-identical prompt
    content across two calls.
  met: true
  how: buildUserPrompt(criterion, evidence, caseContext) builds its entire output from exactly its three
    parameters via plain string concatenation — no clock, random value or instance state reaches it
- criterion: The provider request grants the model no tools.
  met: true
  how: the messages.create() call declares only model, max_tokens, system and messages — no tools or tool_choice
    field is ever written
- criterion: The criterion, the evidence, and the case's title and when_to_use sit inside one delimited
    data block; no other hypothesis's criterion and no subject attribute-value enters the prompt.
  met: true
  how: buildUserPrompt() wraps all four facts inside one outer <judgment_input> block; the function signature
    carries no channel for another hypothesis's criterion or a subject attribute-value to reach it
- criterion: A confirmed or refuted answer is returned with at least one citation; an answer the model
    does not ground in the given evidence is returned as inconclusive with a reason — the adapter never
    throws for any of the three verdicts and never infers beyond what the evidence supports.
  met: true
  how: parseJudgment() only accepts a confirmed/refuted answer with a non-empty, well-formed citations
    array; any provider failure or unparseable/malformed text is demoted to inconclusive/judgment-failure
    rather than thrown; the fixed system prompt instructs the model that absence of ground is a reason,
    never an invitation to infer
- criterion: The adapter imports @anthropic-ai/sdk for the call and no other HTTP client library.
  met: true
  how: the file's only external import is Anthropic from '@anthropic-ai/sdk'; every other import is a
    local domain module
nodes:
- node: domain/investigation/hypothesis-evaluator
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: evaluate() takes one hypothesis's criterion and evidence plus the pinned case's CaseContext, calls
    the provider once, and always answers one of the three EvaluationOutcome shapes, cited and complete,
    never inferred, never throwing
- node: constraints/judgment-runs-behind-a-port
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: the second concrete IHypothesisEvaluator, beside FakeHypothesisEvaluator; only this file imports
    @anthropic-ai/sdk, the port interface and the rest of the domain module remain untouched
- node: constraints/the-judgment-prompt-is-closed
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: a fixed SYSTEM_PROMPT constant independent of any call's inputs, plus a pure buildUserPrompt()
    over exactly criterion/evidence/title/when_to_use inside one delimited block; no tools field ever
    declared
- node: rules/investigation/judgment-does-not-infer
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: the fixed system prompt instructs that evidence grounds every verdict and absence of ground is
    a reason, never an invitation; evidence with any non-ok result is answered inconclusive/no-data before
    the model is ever asked, and any non-well-formed model answer is demoted rather than accepted as decided
- node: rules/investigation/a-decided-evaluation-cites-evidence
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: parseJudgment() requires a confirmed/refuted answer's citations to be a well-formed, non-empty
    array before accepting the verdict; anything else is demoted to inconclusive/judgment-failure
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: every inconclusive outcome carries an explicit reason; noDataOutcome() is built directly from the
    evidence items whose result is not 'ok' and cites exactly those, before the model is ever called —
    answering the sibling task's own note that a naive uncited no-data reason would satisfy the criterion's
    text while failing this clause
inferences:
- inferred: the model's own well-formed "inconclusive" answer is mapped to EvaluationReason 'judgment-failure',
    never 'no-data' or 'deadline-exceeded'
  from: the port's own doc comment tying no-data definitionally to evidence whose result is not ok (handled
    mechanically before the model is called), and deadline-exceeded being outside this adapter's own knowledge
    since evaluate() carries no deadline parameter
- inferred: evaluate() checks evidence for any non-'ok' item and answers inconclusive/no-data immediately
    without calling the provider, rather than always calling the model
  from: judgment-stage.ts's own identical upstream convention and the port's own doc comment tying a no-data
    reason definitionally to evidence whose result is not ok
- inferred: the wire format asked of the model — one JSON object with a closed-tag XML delimiter syntax,
    with escaping of reserved characters in inserted content
  from: the task's own explicit delegation of response-format choice, and the constraint's 'delimited
    data block' language naming the requirement but not a syntax
- inferred: apiKey is optional, defaulting to process.env.ANTHROPIC_API_KEY; model is required with no
    default; maxTokens is optional, defaulting to 1024
  from: STK-11's environment-read requirement, the task's own stated choice, and the task's instruction
    that no specification node grounds a default model — read as forbidding one; maxTokens has no such
    grounding either way, so 1024 is an arbitrary operational default
- inferred: prompt assembly is split into a fixed SYSTEM_PROMPT constant and a pure buildUserPrompt()
    function, rather than one folded prompt string
  from: constraints/the-judgment-prompt-is-closed's own Description, which already names this exact split
divergences:
- cites: MNT-03
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  departure: this file declares its own small isRecord()/parseJsonOrUndefined() helpers rather than calling
    citation-validation.ts's structurally identical, module-private ones
  why: citation-validation.ts's helpers are not exported, so calling them would require editing a file
    this task does not otherwise touch, outside its own objective; the duplicated logic is a generic three-line
    JSON-safety idiom, disclosed rather than left for the standard-conformance pass to discover unremarked
deferred:
- what: wiring AnthropicHypothesisEvaluator into any factory or exporting it from src/index.ts
  why: the task's own "What it is" states this class sits beside the existing fake, never imported by
    anything the domain layer depends on — composition-root wiring is this epic's declared remainder
---

## What it is

One new class implements the widened hypothesis-evaluator port against a live model.
It sits beside the existing fake adapter, never imported by anything the domain layer itself depends on.

## Notes

MNT-03 divergence: small JSON-safety helpers are duplicated rather than importing citation-validation.ts's module-private ones — disclosed above.
