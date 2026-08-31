---
title: Filter the "+ attribute" control's Select against the requirement set
summary: The curator's "+ attribute" glossary Select in case-simulation-subject-panel.tsx now excludes
  every attribute name state.requiredFields already names, leaving the shared useGlossaryVocabularyOptions
  hook untouched for its other consumers.
task: sha256:f87732ae526ec170050db98b97e699acfefab4a35ef5f4ab9ff589f007db6ecd
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/subject-input-requirements-exclude-required-build-2
files:
- path: src/routes/case-simulation-subject-panel.tsx
  effect: adds a local availableAttributeOptions(allOptions, requiredFields) helper that filters a glossary
    vocabulary's SelectOption list against the attribute names state.requiredFields already names, computes
    availableSubjectAttributeOptions from it inside CaseSimulationSubjectPanel, and passes that filtered
    list (rather than the unfiltered subjectAttributeOptions) as the curator's own "+ attribute" row's
    Select options; the header comment gains a paragraph documenting this task's own exclusion and its
    scope, and the helper itself carries a doc comment explaining why it filters only against requiredFields
    and never against addedAttributes.
criteria:
- criterion: The attribute Select offers no attribute name the state's own requirement set already names.
  met: true
  how: availableAttributeOptions builds a Set of state.requiredFields.map(field => field.attribute) and
    filters subjectAttributeOptions to exclude any option whose value is in that set; the Select's options
    prop reads availableSubjectAttributeOptions, the filtered result, rather than the raw subjectAttributeOptions.
- criterion: Every option the Select still offers is drawn from the glossary's subject-attribute vocabulary,
    never typed as free text.
  met: true
  how: the control is unchanged as a Select bound to useGlossaryVocabularyOptions("subject-attribute")'s
    own options; availableAttributeOptions only ever removes entries from that same list via Array.prototype.filter,
    it never adds or synthesizes one, so every surviving option is still one the glossary vocabulary itself
    returned.
- criterion: No attribute the requirement set already names can be added a second time through this control.
  met: true
  how: naturally satisfied once the first criterion holds -- an attribute already named by requiredFields
    is no longer a selectable option in any row's Select, so onAttributeChange can never be invoked with
    that attribute name from this control.
- criterion: useGlossaryVocabularyOptions still answers with the whole vocabulary for its other consumers.
  met: true
  how: use-glossary-vocabulary.ts itself is untouched; the filtering happens entirely inside case-simulation-subject-panel.tsx
    after the hook returns, so every other caller (e.g. glossary-browser-screen.tsx) still receives the
    hook's own unfiltered options.
- criterion: Where the requirement set already names every attribute the vocabulary holds, the control
    offers no option rather than offering one already named.
  met: true
  how: availableAttributeOptions is a plain Array.prototype.filter with no fallback branch -- if every
    option in allOptions is excluded, it returns an empty array, and there is no code path that reverts
    to the unfiltered subjectAttributeOptions.
nodes:
- node: domain/knowledge/case-input-requirement
  how: this task reaches this node only through state.requiredFields, which a sibling task already derives
    one-per-case-input-requirement from this node's own read; this delivery adds no new fact about the
    node itself, it only reads the attribute name each already-derived field carries to decide what the
    "+ attribute" control may still offer.
- node: rules/investigation/a-composed-subject-presents-every-case-input-requirement
  how: this task's own filtering is downstream of this rule's presentation clauses, which a sibling task
    already answers; this delivery does not encode any new fact of this rule, it reads the requirement
    set that rule's own presentation already produces on state.requiredFields to compute the exclusion.
- node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
  how: the control that lets a curator add an attribute stays a Select bound to the glossary's subject-attribute
    vocabulary after filtering -- availableAttributeOptions only removes options from that glossary-drawn
    list, it never introduces a name the glossary does not hold, so every option offered (before or after
    this task's own filter) is drawn from the glossary.
- node: rules/investigation/a-subject-holds-one-value-per-attribute
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
  how: this task keeps the "+ attribute" control from ever being a way of reaching the case this rule
    governs, for a requirement-named attribute -- once an attribute already named by requiredFields is
    excluded from the Select, the curator can never add a second value for it through this control, so
    the collision this rule's own first-recorded-wins resolution would otherwise have to settle for this
    control's own additions never arises here; the resolution itself is not implemented by this task,
    only the one avenue this control offered toward it is closed.
preserved:
- The curator's "+ attribute" control stays a Select bound to useGlossaryVocabularyOptions("subject-attribute"),
  never becoming a free-text Input.
- useGlossaryVocabularyOptions itself, and every other caller reading it unfiltered (e.g. glossary-browser-screen.tsx),
  is untouched.
- use-simulation-subject.ts, deriveSubjectFields and SimulationSubjectState's own shape are untouched
  -- the filtering is computed entirely inside case-simulation-subject-panel.tsx from the state it already
  receives.
- A curator-added row's own already-typed attribute/value and the remove/add row handlers are unaffected;
  only the option list a still-unfilled or being-changed row's Select offers is narrower.
deferred:
- what: rules/investigation/a-subject-holds-one-value-per-attribute's own first-recorded-wins resolution,
    for the general case (e.g. two curator-added rows both naming the same non-requirement attribute,
    which this task's own filter does not prevent since it only excludes requiredFields' own names).
  why: this task's own REMAINDER note assigns that resolution to the act that assembles a subject's whole
    attribute-value set before a diagnose, simulate-case or simulate-hypothesis call -- outside this task's
    own candidate set, which only filters this one manual control's offer against the requirement set.
---

## What it is
The control that lets a curator add an attribute the version's requirements do not name, keeping exactly that purpose and losing the options that duplicate a field already on the screen.

## Notes
None.
