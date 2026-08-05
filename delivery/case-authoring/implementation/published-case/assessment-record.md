---
title: "The assessment construct that carries a resolution"
summary: "The Assessment value and its constructor, together with the resolution, referral and glossary-name shapes it embeds or binds by identity, written as the first source in an empty src/."
task: sha256:d608364ba4875a6473e9edb699326e8a5bb6d0c4f353f08aa7aa92a408c84aaa
standard:
  at: standards/backend-typescript.yaml
  pin: sha256:08c8746bccee3c84d563e9a9ab639ae211360ac7dd76a6db8930b46820a13f69
files:
  - path: "src/glossary/outcome.ts"
    effect: "declares the name an outcome is carried by, so a value binding an outcome by identity has a name type to hold; enumerates and checks nothing"
  - path: "src/glossary/action.ts"
    effect: "declares the name an action is carried by, so a referral has a name type to hold; enumerates and checks nothing"
  - path: "src/glossary/recipient.ts"
    effect: "declares the name a recipient is carried by, so a referral has a name type to hold; enumerates and checks nothing"
  - path: "src/knowledge/referral.ts"
    effect: "declares the referral as the read-only pair of an action name and a recipient name, the shape a resolution embeds"
  - path: "src/knowledge/resolution.ts"
    effect: "declares the resolution as the read-only pair of an outcome name and an embedded referral, and offers no way to produce one"
  - path: "src/knowledge/hypothesis.ts"
    effect: "declares the name a hypothesis is identified by, so a value binding a hypothesis by identity has a name type to hold"
  - path: "src/investigation/assessment.ts"
    effect: "declares the assessment as one required resolution, an optional determining hypothesis name and a required text, and constructs a frozen assessment that reads every part back as it was given"
criteria:
  - criterion: "An assessment reads back the resolution it was constructed with."
    met: true
    how: "createAssessment in src/investigation/assessment.ts copies the resolution whole through copyResolution and copyReferral into the frozen value it returns, so reading resolution back yields the same outcome name, action name and recipient name it was constructed with, and a later change to the object handed in cannot reach it"
  - criterion: "An assessment carries exactly one resolution."
    met: true
    how: "the Assessment type in src/investigation/assessment.ts declares resolution as a single required field of type Resolution \u2014 not a list and not optional \u2014 so there is no slot for a second and no assessment without one, and createAssessment fills that one slot from the one resolution it is handed"
  - criterion: "An assessment constructed with a determining hypothesis reads back that hypothesis by the name unique within its case."
    met: true
    how: "determiningHypothesis is typed HypothesisName, which src/knowledge/hypothesis.ts declares as the hypothesis's identity \u2014 its name, the one two hypotheses of a case never share \u2014 and createAssessment carries that name through unchanged"
  - criterion: "An assessment constructed with no determining hypothesis reads back none and is not refused for carrying none."
    met: true
    how: "determiningHypothesis is optional on the Assessment type, and createAssessment neither checks nor rejects its absence \u2014 it has no refusal path at all \u2014 so an assessment built without one is constructed and reads the field back as absent"
  - criterion: "An assessment reads back the text it was constructed with."
    met: true
    how: "createAssessment carries text through to the frozen value untouched; nothing inspects, trims, rewrites or measures it"
nodes:
  - node: definition/investigation/assessment
    encoded_at:
      - "src/investigation/assessment.ts"
    how: "the Assessment type is the node's three attributes exactly \u2014 a required embedded resolution, a determining hypothesis bound by identity and not required, and a required text \u2014 and ddd value-object is encoded as read-only fields plus a frozen constructed value, which is what makes readback unchanged. The node's Rules about what the writing receives in each branch, and that the writing never receives the case's curator prose, are not reached: the text arrives already written and nothing here composes or presents it. The waived attributes.text.audience gap is honored by encoding no exposure decision anywhere."
  - node: definition/knowledge/resolution
    encoded_at:
      - "src/knowledge/resolution.ts"
      - "src/investigation/assessment.ts"
    how: "Resolution is the node's pair \u2014 an outcome bound by identity and an embedded referral \u2014 and the assessment embeds it whole. The node's rule that a resolution is declared by the case and never produced during an investigation is honored by the module declaring the shape and no constructor: nothing in this delivery can make a resolution, only carry one it is handed."
  - node: definition/knowledge/referral
    encoded_at:
      - "src/knowledge/referral.ts"
      - "src/investigation/assessment.ts"
    how: "Referral is the node's action and recipient, both bound by identity as names from the global vocabularies, embedded in Resolution and copied whole into a constructed assessment. The node's clause that a referral may not be seen before the investigation has a record is not reached, because nothing here presents a referral to anyone."
  - node: definition/knowledge/hypothesis
    encoded_at:
      - "src/knowledge/hypothesis.ts"
      - "src/investigation/assessment.ts"
    how: "the assessment binds the hypothesis by identity and the node's identity is its name, so only HypothesisName is declared and the assessment holds that name. The hypothesis's own attributes \u2014 what it collects, its confirming criterion, the resolution that follows when it holds \u2014 are not reached by this task, which never reads a case. The node's rule that two hypotheses of one case never share a name is what makes the carried name sufficient; the case that scopes it sits outside this construct, which holds no case reference."
  - node: definition/glossary/outcome
    encoded_at:
      - "src/glossary/outcome.ts"
    how: "the resolution binds its outcome by identity, so OutcomeName carries the name and this source neither enumerates the vocabulary nor checks membership in it. The task waives the open values gap, and no member of that vocabulary is written anywhere in this delivery."
  - node: definition/glossary/action
    encoded_at:
      - "src/glossary/action.ts"
    how: "the referral binds its action by identity, so ActionName carries the name and nothing enumerates or validates the vocabulary. The task waives the open values gap, and no action name is written anywhere in this delivery. The node's rule that an action a case names must exist in the glossary is not reached: nothing here reads a case or the register."
  - node: definition/glossary/recipient
    encoded_at:
      - "src/glossary/recipient.ts"
    how: "the referral binds its recipient by identity, so RecipientName carries the name and nothing enumerates or validates the vocabulary. The task waives the open values gap, and no recipient name is written anywhere in this delivery. The node's clause that a recipient names a role and never a person reaches no check here, since the name is carried as given."
