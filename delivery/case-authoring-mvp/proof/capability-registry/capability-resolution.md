---
title: Proof for capability resolution
summary: What proves task/capability-registry/capability-resolution — the published read answering each concept's one capability whole and current, the absence as data, and the one-to-one guarded at registration and at read so no priority chain can hide behind the four criteria.
implementation: sha256:54ef429ff2fc394a7d51e890e15b4b58681b72ecd760a74a95b70dab1905bffb
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/capability-registry-capability-resolution-suite-2
tests:
  - file: src/__tests__/unit/capability-registry/capability-query.port.spec.ts
    name: answers the one capability currently answering a concept, whole with its declared contract
    proves: "Reading a concept one capability answers returns that capability with its name, version, nature, both schemas, timeout and connector."
    fails_when: the resolution projects any of the declared attributes away, recomputes one instead of answering it as registered, or answers a capability other than the one whose concept was asked out of a holding of several
  - file: src/__tests__/unit/capability-registry/capability-query.port.spec.ts
    name: reports a concept no capability currently answers as an absence naming what was asked
    proves: "Reading a concept no capability currently answers reports the absence rather than an invented capability."
    fails_when: the read invents or defaults a capability, raises an error for an ordinary miss, or the absence stops naming the concept that was asked
  - file: src/__tests__/unit/capability-registry/capability-query.port.spec.ts
    name: reports any concept as absent over an empty registry
    proves: the empty-holding edge of criterion 2
    fails_when: an empty holding yields anything but the held-false variant — an error, an empty record, or a default
  - file: src/__tests__/unit/capability-registry/capability-query.port.spec.ts
    name: reports the empty concept as the same absence rather than failing
    proves: the empty-input edge of criterion 2 — the empty string, which no registration may answer, takes the ordinary absence path
    fails_when: reading the empty concept throws, or answers anything but the absence naming it
  - file: src/__tests__/unit/capability-registry/capability-query.port.spec.ts
    name: refuses to resolve a concept the holding answers twice rather than choosing among the answers
    proves: "No concept ever resolves to more than one capability."
    fails_when: the read answers either capability of a duplicated holding — the head of any ordering, which is the chain the specification refuses — or the refusal stops carrying the concept and both answering identities
  - file: src/__tests__/unit/capability-registry/capability-query.port.spec.ts
    name: refuses a registration naming a concept a different capability already answers
    proves: the implementation's recorded inference that the one-to-one rule is enforced at registration — the registration-side half of criterion 3
    fails_when: the registry accepts a second name-and-version identity for an already-answered concept, or the refusal stops carrying the concept and both identities
  - file: src/__tests__/unit/capability-registry/capability-query.port.spec.ts
    name: holds no second answer for a concept when it refuses the registration
    proves: the task's UNDERDETERMINED note — a resolver keeping a priority-ordered chain per concept and answering its head satisfies all four criteria as written; this test fails over exactly that implementation
    fails_when: the registry stores the second capability for an already-answered concept — the chain the note names — or writes anything before refusing
  - file: src/__tests__/unit/capability-registry/capability-query.port.spec.ts
    name: lets a re-registration under its own name and version move its concept
    proves: the implementation's recorded inference that a re-registration under its own held identity still replaces its record and may change its concept, the moved-from concept answering as absent afterwards
    fails_when: the concept guard starts reaching the registration's own held identity, or the read still answers the moved-from concept after the replacement
  - file: src/__tests__/unit/capability-registry/capability-query.port.spec.ts
    name: no longer answers a concept the holding no longer carries, even after answering it once
    proves: "A read after a registration changes answers the registration as it stands, never a remembered one. — the store-seam half: the service keeps no holding of its own between reads"
    fails_when: the service caches a holding, answering a capability the store no longer carries
  - file: src/__tests__/unit/capability-registry/capability-query.port.spec.ts
    name: lets a failing store read reach the caller instead of answering an absence
    proves: the failing-dependency edge — a store that cannot be read is a failure of the read, never an absence
    fails_when: a failed store read is swallowed into the held-false variant, which a consumer would read as a concept nobody answers
  - file: src/__tests__/integration/capability-registry/capability-query.port.spec.ts
    name: answers a capability registered since the previous read, never a remembered absence
    proves: "A read after a registration changes answers the registration as it stands, never a remembered one. — through createCapabilityQuery over the real file store"
    fails_when: the query remembers its first read instead of reading capability.json again, or createCapabilityQuery stops answering over the same holding registrations land in
  - file: src/__tests__/integration/capability-registry/capability-query.port.spec.ts
    name: answers a changed registration as it now stands, never the record it replaced
    proves: "A read after a registration changes answers the registration as it stands, never a remembered one. — the task's full scenario: register, read, register a change, read again"
    fails_when: the second read answers the replaced record, or anything cached between the two reads survives the re-registration
  - file: src/__tests__/integration/capability-registry/capability-query.port.spec.ts
    name: refuses to resolve over a capability file hand-edited into two answers for one concept
    proves: "No concept ever resolves to more than one capability. — over the one state the registration guard cannot prevent, the plain JSON file a person edited"
    fails_when: the real wiring resolves a duplicated holding by picking any of its answers instead of refusing the read
