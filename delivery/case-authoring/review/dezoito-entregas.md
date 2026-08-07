---
title: "As dezoito entregas do plano case-authoring"
summary: "Três passes sobre as dezoito tasks entregues até aqui e os 50 arquivos que as respondem: cobertura total sobre 103 critérios, conformidade com a base sem achados, e 22 achados de standard; o passe de falhas não rodou por falta de comandos ou de um run capturado."
reviewed:
  - src/__tests__/unit/glossary/lookup.spec.ts
  - src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts
  - src/__tests__/unit/investigation/assessment.spec.ts
  - src/__tests__/unit/investigation/evaluation.spec.ts
  - src/__tests__/unit/knowledge/case-has-at-least-one-hypothesis.spec.ts
  - src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts
  - src/__tests__/unit/knowledge/case.spec.ts
  - src/__tests__/unit/knowledge/collection-plan.spec.ts
  - src/__tests__/unit/knowledge/concept-accepts-the-declared-subject-type.spec.ts
  - src/__tests__/unit/knowledge/every-collected-concept-declares-a-ttl.spec.ts
  - src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts
  - src/__tests__/unit/knowledge/fallback-selection.spec.ts
  - src/__tests__/unit/knowledge/hypothesis-collects-at-least-one-concept.spec.ts
  - src/__tests__/unit/knowledge/hypothesis-name-is-unique-in-its-case.spec.ts
  - src/__tests__/unit/knowledge/outcome-resolution.spec.ts
  - src/__tests__/unit/knowledge/recipient-is-a-role.spec.ts
  - src/__tests__/unit/knowledge/required-evaluations.spec.ts
  - src/__tests__/unit/knowledge/validation.spec.ts
  - src/glossary/action.ts
  - src/glossary/concept.ts
  - src/glossary/lookup.ts
  - src/glossary/observation-field.ts
  - src/glossary/outcome.ts
  - src/glossary/recipient.ts
  - src/glossary/subject-type.ts
  - src/integration/capability.ts
  - src/investigation/a-decided-evaluation-cites-evidence.ts
  - src/investigation/assessment.ts
  - src/investigation/citation.ts
  - src/investigation/evaluation.ts
  - src/investigation/evidence.ts
  - src/knowledge/case-has-at-least-one-hypothesis.ts
  - src/knowledge/case-terms-exist-in-the-glossary.ts
  - src/knowledge/case.ts
  - src/knowledge/collection-plan.ts
  - src/knowledge/concept-accepts-the-declared-subject-type.ts
  - src/knowledge/draft-case.ts
  - src/knowledge/every-collected-concept-declares-a-ttl.ts
  - src/knowledge/every-collected-concept-has-a-read-only-capability.ts
  - src/knowledge/fallback-selection.ts
  - src/knowledge/hypothesis-collects-at-least-one-concept.ts
  - src/knowledge/hypothesis-name-is-unique-in-its-case.ts
  - src/knowledge/hypothesis.ts
  - src/knowledge/outcome-resolution.ts
  - src/knowledge/recipient-is-a-role.ts
  - src/knowledge/referral.ts
  - src/knowledge/refusal.ts
  - src/knowledge/required-evaluations.ts
  - src/knowledge/resolution.ts
  - src/knowledge/validation.ts
tasks:
  - task/case-validator/at-least-one-hypothesis
  - task/case-validator/concept-accepts-the-subject-type
  - task/case-validator/concept-declares-a-ttl
  - task/case-validator/glossary-lookup
  - task/case-validator/hypothesis-collects-a-concept
  - task/case-validator/read-only-capability
  - task/case-validator/recipient-is-a-role
  - task/case-validator/terms-exist-in-the-glossary
  - task/case-validator/unique-hypothesis-names
  - task/case-validator/validation-run
  - task/published-case/assessment-record
  - task/published-case/case-structure
  - task/published-case/collection-plan
  - task/published-case/evaluation-citations
  - task/published-case/evaluation-record
  - task/published-case/fallback-selection
  - task/published-case/outcome-resolution
  - task/published-case/required-evaluations
passes:
  - pass: coverage
  - pass: conformance
  - pass: standard
  - pass: failures
    missing: "no commands were named to run and no captured run was pointed to, so nothing was diagnosed"
standard:
  at: standards/backend-node-service.yaml
  pin: sha256:b6d3f7b82ef007e9532f61ae39b5c85de7917bcfe9b3dd5dbebe5a759d6e2937