inferences:
  - inferred: "the source is laid out as one module per base node, in directories named for the base's contexts \u2014 src/investigation/, src/knowledge/, src/glossary/."
    from: "the base's own path structure, which is kind over context over slug; the inventory records an empty src/ with no module or convention to follow, and the standard states no home for a domain value module, so nothing declared or observed decided this"
  - inferred: "an assessment carrying no determining hypothesis reads the field back as an absent value rather than through a distinct sentinel or a wrapper."
    from: "the assessment node declares determining_hypothesis not required and names no value for its absence, and the language's own optional-property idiom is the representation a caller of TypeScript source would expect"
  - inferred: "a constructed assessment holds its own copy of the resolution and the referral rather than the object it was handed."
    from: "ddd value-object on the assessment, the resolution and the referral, which is what reads back unchanged rests on \u2014 a shared object would let the value change after construction"
  - inferred: "relative import specifiers are written without a file extension."
    from: "the inventory records that no toolchain has been chosen, so no module resolution mode is settled; whichever is chosen may require these specifiers to be rewritten"
deferred:
  - what: "The repository holds no TypeScript toolchain \u2014 no package manifest, compiler configuration, dependency lock or test harness \u2014 so nothing written here can be compiled or linted, and the standard's twenty-three tool-decided rules have nothing to run them."
    why: "choosing a language toolchain is not this task's objective, the plan's inventory records that none had been chosen, and writing build or dependency configuration is outside what this delivery may write; the task's epic states that no task of it selects a toolchain"
  - what: "Constructing a resolution, a referral and a whole hypothesis from what a case declares \u2014 src/knowledge/ holds only the shapes an assessment embeds and the name it binds by identity, with no constructors."
    why: "task/published-case/case-structure states criteria for exactly those readbacks, so building them here would reach past this task's objective and duplicate that task's work; this task is handed a resolution and never reads a case"
  - what: "Choosing which resolution an assessment carries and which hypothesis it names as determining."
    why: "the task's own body states that nothing here chooses what goes in the construct, and task/published-case/outcome-resolution is the behaviour that reads the case and decides it"
  - what: "The assessment node's writing-input rules \u2014 what the writing receives when a hypothesis confirmed, what it receives when none did, and that it never receives the case's curator prose."
    why: "the text arrives at this construct already written, and this task's objective reaches construction and readback only; nothing here composes the text or presents it to anyone"
---

## What it is

The assessment as a constructed value — one required resolution, an optional determining hypothesis carried by name, and the text, all read back exactly as they were given.
The resolution and referral shapes the assessment embeds, and the glossary name types the outcome, action and recipient are bound by, each declared as a shape with no way to build one and no vocabulary written down.
The first source in a previously empty `src/`, laid out as one module per base node under directories named for the base's contexts.

## Notes

The construct never sees a case, so nothing here reads a case, names one, or ties what the assessment carries to what a case resolved.
Nothing here presents the text or the referral to anyone, so no exposure decision is encoded and the waived audience gap stays where it was left.
No vocabulary member of the outcome, action or recipient glossaries appears anywhere in this source, and nothing checks a carried name against a register.
`createAssessment` has no refusal path at all — an absent resolution or text is refused by the type system rather than at runtime, and no error, code or status is named, because no bound node holds one for this construct.
An empty text is constructed rather than refused, since no bound node states a refusal for it and the standard puts the refusal of absent or empty input at a validation boundary this construct is not.
The written source departs from no rule of the standard — the only reading-decided rules whose scope reaches a plain TypeScript module under `src/` are SEC-04 and MNT-03, and this delivery logs nothing, answers nothing and copies no logic that existed.
Types are declared with `type` rather than `interface`, so CON-01's prefix rule for interfaces does not arise, and no file carries a suffix that brings the layering, DTO, transport or error rules into scope.
The record claims no divergence deliberately — the absence of a compiler configuration is a fact about the repository the inventory already records and is deferred above, not a departure observable in any file written here.
