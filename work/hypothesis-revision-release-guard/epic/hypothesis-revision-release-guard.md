---
title: Hypothesis-revision release guard
summary: Fixes releaseHypothesisRevisionRow to refuse releasing a hypothesis-revision
  that is not currently draft, matching the guard the sibling case-version release
  path already performs.
covers:
- constraints/a-case-is-read-whole
- contracts/knowledge/case-lifecycle
- contracts/knowledge/case-query
- domain/knowledge/case
- domain/knowledge/case-summary
- domain/knowledge/case-version
- domain/knowledge/case-version-state
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
- domain/knowledge/hypothesis-revision-state
- domain/knowledge/manifest-entry
- rules/knowledge/a-case-has-at-most-one-draft
- rules/knowledge/a-case-listing-answers-cases-in-slug-order
- rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
- rules/knowledge/a-case-version-is-written-once
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
- rules/knowledge/a-case-version-number-is-never-reused
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- rules/knowledge/a-hypothesis-name-is-unique-within-its-case
- rules/knowledge/a-hypothesis-position-is-unique-within-its-case
- rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
- rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
- rules/knowledge/a-hypothesis-revision-number-is-never-reused
- rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
- rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
- rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
- rules/knowledge/a-slug-identifies-one-case
- rules/knowledge/every-case-version-remains-readable
- rules/knowledge/hypotheses-are-ordered-by-precedence
- scenarios/knowledge/a-catalog-entry-follows-the-released-version
- scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
- scenarios/knowledge/revising-a-released-revision-creates-the-next
uncovered:
- node: constraints/a-case-is-read-whole
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: contracts/knowledge/case-lifecycle
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: contracts/knowledge/case-query
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: domain/knowledge/case
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: domain/knowledge/case-summary
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: domain/knowledge/case-version
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: domain/knowledge/case-version-state
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: domain/knowledge/hypothesis
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: domain/knowledge/manifest-entry
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: rules/knowledge/a-case-has-at-most-one-draft
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: rules/knowledge/a-case-listing-answers-cases-in-slug-order
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: rules/knowledge/a-case-version-is-written-once
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: rules/knowledge/a-case-version-number-is-never-reused
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: rules/knowledge/a-slug-identifies-one-case
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: rules/knowledge/every-case-version-remains-readable
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: scenarios/knowledge/a-catalog-entry-follows-the-released-version
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
- node: scenarios/knowledge/revising-a-released-revision-creates-the-next
  why: This corrective increment answers one wrong behavior only — the missing state
    guard in releaseHypothesisRevisionRow — and this node's own fact is unrelated
    to that guard; this plan holds one task and changes nothing about it.
sources:
- intake/scope.md
---

## What it is
None.

## Notes
None.