coverage:
  - criterion: "A case declaring no hypothesis is refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case-has-at-least-one-hypothesis.spec.ts, name: "refuses a case declaring no hypothesis" }
      - { file: src/__tests__/unit/knowledge/case-has-at-least-one-hypothesis.spec.ts, name: "answers a refusal naming the rule that refused and its own stated text, with no position named" }
  - criterion: "A case declaring exactly one hypothesis is not refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case-has-at-least-one-hypothesis.spec.ts, name: "does not refuse a case declaring exactly one hypothesis" }
  - criterion: "A case declaring several hypotheses is not refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case-has-at-least-one-hypothesis.spec.ts, name: "does not refuse a case declaring several hypotheses" }
  - criterion: "A case collecting one concept that does not accept the case's declared subject type is refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/concept-accepts-the-declared-subject-type.spec.ts, name: "refuses a case collecting one concept that does not accept the case's declared subject type" }
      - { file: src/__tests__/unit/knowledge/concept-accepts-the-declared-subject-type.spec.ts, name: "answers the refusal naming the rule, the offending hypothesis and concept, and the rule's own stated text" }
  - criterion: "A case whose every collected concept accepts the case's declared subject type is not refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/concept-accepts-the-declared-subject-type.spec.ts, name: "does not refuse a case whose every collected concept accepts the case's declared subject type" }
  - criterion: "A case collecting a concept that accepts several subject types including the declared one is not refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/concept-accepts-the-declared-subject-type.spec.ts, name: "does not refuse a case collecting a concept that accepts several subject types including the declared one" }
  - criterion: "A case collecting one concept that declares no ttl is refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/every-collected-concept-declares-a-ttl.spec.ts, name: "refuses a case collecting one concept that declares no ttl" }
      - { file: src/__tests__/unit/knowledge/every-collected-concept-declares-a-ttl.spec.ts, name: "answers the refusal naming the rule, the offending hypothesis and concept, and the rule's own stated text" }
  - criterion: "A case whose every collected concept declares a ttl is not refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/every-collected-concept-declares-a-ttl.spec.ts, name: "does not refuse a case whose every collected concept declares a ttl" }
  - criterion: "The check decides on the presence of the concept's declared ttl and compares no ttl against another."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/every-collected-concept-declares-a-ttl.spec.ts, name: "does not refuse a case collecting a concept whose declared ttl is zero, deciding on presence rather than the value" }
      - { file: src/__tests__/unit/knowledge/every-collected-concept-declares-a-ttl.spec.ts, name: "does not refuse a case whose collected concepts declare different ttl values, proving the check never compares one concept's ttl against another's" }
  - criterion: "A term the glossary publishes as a concept is answered as published when looked up as a concept."
    state: covered
    tests:
      - { file: src/__tests__/unit/glossary/lookup.spec.ts, name: "answers a term the glossary publishes as a concept as published when looked up as a concept" }
  - criterion: "A term the glossary publishes no entry for is answered as not published under any kind."
    state: covered
    tests:
      - { file: src/__tests__/unit/glossary/lookup.spec.ts, name: "answers a term the glossary publishes no entry for as not published under any kind" }
  - criterion: "A term the glossary publishes as an outcome is answered as not published when looked up as an action."
    state: covered
    tests:
      - { file: src/__tests__/unit/glossary/lookup.spec.ts, name: "answers a term the glossary publishes as an outcome as not published when looked up as an action" }
      - { file: src/__tests__/unit/glossary/lookup.spec.ts, name: "answers a term the glossary publishes as an outcome as published when looked up as an outcome" }
  - criterion: "A term the glossary publishes as a concept is yielded as the glossary records it when looked up as a concept."
    state: covered
    tests:
      - { file: src/__tests__/unit/glossary/lookup.spec.ts, name: "yields the published concept as the glossary records it, with its name, accepted subject types, ttl and observation fields" }
  - criterion: "The lookup answers from the glossary it was given and holds no term of its own."
    state: covered
    tests:
      - { file: src/__tests__/unit/glossary/lookup.spec.ts, name: "answers nothing as published from a glossary publishing nothing" }
      - { file: src/__tests__/unit/glossary/lookup.spec.ts, name: "answers one term differently from two glossaries, published exactly where the given one publishes it" }
  - criterion: "A case holding one hypothesis that collects no concept is refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/hypothesis-collects-at-least-one-concept.spec.ts, name: "refuses a case holding one hypothesis that collects no concept" }
      - { file: src/__tests__/unit/knowledge/hypothesis-collects-at-least-one-concept.spec.ts, name: "answers a refusal naming the rule and the offending hypothesis, with no offended term and the rule's own stated text" }
  - criterion: "A case whose every hypothesis collects at least one concept is not refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/hypothesis-collects-at-least-one-concept.spec.ts, name: "does not refuse a case whose every hypothesis collects at least one concept" }
  - criterion: "A case whose only failing hypothesis is not the one it lists earliest is still refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/hypothesis-collects-at-least-one-concept.spec.ts, name: "refuses the failing hypothesis when it is not the one declared first" }
  - criterion: "A case collecting a concept that no capability answers is refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts, name: "refuses a case collecting a concept when no capability is registered at all" }
      - { file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts, name: "refuses a case collecting a concept that no registered capability names" }
  - criterion: "A case collecting a concept whose answering capability is not read-only is refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts, name: "refuses a case collecting a concept whose only naming capability is not read-only" }
  - criterion: "A case whose every collected concept is answered by a read-only capability is not refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts, name: "does not refuse a case whose every collected concept is answered by a registered read-only capability declaring both an output schema and a timeout" }
  - criterion: "Deciding this check over a case invokes no capability."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts, name: "decides the check without invoking the capability record, even where the record could be invoked as a function" }
  - criterion: "A case whose referral names a recipient the glossary does not publish as an operational role is refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/recipient-is-a-role.spec.ts, name: "refuses a case whose hypothesis's referral names a recipient the glossary does not publish" }
      - { file: src/__tests__/unit/knowledge/recipient-is-a-role.spec.ts, name: "answers the refusal naming the terms-exist rule, the offending hypothesis and recipient, and the rule's own stated text" }
  - criterion: "A case whose every referral names a recipient the glossary publishes as an operational role is not refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/recipient-is-a-role.spec.ts, name: "does not refuse a case whose every referral — each hypothesis and both fallbacks — names a recipient the glossary publishes" }
  - criterion: "A case whose fallback resolution carries a referral is read by this check the same as one carried by a hypothesis's resolution."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/recipient-is-a-role.spec.ts, name: "refuses a case whose no-data fallback names an unpublished recipient while every hypothesis and the hypotheses-exhausted fallback name published recipients" }
      - { file: src/__tests__/unit/knowledge/recipient-is-a-role.spec.ts, name: "refuses a case whose hypotheses-exhausted fallback names an unpublished recipient while every hypothesis and the no-data fallback name published recipients" }
      - { file: src/__tests__/unit/knowledge/recipient-is-a-role.spec.ts, name: "refuses only the hypothesis whose referral names an unpublished recipient, leaving the hypothesis whose referral names a published recipient unrefused" }
  - criterion: "A case collecting a concept the glossary does not publish is refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts, name: "refuses a case collecting a concept the glossary does not publish, while every other named term is left unrefused" }
      - { file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts, name: "produces one refusal per unpublished concept, in the order collected, when a hypothesis collects two concepts the glossary does not publish" }
  - criterion: "A case whose resolution names an outcome the glossary does not publish is refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts, name: "refuses a case whose hypothesis's resolution names an outcome the glossary does not publish, while every other named term is left unrefused" }
      - { file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts, name: "refuses a case whose no-data fallback names an outcome the glossary does not publish, while every hypothesis and the hypotheses-exhausted fallback are left unrefused" }
      - { file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts, name: "refuses a case whose hypotheses-exhausted fallback names an outcome the glossary does not publish, while every hypothesis and the no-data fallback are left unrefused" }
  - criterion: "A case whose referral names an action the glossary does not publish is refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts, name: "refuses a case whose hypothesis's referral names an action the glossary does not publish, while every other named term is left unrefused" }
      - { file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts, name: "refuses a case whose no-data fallback names an action the glossary does not publish, while every hypothesis and the hypotheses-exhausted fallback are left unrefused" }
      - { file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts, name: "refuses a case whose hypotheses-exhausted fallback names an action the glossary does not publish, while every hypothesis and the no-data fallback are left unrefused" }
  - criterion: "A case whose referral names a recipient the glossary does not publish is refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts, name: "refuses a case whose hypothesis's referral names a recipient the glossary does not publish, while every other named term is left unrefused" }
      - { file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts, name: "refuses a case whose no-data fallback names a recipient the glossary does not publish, while every hypothesis and the hypotheses-exhausted fallback are left unrefused" }
      - { file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts, name: "refuses a case whose hypotheses-exhausted fallback names a recipient the glossary does not publish, while every hypothesis and the no-data fallback are left unrefused" }
  - criterion: "A case declaring a subject type the glossary does not publish is refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts, name: "refuses a case declaring a subject type the glossary does not publish, while every other named term is left unrefused" }
  - criterion: "A case whose every named term the glossary publishes under the kind the case uses it as is not refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts, name: "does not refuse a case whose every named term — subject type, collected concept, and every resolution's outcome, action and recipient — the glossary publishes under the kind it is used as" }
  - criterion: "Hypotheses declared for one case, two of which carry the same name, are refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/hypothesis-name-is-unique-in-its-case.spec.ts, name: "refuses a case declaring two hypotheses that carry the same name" }
      - { file: src/__tests__/unit/knowledge/hypothesis-name-is-unique-in-its-case.spec.ts, name: "answers one refusal naming the rule, the repeating hypothesis and the rule's own stated text, leaving the hypothesis that first declared the name unrefused" }
  - criterion: "Hypotheses declared for one case, all carrying distinct names, are not refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/hypothesis-name-is-unique-in-its-case.spec.ts, name: "does not refuse a case whose hypotheses all carry distinct names" }
  - criterion: "Hypotheses declared separately for two cases, one in each carrying the same name, are each not refused by this check."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/hypothesis-name-is-unique-in-its-case.spec.ts, name: "does not refuse a hypothesis name in a case validated after a separate case already declared and validated that same name" }
  - criterion: "A run with no check registered does not refuse the case it is given."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/validation.spec.ts, name: "answers no refusal for a case when no check is registered" }
  - criterion: "A run whose every registered check refuses nothing does not refuse the case it is given."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/validation.spec.ts, name: "answers no refusal when every registered check refuses nothing" }
  - criterion: "A run with one registered check that refuses the given case refuses that case."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/validation.spec.ts, name: "refuses the case it is given when its one registered check refuses it" }
  - criterion: "A run with two registered checks that both refuse the given case reports both refusals."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/validation.spec.ts, name: "reports both refusals when two registered checks both refuse the case" }
  - criterion: "A run reports no refusal that no registered check produced."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/validation.spec.ts, name: "reports no refusal that no registered check produced" }
  - criterion: "An assessment reads back the resolution it was constructed with."
    state: covered
    tests:
      - { file: src/__tests__/unit/investigation/assessment.spec.ts, name: "reads back the resolution it was constructed with" }
  - criterion: "An assessment carries exactly one resolution."
    state: covered
    tests:
      - { file: src/__tests__/unit/investigation/assessment.spec.ts, name: "carries only one resolution when it is handed a part naming a second one" }
      - { file: src/__tests__/unit/investigation/assessment.spec.ts, name: "reads its resolution back as one resolution and not as a collection of them" }
  - criterion: "An assessment constructed with a determining hypothesis reads back that hypothesis by the name unique within its case."
    state: covered
    tests:
      - { file: src/__tests__/unit/investigation/assessment.spec.ts, name: "reads back the determining hypothesis it was constructed with, by name" }
  - criterion: "An assessment constructed with no determining hypothesis reads back none and is not refused for carrying none."
    state: covered
    tests:
      - { file: src/__tests__/unit/investigation/assessment.spec.ts, name: "constructs an assessment given no determining hypothesis rather than refusing it" }
      - { file: src/__tests__/unit/investigation/assessment.spec.ts, name: "reads back no determining hypothesis when it was constructed without one" }
  - criterion: "An assessment reads back the text it was constructed with."
    state: covered
    tests:
      - { file: src/__tests__/unit/investigation/assessment.spec.ts, name: "reads back the text it was constructed with, character for character" }
  - criterion: "A case reads back the slug it was declared with."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case.spec.ts, name: "reads back the slug it was declared with" }
  - criterion: "A case reads back the title it was declared with."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case.spec.ts, name: "reads back the title it was declared with" }
  - criterion: "A case reads back the when-to-use guidance it was declared with."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case.spec.ts, name: "reads back the when-to-use guidance it was declared with, character for character" }
  - criterion: "A case reads back the version it was declared with."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case.spec.ts, name: "reads back the version it was declared with" }
  - criterion: "A case reads back the content hash it was declared with."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case.spec.ts, name: "reads back the content hash it was declared with" }
  - criterion: "A case declared with curator notes reads them back, and a case declared without them reads back none."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case.spec.ts, name: "reads back the curator notes it was declared with, character for character" }
      - { file: src/__tests__/unit/knowledge/case.spec.ts, name: "reads back no curator notes when it was declared without them" }
  - criterion: "A case reads back the subject type it declares."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case.spec.ts, name: "reads back the subject type it declares" }
  - criterion: "A case constructed with its hypotheses in a given order lists them back in that same order."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case.spec.ts, name: "lists its hypotheses back in the order it declared them" }
  - criterion: "A hypothesis reads back the name that identifies it within its case."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case.spec.ts, name: "reads back the name that identifies a hypothesis within its case" }
  - criterion: "A hypothesis reads back the criterion it was declared with."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case.spec.ts, name: "reads back the criterion a hypothesis was declared with, character for character" }
  - criterion: "A hypothesis reads back the concepts it collects."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case.spec.ts, name: "reads back the concepts a hypothesis collects, in their declared order" }
  - criterion: "A hypothesis reads back the resolution that follows when it holds."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case.spec.ts, name: "reads back the resolution that follows a hypothesis when it holds" }
  - criterion: "A case reads back the resolution it declares as its no-data fallback."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case.spec.ts, name: "reads back the resolution it declares as its no-data fallback" }
  - criterion: "A case reads back the resolution it declares as its hypotheses-exhausted fallback."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case.spec.ts, name: "reads back the resolution it declares as its hypotheses-exhausted fallback" }
  - criterion: "A resolution reads back both the outcome and the referral it was declared with."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case.spec.ts, name: "reads a declared resolution back with both its outcome and its referral" }
  - criterion: "A referral reads back both the action and the recipient it was declared with."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/case.spec.ts, name: "reads a declared referral back with both its action and its recipient" }
  - criterion: "A concept collected by exactly one hypothesis appears in the answer."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/collection-plan.spec.ts, name: "includes a concept collected by exactly one hypothesis of the case" }
  - criterion: "A concept collected by two hypotheses appears once in the answer."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/collection-plan.spec.ts, name: "includes a concept collected by two hypotheses exactly once" }
  - criterion: "A case whose hypotheses collect disjoint sets answers with every concept every hypothesis collects."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/collection-plan.spec.ts, name: "answers with every concept every hypothesis collects, when the hypotheses' collected sets are disjoint" }
  - criterion: "No concept absent from every hypothesis of the case appears in the answer."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/collection-plan.spec.ts, name: "answers with no concept absent from every hypothesis of the case" }
  - criterion: "Two cases whose structured hypotheses are identical and whose body text differs answer with the same set of concepts."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/collection-plan.spec.ts, name: "answers with the same set of concepts for two cases whose structured hypotheses are identical and whose body text differs" }
  - criterion: "An evaluation that confirms its hypothesis reads back at least one citation."
    state: covered
    tests:
      - { file: src/__tests__/unit/investigation/evaluation.spec.ts, name: "reads back at least one citation given to a confirmed evaluation" }
  - criterion: "An evaluation that refutes its hypothesis reads back at least one citation."
    state: covered
    tests:
      - { file: src/__tests__/unit/investigation/evaluation.spec.ts, name: "reads back at least one citation given to a refuted evaluation" }
  - criterion: "An evaluation that confirms or refutes and carries no citation is refused."
    state: covered
    tests:
      - { file: src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts, name: "refuses a confirmed evaluation carrying no citation" }
      - { file: src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts, name: "refuses a refuted evaluation carrying no citation" }
      - { file: src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts, name: "refuses a confirmed evaluation whose citations list is explicitly empty, the same as one carrying none at all" }
  - criterion: "An evaluation whose verdict is inconclusive is not refused for carrying no citation."
    state: covered
    tests:
      - { file: src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts, name: "does not refuse an inconclusive evaluation carrying no citation" }
      - { file: src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts, name: "does not refuse an inconclusive evaluation for this rule, whatever its citations hold, proving the obligation is asymmetric" }
  - criterion: "A citation reads back the concept and the field it cites, each by name."
    state: covered
    tests:
      - { file: src/__tests__/unit/investigation/evaluation.spec.ts, name: "reads back the concept and the field of a citation, each by the exact name given" }
  - criterion: "A citation carrying an identifier for the concept or the field it cites is refused."
    state: covered
    why: "no fixture constructs a citation carrying a literal identifier-shaped value distinct from a name; the base admits no other way a citation can be carried than by name, so the two listed tests exercise that reduction rather than a hand-built identifier"
    tests:
      - { file: src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts, name: "refuses an evaluation citing a concept its hypothesis does not collect" }
      - { file: src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts, name: "refuses an evaluation citing a field the cited concept does not declare" }
  - criterion: "An evaluation citing a concept its hypothesis does not collect is refused."
    state: covered
    tests:
      - { file: src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts, name: "refuses an evaluation citing a concept its hypothesis does not collect" }
      - { file: src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts, name: "refuses an evaluation where only one of several citations is invalid, one bad citation being enough" }
  - criterion: "An evaluation citing a field the cited concept does not declare is refused."
    state: covered
    tests:
      - { file: src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts, name: "refuses an evaluation citing a field the cited concept does not declare" }
  - criterion: "An evaluation whose every citation names a collected concept and a field that concept declares is not refused by this rule."
    state: covered
    tests:
      - { file: src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts, name: "is not refused by this rule when every citation names a collected concept and a field that concept declares" }
  - criterion: "An evaluation reads back the name of the one hypothesis it decided."
    state: covered
    tests:
      - { file: src/__tests__/unit/investigation/evaluation.spec.ts, name: "reads back the name of the one hypothesis it decided" }
  - criterion: "An evaluation carries exactly one hypothesis name."
    state: covered
    tests:
      - { file: src/__tests__/unit/investigation/evaluation.spec.ts, name: "carries only one hypothesis name when it is handed a part naming a second one" }
  - criterion: "An evaluation constructed without a verdict is refused."
    state: covered
    tests:
      - { file: src/__tests__/unit/investigation/evaluation.spec.ts, name: "refuses a construction that gives no verdict, naming the verdict as what is absent" }
      - { file: src/__tests__/unit/investigation/evaluation.spec.ts, name: "refuses a construction whose parsed verdict is null the same way as one giving none" }
  - criterion: "An evaluation reads back the verdict it received."
    state: covered
    tests:
      - { file: src/__tests__/unit/investigation/evaluation.spec.ts, name: "reads each of the three verdicts back as the verdict it was given" }
  - criterion: "An evaluation whose verdict is inconclusive reads back why it could not decide."
    state: covered
    tests:
      - { file: src/__tests__/unit/investigation/evaluation.spec.ts, name: "reads back why it could not decide when the verdict it carries is inconclusive" }
      - { file: src/__tests__/unit/investigation/evaluation.spec.ts, name: "reads each of the three declared reasons back as the reason it was given" }
      - { file: src/__tests__/unit/investigation/evaluation.spec.ts, name: "refuses an inconclusive construction that declares no reason, naming the reason as what is absent" }
  - criterion: "An evaluation reads back the verdict it received even when a hypothesis the case lists earlier has already confirmed."
    state: covered
    tests:
      - { file: src/__tests__/unit/investigation/evaluation.spec.ts, name: "reads back the verdict it received when an evaluation of an earlier hypothesis has already confirmed" }
  - criterion: "A case in which no hypothesis confirms and whose every evidence carries ok resolves to the hypotheses-exhausted fallback it declares."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/fallback-selection.spec.ts, name: "resolves to the hypotheses-exhausted fallback the case declares when no hypothesis confirms and every evidence carries ok" }
  - criterion: "A case in which no hypothesis confirms and one of whose evidences carries a timeout resolves to the no-data fallback it declares."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/fallback-selection.spec.ts, name: "resolves to the no-data fallback the case declares when no hypothesis confirms and its evidence carries a timeout" }
  - criterion: "A case in which no hypothesis confirms and one of whose evidences carries an unavailability resolves to the no-data fallback it declares."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/fallback-selection.spec.ts, name: "resolves to the no-data fallback the case declares when no hypothesis confirms and its evidence carries an unavailability" }
  - criterion: "A case in which no hypothesis confirms and one of whose evidences carries a denial resolves to the no-data fallback it declares."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/fallback-selection.spec.ts, name: "resolves to the no-data fallback the case declares when no hypothesis confirms and its evidence carries a denial" }
  - criterion: "A case in which no hypothesis confirms and one of whose evidences carries a result other than ok while every other carries ok resolves to the no-data fallback it declares."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/fallback-selection.spec.ts, name: "resolves to the no-data fallback the case declares when only one of several evidences carries a result other than ok" }
  - criterion: "The resolution this selection yields is one of the two fallbacks the case declares."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/fallback-selection.spec.ts, name: "returns the hypotheses-exhausted fallback object itself rather than a resolution composed anew, when every evidence carries ok" }
      - { file: src/__tests__/unit/knowledge/fallback-selection.spec.ts, name: "returns the no-data fallback object itself rather than a resolution composed anew, when an evidence carries a result other than ok" }
  - criterion: "A case in which one hypothesis confirms yields no fallback from this selection."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/fallback-selection.spec.ts, name: "yields no fallback when the one evaluated hypothesis confirms" }
      - { file: src/__tests__/unit/knowledge/fallback-selection.spec.ts, name: "yields no fallback when a later evaluation among several confirms, even though every evidence carries ok" }
      - { file: src/__tests__/unit/knowledge/fallback-selection.spec.ts, name: "yields no fallback when an evaluation confirms, even though an evidence carries a result other than ok" }
      - { file: src/__tests__/unit/knowledge/fallback-selection.spec.ts, name: "yields no fallback when more than one evaluation confirms" }
  - criterion: "A case in which exactly one hypothesis confirms answers with an assessment naming that hypothesis as determining."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts, name: "names the sole confirmed hypothesis as determining" }
  - criterion: "A case in which two hypotheses confirm answers with an assessment naming as determining the confirmed hypothesis the case lists earliest in its declared order."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts, name: "names the confirmed hypothesis the case lists earliest as determining, when two confirm" }
      - { file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts, name: "names the confirmed hypothesis the case lists earliest as determining, when three or more confirm" }
  - criterion: "A case in which exactly one hypothesis confirms answers with an assessment carrying the resolution the case declared for that hypothesis."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts, name: "carries the resolution the case declared for the sole confirmed hypothesis" }
  - criterion: "A case in which two hypotheses confirm answers with an assessment carrying the resolution the case declared for the hypothesis it names as determining."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts, name: "carries the resolution declared for the determining hypothesis, not the other confirmed one, when two confirm" }
  - criterion: "A case in which no hypothesis confirms and whose fallback selection yields its no-data fallback answers with an assessment carrying that fallback."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts, name: "carries the case's no-data fallback when no hypothesis confirms and the fallback selection yields it" }
  - criterion: "A case in which no hypothesis confirms and whose fallback selection yields its hypotheses-exhausted fallback answers with an assessment carrying that fallback."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts, name: "carries the case's hypotheses-exhausted fallback when no hypothesis confirms and the fallback selection yields it" }
  - criterion: "A case in which no hypothesis confirms answers with an assessment naming no determining hypothesis."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts, name: "names no determining hypothesis when no hypothesis confirms" }
  - criterion: "The outcome the assessment carries is the outcome of the one resolution the case resolved for this answer, and no other outcome the case holds appears in it."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts, name: "carries only the outcome of the resolution that was resolved, and no other outcome the case holds, on the confirmed path" }
      - { file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts, name: "carries only the outcome of the resolution that was resolved, and no other outcome the case holds, on the fallback path" }
  - criterion: "The referral the assessment carries is the referral of that same resolution, and no other referral the case holds appears in it."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts, name: "carries only the referral of the resolution that was resolved, and no other referral the case holds, on the confirmed path" }
      - { file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts, name: "carries only the referral of the resolution that was resolved, and no other referral the case holds, on the fallback path" }
  - criterion: "In a case in which two hypotheses confirm, the evaluation of the later-listed confirmed hypothesis still reads back its confirming verdict once the answer is produced."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts, name: "still reads back the later-listed confirmed hypothesis's evaluation with its confirming verdict, once the answer is produced" }
  - criterion: "Producing the answer marks no hypothesis of the case as superseded."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts, name: "marks no hypothesis of the case as superseded when producing the answer" }
  - criterion: "Every hypothesis the case declares appears in the answer."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/required-evaluations.spec.ts, name: "answers with a name for every hypothesis the case declares" }
  - criterion: "No name absent from the case's declared hypotheses appears in the answer."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/required-evaluations.spec.ts, name: "answers with no name absent from the case's declared hypotheses" }
  - criterion: "A case declaring one hypothesis answers with exactly one entry."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/required-evaluations.spec.ts, name: "answers with exactly one entry for a case declaring one hypothesis" }
  - criterion: "Each entry of the answer carries the hypothesis name that identifies it within its case."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/required-evaluations.spec.ts, name: "carries the hypothesis name that identifies it within its case, on each entry" }
  - criterion: "The entries of the answer stand in the order the case declares its hypotheses."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/required-evaluations.spec.ts, name: "stands the entries in the order the case declares its hypotheses" }
  - criterion: "A case whose declared hypotheses are reordered answers with its entries reordered the same way."
    state: covered
    tests:
      - { file: src/__tests__/unit/knowledge/required-evaluations.spec.ts, name: "reorders its entries the same way across two published cases whose declared orders differ" }
