---
target: backend
title: Subject placeholder input_schema match removal — first review
summary: What four passes found over the corrected subject-placeholder resolver, its closed reason vocabulary,
  and the three pre-existing spec files that asserted the retired behavior.
reviewed:
- src/connector-registry/subject-placeholder-resolution.ts
- src/connector-registry/connector-configuration-draft.ts
- src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
- src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
- src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
tasks:
- task/subject-placeholder-input-schema-match-removal/resolve-regardless-of-input-schema
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the run this review points at (run/resolve-regardless-of-input-schema-suite, captured during
    this task's own delivery — a fresh capture over this review's own name failed five times to a host-level
    memory constraint outside this session's control, and the human directed reuse of the delivery's own
    suite run instead) passed cleanly; there was no failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
coverage:
- criterion: A parameter or request-body field name absent from every input schema of every capability
    currently registered against the connector still resolves as ${subject:<name>} in the draft's configuration,
    where at least one capability is registered for that connector.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: resolves customerId as ${subject:customerId} even though the one registered capability declares
      only customer_id, never withholding it for the mismatch
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: resolves every parameter and request-body field name to a placeholder once a capability is registered
      for the connector, whatever its own input schema names, while a security scheme that cannot reduce
      to a credential still lists unresolved
- criterion: No draft names a field in its unresolved list with reason no-matching-input-schema-property.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: admits exactly the three vocabulary reasons the specification enumerates, and no other value
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: resolves every parameter and request-body field name to a placeholder once a capability is registered
      for the connector, whatever its own input schema names, while a security scheme that cannot reduce
      to a credential still lists unresolved
- criterion: A connector configuration draft still refuses to resolve any candidate name, with reason
    no-capability-registered, where no capability is currently registered for that connector.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: names every parameter and request-body field name unresolved with no-capability-registered when
      no capability is registered at all
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: generates and returns a draft, rather than refusing, when every parameter resolves to nothing
      and no security scheme reduces to a credential
findings:
- pass: conformance
  file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  where: line 27, the test title "it('refuses an unresolved item whose reason is not one of the four vocabulary
    values', ...)"
  evidence: it('refuses an unresolved item whose reason is not one of the four vocabulary values', ()
    => {
  cost: A reader who trusts this title for the size of the vocabulary comes away believing it has four
    members; the node that owns the enumeration holds exactly three (no-capability-registered, security-scheme-not-reducible-to-a-credential,
    drafted-key-occupied-by-another-security-scheme), and this very file's own expected array two tests
    above is built from those same three values. The label on the test that exists to guard the vocabulary
    misstates the vocabulary it guards — a stale count left behind by the recent removal of the fourth,
    now-retired reason (no-matching-input-schema-property).
  correction: change "four" to "three" in the test title.
- pass: conformance
  file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  where: lines 93-101, the test asserting the domain module carries no import statement at all
  evidence: 'const importSpecifiers = [...source.matchAll(/(?:from|import)\s*\(?\s*[''"]([^''"]+)[''"]/g)];

    expect(importSpecifiers).toEqual([]);'
  cost: The constraint this test claims to guard permits infrastructure to reach the domain "only through
    ports" — it audits for a framework, a driver or a provider-client package, not for the presence of
    any import whatsoever. This test instead fails on any import at all, including a legitimate port-type
    or domain-to-domain type import the specification would allow; a future, conformant change that imports
    such a type into this file would be rejected by a test stricter than the rule it names.
  correction: narrow the assertion to import specifiers naming a framework, driver or provider-client
    package, rather than rejecting every import specifier.
- pass: standard
  file: src/connector-registry/subject-placeholder-resolution.ts
  where: lines 37-39, inside resolveSubjectPlaceholders
  evidence: "const registered = (await capabilitiesReader.readCapabilities()).filter(\n    (capability)\
    \ => capability.connector === connector,\n  );"
  cost: The identical operation — read every registered capability and filter to the ones naming one connector
    — already exists as refuseOrphanedPlaceholders's first two lines in connector-configuration-registry.service.ts.
    Copying it here means a future change to what "registered for a connector" means has to be made in
    both places, and nothing keeps them in step.
  correction: Extract the connector-filter over readCapabilities() into one exported function and have
    both subject-placeholder-resolution.ts and connector-configuration-registry.service.ts call it.
  cites: MNT-03
reconciliation: siegard-reconcile/subject-placeholder-input-schema-match-removal.md
---

## What it is

Four independent passes over the corrective delivery: whether the tests prove the task's
criteria, whether the source states only what the specification holds, whether it follows the
project's own standard, and why the captured run failed — it did not.

## Notes

The captured run this record points at is the delivery's own suite run
(`run/resolve-regardless-of-input-schema-suite`), not a fresh capture over this review's own
name: five attempts to run the registry's full command set again, under this review's own run
name, were each killed by a host-level memory constraint the WSL guest itself never reported as
low (`free -h` showed 9-10GB available throughout, and the kernel log carries no OOM-kill entry),
so the cause sits outside this session's or this repository's control. The human directed reuse
of the delivery's own suite run rather than a further retry. That run already covers the whole
file set of this review — the same five files, all touched by the one task under review — so the
redundancy the capture step exists for (catching two tasks that each pass alone but not together)
buys nothing further here: there is only one task in this review.

Two of the three certification delegations staged for this review (over
domain/integration/connector-configuration-draft-unresolved-item and
domain/integration/connector-configuration-draft-unresolved-reason) and one scenario
(scenarios/integration/a-mismatched-parameter-name-resolves-regardless) came back `partial` rather
than `covered` — the offered proof does not certify any of the three whole. None of the three
partial verdicts is a conformance finding: each is a coverage judgment about a specific named
proof, folded into the reconciliation record's notes and left as `## Notes` in the delivery's own
records, never promoted to a `findings` entry here — the two certification agents' own returns
carry the detail, and `trace.py --owed` is where a later reader finds the remainder each named as
testable.
