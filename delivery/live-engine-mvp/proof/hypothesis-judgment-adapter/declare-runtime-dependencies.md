---
title: Proof for declaring @anthropic-ai/sdk and fastify as runtime dependencies
summary: Six tests, added to the pre-existing manifest-audit spec, prove the two dependencies are declared,
  pinned as recorded, and are the only additions.
implementation: sha256:f5d985471c837b9a46bf491d523460c1eec99b7b7bde1c87b34bf42a4e5a23df
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/hypothesis-judgment-adapter-declare-runtime-dependencies-suite
tests:
- file: src/__tests__/unit/dependency-manifest.spec.ts
  name: the dependency manifest declares @anthropic-ai/sdk as a dependency
  proves: package.json's dependencies list @anthropic-ai/sdk, matching STK-11's authorization to call
    the model only through it.
  fails_when: the dependencies block stops carrying the @anthropic-ai/sdk key, or the package is declared
    only in devDependencies/peerDependencies/optionalDependencies instead
- file: src/__tests__/unit/dependency-manifest.spec.ts
  name: the dependency manifest declares fastify as a dependency
  proves: package.json's dependencies list fastify, matching STK-03's authorization as the only HTTP framework
    this standard permits.
  fails_when: the dependencies block stops carrying the fastify key, or the package is declared only in
    another section
- file: src/__tests__/unit/dependency-manifest.spec.ts
  name: the dependency manifest pins @anthropic-ai/sdk to ^0.32.0
  proves: the inference '@anthropic-ai/sdk is pinned to ^0.32.0 and fastify to ^5.0.0' recorded by the
    implementation, so the version choice is pinned rather than incidental
  fails_when: the declared range for @anthropic-ai/sdk changes to anything other than the literal string
    ^0.32.0
- file: src/__tests__/unit/dependency-manifest.spec.ts
  name: the dependency manifest pins fastify to ^5.0.0
  proves: the same version inference, for fastify
  fails_when: the declared range for fastify changes to anything other than the literal string ^5.0.0
- file: src/__tests__/unit/dependency-manifest.spec.ts
  name: the dependency manifest's dependencies hold exactly @anthropic-ai/sdk, fastify and zod
  proves: The two additions are the only new dependencies; no database driver or ORM package is introduced
    (constraints/the-mvp-persists-to-no-database) — the totality half of this criterion
  fails_when: the dependencies section gains any fourth package, loses one of the three expected ones,
    or is otherwise not exactly this three-member set, regardless of order
- file: src/__tests__/unit/dependency-manifest.spec.ts
  name: the dependency manifest orders @anthropic-ai/sdk and fastify ahead of the pre-existing zod
  proves: the inference that the two new entries sit in alphabetical order ahead of zod rather than appended
    after it
  fails_when: either new package's key moves to after zod's key in the dependencies object's own order,
    independent of what else the set contains
not_applicable:
- edge_case: absent or empty input to a function
  why: this task writes no function that receives input; the whole deliverable is a static manifest edit,
    so there is no boundary to feed an absent or empty value
- edge_case: a boundary at each end of a stated numeric range
  why: no criterion or inference states a range — a version is a fixed string, not a range with two ends
    to probe
- edge_case: an empty collection where one comes back
  why: no criterion describes a collection this delivery returns; the manifest's dependencies section
    is read, never produced by running code
- edge_case: a duplicate where uniqueness is claimed
  why: no criterion or inference claims a package appears in exactly one section; testing that @anthropic-ai/sdk
    or fastify is absent from devDependencies/peerDependencies/optionalDependencies would assert a guarantee
    nobody stated
- edge_case: an operation against state that forbids it
  why: a manifest edit has no state machine to violate; there is no forbidden state for a dependency declaration
    to be attempted against
- edge_case: a dependency that fails or answers slowly
  why: this is a build-time declaration, not a runtime call to a collaborator; there is no request to
    time out or fail against
- edge_case: two operations against one subject at once
  why: package.json is edited once, statically, by this task alone (the distributed-delivery rule the
    implementation's own rationale cites keeps a manifest-editing task solitary); there is no concurrent
    writer to race against
untested:
- 'npm install succeeds and the existing typecheck, lint and test steps still pass with both declared
  — proven by the captured run run/hypothesis-judgment-adapter-declare-runtime-dependencies-suite recorded
  in this proof, not by a test written here: this task writes no source a test could exercise for that
  criterion, and the captured build/lint/typecheck/test run is the evidence the delivery-node contract
  expects for it.'
- the devDependencies block staying exactly the six pre-existing entries — the implementation record lists
  this under preserved, but no task criterion requires it, so nothing here asserts it; a regression there
  would surface only if a future proof checks it.
---

## What it is

Six tests over the manifest-audit spec prove the two additions are declared, pinned and exhaustive.
The build-passing criterion is proven by the captured run, not by a written test.

## Notes

None.