findings:
  - pass: standard
    file: src/__tests__/unit/glossary/lookup.spec.ts
    where: "lines 1-2, the test framework imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "the suite's own test script is required to run under Vitest, so a file wired to Node's native runner instead reports its results through a different runner and reporter than the rest of the suite, and a reader trying to run \"the tests\" with the configured command has no single command that covers both"
    correction: "import describe/it/expect from 'vitest' instead of node:test and node:assert/strict"
  - pass: standard
    file: src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts
    where: "lines 1-2, the test framework imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "this file cannot be collected and reported by the same Vitest run as any sibling spec written against Vitest, so a single \"run the tests\" command cannot cover it without also invoking Node's own test runner"
    correction: "import describe/it/expect from 'vitest' instead of node:test and node:assert/strict"
  - pass: standard
    file: src/__tests__/unit/investigation/assessment.spec.ts
    where: "lines 1-2, the test framework imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "the same second-runner dependency the standard forbids: a failure here surfaces under node's own reporter, not the project's configured one"
    correction: "import describe/it/expect from 'vitest' instead of node:test and node:assert/strict"
  - pass: standard
    file: src/__tests__/unit/investigation/evaluation.spec.ts
    where: "lines 1-2, the test framework imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "the same second-runner dependency the standard forbids: a failure here surfaces under node's own reporter, not the project's configured one"
    correction: "import describe/it/expect from 'vitest' instead of node:test and node:assert/strict"
  - pass: standard
    file: src/__tests__/unit/knowledge/case-has-at-least-one-hypothesis.spec.ts
    where: "lines 1-2, the test framework imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "the same second-runner dependency the standard forbids: a failure here surfaces under node's own reporter, not the project's configured one"
    correction: "import describe/it/expect from 'vitest' instead of node:test and node:assert/strict"
  - pass: standard
    file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts
    where: "lines 1-2, the test framework imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "the same second-runner dependency the standard forbids: a failure here surfaces under node's own reporter, not the project's configured one"
    correction: "import describe/it/expect from 'vitest' instead of node:test and node:assert/strict"
  - pass: standard
    file: src/__tests__/unit/knowledge/case.spec.ts
    where: "lines 1-2, the test framework imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "the same second-runner dependency the standard forbids: a failure here surfaces under node's own reporter, not the project's configured one"
    correction: "import describe/it/expect from 'vitest' instead of node:test and node:assert/strict"
  - pass: standard
    file: src/__tests__/unit/knowledge/collection-plan.spec.ts
    where: "lines 1-2, the test framework imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "the same second-runner dependency the standard forbids: a failure here surfaces under node's own reporter, not the project's configured one"
    correction: "import describe/it/expect from 'vitest' instead of node:test and node:assert/strict"
  - pass: standard
    file: src/__tests__/unit/knowledge/concept-accepts-the-declared-subject-type.spec.ts
    where: "lines 1-2, the test framework imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "the same second-runner dependency the standard forbids: a failure here surfaces under node's own reporter, not the project's configured one"
    correction: "import describe/it/expect from 'vitest' instead of node:test and node:assert/strict"
  - pass: standard
    file: src/__tests__/unit/knowledge/every-collected-concept-declares-a-ttl.spec.ts
    where: "lines 1-2, the test framework imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "the same second-runner dependency the standard forbids: a failure here surfaces under node's own reporter, not the project's configured one"
    correction: "import describe/it/expect from 'vitest' instead of node:test and node:assert/strict"
  - pass: standard
    file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts
    where: "lines 1-2, the test framework imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "the same second-runner dependency the standard forbids: a failure here surfaces under node's own reporter, not the project's configured one"
    correction: "import describe/it/expect from 'vitest' instead of node:test and node:assert/strict"
  - pass: standard
    file: src/__tests__/unit/knowledge/fallback-selection.spec.ts
    where: "lines 1-2, the test framework imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "the same second-runner dependency the standard forbids: a failure here surfaces under node's own reporter, not the project's configured one"
    correction: "import describe/it/expect from 'vitest' instead of node:test and node:assert/strict"
  - pass: standard
    file: src/__tests__/unit/knowledge/hypothesis-collects-at-least-one-concept.spec.ts
    where: "lines 1-2, the test framework imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "the same second-runner dependency the standard forbids: a failure here surfaces under node's own reporter, not the project's configured one"
    correction: "import describe/it/expect from 'vitest' instead of node:test and node:assert/strict"
  - pass: standard
    file: src/__tests__/unit/knowledge/hypothesis-name-is-unique-in-its-case.spec.ts
    where: "lines 1-2, the test framework imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "the same second-runner dependency the standard forbids: a failure here surfaces under node's own reporter, not the project's configured one"
    correction: "import describe/it/expect from 'vitest' instead of node:test and node:assert/strict"
  - pass: standard
    file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts
    where: "lines 1-2, the test framework imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "the same second-runner dependency the standard forbids: a failure here surfaces under node's own reporter, not the project's configured one"
    correction: "import describe/it/expect from 'vitest' instead of node:test and node:assert/strict"
  - pass: standard
    file: src/__tests__/unit/knowledge/recipient-is-a-role.spec.ts
    where: "lines 1-2, the test framework imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "the same second-runner dependency the standard forbids: a failure here surfaces under node's own reporter, not the project's configured one"
    correction: "import describe/it/expect from 'vitest' instead of node:test and node:assert/strict"
  - pass: standard
    file: src/__tests__/unit/knowledge/required-evaluations.spec.ts
    where: "lines 1-2, the test framework imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "the same second-runner dependency the standard forbids: a failure here surfaces under node's own reporter, not the project's configured one"
    correction: "import describe/it/expect from 'vitest' instead of node:test and node:assert/strict"
  - pass: standard
    file: src/__tests__/unit/knowledge/validation.spec.ts
    where: "lines 1-2, the test framework imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "the same second-runner dependency the standard forbids: a failure here surfaces under node's own reporter, not the project's configured one"
    correction: "import describe/it/expect from 'vitest' instead of node:test and node:assert/strict"
  - pass: standard
    file: src/investigation/assessment.ts
    where: "lines 28-40, copyReferral and copyResolution"
    cites: MNT-03
    evidence: "function copyReferral(referral: Referral): Referral {\n  return Object.freeze({\n    action: referral.action,\n    recipient: referral.recipient,\n  });\n}\n\nfunction copyResolution(resolution: Resolution): Resolution {\n  return Object.freeze({\n    outcome: resolution.outcome,\n    referral: copyReferral(resolution.referral),\n  });\n}"
    cost: "this is the same freezing copy logic src/knowledge/case.ts already defines under the identical names, so a change to how a referral or resolution is copied (a new field, a different freeze depth) has to be found and made twice, and a reader who fixes one copy has no way to know the other exists"
    correction: "extract copyReferral/copyResolution into one shared module both case.ts and assessment.ts import, rather than each declaring its own"
  - pass: standard
    file: src/knowledge/case.ts
    where: "lines 45-57, copyReferral and copyResolution"
    cites: MNT-03
    evidence: "function copyReferral(referral: Referral): Referral {\n  return Object.freeze({\n    action: referral.action,\n    recipient: referral.recipient,\n  });\n}\n\nfunction copyResolution(resolution: Resolution): Resolution {\n  return Object.freeze({\n    outcome: resolution.outcome,\n    referral: copyReferral(resolution.referral),\n  });\n}"
    cost: "the identical pair is redeclared in src/investigation/assessment.ts, so the copy behaviour for a referral or a resolution exists in two places a future change has to keep in step by hand"
    correction: "extract copyReferral/copyResolution into one shared module both case.ts and assessment.ts import, rather than each declaring its own"
  - pass: standard
    file: src/knowledge/case-terms-exist-in-the-glossary.ts
    where: "lines 162-171, presentFallbacks"
    cites: MNT-03
    evidence: "function presentFallbacks(draftCase: DraftCase): readonly Resolution[] {\n  const fallbacks: Resolution[] = [];\n  if (draftCase.noDataFallback !== undefined) {\n    fallbacks.push(draftCase.noDataFallback);\n  }\n  if (draftCase.hypothesesExhaustedFallback !== undefined) {\n    fallbacks.push(draftCase.hypothesesExhaustedFallback);\n  }\n  return fallbacks;\n}"
    cost: "src/knowledge/recipient-is-a-role.ts declares the identical function under the identical name, so the same malformed-case handling exists in two places that can drift apart the day one is fixed to admit a further malformation"
    correction: "extract presentFallbacks into one shared module both case-terms-exist-in-the-glossary.ts and recipient-is-a-role.ts import, rather than each declaring its own"
  - pass: standard
    file: src/knowledge/recipient-is-a-role.ts
    where: "lines 91-100, presentFallbacks"
    cites: MNT-03
    evidence: "function presentFallbacks(draftCase: DraftCase): readonly Resolution[] {\n  const fallbacks: Resolution[] = [];\n  if (draftCase.noDataFallback !== undefined) {\n    fallbacks.push(draftCase.noDataFallback);\n  }\n  if (draftCase.hypothesesExhaustedFallback !== undefined) {\n    fallbacks.push(draftCase.hypothesesExhaustedFallback);\n  }\n  return fallbacks;\n}"
    cost: "src/knowledge/case-terms-exist-in-the-glossary.ts declares the identical function under the identical name, so the same malformed-case handling exists in two places that can drift apart the day one is fixed to admit a further malformation"
    correction: "extract presentFallbacks into one shared module both recipient-is-a-role.ts and case-terms-exist-in-the-glossary.ts import, rather than each declaring its own"
