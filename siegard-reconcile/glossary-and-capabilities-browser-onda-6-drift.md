---
contract_version: siegard-reconcile/1
title: Code drift from glossary-and-capabilities-browser onda 6's own delivery
summary: >-
  task/glossary-and-capabilities-browser/widen-glossary-vocabulary-union legitimately widened
  src/hooks/use-glossary-vocabulary.ts's own GlossaryVocabulary union from four to five members
  (adding "subject-attribute"), touching no other line -- the file was already bound by
  edit-draft-version (Onda 3) for four of its five now-current nodes, and a bind restamps only the
  delivering task's own nodes, leaving those four earlier bindings stale. The premise here is the
  delivered source itself: it already passed review/version-editor-onda-3.md's own coverage,
  conformance and standard passes (long since closed) for its original four members, and this
  onda's own delivery for the fifth; this reconciliation asks the narrower question of whether the
  specification still describes what this file now states, for every node the trace currently
  binds to it.
target: frontend
files:
  - path: src/hooks/use-glossary-vocabulary.ts
    change: >-
      GlossaryVocabulary's union gained "subject-attribute" as a fifth member alongside the
      pre-existing "outcome", "action", "recipient" and "subject-type"; the header comment was
      rewritten to name the fifth vocabulary. No other line -- the query function, its
      GlossaryTermsPage read-shape, its {value, label} mapping and its return shape -- changed.
nodes:
  - node: contracts/glossary/glossary-query
    conforms: true
    how: >-
      "Reads one term vocabulary of the glossary through the published
      contracts/glossary/glossary-query contract (GET /v1/glossary/{vocabulary},
      task/glossary-query-http/list-vocabulary-terms-route)"; `queryFn: () =>
      apiFetch<GlossaryTermsPage>(\`/v1/glossary/${vocabulary}\`)` -- the widening adds one more
      value this same operation may be called with, encoding nothing this contract does not hold.
    encoded_at:
      - src/hooks/use-glossary-vocabulary.ts
  - node: domain/glossary/action
    conforms: true
    how: >-
      the GlossaryVocabulary union still carries "action" as one of its five members, unchanged by
      this widening; the node's own fact (one required `name` attribute) is read the same way it
      was before.
    encoded_at:
      - src/hooks/use-glossary-vocabulary.ts
  - node: domain/glossary/outcome
    conforms: true
    how: >-
      the GlossaryVocabulary union still carries "outcome" as one of its five members, unchanged by
      this widening.
    encoded_at:
      - src/hooks/use-glossary-vocabulary.ts
  - node: domain/glossary/recipient
    conforms: true
    how: >-
      the GlossaryVocabulary union still carries "recipient" as one of its five members, unchanged
      by this widening.
    encoded_at:
      - src/hooks/use-glossary-vocabulary.ts
  - node: domain/glossary/subject-attribute
    conforms: true
    how: >-
      the GlossaryVocabulary union now carries "subject-attribute" as its fifth member, added by
      this exact change, and the preceding doc comment names domain/glossary/subject-attribute by
      identity as the vocabulary this member represents.
    encoded_at:
      - src/hooks/use-glossary-vocabulary.ts
  - node: domain/glossary/subject-type
    conforms: true
    how: >-
      the GlossaryVocabulary union still carries "subject-type" as one of its five members,
      unchanged by this widening.
    encoded_at:
      - src/hooks/use-glossary-vocabulary.ts
  - node: rules/knowledge/case-terms-exist-in-the-glossary
    conforms: true
    how: >-
      the hook's own design -- "maps each to a Select option whose value and label are both the
      term's own name -- the glossary names a term once, and nothing here re-labels it" -- still
      populates every option only from the glossary's own current terms; the rule's own governed
      set (subject-type, concept, outcome, action, recipient) never included "concept" through this
      file either before or after the widening, so the new member neither exceeds nor contradicts
      what this rule holds.
    encoded_at:
      - src/hooks/use-glossary-vocabulary.ts
notes: >-
  All seven nodes the trace currently binds to this file were judged, not only the five `trace.py
  --check` reported as drifted (action, outcome, recipient, subject-type,
  case-terms-exist-in-the-glossary) -- contracts/glossary/glossary-query and
  domain/glossary/subject-attribute were already intact (rebound by widen-glossary-vocabulary-union's
  own delivery), and their nodes are read here too per this route's own rule that a file's node set
  is read from the trace whole, never a chosen subset. One delegation (a single
  specification-conformance-reviewer, one file, all seven candidate nodes) produced every finding
  above; none ran inline.
---
