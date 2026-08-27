---
contract_version: siegard-reconcile/1
title: 'case-version-editor-form-fields.tsx: 8 bindings stale from two unrelated subject-field deliveries'
summary: 'Two corrective deliveries this session (subject-field-fixed-bug/subject-follows-isblocked, and
  its sibling stale-test correction) rewrote this file to fix its subject field only. A bind restamps
  only the nodes its own delivery record names, so the file''s other 8 bindings — for the fallback outcome/action/recipient
  fields, the consolidation register, the write-once rule and the glossary-membership rule, none of which
  the subject-field fix touched — went stale as a side effect. The human states the file is correct: nothing
  about outcome, action, recipient, consolidation_register, the fallback grouping, write-once enforcement
  or glossary-sourced vocabularies changed.'
target: frontend
files:
- path: src/routes/case-version-editor-form-fields.tsx
  change: the subject field now renders disabled={isBlocked} instead of an unconditional disabled, and
    its label reads "Subject type" instead of "Subject type (fixed)"; every other field (outcome, action,
    recipient, consolidation_register, title, when_to_use) and the write-once/isReadOnly wiring are unchanged
nodes:
- node: domain/glossary/action
  conforms: true
  how: 'the "Fallback referral (action)" field, bound to fallback.referral.action, renders as a vocabulary-driven
    Select fed by actionOptions: GlossaryVocabularyOptions rather than any hardcoded list'
  encoded_at:
  - src/routes/case-version-editor-form-fields.tsx
- node: domain/glossary/outcome
  conforms: true
  how: 'the "Fallback outcome" field, bound to fallback.outcome, renders as a vocabulary-driven Select
    fed by outcomeOptions: GlossaryVocabularyOptions rather than any hardcoded list'
  encoded_at:
  - src/routes/case-version-editor-form-fields.tsx
- node: domain/glossary/recipient
  conforms: true
  how: 'the "Fallback referral (recipient)" field, bound to fallback.referral.recipient, renders as a
    vocabulary-driven Select fed by recipientOptions: GlossaryVocabularyOptions rather than any hardcoded
    list'
  encoded_at:
  - src/routes/case-version-editor-form-fields.tsx
- node: domain/knowledge/consolidation-register
  conforms: true
  how: CONSOLIDATION_REGISTER_OPTIONS is mapped from the imported CONSOLIDATION_REGISTERS constant rather
    than restated in this file, keeping the fixed enum in one place
  encoded_at:
  - src/routes/case-version-editor-form-fields.tsx
- node: domain/knowledge/referral
  conforms: true
  how: the paired "Fallback referral (action)" and "Fallback referral (recipient)" fields, both under
    fallback.referral, mirror the node's own action+recipient shape
  encoded_at:
  - src/routes/case-version-editor-form-fields.tsx
- node: domain/knowledge/resolution
  conforms: true
  how: fallback.outcome is grouped with fallback.referral.* under one fieldset, matching the node's own
    outcome-plus-referral shape
  encoded_at:
  - src/routes/case-version-editor-form-fields.tsx
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: disabled={isBlocked} is applied uniformly to every control, and the isReadOnly guard omits the
    Save control and its submit/blur wiring entirely once the version is not writable
  encoded_at:
  - src/routes/case-version-editor-form-fields.tsx
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: outcomeOptions, actionOptions and recipientOptions are all typed GlossaryVocabularyOptions and
    passed through to each Select's options — no vocabulary is hardcoded in this file
  encoded_at:
  - src/routes/case-version-editor-form-fields.tsx
- node: domain/knowledge/case-version
  conforms: true
  how: this file's own binding to this node is not stale — it was freshly written today by
    delivery/frontend-spec-conformance-corrections/implementation/subject-field-fixed-bug/subject-follows-isblocked.md's
    own bind, backed by that delivery's independent proof (delivery/frontend-spec-conformance-corrections/proof/subject-field-fixed-bug/subject-follows-isblocked.md).
    Named here only because the trace binds this file to it and this record must answer for every node
    a named file carries, not because a fresh reading ran; no new judgment was made.
  encoded_at:
  - src/routes/case-version-editor-form-fields.tsx
notes: One delegation, over the one named file, judged against the 8 nodes the trace's own drift report
  named as stale on this file. domain/knowledge/case-version, also bound to this file, was not part of
  that delegation's judgment — it is not stale, having been freshly bound today by this session's own
  subject-field delivery and its independent proof — and is carried in this record's `nodes` only because
  the bind form requires every node a named file answers to be accounted for; its `how` cites that prior
  delivery rather than a fresh reading. All 8 delegated nodes cleared; the judge also noted, outside the
  judgment set, that the subject field itself renders as a plain Input rather than a glossary-Select even
  though case-terms-exist-in-the-glossary also names subject type — that observation names
  domain/glossary/subject-type, which is neither in this record's node set nor its candidates, so it is
  left for a separate reading rather than answered here.
---

## What it is

Reconciles the 8 bindings on case-version-editor-form-fields.tsx that this session's own
subject-field corrective deliveries left stale, as a side effect of restamping only the nodes
those deliveries' own records named.

## Notes

None.