---

## What it is

Four passes over the eighteen tasks the case-authoring plan has delivered so far and the fifty files that answer them — coverage, conformance and standard ran; failures did not.
The coverage pass paired every one of the 103 criteria these eighteen tasks state, quoted exactly, with the test that would fail if it stopped holding.
The conformance pass read all fifty files against the union of the forty base nodes these eighteen tasks bind, and found no domain fact stated in source that the base does not hold.
The standard pass read the project's own registry, in scope for fifteen of its rules against this file set, and found twenty-two departures — one habitual, one structural.

## Notes

The standard's fifteen in-scope rules over this file set are STK-02 through STK-12, SEC-04, MNT-03, TST-01, TST-02 and TST-03; the reading-decided rules ARC-01/04, DTO-01, API-02 through 05, COR-02 through 04, EDG-01 through 08 and SEC-01 do not reach this file set because no file carries the suffix each of them is scoped to.
The eighteen STK-10 findings share one shape across eighteen files: every spec imports `describe`/`it` from `node:test` and `assert` from `node:assert/strict` rather than from `vitest`, which the standard names as the project's only test runner and assertion library.
The four MNT-03 findings are two duplicated helper pairs, each declared twice rather than shared: `copyReferral`/`copyResolution` in both `src/knowledge/case.ts` and `src/investigation/assessment.ts`, and `presentFallbacks` in both `src/knowledge/case-terms-exist-in-the-glossary.ts` and `src/knowledge/recipient-is-a-role.ts`.
The standard's 24 tool-decided rules (lint, secret-scan, typecheck) were not applied by this pass and remain unanswered: no captured run exists for this review to read their findings from, and the repository still holds no toolchain to run them with in the first place.
The conformance pass looked past several stylistic and architectural patterns as another judgment's — duplicated logic between `case-terms-exist-in-the-glossary.ts` and `recipient-is-a-role.ts` (disclosed as deliberate in both files' own comments, and separately caught by the standard pass as MNT-03), a Proxy-based test fixture for detecting invocation, and heavy per-file documentation verbosity — because none of them state or omit a domain fact.
The standard pass looked past each spec file's own near-identical fixture builders (`hypothesis()`, `draftCase()`, `resolution()`) as deliberate per-test isolation rather than the shared-logic duplication MNT-03 is aimed at, since each is private to its own file and varies slightly with that file's own needs.
The coverage pass covered "A citation carrying an identifier for the concept or the field it cites is refused." through the same two tests that prove the neighbouring criteria, because the base admits no way a citation is carried other than by name — there is no identifier-shaped fixture to construct, only the reduction the source itself states.
This review answers to the criteria eighteen tasks state today; a task that changes after this review is a criterion this review did not answer for, not a hash it can be checked against.
No captured run and no commands were named, so the failures pass did not run — nothing in this delivery has ever been compiled, type-checked or executed, and that absence is itself recorded by the inventory rather than hidden by this review's silence on it.
This review does not compute a verdict, a severity, or a decision about the change; what the twenty-two findings and the zero conformance findings mean for the change is a person's to decide.
