---
title: Drop the glossary attribute check and dependency from both simulate controllers
summary: handleSimulateCaseRequest and handleSimulateHypothesisRequest stop calling refuseAttributesNotInGlossary
  and stop declaring a glossary dependency, together with every call site that supplies one.
rationale: 'Cut as the first of two tasks over one check because refuseAttributesNotInGlossary is exported
  from investigation-factory.ts and called from these two controllers: the consumers of that seam are
  changed here, and the seam itself in the sibling task. The two controllers are one task rather than
  two because they hold the same call, the same dependency field and the same construction site in diagnose-server.factory.ts,
  so splitting them would leave that one factory object half-changed.'
sources:
- work/subject-attribute-glossary-removal-backend/intake/scope.md
objective: Neither simulate-case nor simulate-hypothesis consults the glossary about a subject attribute
  name, and neither controller's dependency type declares a glossary.
criteria:
- A simulate-case request whose subject carries an attribute name no glossary vocabulary holds is not
  refused for that reason.
- A simulate-hypothesis request whose subject carries an attribute name no glossary vocabulary holds is
  not refused for that reason.
- SimulateCaseControllerDependencies declares exactly caseQuery and runSimulate.
- SimulateHypothesisControllerDependencies declares exactly caseQuery and runSimulateHypothesis.
- Neither controller imports refuseAttributesNotInGlossary or IGlossaryQuery.
- Neither controller gains a case-input-requirements coverage refusal in place of the removed check.
- diagnose-server.factory.ts constructs both controller dependency objects with no glossary field.
- A simulate-case request whose subject carries no attribute at all is still refused with an HTTP 422
  response reporting SubjectCarriesNoAttributeError.
- A simulate-hypothesis request whose subject carries no attribute at all is still refused with an HTTP
  422 response reporting SubjectCarriesNoAttributeError.
- status-map.ts maps SubjectCarriesNoAttributeError to HTTP 422.
- No spec in src/ constructs a simulate-case or simulate-hypothesis controller dependency object carrying
  a glossary, and none stubs a vocabulary-term read for either controller.
- src's test suite passes.
implements:
- domain/investigation/subject-attribute-value
- contracts/investigation/glossary-source
- rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses
- rules/investigation/a-subject-carries-at-least-one-attribute
---

## What it is
The two simulate entry points stop asking the glossary whether a subject's attribute names are held, and stop being handed a glossary to ask with.
The controller specs, the routes and build-app specs, the cross-route rate-limiting spec and the server factory that construct those dependency objects change with them, since the dependency type is what they name.

## Notes
The controller specs currently assert the refusal and stub readVocabularyTerm; both assertions go with the check they test.
A simulate call stays open for a subject missing an attribute a requirement names required, so nothing replaces the removed check here.
UNDERDETERMINED, from the specification — rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses's second clause (the concept that requirement answers reaches collection and degrades to unavailable) reaches no criterion of this task; an implementation that instead silently drops the concept from collection would pass every criterion here while still breaching that clause. Passes at: the collection stage inside the shared investigation pipeline, not this task's own controllers.
REMAINDER, from the specification — rules/investigation/a-subject-carries-at-least-one-attribute's refusal applies to every call carrying a subject, not only simulate-case and simulate-hypothesis; the diagnose route's own enforcement and the connector-configuration test call's own assembly are untouched by this task. Belongs to: the diagnose route and the connector-test call's own already-delivered enforcement.
REMAINDER, from the specification — a-simulated-subject-missing-a-requirement-degrades-not-refuses's collection-stage degradation belongs to the act covering an-unresolvable-observation-ends-unavailable, outside this epic's covers.
Decision, beyond the covers — stand: the collection-stage degrade-to-unavailable path (rules/integration/an-unresolvable-observation-ends-unavailable) is pre-existing behavior this task's controllers do not touch; removing the glossary check widens what a subject may carry into it without changing how it degrades.
ADVISORY, from the specification — rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes governs the diagnose door alone; the criterion barring a case-input-requirements refusal on simulate restates what a-simulated-subject-missing-a-requirement-degrades-not-refuses already states positively, and changes nothing on the diagnose route.
ADVISORY, from the specification — contracts/investigation/glossary-source now declares read-concept only; this task's removal is what makes a vocabulary-term read no longer a consumed operation from either simulate controller, but no criterion here exercises read-concept itself.
