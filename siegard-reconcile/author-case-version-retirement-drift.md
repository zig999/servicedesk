---
contract_version: siegard-reconcile/1
title: The retired author-case-version command's stale trace bindings
summary: src/factories/author-case-version.factory.ts and src/case/author-case-version.service.ts were
  deliberately deleted in commit 4a02bc7, which delivered the case-lifecycle initiative and retired the
  old author-case-version command in favor of five new operations (create-draft, revise-hypothesis, place-hypothesis,
  remove-hypothesis, release). That delivery's own bind restamped only the nodes its own task touched,
  so the prior bind of these six nodes to the two now-deleted files was never revisited and the trace
  kept asserting a digest for source that no longer exists.
target: backend
files:
- path: src/factories/author-case-version.factory.ts
  change: deleted outright; no replacement file at this path
- path: src/case/author-case-version.service.ts
  change: deleted outright; no replacement file at this path
nodes:
- node: contracts/knowledge/capability-check
  conforms: false
  how: src/factories/author-case-version.factory.ts, the file this node is bound to, does not exist at
    this path. There is no source left to hold to the node's statement of what the contract check reads
    and from where.
  observed_at:
  - src/factories/author-case-version.factory.ts
- node: contracts/knowledge/vocabulary-terms
  conforms: false
  how: src/factories/author-case-version.factory.ts, the file this node is bound to, does not exist at
    this path. There is no source left to check against this contract's reading requirement.
  observed_at:
  - src/factories/author-case-version.factory.ts
- node: contracts/system/case-authoring
  conforms: false
  how: src/case/author-case-version.service.ts, the file this node is bound to, does not exist at this
    path. There is no implementation left to check for free draft composition, all-at-once release refusals,
    or released-version immutability.
  observed_at:
  - src/case/author-case-version.service.ts
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: false
  how: src/case/author-case-version.service.ts, the file this node is bound to, does not exist at this
    path. There is no code left to check whether a capability check reads fresh versus cached registration.
  observed_at:
  - src/case/author-case-version.service.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: false
  how: src/case/author-case-version.service.ts, the file this node is bound to, does not exist at this
    path. There is no code left to check whether validation runs at authoring-time composition and at
    each read, or whether replay is exempted.
  observed_at:
  - src/case/author-case-version.service.ts
- node: scenarios/knowledge/a-subject-mismatch-refuses-the-case
  conforms: false
  how: src/case/author-case-version.service.ts, the file this node is bound to, does not exist at this
    path. There is no code left to check whether this specific subject-mismatch refusal, or its message
    content, is implemented here.
  observed_at:
  - src/case/author-case-version.service.ts
notes: 'This reconciliation is not the ordinary premise ("the source is correct as it stands") — there
  is no source left at either path to hold correct or incorrect, so every node comes back conforms: false
  and nothing binds, per the all-or-nothing rule. This is not a coverage gap: separately verified against
  siegard-trace.json that all six nodes above also carry a live binding to at least one surviving file
  (case/validate-case-coherence.ts, case/case-query.service.ts, case/parse-case-document.ts, case/release.operation.ts,
  and the three case/errors/*.error.ts files), so the underlying facts remain encoded elsewhere in the
  tree; only the specific claim that these two deleted files encode them is what this record refuses.
  The likely next step is a fresh /reconcile invocation over the actual files the new case-lifecycle operations
  put in these files'' place (e.g. the create-draft, revise-hypothesis and release operation modules),
  which was out of this invocation''s named file set and so out of its scope.'
---
