---
title: Backend comment-assertion test sweep
summary: The one corrective task removing every backend test asserting a production comment's literal
  prose, now that source comments are forbidden.
rationale: A corrective increment cuts no epic through survey/decomposition -- this is the structural
  container the validator still requires, holding exactly the one task's own claim.
covers:
- constraints/hypotheses-are-judged-in-isolated-parallel-calls
- constraints/listings-are-paged
- constraints/the-capability-identity-read-refuses-an-unregistered-identity
- constraints/the-judgment-prompt-is-closed
- contracts/integration/capability-registry
- domain/integration/capability
- domain/integration/capability-registry
- domain/investigation/evidence-result
- domain/knowledge/case-version
- domain/knowledge/hypothesis-revision
- rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
- rules/integration/a-connector-configuration-holds-a-well-formed-object
- rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
- rules/integration/a-connector-placeholder-is-declared-by-its-capability
- rules/integration/a-diagnostic-response-masks-a-resolved-credential
- rules/integration/an-unclassified-status-ends-unavailable
- rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
- rules/investigation/no-stage-aborts-on-its-deadline
- rules/investigation/the-writing-input-is-narrowed
- rules/knowledge/a-collected-concept-declares-a-ttl
- rules/knowledge/a-concept-accepts-the-declared-subject-type
- rules/knowledge/a-hypothesis-collects-at-least-one-concept
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- rules/knowledge/case-terms-exist-in-the-glossary
- scenarios/knowledge/no-confirmation-falls-back
- scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
uncovered:
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: constraints/listings-are-paged
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: constraints/the-judgment-prompt-is-closed
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: contracts/integration/capability-registry
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: domain/integration/capability
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: domain/integration/capability-registry
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: domain/investigation/evidence-result
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: domain/knowledge/case-version
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: domain/knowledge/hypothesis-revision
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: rules/integration/a-diagnostic-response-masks-a-resolved-credential
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: rules/integration/an-unclassified-status-ends-unavailable
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: rules/investigation/no-stage-aborts-on-its-deadline
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: rules/investigation/the-writing-input-is-narrowed
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: rules/knowledge/a-collected-concept-declares-a-ttl
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: rules/knowledge/case-terms-exist-in-the-glossary
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: scenarios/knowledge/no-confirmation-falls-back
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
- node: scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  why: Reached because a deleted test asserted that a production comment cites this node; the node's own
    runtime behavior is proved, untouched, by the behavioral tests that remain in the same file. This
    task implements nothing against it -- the execution-contract-binder confirmed no candidate settles
    which tests to delete, since removing a comment-prose assertion changes no behavior any node governs.
sources:
- intake/scope.md
---

## What it is

A single-task epic for the backend-comment-assertion-test-sweep corrective increment. Its covers
list is the full set of specification-node identities the removed tests cited inside the
production comments they asserted on -- named here because the scope textually touches them, not
because the task implements any of them. The execution-contract-binder confirmed the task
implements none of them; every one is declared uncovered for the same reason.

## Notes

None.
