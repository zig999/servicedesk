---
contract_version: siegard-reconcile/1
title: assessment-consolidator rebind after its own Responsibility correction
summary: domain/investigation/assessment-consolidator's own Responsibility line was just corrected (via
  /analyse) from 'return the assessment's text alone' to include usage, elapsed_ms and prompt, matching
  what every implementation of this port already returns and what domain/investigation/assessment already
  requires of those three fields. The human asked to reconcile the same three files an earlier reconciliation
  (reconcile-backend-investigation-cluster.md) left unbound over this exact node, now that the node's
  own text was corrected to match the code.
target: backend
files:
- path: src/investigation/anthropic-assessment-consolidator.adapter.ts
  change: unchanged; the specification node was corrected to state a fact this file already implements
- path: src/investigation/draft-assessment-text.ts
  change: unchanged; the specification node was corrected to state a fact this file already implements
- path: src/investigation/fake-assessment-consolidator.adapter.ts
  change: unchanged; the specification node was corrected to state a fact this file already implements
nodes:
- node: domain/investigation/assessment-consolidator
  conforms: true
  how: 'All three implementations of consolidate() return exactly text together with usage, elapsed_ms
    and prompt, matching the corrected Responsibility line verbatim: anthropic-assessment-consolidator.adapter.ts''s
    ''return { text: textOf(response.content).trim(), usage: response.usage, elapsed_ms: elapsedMs, prompt
    };'', fake-assessment-consolidator.adapter.ts''s ''return { text, usage: ZEROED_USAGE, elapsed_ms:
    ZEROED_ELAPSED_MS, prompt: PLACEHOLDER_PROMPT };'', and draft-assessment-text.ts''s own call site,
    which unwraps this same four-field ConsolidationOutcome (its own comment: ''consolidator.consolidate()
    now answers a ConsolidationOutcome rather than the text alone'').'
  encoded_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
- node: domain/investigation/assessment
  conforms: false
  how: 'Unchanged from the prior reconciliation: draft-assessment-text.ts''s own returned object ({ outcome,
    referral, text, determining_hypothesis? }) still carries none of register, usage, elapsed_ms or prompt,
    which domain/investigation/assessment requires on every Assessment -- and its own docstring still
    names that same narrower shape as this node''s own authority. This is the code-side gap a separate
    corrective task is owed for (register/usage/elapsed_ms/prompt never reaching the final Assessment
    across draft-assessment-text.ts, investigation-pipeline.ts and relational-investigation-store.repository.ts);
    the /analyse increment that corrected assessment-consolidator''s own Responsibility line did not touch
    this node or this gap.'
  observed_at:
  - src/investigation/draft-assessment-text.ts
- node: domain/investigation/evaluation
  conforms: true
  how: fake-assessment-consolidator.adapter.ts only ever treats Evaluation as an opaque type flowing through
    to a fixture-key lookup, never reading or restating the node's own usage/elapsed_ms/prompt-presence
    rule -- unchanged from the prior reconciliation's own reading.
  encoded_at:
  - src/investigation/fake-assessment-consolidator.adapter.ts
- node: constraints/consolidation-runs-behind-a-port
  conforms: true
  how: unchanged since reconcile-backend-investigation-cluster.md's own clearing of this node over all
    three files (each calls/implements only the published IAssessmentConsolidator interface); none of
    these three files were edited by this /analyse increment, only the node text this record's own subject
    changed.
  encoded_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
- node: constraints/the-consolidation-prompt-is-closed
  conforms: true
  how: unchanged since reconcile-backend-investigation-cluster.md's own clearing (the provider call carries
    no tools field); this file was not edited by this increment.
  encoded_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: unchanged since reconcile-backend-investigation-cluster.md's own clearing (each file's imports are
    local types or the one adapter's own carved-out provider import); neither file was edited by this
    increment.
  encoded_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
- node: domain/investigation/usage
  conforms: true
  how: unchanged since reconcile-backend-investigation-cluster.md's own clearing (both adapters' own usage
    objects/fields match the node's two required attributes); neither file was edited by this increment.
  encoded_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
- node: domain/investigation/evidence
  conforms: true
  how: unchanged since reconcile-backend-investigation-cluster.md's own clearing (Evidence is threaded
    through unread, consistent with the fake computing nothing from it); this file was not edited by this
    increment.
  encoded_at:
  - src/investigation/fake-assessment-consolidator.adapter.ts
- node: domain/knowledge/case-version
  conforms: true
  how: unchanged since reconcile-backend-investigation-cluster.md's own clearing (consolidationRegister
    is read from the pinned case's own consolidation_register by this file's own caller); this file was
    not edited by this increment.
  encoded_at:
  - src/investigation/draft-assessment-text.ts
- node: domain/knowledge/consolidation-register
  conforms: true
  how: unchanged since reconcile-backend-investigation-cluster.md's own clearing (the ConsolidationRegister
    type is threaded unchanged as an explicit option field); this file was not edited by this increment.
  encoded_at:
  - src/investigation/draft-assessment-text.ts
- node: rules/investigation/the-outcome-comes-from-the-case
  conforms: true
  how: unchanged since reconcile-backend-investigation-cluster.md's own clearing (neither file decides
    or returns outcome/referral/determining_hypothesis themselves); neither file was edited by this increment.
  encoded_at:
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
- node: rules/investigation/the-writing-input-is-narrowed
  conforms: true
  how: unchanged since reconcile-backend-investigation-cluster.md's own clearing (the same unconditional
    breadth in every outcome the narrowed writing input itself already carries); this file was not edited
    by this increment.
  encoded_at:
  - src/investigation/draft-assessment-text.ts
notes: Three delegations ran, one per file. This reconciliation closes exactly the domain/investigation/assessment-consolidator
  finding the prior reconcile-backend-investigation-cluster.md left unbound over these same three files;
  domain/investigation/assessment stays unbound on draft-assessment-text.ts, as it should -- that gap
  is a code defect, not a specification-text problem, and is unaffected by this /analyse increment.
---
