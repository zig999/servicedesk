---
title: "Source tree after the assessment delivery"
summary: "The area the case-authoring scope lands in \u2014 eight TypeScript files under `src/`, written by the single delivered task, in three directories named for the base's contexts plus a mirrored unit-test subtree, with no package manifest, compiler configuration, dependency lock or test runner anywhere in the repository."
rationale: "The survey walked the target root as it stands rather than as the previous inventory recorded it, and it treated the implementation record's four recorded inferences as one delivery's choices rather than as settled conventions: what is recorded below as a convention carries the path it was observed at and how many files carry it, so a reader can see that the doc-comment and value-shape habits hold across all seven modules while the constructor, copy-helper and test-layout habits each rest on exactly one occurrence."
sources:
  - intake/escopo.md
  - intake/escopo-revinculacao.md
area:
  - src/
modules:
  - name: glossary
    path: "src/glossary"
    role: touched
  - name: knowledge
    path: "src/knowledge"
    role: touched
  - name: investigation
    path: "src/investigation"
    role: touched
  - name: assessment
    path: "src/investigation/assessment.ts"
    role: depends-on
  - name: resolution
    path: "src/knowledge/resolution.ts"
    role: depends-on
  - name: referral
    path: "src/knowledge/referral.ts"
    role: depends-on
  - name: hypothesis-name
    path: "src/knowledge/hypothesis.ts"
    role: depends-on
  - name: unit-tests
    path: "src/__tests__/unit"
    role: touched
conventions:
  - statement: "Every source module opens with a doc comment whose first line names the base node it encodes, and all seven modules written so far carry one."
    seen_at: "src/knowledge/resolution.ts"
  - statement: "Source directories are named for the base's contexts and hold one file per base node \u2014 three directories, seven files, no index or barrel module anywhere."
    seen_at: "src/knowledge"
  - statement: "A domain value is declared with `type` and `readonly` fields; no `interface` appears in any of the seven modules."
    seen_at: "src/knowledge/referral.ts"
  - statement: "A term the base binds by identity is declared as a named alias of `string` in its own module, and that module neither enumerates the vocabulary nor checks membership in it \u2014 four such aliases exist."
    seen_at: "src/glossary/outcome.ts"
  - statement: "Relative imports carry no file extension, and an import used only as a type is written `import type` \u2014 every import line in the tree does both."
    seen_at: "src/investigation/assessment.ts"
  - statement: "The tree's only constructor is a free create-function that takes the value's own type and returns a frozen value, with a module-private copy helper per level of nesting; this is one occurrence, not yet a pattern."
    seen_at: "src/investigation/assessment.ts"
  - statement: "The tree's only test file mirrors its module's path under a unit subtree with a spec suffix, and imports Node's built-in test and assert modules; this is one occurrence, and the proof record states the runner was chosen because none existed to follow."
    seen_at: "src/__tests__/unit/investigation/assessment.spec.ts"
  - statement: "Tests mark their phases with literal arrange, act and assert comments, arrange their own parts, and stand in for members of open vocabularies with placeholder constants so no vocabulary member is written down."
    seen_at: "src/__tests__/unit/investigation/assessment.spec.ts"
must_not_duplicate:
  - what: "The `Resolution` shape \u2014 an outcome bound by identity and an embedded referral, read-only, with no constructor."
    at: "src/knowledge/resolution.ts"
  - what: "The `Referral` shape \u2014 the read-only pair of an action name and a recipient name."
    at: "src/knowledge/referral.ts"
  - what: "`HypothesisName`, the type a value binding a hypothesis by identity holds."
    at: "src/knowledge/hypothesis.ts"
  - what: "`OutcomeName`, the type a value binding an outcome by identity holds."
    at: "src/glossary/outcome.ts"
  - what: "`ActionName`, the type a referral binds its action by."
    at: "src/glossary/action.ts"
  - what: "`RecipientName`, the type a referral binds its recipient by."
    at: "src/glossary/recipient.ts"
  - what: "The `Assessment` type and `createAssessment`, the constructed value carrying one resolution, an optional determining hypothesis name and a text."
    at: "src/investigation/assessment.ts"
  - what: "The copy-on-construct helpers that make a carried resolution read back unchanged after the object handed in is mutated \u2014 module-private, so a task needing them today would rewrite them."
    at: "src/investigation/assessment.ts"
