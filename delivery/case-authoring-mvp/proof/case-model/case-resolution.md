---
title: Proof for case resolution
summary: Holds task/case-model/case-resolution over the specification's worked example — the collection plan deduplicated where the declared order first names each concept, totality demanded as the case declares it, the first confirmed hypothesis in declared order determining while a later confirmation stays unmarked, and the fallback answering whole with no determining name.
implementation: sha256:7927e3e90a578c70978e89ca444e4ac2e72767928f8ed7078fbe745cb16f8253
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/case-model-case-resolution-suite
tests:
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: answers the deduplicated union of every hypothesis's collects, each concept once
    proves: "The collection plan is the deduplicated union of every hypothesis's collects."
    fails_when: a concept two hypotheses collect appears twice, a collected concept goes missing from the plan, or a concept nobody collects appears in it
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: lists each concept where the declared order first names it
    proves: the implementation's recorded inference that the plan's order is first appearance in declared order — the fixture is deliberately non-alphabetical
    fails_when: the plan starts sorting its concepts, or a concept repeated by a later hypothesis moves to its later appearance
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: answers a concept one hypothesis collects twice exactly once
    proves: the deduplicated half of criterion 1 at its narrowest — a repeat inside one hypothesis's own collects, which the parser does not refuse and only the plan can collapse
    fails_when: a within-hypothesis duplicate survives into the plan
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: demands one evaluation per declared hypothesis, named and ordered as the case declares them
    proves: "requires-evaluation-of answers what totality demands as the case declares it, one entry per declared hypothesis name."
    fails_when: a declared hypothesis goes undemanded, an undeclared name is demanded, an entry duplicates, or the answer stops following the declared order
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: demands exactly the one hypothesis of a single-hypothesis case
    proves: the lower boundary of the aggregate's only stated bound over the totality demand
    fails_when: a one-hypothesis case demands more or fewer than its one declared name
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: answers the first confirmed hypothesis in declared order with its outcome, its referral and its determining role
    proves: "Given confirmed and refuted verdicts per hypothesis name, resolve-outcome answers the first confirmed hypothesis in declared order with its outcome, its referral and its determining role. — realizing scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome over the worked example"
    fails_when: the later confirmed hypothesis answers, the resolution's outcome or referral arrives without the other, the determining name is wrong or missing, or anything beyond the three declared fields appears
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: leaves a hypothesis confirmed after the determining one holding its confirmed verdict, unmarked
    proves: "A hypothesis confirmed after the determining one keeps its confirmed verdict, unmarked. — the scenario's second then: the verdicts are only read, never written"
    fails_when: resolve-outcome writes a mark into the verdicts record it was given, or the later confirmed hypothesis becomes the one the answer names
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: follows the declared order alone, so reversing the declaration flips which confirmed hypothesis determines
    proves: "The declared order of the case's hypotheses is the only precedence resolution consults. — the same two confirmed hypotheses declared in both orders, each declaration answering its own first"
    fails_when: precedence starts following anything but the declaration — the names' alphabetical order or the verdicts record's own key order
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: never lets a confirmed verdict under a name the case does not declare determine anything
    proves: the declared-hypotheses edge of criterion 3 — a stray confirmed entry neither determines nor shifts the answer
    fails_when: a confirmed verdict under an undeclared name determines the outcome or displaces the declared hypothesis that should
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: lets an unanswered hypothesis determine nothing, so a later explicit confirmation answers
    proves: the implementation's recorded inference that only an explicit confirmed verdict confirms — pinned only as far as an unanswered name never determining
    fails_when: an unanswered hypothesis name starts reading as confirmed
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: answers the fallback's outcome and referral when every hypothesis is refuted or inconclusive
    proves: "When every hypothesis is refuted or inconclusive, resolve-outcome answers the fallback's outcome and referral. — realizing scenarios/knowledge/no-confirmation-falls-back over a mix of both non-confirming verdicts"
    fails_when: a refuted or inconclusive hypothesis's own resolution answers, the fallback's pair arrives split or altered, or a determining name appears
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: names no determining hypothesis when the fallback answers
    proves: "When the fallback answers, no determining hypothesis is named. — and the implementation's recorded shape: the field is absent, not null and not a key holding undefined"
    fails_when: the determining property appears on a fallback answer in any form
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: falls back over a single-hypothesis case whose one claim is refuted
    proves: the fallback path at the aggregate's lower boundary
    fails_when: the single refuted hypothesis's own resolution answers instead of the fallback's
  - file: src/__tests__/unit/case/case-document-modules.spec.ts
    name: the document model's modules import no framework, no driver and no provider client
    proves: "The resolution modules import no framework, no driver and no provider client. — held by the standing sibling audit, which reads every .ts under src/case from disk and so swept case-resolution.ts the moment it existed; reused rather than duplicated"
    fails_when: case-resolution.ts gains an import of a framework, driver or provider client — and its companion test fails on any non-relative import at all
not_applicable:
  - edge_case: absent input
    why: both operations take required parameters the strict compiler excludes absence from, and no transport boundary exists in this task
  - edge_case: empty input — a case declaring no hypotheses
    why: refused at parse before any operation runs, proven by the document-model proof; these operations receive only the already-valid aggregate
  - edge_case: a boundary at each end of a stated range
    why: the only stated bound is at least one hypothesis, whose lower end the two single-hypothesis tests exercise
  - edge_case: a duplicate where uniqueness is claimed
    why: a duplicated hypothesis name is refused at parse; the duplicate these operations can actually meet — a concept collected twice — is tested rather than dismissed
  - edge_case: an operation against state that forbids it
    why: the three operations are pure functions of their arguments
  - edge_case: a dependency that fails or answers slowly
    why: the module has no dependency at all, and the standing sibling import audit keeps that true
  - edge_case: two operations against one subject at once
    why: pure functions over a read-only aggregate share no state, and the unmarked-verdict test proves the one input a call could have written into is never written
untested:
  - what resolve-outcome answers over a non-total verdict set in which nothing confirms, including the empty record — totality is the successor initiative's rule, so no test pins that path either way; the one thing held is that an unanswered name never determines
  - whether the answered outcome and referral alias the aggregate's own objects or copy them — no bound node states aliasing behavior
  - the plan's first-appearance order is pinned only as the implementation's recorded inference — if the analysis later states an order, that test states the implementation's choice, not the business's
---
## What it is
Thirteen test entries, twelve newly written as pure units over the worked example and one reused — the standing import audit that swept the new module the moment it existed.
Both scenarios are realized concretely, the order-only precedence is proven by flipping one declaration, and the fallback's absent determining field is held in the shape the implementation recorded.

## Notes
Criterion 8 is deliberately proven by reuse: the sibling audit reads the directory from disk, so a duplicate audit would pin the same fact twice.
The non-total verdict set stays unpinned on purpose — the seam belongs to the successor initiative, and a test either way would state a fact nothing holds.
