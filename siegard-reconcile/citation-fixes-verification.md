---
contract_version: siegard-reconcile/1
title: Verify the four citation fixes, and re-verify their files' full node sets
summary: 'Following the two prior reconciliations, the human authorized a direct, comment-only fix to
  5 stale specification citations across 3 files (no behavior change): case-query.service.ts''s trustedCaseOf
  citing the wrong node for a version-immutability fact, case-resolution.ts''s local Verdict type carrying
  no citation and two comments citing the wrong node after the case/case-version split, and investigation-pipeline.ts''s
  defaultConsolidationRegister citing the wrong node for the same split. Editing these files changed their
  digests, so every node bound to them needed re-verification, not only the ones fixed.'
target: backend
files:
- path: src/case/case-query.service.ts
  change: 'two comment citations corrected: trustedCaseOf''s docblock now cites rules/knowledge/a-case-version-is-written-once
    instead of every-case-version-remains-readable for the version-immutability fact it relies on'
- path: src/case/case-resolution.ts
  change: the local Verdict type now cites domain/investigation/verdict; the CONFIRMED constant and ResolvedOutcome
    type now cite domain/knowledge/case-version instead of domain/knowledge/case
- path: src/investigation/investigation-pipeline.ts
  change: defaultConsolidationRegister's doc comment now cites domain/knowledge/case-version instead of
    domain/knowledge/case for the register-defaulting fact
nodes:
- node: constraints/a-case-is-read-whole
  conforms: true
  how: readCase still assembles, validates and returns the case as one structural unit, matching the node.
  encoded_at:
  - src/case/case-query.service.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: the five public methods still match the published contract's own operations.
  encoded_at:
  - src/case/case-query.service.ts
- node: contracts/system/case-authoring
  conforms: false
  how: the file header still cites this node for readCase's own refusal shape, but readCase runs structuralCase()
    and refuseIncoherence() as two separate calls — a version violating both a structural and a coherence
    rule surfaces only the structural set on any one call, never both named together in one refusal. The
    node's own 'all refusals at once' promise is stated for release, not for this read.
  observed_at:
  - src/case/case-query.service.ts
- node: domain/knowledge/case
  conforms: true
  how: case-resolution.ts's own remaining use of this node (HypothesisNotInManifestError's slug/version)
    is legitimate; the two miscited spots (CONFIRMED, ResolvedOutcome) now correctly cite domain/knowledge/case-version
    instead. case-query.service.ts states none of this node's own facts (slug, next_version) at all.
  encoded_at:
  - src/case/case-query.service.ts
  - src/case/case-resolution.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: both files' use of hypothesis names/fields still matches the node.
  encoded_at:
  - src/case/case-query.service.ts
  - src/case/case-resolution.ts
- node: rules/investigation/replay-is-pinned
  conforms: true
  how: replayCase still resolves without reading any content digest, matching the node.
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/a-case-versions-input-requirements-are-derived
  conforms: true
  how: readCaseInputRequirements still delegates the derivation wholesale to case-input-requirements.ts,
    supplying exactly the inputs the node requires; states nothing that departs.
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: true
  how: slug is used only as an opaque lookup key throughout this read-only service; states nothing that
    departs from the node.
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: 'fix confirmed: the file no longer cites this node for the immutability fact — trustedCaseOf now
    correctly cites rules/knowledge/a-case-version-is-written-once instead, and heldVersion''s own use
    of this node (reading any stored version by slug+version) states nothing that departs from it.'
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: readCaseInputRequirements still reads the registered-capability set fresh on every call, matching
    the node.
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: true
  how: the file header and replayCase's own docblock still state every validator rule holds at read time
    (with replay as the declared exception), matching the node.
  encoded_at:
  - src/case/case-query.service.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: collectionPlan and resolveOutcome still read collects/resolution through entry.hypothesis_revision,
    matching the node.
  encoded_at:
  - src/case/case-resolution.ts
- node: domain/knowledge/manifest-entry
  conforms: true
  how: byPrecedence still sorts entries by their own declared position, matching the node.
  encoded_at:
  - src/case/case-resolution.ts
- node: domain/knowledge/referral
  conforms: true
  how: ResolvedOutcome.referral still matches the node's own shape.
  encoded_at:
  - src/case/case-resolution.ts