risks:
  - risk: "The four identity types are bare aliases of `string`, so every name slot accepts any string and a lookup or membership check gets no help from the type system in telling an outcome name from an action name."
    consumers:
      - "task/case-validator/glossary-lookup"
      - "task/case-validator/terms-exist-in-the-glossary"
      - "task/case-validator/recipient-is-a-role"
      - "task/case-validator/unique-hypothesis-names"
  - risk: "`src/knowledge/resolution.ts` declares the shape and deliberately offers no way to build one, so a task that constructs resolutions and referrals from what a case declares either edits that module and its stated claim or builds them elsewhere."
    consumers:
      - "task/published-case/case-structure"
      - "task/published-case/outcome-resolution"
  - risk: "`createAssessment` takes the assessment's own type as its parameter, so any part later added to the value becomes a required argument at every call site at the same moment."
    consumers:
      - "task/published-case/outcome-resolution"
  - risk: "Copy-on-construct is hand-written one helper per nesting level and both helpers are module-private, so a nested part added without its own copy step is shared rather than copied and the readback stops holding while every existing test still passes."
    consumers:
      - "task/published-case/case-structure"
      - "task/published-case/evaluation-record"
      - "task/published-case/outcome-resolution"
  - risk: "Relative import specifiers are extensionless and no compiler configuration settles a module resolution mode, so whichever toolchain is chosen may require every import line in the tree to be rewritten."
    consumers:
      - "task/published-case/case-structure"
      - "task/published-case/evaluation-record"
      - "task/published-case/outcome-resolution"
      - "task/case-validator/glossary-lookup"
      - "task/case-validator/terms-exist-in-the-glossary"
      - "task/case-validator/recipient-is-a-role"
      - "task/case-validator/unique-hypothesis-names"
  - risk: "Nothing in the tree has been executed or type-checked, and the one spec file targets Node's built-in runner; a proof written against a different runner would leave two harnesses in the same subtree, and the existing file would be rewritten by whichever choice wins."
    consumers:
      - "task/published-case/case-structure"
      - "task/published-case/evaluation-record"
      - "task/published-case/outcome-resolution"
  - risk: "An assessment carrying no determining hypothesis reads the field back as the absent value with no sentinel and no wrapper, so a reader distinguishing absence from an empty name depends on that representation staying what it is."
    consumers:
      - "task/published-case/outcome-resolution"
---

## What it is

The target source root `src/`, which now exists on disk and holds seven modules and one test file.
Three directories named for the base's contexts — `src/glossary/` with three glossary name types, `src/knowledge/` with the referral shape, the resolution shape and the hypothesis name, and `src/investigation/` with the assessment type and its constructor.
One unit-test subtree at `src/__tests__/unit/` holding a single spec file that mirrors the path of `src/investigation/assessment.ts`.
The assessment as the tree's only behaviour — a constructor that freezes what it is handed, copies the resolution and the referral whole, and refuses nothing at runtime.
The shapes the rest of the plan's sixteen tasks will build on — a resolution, a referral, and the four names a value binds a term by — each declared without a constructor and without any vocabulary written down.

## Notes

This node supersedes the greenfield inventory, whose every observation about the target had stopped being true: `src/` existed nowhere on disk when that node was written, and it now holds eight files.
What changed is one delivered task, which wrote the three glossary name modules, the referral, resolution and hypothesis modules, the assessment module and one spec file.
The superseded node recorded no module, convention, reuse point or risk because there was nothing to observe one at; all four fields are populated here from files read in the tree.
The superseded node also recorded that no standard registry existed at the repository root, and that is stale too — two registries exist and the implementation record pins one of them, though neither lies inside the surveyed area.
What has not changed is the absence of a toolchain: the repository holds no package manifest, no compiler configuration, no dependency lock and no test runner, so no file in `src/` has ever been compiled, type-checked or executed.
The language of the tree is TypeScript because the one delivery wrote TypeScript, not because any manifest or configuration in the repository selects it.
Four of the conventions above are carried by all seven modules and are safe to follow; the constructor shape, the copy-helper shape and the test layout each rest on exactly one file, which is why each statement says so rather than presenting one delivery's choice as the tree's habit.
The implementation record listed the context-named source layout as an inference it made rather than a fact it read, and this survey records it as a convention on the evidence of three directories and seven files that follow it — the count is one delivery's, and a second delivery diverging from it would depart from one precedent rather than from an established rule.
`src/glossary/` holds three of the five glossary terms the plan's tasks bind — subject type and concept have no module — so a task expecting a name type for either will find none and is writing the first, not reusing one.
Nothing anywhere in `src/` enumerates a member of the outcome, action or recipient vocabularies, and nothing checks a carried name against a register, so the open vocabulary gaps in the base are unencoded in source and remain the base's to settle.
