---
title: unavailableEvidence names its cause by the error's own class name
summary: evidence-collection-stage.ts's unavailableEvidence() now reports "CapabilityNotResolvedForObservationError"
  as result_detail, read from the error class's own .name rather than a free-text sentence, matching the
  adapter's later-resolution path character for character.
task: sha256:687fe208aec1c011ca0111f2d4632806712f780c870510c1976ccc4a44dcf6a7
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/evidence-collection-stage-result-detail-fix-report-the-required-error-name-build
files:
- path: src/investigation/evidence-collection-stage.ts
  effect: unavailableEvidence() now sets result_detail to new CapabilityNotResolvedForObservationError(concept).name
    instead of a free-text sentence, importing CapabilityNotResolvedForObservationError from ../errors/capability-not-resolved-for-observation.error.js.
    The function's doc comment now names the rule and the identical convention http-declarative-observation-source.adapter.ts's
    own resolveCapability path already follows.
criteria:
- criterion: Given a case whose collection plan names a concept no registered capability currently answers,
    the Evidence unavailableEvidence() records for it carries result_detail exactly equal to "CapabilityNotResolvedForObservationError".
  met: true
  how: 'unavailableEvidence() (src/investigation/evidence-collection-stage.ts) builds its unavailable
    ending with resultDetail: new CapabilityNotResolvedForObservationError(concept).name. That class''s
    own constructor (src/errors/capability-not-resolved-for-observation.error.ts) sets this.name = ''CapabilityNotResolvedForObservationError'',
    so the recorded result_detail is exactly that string.'
- criterion: Given the same scenario reached through the collection stage's own pre-check (capabilities.readCapability(concept)
    resolving unheld before observe-concept is ever called), the recorded result_detail is identical,
    character for character, to what http-declarative-observation-source.adapter.ts's own resolveCapability
    path already records for the same condition.
  met: true
  how: 'Both paths now derive their result_detail from the same class''s .name rather than an independent
    literal. The adapter''s unavailableFor(error) (src/investigation/http-declarative-observation-source.adapter.ts)
    returns { result: ''unavailable'', result_detail: error.name } for new CapabilityNotResolvedForObservationError(concept);
    the collection stage''s unavailableEvidence() now reads new CapabilityNotResolvedForObservationError(concept).name
    for the same condition. Since .name is set once, in the error class''s own constructor, to the literal
    ''CapabilityNotResolvedForObservationError'', the two paths can never report a different string for
    the identical cause.'
nodes:
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  how: The rule requires that an observation of a concept no registered capability currently answers issues
    no call and ends unavailable with a result detail reporting a CapabilityNotResolvedForObservationError.
    The collection stage's own pre-check path — reached before observe-concept is ever called, when capabilities.readCapability(concept)
    resolves unheld — now names that same class by reading its .name rather than a restated sentence,
    matching what http-declarative-observation-source.adapter.ts's own resolveCapability path already
    encodes for this rule when the same condition is instead reached through its own later resolution.
inferences:
- inferred: The class's own name is read by instantiating CapabilityNotResolvedForObservationError(concept)
    and taking .name, rather than writing the literal string 'CapabilityNotResolvedForObservationError'
    directly in evidence-collection-stage.ts.
  from: http-declarative-observation-source.adapter.ts's own unavailableFor(error) helper and its doc
    comment ('read from the error itself rather than restated as a second literal, so result_detail can
    never drift from the class the condition actually is') — the identical convention this task's second
    criterion asks the two paths to agree on character for character, and TYP-04/MNT-03 of the project's
    standard (a value with meaning is a named constant rather than a spelled-out literal; reuse rather
    than re-derive) support the same choice.
preserved:
- Every other outcome branch of settledEvidence() (ok, denied, timeout, and an observation-reported unavailable
  ending's own result_detail) is unchanged — only unavailableEvidence()'s own free-text literal was replaced.
- unavailableEvidence()'s signature, its call site in collectOneEvidence(), and the 'unavailable' EvidenceResult
  it records are unchanged; only the resultDetail value changed.
---

## What it is

unavailableEvidence() now reports CapabilityNotResolvedForObservationError, read from the error class's own `.name`, instead of a free-text sentence.
The change makes the collection stage's own pre-check path agree, character for character, with the production adapter's later-resolution path for the identical scenario.

## Notes

None.
