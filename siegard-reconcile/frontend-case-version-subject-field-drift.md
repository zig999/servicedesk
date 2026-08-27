---
contract_version: siegard-reconcile/1
title: Frontend first sweep — case-version-editor-form-fields.tsx
summary: Same premise as frontend-first-sweep-clean.md, reconciled separately because this file's own
  judge returned a finding.
target: frontend
files:
- path: src/routes/case-version-editor-form-fields.tsx
  change: never reconciled
nodes:
- node: domain/glossary/action
  conforms: true
  how: sources the Select's options from actionOptions.options, not a hardcoded list.
  encoded_at:
  - src/routes/case-version-editor-form-fields.tsx
- node: domain/glossary/outcome
  conforms: true
  how: sources the Select's options from outcomeOptions.options.
  encoded_at:
  - src/routes/case-version-editor-form-fields.tsx
- node: domain/glossary/recipient
  conforms: true
  how: sources the Select's options from recipientOptions.options.
  encoded_at:
  - src/routes/case-version-editor-form-fields.tsx
- node: domain/knowledge/case-version
  conforms: false
  how: The subject field is rendered unconditionally disabled ('Subject type (fixed)', <Input {...register('subject')}
    disabled />), unlike every other declared-attribute field which uses disabled={isBlocked}. domain/knowledge/case-version's
    own update-draft operation and its Description state a draft's declared attributes 'may likewise be
    corrected, as many times as curation needs'; decision-log.md (lines 378-382) names subject explicitly
    among the attributes update-draft lets a curator correct. The form asserts, contrary to the node,
    that subject can never be corrected.
  observed_at:
  - src/routes/case-version-editor-form-fields.tsx
- node: domain/knowledge/consolidation-register
  conforms: true
  how: maps the imported CONSOLIDATION_REGISTERS constant into options, not restating the vocabulary.
  encoded_at:
  - src/routes/case-version-editor-form-fields.tsx
- node: domain/knowledge/referral
  conforms: true
  how: fallback.referral.action/recipient rendered together, matching the node's pairing.
  encoded_at:
  - src/routes/case-version-editor-form-fields.tsx
- node: domain/knowledge/resolution
  conforms: true
  how: fallback.outcome and fallback.referral grouped under one 'fallback' group, matching the node's
    outcome+referral pairing.
  encoded_at:
  - src/routes/case-version-editor-form-fields.tsx
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: onSubmit/onBlur/Save are all removed for isReadOnly, alongside disabled={isBlocked} on the editable
    fields.
  encoded_at:
  - src/routes/case-version-editor-form-fields.tsx
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: every glossary-governed value is drawn from the supplied vocabulary options, never hardcoded.
  encoded_at:
  - src/routes/case-version-editor-form-fields.tsx
notes: One delegation over this one file, handed its own 9-node trace-bound set plus the batch candidate
  union. 8 of 9 clear.
---
