---
title: Proof for the observation-source port and its fake adapter
summary: Drives FakeObservationSource, the only concrete IObservationSource this task ships, through each of the four evidence-result endings and its one throwing fault, and audits src/investigation's own modules for import purity and for shipping exactly one adapter.
implementation: sha256:e9c168e7f976563c9ca9b32f23a86e0a1322c1c5125816d71f8d648ea654ea0b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/evidence-collection-observation-source-port-suite
tests:
- file: src/__tests__/unit/investigation/observation-source.port.spec.ts
  name: answers the ok ending carrying the actual observation seeded for the pair, not the bare tag alone
  proves: criterion 3 ("A unit test drives the fake adapter through each of the four evidence-result endings and asserts the port answers each as data") for the ok ending, and the inference the implementation recorded resolving the task's UNDERDETERMINED note, that the ok ending carries an actual observation string rather than only the bare result tag
  fails_when: 'observeConcept resolves to anything other than exactly { result: ''ok'', observation: ''the-observed-value'' } for the seeded pair, including a future change that drops the observation field back to a bare { result: ''ok'' } tag, which this same assertion would no longer match'
- file: src/__tests__/unit/investigation/observation-source.port.spec.ts
  name: answers the unavailable ending as data, without throwing
  proves: criterion 1 ("never throwing for a non-ok ending") and criterion 3, for the unavailable ending
  fails_when: 'observeConcept rejects instead of resolving for a seeded unavailable outcome, or resolves to anything other than { result: ''unavailable'' }'
- file: src/__tests__/unit/investigation/observation-source.port.spec.ts
  name: answers the denied ending as data, without throwing
  proves: criterion 1 and criterion 3, for the denied ending
  fails_when: 'observeConcept rejects instead of resolving for a seeded denied outcome, or resolves to anything other than { result: ''denied'' }'
- file: src/__tests__/unit/investigation/observation-source.port.spec.ts
  name: answers the timeout ending as data, without throwing
  proves: criterion 1 and criterion 3, for the timeout ending
  fails_when: 'observeConcept rejects instead of resolving for a seeded timeout outcome, or resolves to anything other than { result: ''timeout'' }'
- file: src/__tests__/unit/investigation/observation-source.port.spec.ts
  name: answers the outcome seeded for this subject, not the one seeded for a different subject of the same concept
  proves: criterion 1's "accepts a concept, a subject and the requester's own scope", that the subject genuinely participates in which outcome answers, rather than the fake (or a hypothetical implementation) ignoring it and keying on the concept alone
  fails_when: observeConcept answers the outcome seeded for SUBJECT_TWO, or any outcome other than the one seeded for SUBJECT_ONE, when asked about SUBJECT_ONE
- file: src/__tests__/unit/investigation/observation-source.port.spec.ts
  name: answers the outcome seeded for this concept, not the one seeded for a different concept of the same subject
  proves: criterion 1's "accepts a concept", that the concept genuinely participates in which outcome answers, rather than resolution keying on the subject alone
  fails_when: observeConcept answers the outcome seeded for 'another-concept', or any outcome other than the one seeded for 'a-concept', when asked about 'a-concept' for the same subject
- file: src/__tests__/unit/investigation/observation-source.port.spec.ts
  name: a later seed for the same concept and subject replaces the earlier one
  proves: the fake's own documented behavior of replacing an earlier seed for the same pair, and criterion 2's "driven entirely by test-supplied fixtures", the answer always reflects the most recently supplied fixture, never an accumulation or the first one seeded
  fails_when: observeConcept answers the first-seeded outcome (unavailable) instead of the replacing one, after the same pair is re-seeded
- file: src/__tests__/unit/investigation/observation-source.port.spec.ts
  name: throws naming the concept rather than answering a default for a concept-and-subject pair nothing seeded
  proves: the edge case of asking for an unseeded concept/subject pair, and the inference the implementation recorded that an unseeded pair throws a plain error naming what was never seeded rather than answering one of the four endings by default
  fails_when: observeConcept resolves to some default outcome instead of rejecting, or rejects with a message that does not name the concept asked about
- file: src/__tests__/unit/investigation/observation-source-modules.spec.ts
  name: the observation-source modules import no framework, no driver and no provider client
  proves: criterion 2's "importing no network client and no framework", and how the implementation record answers constraints/the-domain-depends-on-no-infrastructure for evidence-result.ts, observation-source.port.ts and fake-observation-source.adapter.ts, the automated sweep the implementation record names as deferred to this proof rather than assumed covered by inspection alone
  fails_when: any file directly under src/investigation imports one of the listed frameworks, database drivers or provider client packages
- file: src/__tests__/unit/investigation/observation-source-modules.spec.ts
  name: the observation-source modules import nothing from the standard library, so infrastructure cannot be reached from them directly
  proves: the same constraint and criterion, catching a node builtin (including any node network module such as node:http) rather than only a third-party package
  fails_when: 'any file directly under src/investigation imports anything prefixed node: or named among Node''s builtin modules'
- file: src/__tests__/unit/investigation/observation-source-modules.spec.ts
  name: ships exactly one concrete adapter behind the port
  proves: criterion 2's "The fake adapter is the only concrete implementation this task ships"
  fails_when: a second .adapter.ts file appears directly under src/investigation, or fake-observation-source.adapter.ts is renamed or removed without the assertion changing
not_applicable:
- edge_case: two operations reaching the fake for one concept-and-subject pair at once
  why: the fake is a synchronous in-memory Map read wrapped in an already-resolved promise; there is no I/O boundary or shared mutable state a second concurrent call could observe mid-write, and no specification node bound to this task describes concurrent-call behavior for this port
- edge_case: a dependency that is unavailable, slow to answer, or answers in an unexpected shape
  why: this task ships no real dependency, unavailable and timeout are seeded plain data, not a hung call or a malformed response, and the real connector that would actually reach a slow or misbehaving system is this epic's declared remainder, not this task's
- edge_case: a boundary at each end of a stated numeric or ordered range
  why: neither the port nor the fake declares any numeric or ordered range for concept, subject or requester, each is an opaque string or a two-field shape with no bound to sit at the edge of
- edge_case: an empty collection answered where one is expected
  why: observeConcept answers exactly one ObservationOutcome, never a list, so there is no collection for emptiness to apply to
- edge_case: an empty-string concept, subject type or subject id
  why: no node bound to this task assigns an empty string any special meaning at this port (unlike the glossary and capability-registry query ports, which explicitly document an empty concept as a distinct domain absence), the fake's fixture lookup treats any string uniformly by exact match, so an empty string would exercise exactly the same seeded/unseeded path the existing tests already cover and would prove nothing new
- edge_case: an operation attempted against state that forbids it
  why: the port models no state machine; re-observing the same pair simply answers whatever is currently seeded for it (the reseed test already exercises re-seeding), and no node describes an operation this port could refuse because of prior state
untested:
- whether the requester actually bounds resolution to that identity's own scope (rules/investigation/collection-runs-in-the-requester-scope); every test here calls observeConcept with a fixed requester string and the fake threads it through unused, exactly as the implementation record discloses, so nothing exists yet to exercise that enforcement against; the real connector this epic leaves as its declared remainder is where that behavior would first appear
---

## What it is

Unit tests proving the observation-source port's three criteria against its fake adapter, plus an import-purity and single-adapter sweep of the module.

## Notes

None.