not_applicable:
  - edge_case: an absent (undefined) concept argument
    why: the published signature takes a required string, so the compiler excludes it; the empty string, which the compiler admits, is tested instead
  - edge_case: a boundary at each end of a stated range
    why: no node this task implements states a range the read enforces — the timeout's integer-milliseconds bound acts at registration and is proven by the sibling registration proof
  - edge_case: a dependency that answers slowly
    why: no bound node states a deadline for the registry read — the capability's own timeout is the observation's budget inside the collection's deadline, not the read's
  - edge_case: two operations against one subject at once
    why: no bound node states concurrent behavior over the one plain file the MVP persists to
untested:
  - the form any transport gives the absence report and the two refusals — no node states what the read answers on a miss beyond distinguishing it, the typed held-false variant is pinned here only as the implementation's recorded inference, and no transport exists for a named refusal or status to be proven against
contested:
  - what: the delivered registration guard contradicted the sibling registration proof's test "holds two versions of one capability name as two registrations", whose fixture seeded both versions with one concept and expected both held — the suite's first run (run/capability-registry-capability-resolution-suite) is red on exactly that test.
    why: rules/integration/one-capability-answers-one-concept backs the implementation — two versions of one name may coexist only answering different concepts — so the stale fixture was the sibling proof's to amend and not this proof's to edit; the conflict was recorded, settled by the human in favor of the rule, the sibling fixture amended with the settlement noted on its proof, and the green run this record points at followed.
divergences:
  - cites: TST-04
    file: src/__tests__/unit/capability-registry/capability-query.port.spec.ts
    departure: three tests in this file — the registration refusal, its written-nothing companion and the concept move — exercise capability-registry.service.ts, whose mirrored spec file belongs to the registration task's proof rather than sitting at this file's path.
    why: the service's mirrored file is another proof's record to maintain, and appending this task's tests there would mix two proofs' tests in one file nobody's record lists whole; the guard is this task's half of criterion 3, so it sits beside the tests that read it, disclosed here so the standard pass's finding is not read as news
---
## What it is
Thirteen tests over two files: the published read's resolution, absence and freshness behavior as pure units and through the real wiring, and the one-to-one guarded on both sides — the registration refusal that keeps a chain from ever being stored, and the read refusal over a holding a person hand-edited into two answers.

## Notes
The contested entry is this delivery's most important record: the first suite run is red on the sibling proof's stale fixture, the specification's rule settled it, the human confirmed, and the amendment is noted on the sibling proof — one producer never overruled the other in silence.
The UNDERDETERMINED note's chain is excluded structurally: nothing is ever stored for a second identity answering one concept, so no later ordering has anything to read.