- node: domain/knowledge/resolution
  conforms: true
  how: case-resolution.ts's ResolvedOutcome and resolveOutcome still pair outcome with referral as one
    resolution, and investigation-pipeline.ts's own resolveAndNarrow destructuring passes that same value
    through unchanged; both match the node.
  encoded_at:
  - src/case/case-resolution.ts
  - src/investigation/investigation-pipeline.ts
- node: rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  conforms: true
  how: manifestEntryNamed still refuses with HypothesisNotInManifestError on a miss, matching the node.
  encoded_at:
  - src/case/case-resolution.ts
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: byPrecedence and its citations still match the node's ordering rule.
  encoded_at:
  - src/case/case-resolution.ts
- node: scenarios/investigation/a-single-hypothesis-is-simulated
  conforms: true
  how: manifestEntryNamed's own docblock still correctly distinguishes this lookup (by hypothesis, not
    by precedence) from collectionPlan/resolveOutcome, matching the scenario.
  encoded_at:
  - src/case/case-resolution.ts
- node: scenarios/knowledge/no-confirmation-falls-back
  conforms: true
  how: resolveOutcome's fallback branch still matches the scenario.
  encoded_at:
  - src/case/case-resolution.ts
- node: scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  conforms: true
  how: resolveOutcome's determining branch still matches the scenario.
  encoded_at:
  - src/case/case-resolution.ts
- node: domain/investigation/verdict
  conforms: true
  how: 'fix confirmed: the Verdict type now carries a citation to this node right where it declares the
    three-value enumeration, matching it exactly.'
  encoded_at:
  - src/case/case-resolution.ts
- node: domain/investigation/assessment
  conforms: false
  how: 'unchanged, pre-existing finding: usage/elapsed_ms/prompt reach the pipeline''s result as separate
    cost/durations.writing/prompts.writing fields rather than as attributes of the returned assessment
    itself, and register is held nowhere in the result at all — the node''s own declared shape doesn''t
    match where these facts actually live in this delivered record.'
  observed_at:
  - src/investigation/investigation-pipeline.ts
- node: domain/investigation/cost
  conforms: true
  how: costOf still matches the node.
  encoded_at:
  - src/investigation/investigation-pipeline.ts
- node: domain/investigation/durations
  conforms: true
  how: durationsOf still matches the node.
  encoded_at:
  - src/investigation/investigation-pipeline.ts
- node: domain/investigation/evaluation
  conforms: true
  how: costOf/durationsOf's flatMap guards over evaluation.usage/elapsed_ms still match the node.
  encoded_at:
  - src/investigation/investigation-pipeline.ts
- node: domain/investigation/evidence
  conforms: true
  how: evidenceByHypothesisOf and durationsOf's use of evidence still match the node.
  encoded_at:
  - src/investigation/investigation-pipeline.ts
- node: domain/investigation/subject
  conforms: true
  how: the buildSubject call still matches the node.
  encoded_at:
  - src/investigation/investigation-pipeline.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: true
  how: still delegated to subject.ts's buildSubject, per the module's own comment; states nothing that
    departs.
  encoded_at:
  - src/investigation/investigation-pipeline.ts
notes: 'The four targeted fixes are confirmed correct by fresh, independent judges. One new, unrelated
  finding surfaced on case-query.service.ts: contracts/system/case-authoring is over-cited in the file
  header — readCase performs two separate refusals (structural, then coherence) rather than the one combined
  ''all rules together'' refusal the node states for release. This was not caught by the earlier reconciliation''s
  reading of the same file; a later, more careful pass found it. It is left unbound, as a genuine finding
  for a human to route (most likely a narrowing of the header comment, not a specification change). investigation-pipeline.ts''s
  own pre-existing finding against domain/investigation/assessment (part of the write-telemetry cluster
  from the prior reconciliation) is unchanged and confirmed still present. A further observation surfaced
  outside this reconciliation''s own node set, not bound here: case-resolution.ts''s byPrecedence docstring
  states a position-uniqueness invariant (''enforced at parse'') with no citation, while every neighboring
  claim in the same docstring is cited — the governing node is rules/knowledge/a-hypothesis-position-is-unique-within-its-case,
  not part of this file''s current binding.'
---
