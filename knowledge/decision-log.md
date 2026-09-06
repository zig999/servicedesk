---
entries:
  - location: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions.md
    field: statement
    unstated: Whether a case has any derived "current state," "version count" or "last updated" concept, and if so how each is computed from the case's own case-versions — the case aggregate declares only slug and next_version, and each case-version separately declares its own state and authored_at.
    decided: A case's summary is computed from its own existing versions — current_state is the state of the case's highest-numbered version, version_count is the number of versions the case currently holds, and last_updated is that same highest-numbered version's authored_at.
    why: A discarded draft already leaves no version behind to read (a-case-version-number-is-never-reused), so version_count needs no separate policy on what to include or exclude — it counts exactly the rows the store still holds. Version numbers are assigned once, strictly increasing, and a version is only ever created after every version before it, so the highest-numbered version a case holds is always its most recently authored one regardless of whether it is draft or released — making that single version the natural source of both current_state and last_updated, rather than two independently-computed facts that could disagree.
  - location: domain/glossary/_context.md
    field: strategic
    unstated: The material's distillation table classifies knowledge, execution and corporate-system access, but never the glossary.
    decided: supporting
    why: Pure published data serving the core without being it; not generic, because the vocabulary is this business's own.
  - location: domain/glossary/subject-type.md
    field: type
    unstated: The material calls the vocabularies closed but discovered, growing with cases, and leaves their initial sets open as Decision 4.
    decided: value-object
    why: An enumeration would fix values the material has not decided; a named value object holds an open registered set.
  - location: domain/glossary/outcome.md
    field: type
    unstated: Same as subject-type — a contributed vocabulary with no fixed value set stated.
    decided: value-object
    why: Outcomes grow one per confirmable hypothesis; only the two non-conclusion outcomes are known today, which a rule states.
  - location: domain/glossary/action.md
    field: type
    unstated: The material fixes governance for actions but not their values.
    decided: value-object
    why: Same open-set reasoning as the other vocabularies.
  - location: domain/glossary/recipient.md
    field: type
    unstated: The material fixes governance for recipients but not their values.
    decided: value-object
    why: Same open-set reasoning as the other vocabularies.
  - location: domain/glossary/concept.md
    field: attributes.ttl.type
    unstated: The material gives ttl no unit or shape.
    decided: integer
    why: A tolerance is compared against elapsed time; whole seconds are the coarsest unit that still expresses every tolerance the material discusses.
  - location: domain/knowledge/case.md
    field: type
    unstated: The material classifies the case as a value object identified by content, while also giving it composition of named hypotheses, outside references to it, and its own behavior.
    decided: aggregate-root
    why: Content identity is still identity — the domain cares which case answered — and only an aggregate root can own entities by name, be referenced from another aggregate, and carry the declared operations.
  - location: domain/knowledge/case.md
    field: attributes.version.type
    unstated: The material shows a version in the case pin without stating its form.
    decided: integer
    why: Versions are counted at each change of the file; a count is an integer.
  - location: domain/knowledge/resolution.md
    field: type
    unstated: The material states outcome and referral on every hypothesis and on the fallback, but never names their grouping.
    decided: value-object
    why: One shared shape keeps a position from declaring one field without the other, which a rule then states once.
  - location: domain/investigation/investigation.md
    field: attributes.id.type
    unstated: The material lists id without a shape.
    decided: string
    why: Nothing in the material orders or computes over ids; an opaque string is the weakest sufficient claim.
  - location: domain/investigation/investigation.md
    field: attributes.requester.type
    unstated: The material names the requester and their authorization scope without a shape.
    decided: string
    why: The requester is an identity carried to the connectors for scoping; an opaque identifier suffices and the scope itself lives with authorization, not the domain.
  - location: domain/investigation/evidence.md
    field: attributes.inputs.type
    unstated: The material shows inputs on evidence without a shape.
    decided: string
    why: Inputs vary per capability and are pinned for replay as recorded bytes; a serialized form is the only shape common to all.
  - location: domain/investigation/evidence.md
    field: attributes.observation.type
    unstated: The material says the observation is normalized to the glossary vocabulary but gives it no shape of its own.
    decided: string
    why: The observation's real schema is the producing capability's output schema; the record carries the serialized form and the citation check reads the schema, not this field.
  - location: domain/investigation/evidence.md
    field: attributes.origin.type
    unstated: The material lists origin on evidence without saying what it holds.
    decided: string
    why: It names where the observation came from for audit; an opaque name suffices.
  - location: domain/investigation/durations.md
    field: attributes
    unstated: The material measures durations per stage without a unit.
    decided: integer milliseconds per stage
    why: Stage budgets are single-digit seconds; milliseconds keep them integral and comparable.
  - location: domain/investigation/evaluation.md
    field: attributes.hypothesis.type
    unstated: The material indexes evaluations by hypothesis name but does not say how the record points at the hypothesis.
    decided: string
    why: A hypothesis is an entity inside the case aggregate and is reached only through its root; the name within the pinned case is the reference that respects the boundary.
  - location: domain/integration/capability.md
    field: type
    unstated: The material classifies capability as a value object while also registering it, versioning it and referencing it from evidence.
    decided: aggregate-root
    why: Registration is identity plus lifecycle — the domain cares which capability answered — and evidence must reference it across aggregates, which only a root admits.
  - location: domain/integration/capability.md
    field: attributes.version.type
    unstated: The material shows a capability version without a format.
    decided: string
    why: Versions of an integration contract follow the provider's scheme, which the material does not constrain.
  - location: domain/integration/capability.md
    field: attributes.input_schema.type
    unstated: The material says a capability declares schemas without saying how a schema is held.
    decided: string
    why: A schema is carried as its serialized declaration; what reads it is the citation check, not the domain record.
  - location: domain/integration/capability.md
    field: attributes.output_schema.type
    unstated: Same as input_schema.
    decided: string
    why: Same as input_schema.
  - location: domain/integration/capability.md
    field: attributes.timeout.type
    unstated: The material demands a timeout per capability without a unit.
    decided: integer
    why: Milliseconds, consistent with durations, since capability budgets are fractions of the collection stage.
  - location: domain/integration/capability.md
    field: attributes.connector.type
    unstated: The context map draws connectors beside capabilities without ever linking one to the other.
    decided: string
    why: A capability must say which adapter executes it or the registration cannot be run; the name is configuration, so an opaque string keeps vendors out of the model.
  - location: domain/integration/capability-nature.md
    field: values
    unstated: The material names only read-only and says the field exists so the registry has something to refuse.
    decided: read-only and mutating
    why: A refusable value must exist to be refused; mutating is the material's own name for what the registry turns away.
  - location: contracts/investigation/assessment-reviewed.md
    field: payload
    unstated: The material names the event and its role as regression label, but never its shape.
    decided: domain/investigation/assessment
    why: The event is the operator's judgment of the assessment; the assessment is the thing reviewed, and no reviewed-assessment element exists to carry more.
  - location: contracts/glossary/glossary-query.md
    field: operations
    unstated: The material demands the glossary be readable by every context but names no operations.
    decided: read-vocabulary-term and read-concept
    why: The two reads the consumers actually perform; validation reads terms, normalization and collection read concepts.
  - location: contracts/investigation/diagnosis.md
    field: operations
    unstated: The material describes the synchronous flow but names no interface operation.
    decided: diagnose
    why: One entry point, one name, matching the flow the material draws end to end.
  - location: contracts/system/corporate-records.md
    field: type
    unstated: The material shows corporate systems as an external box with no contract of their own.
    decided: capability
    why: A third-party system enters the specification as an upstream capability named by what it supplies, never by vendor name.
  - location: rules/knowledge/validation-runs-at-every-read.md
    field: statement
    unstated: The material demands validation at every read and also that every case version stays readable for replay, without saying whether a replayed old version must still validate against the current glossary.
    decided: Validation gates a case's use for new diagnoses; a replay reads the pinned version without revalidation.
    why: Replay pins content to reproduce what ran; revalidating history against today's glossary would destroy the reproducibility the pins exist for.
  - location: rules/glossary/an-outcome-is-contributed-by-a-confirmable-hypothesis.md
    field: statement
    unstated: A new case introduces its outcome, yet validation refuses a case whose outcome the glossary lacks; the material never says whether contribution registers the term or presupposes it.
    decided: Contribution is a curation act in the same change that introduces the case; validation still refuses a case whose outcome is absent at reading.
    why: Automatic registration would make the outcome-existence refusal unreachable and let a typo mint a vocabulary term; the same-change discipline keeps both rules decidable.
  - location: rules/knowledge/a-collected-concept-declares-a-ttl.md
    field: statement
    unstated: The material delegates the default ttl to the analysis without naming a value.
    decided: Sixty seconds.
    why: The material itself states a short ttl never produces an error, only less cache efficiency, so the safe default is short; one minute keeps any cached observation fresher than the investigation deadline by a factor of three.
  - location: rules/investigation/the-customer-sees-only-the-text.md
    field: statement
    unstated: The material answers that the writing is what the assessment exposes to the end customer, without saying explicitly that nothing else is exposed.
    decided: The text is the only customer-facing part; outcome, referral, verdicts and evidence stay operational.
    why: Naming the writing as the answer to what-is-exposed reads as exclusive, and an exclusive bound is the only falsifiable form of it.
  - location: rules/integration/a-capability-declares-its-contract.md
    field: statement
    unstated: Decision 3 demanded two figures — the per-capability timeout and the collection stage's global deadline — and the material answered with the single figure of sixty seconds.
    decided: Sixty seconds binds the capability timeout default; no second figure is recorded for the collection stage.
    why: The collection stage runs its concepts in parallel, so its bound is the slowest capability clamped by the propagated remaining time, and a separate stage figure would add nothing the propagation constraint does not already enforce.
  - location: rules/investigation/collection-has-its-own-budget-within-the-total.md
    field: statement
    unstated: Decision 3 demanded two figures, and the entry above decided only the capability timeout default, reasoning that the propagation constraint made a second figure redundant — but no nominal per-stage budget is stated anywhere for that constraint to clamp against, so the collection stage's own bound was never actually pinned; the material itself, at Decision 3, says a slow system hangs the investigation without both numbers.
    decided: Seven seconds, the collection stage's own nominal budget inside the total deadline.
    why: The material's engineering proposal for the synchronous budget (Decision 1) is the only concrete split it offers, and it allocates seven of the twenty seconds to collection because the stage runs in parallel and is bound by its slowest capability, not by a sum.
  - location: rules/investigation/an-answer-arrives-within-the-declared-deadline.md
    field: statement
    unstated: The specification held a total deadline of three hundred seconds with no decision-log entry disclosing it — an undisclosed decision, and one at odds with Decision 1, closed as synchronous with the attendant waiting on screen, and with the material's own proposed twenty-second synchronous budget, referenced twice more elsewhere in the material as the orçamento the durations record against.
    decided: Twenty seconds — two of overhead and margin, seven of collection, five of judgment, four of writing and two of persistence.
    why: A five-minute wait contradicts the synchronous, on-screen experience Decision 1 closed on; twenty seconds is the only total the material gives, so the undisclosed three-hundred-second figure is corrected to it, pending the operational confirmation the material itself still asks for.
  - location: domain/glossary/subject-attribute.md
    field: type
    unstated: The material asks for a closed vocabulary of attribute names, discovered from the glossary, without naming the value's construct or fixing an initial set.
    decided: value-object
    why: Mirrors subject-type, concept, outcome, action and recipient exactly — an open, registered set that grows as a new kind of identifying data enters, never a fixed enumeration.
  - location: domain/investigation/subject-attribute-value.md
    field: attributes
    unstated: The material gives the attribute-value pair only as a worked example (attribute "id", value "12345") without naming the element that holds it or its own two fields.
    decided: attribute, domain/glossary/subject-attribute, required; value, string, required.
    why: Mirrors domain/investigation/citation's own pairing of a governed-vocabulary reference with a free string in this same context — one governed name and one free value travel together as one fact rather than two arrays kept in step by convention.
  - location: domain/investigation/subject.md
    field: attributes
    unstated: The material replaces the subject's single id with a described set of attribute-value pairs but does not name the field the set is held in.
    decided: attributes, subject-attribute-value, many, required — alongside the unchanged type field.
    why: Matches the material's own top-level word for the set ("conjunto de atributos-valor") and avoids "values", a key the element schema reserves for an enumeration's own closed set.
  - location: rules/investigation/a-subject-carries-at-least-one-attribute.md
    field: statement
    unstated: The material explicitly asks whether the new subject shape needs an invariant analogous to a-hypothesis-collects-at-least-one-concept, without deciding it.
    decided: A subject carries at least one attribute-value, as its own invariant.
    why: Mirrors a-hypothesis-collects-at-least-one-concept's own reasoning exactly — a subject with no attribute-value at all identifies nothing, and no capability's connector would have anything to derive its call from.
  - location: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary.md
    field: statement
    unstated: The material asks for machine-checkable governance of attribute names from the glossary, without deciding whether this extends case-terms-exist-in-the-glossary or stands as its own rule.
    decided: A new, separate policy — every attribute a subject's attribute-values name exists in the glossary.
    why: case-terms-exist-in-the-glossary's own statement and rationale are specifically about what a case names; a subject's attribute-values are never declared by a case — the entry point resolves and assembles them at request time — so folding this into that rule would state a case-time check that never actually runs for them.
  - location: constraints/the-evidence-cache-admits-only-ok-results.md
    field: statement
    unstated: The same substitution the idempotency key needed applies to this cache-key constraint, which the material does not mention directly but which names subject id in the same way.
    decided: The subject's whole set of attribute-values, in place of subject id, consistent with the idempotency key's own substitution.
    why: Both keys identify "this same subject"; a day-two feature should not diverge from the identity the rest of the specification already gives it.
  - location: domain/investigation/assessment-consolidator.md
    field: operations
    unstated: The material asks for a new domain-service and port analogous to hypothesis-evaluator, without naming its own operation.
    decided: assessment-consolidator, one operation, consolidate.
    why: Mirrors hypothesis-evaluator/evaluate exactly — a domain-service named for the role, one operation named for the verb the material itself uses ("consolidação").
  - location: domain/knowledge/consolidation-register.md
    field: values
    unstated: The material asks for a closed, structured field guiding the write-up's framing, offering "which aspects to prioritize" and "expected register/tone" only as examples, without deciding which parameters actually exist or their values.
    decided: One parameter only — register, an enumeration of formal and plain — explicitly excluding any content-priority or emphasis parameter.
    why: A parameter naming which aspect to prioritize would let a curator's framing steer which findings the text foregrounds, in tension with judgment-does-not-infer and the-outcome-comes-from-the-case, which this whole field exists to stay reconciled with; register is purely cosmetic and carries no such risk, and a closed pair (formal, plain) is the smallest defensible set the material's own example gestures at.
  - location: domain/knowledge/consolidation-register.md
    field: type
    unstated: The material asks the analysis to decide whether this parameter needs a glossary vocabulary of its own (the subject-attribute pattern) or a fixed enumeration suffices.
    decided: enumeration, not a glossary-discovered vocabulary.
    why: A register is a closed style choice known ahead of time, unlike concept, outcome or subject-attribute, which grow as new cases or new integrations are authored; nothing about a register grows the same way, so no case-terms-exist-in-the-glossary-style governance rule is needed for it.
  - location: domain/knowledge/case.md
    field: attributes.consolidation_register.required
    unstated: The material says the curator authors this alongside the hypotheses but does not say whether every case must declare one.
    decided: Not required.
    why: Forcing every existing case to declare a register retroactively is a burden the material never asks for; an absent register defers to whatever the consolidation adapter's own default carries, the same absence-is-data convention domain/investigation/assessment already uses for determining_hypothesis.
  - location: rules/investigation/the-writing-input-is-narrowed.md
    field: statement
    unstated: The material states explicitly that this rule is replaced, not relaxed — the outcome-based branching disappears — but leaves the exact new statement for the analysis to write.
    decided: One shape in every outcome — every required hypothesis's evaluation (verdict, reason when present, citations) plus the evidence any citation names; the case's hypotheses, their criteria and the when_to_use still enter no prompt, without exception.
    why: Directly reflects the material's own description of the unified input, keeping the two absolute exclusions (case body, criteria) the material repeats as never lifted.
  - location: rules/investigation/an-answer-arrives-within-the-declared-deadline.md
    field: statement
    unstated: The material asks the analysis to confirm, as an explicit decision rather than an absence of change, whether the four-second writing slice still holds now that its mechanism moves from a pure function to a single LLM call.
    decided: The total stays twenty seconds and the writing slice stays four, unchanged, now covering the consolidation call.
    why: A single, non-parallel LLM call fits a four-second slice at least as comfortably as one individual judgment call already fits inside judgment's own five-second slice across a whole pool; nothing in the material gives evidence the mechanism change demands a larger number.
  - location: domain/investigation/investigation.md
    field: attributes.requester.type
    unstated: No node stated where a diagnose call's requester value originates — the standing BLOCKING on task/investigation-lifecycle/diagnose-entry-point.
    decided: The caller supplies it directly in the diagnose call's own payload; no further resolution or inference happens inside the domain.
    why: Resolves the standing BLOCKING; the human confirmed the caller supplies it directly, the same way ticket_ref now does.
  - location: domain/investigation/investigation.md
    field: attributes.ticket_ref.required
    unstated: The same BLOCKING left unstated where ticket_ref originates, and whether every diagnose call must carry one.
    decided: Not required — ticket_ref travels in the diagnose call's own payload when given, but not every call carries one.
    why: The human confirmed a ticket reference is optional; nothing forces every request to have a ticket to attach.
  - location: domain/investigation/investigation.md
    field: attributes.ticket_ref
    unstated: Removing the window-deduplication rule deletes the only node that gave ticket_ref an operative role, and the node itself does not say why the attribute survives.
    decided: ticket_ref stays on the investigation, optional and unchanged — correlation with the ticketing system for traceability and audit, participating in no matching or deduplication logic.
    why: The product owner confirmed the attribute keeps its correlation value with repetition semantics gone; removing it would cut the audit link between an investigation and the ticket that occasioned it, which nothing in the removal asked for.
  - location: rules/investigation/the-writing-input-is-narrowed.md
    field: statement
    unstated: The material admits the pinned case's title and when_to_use into the judgment prompt without saying what becomes of this rule's unqualified clause that the when_to_use enters no prompt.
    decided: The exclusion is scoped to consolidation — the case's hypotheses, their criteria and the when_to_use enter no consolidation prompt; what the judgment prompt contains is its own constraint's to state.
    why: Read unqualified, the clause would contradict the confirmed decision that title and when_to_use now enter the judgment prompt; the rule's own rationale — never give consolidation the case body to reason from — was always about the writing, and the closed consolidation prompt keeps them out of consolidation regardless.
  - location: constraints/the-judgment-prompt-is-closed.md
    field: statement
    unstated: Live testing against the real provider exposed that rules/investigation/a-cited-field-exists-in-the-capability-output-schema cannot be satisfied by a model never shown the output schema it cites against, but the product owner's confirmed decision to widen the closed prompt did not itself fix the exact shape of what enters — the field names alone, the whole schema text, or the schema with its types and descriptions.
    decided: Only the field names — the output schema's own `properties` keys, per evidence item — enter the prompt; the schema's types, descriptions and any other content stay out.
    why: The citation rule only ever holds a citation's field to existing among those keys, so the field names are the whole vocabulary it requires; admitting the schema's other content would let data the rule never asked for start reading as instruction, against this constraint's own data-is-data discipline.
  - location: constraints/the-system-persists-to-one-relational-database.md
    field: statement
    unstated: The material says the application starts persisting to a database without saying which of the four things the system keeps move there — the cases, the published vocabularies, the capability registrations and the investigations each have their own store today.
    decided: All four, in one store; nothing stays in a file — and the constraint names no engine and no driver, saying only that the store is transactional and relational.
    why: A record left in a file would keep the constraint this replaces alive for part of the system while the rest denies it, and the two homes would have to be kept in step by hand; the engine is named by the project's standard in STK-12 and its driver in STK-05, so naming it here as well would put one fact in two houses where changing stores means remembering to edit both, and only the property that survives such a change belongs here.
  - location: constraints/the-database-is-externally-provisioned.md
    field: statement
    unstated: The material names the provider that provisions the database; it does not say whether the provider is part of the solution bound or a deployment choice the specification stays out of.
    decided: A deployment choice — the constraint states external provisioning reached through a connection URL from configuration, and names no provider.
    why: A provider's name written here would refuse a second environment provisioned differently, and it is not what any check could hold; what a check can hold is that the deployment provisions no database service and hardcodes no endpoint, which is the property the material was actually asserting.
  - location: constraints/the-schema-replays-from-its-scripts.md
    field: statement
    unstated: The material asks for SQL scripts in the style of migrations under migrations/, versioned, without saying which of those facts is a bound on the solution and which is the project's own arrangement — and the project's standard already states the arrangement half, in STK-06 and PRH-04, differently.
    decided: The constraint states only that the schema replays from the numbered scripts; the directory, the file form and the prohibition on runtime DDL stay with the standard.
    why: Stated here as well, the directory would put two review passes in contradiction over the same file — one requiring migrations/ while the standard's rule reaches src/migrations and nothing else — and the constraint schema assigns a project's arrangement convention to the standard even where the property is identical; what survives a change of standard is that the scripts are the whole schema and their order suffices, which is what this keeps.
  - location: constraints/the-stored-schema-mirrors-the-declared-model.md
    field: fitness
    unstated: The material requires the tables and attributes to conform to the current entities but names no check that would find a departure.
    decided: A pairing in both directions — each relation and column against the element and declared attribute it encodes, and each required attribute against the column that holds it.
    why: Both sides are enumerable, so the pairing is mechanical rather than a reading; and the second direction is the one no schema review would find on its own, because a fact the specification states and the store cannot record is invisible from the schema alone.
  - location: constraints/a-case-is-read-whole.md
    field: statement
    unstated: Retiring the one-JSON-document constraint says the case stops being stored whole; it does not say whether the aggregate may now be read in pieces.
    decided: A case is read whole, in one transaction, or not at all.
    why: What kept hypotheses, resolutions and referrals arriving together was the document rather than any decision, so retiring the document silently retires the guarantee; a partially loaded case has a short collection plan and a holed precedence order, and resolve-outcome would answer from it without anything failing.
  - location: rules/knowledge/a-case-version-is-written-once.md
    field: statement
    unstated: Dropping the hash leaves slug and version as the whole of the pin, and the material does not say what makes that pair name one content.
    decided: A case version is written once and never altered; revising a case writes a new version.
    why: The pair only identifies content while no version can be rewritten — with the digest gone, nothing else would detect a rewritten version, and every investigation that pinned it would name a procedure other than the one that ran.
  - location: rules/knowledge/a-slug-identifies-one-case.md
    field: statement
    unstated: The rule that a case's slug equals its file name goes with the file, and the material does not say what keeps a slug identifying one case once no file system enforces it.
    decided: No two cases share a slug, stated as an invariant of its own.
    why: The uniqueness was real and was being kept by the medium rather than by a decision; leaving it unstated would drop a standing invariant as a side effect of changing the store, and two cases under one slug would leave every pin to that slug ambiguous.
  - location: rules/knowledge/validation-runs-at-every-read.md
    field: statement
    unstated: The case element justified holding no draft by work in progress being a git fact, a branch or a pull request; with curation moving to the database, the material does not say what keeps a draft out of the domain.
    decided: Validation at every read is the whole of the gate — an unfinished version does not validate, so it is not a case, and no publication state is introduced.
    why: The alternative is a status on the case, which no class here admits and which the specification deliberately refused; the rule already ran at every read with no intermediate gate, so it covers an unfinished version without any new field to maintain.
  - location: constraints/the-stored-schema-mirrors-the-declared-model.md
    field: statement
    unstated: Stated per relation, this constraint and constraints/the-evidence-cache-admits-only-ok-results decide the evidence cache differently — the cache's key is a concept, a subject type, a subject's whole set of attribute-values and the inputs, declared by different elements and by no element named cache, so a relation-level pairing makes a cache the specification already admits a departure.
    decided: The pairing is per column, not per relation — every column pairs with one attribute some element declares, and a relation may draw columns from more than one element.
    why: What this constraint exists to catch is a column no element declares, and that is caught identically per column; the relation-level reading additionally forbade shapes the specification elsewhere requires, and the aggregate boundary it seemed to protect is held by constraints/a-case-is-read-whole rather than by the schema's shape.
  - location: domain/knowledge/hypothesis.md
    field: attributes
    unstated: The precedence rules/knowledge/hypotheses-are-ordered-by-precedence calls the declared order was carried by the order of the hypotheses inside their case's one document, and nothing declared it; decomposed into relations, rows have no order and constraints/the-stored-schema-mirrors-the-declared-model refuses a column no attribute declares.
    decided: A hypothesis declares position, a required integer.
    why: The precedence is a domain fact the rule already states experts affirm, so it cannot survive as an arrangement of the storage; declaring it on the hypothesis keeps the rule's statement true word for word and lets resolve-outcome read the order from a fact rather than from however rows came back.
  - location: rules/knowledge/a-hypothesis-position-is-unique-within-its-case.md
    field: statement
    unstated: Moving the order into a position field says nothing about two hypotheses holding the same position, which the document's arrangement made impossible without any rule.
    decided: No two hypotheses of one case share a position.
    why: resolve-outcome needs a total order to have a first confirmed hypothesis at all; with positions free to collide, a tie would be settled by whichever row was read first, which is the ambiguity the declared order exists to remove.
  - location: domain/investigation/investigation.md
    field: attributes
    unstated: The material does not say whether an investigation records when it was written; the file's own modification time carried it by accident and a row carries nothing by accident.
    decided: written_at, a required datetime.
    why: The record exists to be audited and replayed, and when it was written is the one fact an audit cannot recover from any other attribute; it is not a closing state, because nothing reads it to decide whether the investigation finished and there is no value it moves to next.
  - location: domain/knowledge/case.md
    field: attributes
    unstated: Version history used to be readable from the commits that produced the files; with the file gone, the material does not say whether a case version records when it was authored.
    decided: authored_at, a required datetime.
    why: Curation history was a fact of the version control the case no longer lives in, and an audit of which procedure was current when an old investigation ran needs it; the alternative was leaving a column no attribute declares, which constraints/the-stored-schema-mirrors-the-declared-model refuses.
  - location: domain/integration/capability.md
    field: attributes
    unstated: rules/integration/one-capability-answers-one-concept states that each concept resolves to exactly one capability, and domain/integration/capability-registry's own resolve-concept operation looks a capability up by the concept it answers, but no attribute of the capability itself ever named which concept that is — the element's own Description already spoke of "its concept" in prose, an operative fact with nowhere to be held.
    decided: A capability declares concept, a required reference to domain/glossary/concept.
    why: The lookup resolve-concept performs and the one-to-one invariant one-capability-answers-one-concept states both presuppose a fact readable off the capability itself; leaving it unstated left a column no attribute would declare, which constraints/the-stored-schema-mirrors-the-declared-model refuses, and left an operative claim living only in the element's own Description, which SPEC-001 R7 refuses. The reference is singular, not many, since the existing resolution reads one capability as answering one concept.
  - location: domain/knowledge/case.md
    field: attributes
    unstated: The material describes a case's identity as distinct from any one of its versions, and gives the identity a next-draft behavior, but does not say whether it carries any attribute of its own beyond the slug.
    decided: slug alone.
    why: Everything the material once described as belonging to "the case" beyond bare identity — title, when-to-use, subject, fallback, its hypotheses — is now explicitly per-version or per-hypothesis; nothing the material states is a fact of the identity itself, and inventing one would be exactly the kind of technical bookkeeping this class refuses.
  - location: domain/knowledge/hypothesis-revision.md
    field: type
    unstated: The material describes a hypothesis's content as revisioned, reused across several case versions, but does not say whether one revision is an entity living inside the hypothesis's own aggregate or a root of its own.
    decided: aggregate-root, referenced both by the hypothesis it belongs to and by the manifest entry that adopts it.
    why: A manifest entry belongs to a different aggregate (case-version) than the hypothesis whose content it adopts, and a reference may only target another aggregate's root, never reach into a sibling aggregate's own entity (SPEC-002 R11); a revision that a manifest entry outside the hypothesis aggregate must address by identity therefore has to stand as a root of its own.
  - location: domain/knowledge/manifest-entry.md
    field: attributes.position
    unstated: The material shows a hypothesis's precedence position without saying whether it belongs to the hypothesis's revisioned content or to the version's own placement of it.
    decided: position is the manifest entry's own attribute, never a fact of the hypothesis-revision it references.
    why: The material's own example reorders hypotheses between one version and the next with neither hypothesis's content changing; had position lived on the revision, that same reorder would force a content revision nobody asked for, purely to relabel a number.
  - location: rules/knowledge/validation-runs-at-every-read.md
    field: statement
    unstated: The material says a draft may be temporarily incomplete or incoherent while it is being composed, without saying whether reading a case version in that state is refused, exactly as an incoherent version already is today, or answered as partial data.
    decided: Reading a case version — draft or released alike — still requires every validator rule to hold at that reading; an incomplete or incoherent draft is not yet readable as a case at all, whether previewed or diagnosed against, and this needs no field of its own to track.
    why: Keeps the specification's own established mechanism — an unfinished version does not validate, so it is not a case, and nothing has to mark it as not ready — doing exactly the job it already did, rather than inventing a second, parallel notion of partial readability the material never asked for; draft and released answer a different question (whether a version may yet be diagnosed against), never whether it is coherent.
  - location: rules/knowledge/a-case-has-at-most-one-draft.md
    field: statement
    unstated: The material's own working-copy metaphor implies a single draft in flight per case, without stating this as a standing rule.
    decided: A case holds at most one version in draft state at a time.
    why: The material's own accepted numbering choice — assign the next version number the moment a draft is created, not at release — only avoids two drafts racing for the same number if at most one draft can exist per case at once; without this as a standing rule, that numbering choice has nothing stopping the collision it was meant to prevent.
  - location: rules/knowledge/a-case-version-number-is-never-reused.md
    field: statement
    unstated: The material states that a discarded draft's version number is never reused as a described behavior of rollback, without saying whether this is a standing invariant or an implementation detail nobody has to honor.
    decided: A standing rule of the case aggregate, not an implementation detail.
    why: The whole reason the material insists rollback always mints a new, higher version rather than reactivating an old one is auditability; leaving the no-reuse guarantee as an unstated implementation detail would let a future implementation derive the next number from whichever rows happen to still exist, silently reopening exactly the ambiguity rollback's own discipline exists to close.
  - location: rules/knowledge/a-hypothesis-revision-number-is-never-reused.md
    field: statement
    unstated: The intake scope for /plan-work describes revise-hypothesis assigning the next hypothesis-revision number as that hypothesis's own highest existing revision plus one, or one if none exists yet — an implementation-level assumption, not cited against any specification node — and never states whether this is a standing rule of the specification or whether a revision number may ever be reused for that hypothesis, the same gap a-case-version-number-is-never-reused once closed for case versions.
    decided: A hypothesis's first-ever revision is numbered 1; each later revision is numbered exactly one past that hypothesis's own highest existing revision, and a revision number, once assigned, is never reused for that hypothesis.
    why: Mirrors a-case-version-number-is-never-reused's own precedent exactly — a manifest entry, and a released version's pin through it, address a hypothesis-revision by this very number, so a reused number would let two different pieces of content answer to the same reference; unlike a case version, a hypothesis-revision is never discarded, so the guarantee holds without any counter needing to survive past a deleted row.
  - location: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft.md
    field: statement
    unstated: Which case version's declared subject type governs the concept-acceptance check performed when a hypothesis is revised, and whether a case must hold a draft version for a hypothesis of that case to be revised at all, is not stated.
    decided: A hypothesis is revised only while its case holds a draft version, and the concept-acceptance check the new revision undergoes uses that draft version's declared subject type.
    why: A hypothesis-revision carries no version reference of its own, so a-concept-accepts-the-declared-subject-type has nothing to check against unless one version is named; a-case-has-at-most-one-draft makes the case's own draft the one unambiguous candidate, and a-case-version-is-written-once already routes every content change through a draft rather than a released version, so anchoring the check there closes the gap without introducing a second route revision could take.
  - location: domain/knowledge/case.md
    field: attributes
    unstated: An earlier entry in this same log decided the case identity carries no attribute beyond slug, reasoning that a durable version-number counter was technical bookkeeping with no domain home. /plan-work's own execution-contract-binder later found this in direct conflict with a task built from the human-authored implementation scope, which requires exactly such a counter to satisfy a-case-version-number-is-never-reused (a version number, once issued, is never reused even after its draft is discarded — which a counter derived only from currently-existing rows cannot guarantee). The conflict was reported as a BLOCKING note, and the human explicitly chose to settle it by extending the specification rather than loosening the scope's own criterion.
    decided: The case identity gains a required attribute, next_version, an integer — the counter that assigns each new draft's version number, always greater than every version number the case has ever held, including one later discarded. This reverses the earlier "slug alone" entry rather than replacing it, since that entry is not itself wrong about anything the material stated in analysis, only insufficient once a-case-version-number-is-never-reused's own guarantee needed a durable, unambiguous home the analysis had not yet been asked to consider.
    why: The human's own explicit instruction, given the two paths a BLOCKING note offers (loosen the scope's criterion, or extend the specification) — this is the "extend the specification" path, chosen over asking whoever authors the scope to retract a criterion that is itself sound engineering, just previously homeless in the domain model.
  - location: domain/knowledge/case-version.md
    field: operations
    unstated: The human, reviewing a gap analysis of the HTTP surface an administration front-end needs, decided a curator must be able to correct a draft's own declared attributes (title, when_to_use, subject, fallback, consolidation_register) after create-draft, without naming the operation itself.
    decided: update-draft, added to case-version's own declared operations.
    why: Mirrors create-draft's own naming — a verb naming the lifecycle action — and sits beside place-hypothesis and remove-hypothesis as a third kind of in-draft composition, this one over the version's own attributes rather than its manifest; a-case-version-is-written-once already refuses it once released, so no new rule is needed to bound it.
  - location: contracts/knowledge/case-lifecycle.md
    field: operations
    unstated: The same review decided update-draft belongs to the curator's published entrance, without naming where it is exposed.
    decided: update-draft, added alongside create-draft, revise-hypothesis, place-hypothesis and remove-hypothesis in case-lifecycle's own operations.
    why: case-lifecycle already publishes every other in-draft composition action and the two terminal transitions (release, discard); update-draft is the same kind of action over the version's own attributes, so it belongs beside them rather than under a new api.
  - location: contracts/knowledge/case-query.md
    field: operations
    unstated: The same review decided that cases, the versions of a case, the hypotheses of a case and the revisions of a hypothesis each need a listing a curator browses by, without naming the operations or which api exposes them.
    decided: list-cases, list-case-versions, list-hypotheses and list-hypothesis-revisions, added to case-query's own operations, alongside read-case.
    why: case-query is already the one published api for every synchronous read the knowledge context offers; a listing is the same kind of read as read-case — validated, never file-backed — at a different cardinality, so it belongs beside read-case rather than splitting the context's one read surface into a second api. constraints/a-case-is-read-whole already anticipates independent reads of a hypothesis and its revisions apart from a whole case-version read, so this introduces no new tension with it.
  - location: contracts/glossary/glossary-query.md
    field: operations
    unstated: The same review decided the glossary's vocabularies and its concepts both need a listing, without naming the operations.
    decided: list-vocabulary-terms and list-concepts, added to glossary-query's own operations, alongside read-vocabulary-term and read-concept.
    why: Mirrors this api's own existing pairing of a term read and a concept read — one more operation per existing read, exposed through the one published-language interface a consumer already depends on, never a second interface.
  - location: contracts/integration/capability-registry.md
    field: operations
    unstated: The same review decided registered capabilities need a listing, without naming the operation.
    decided: list-capabilities, added to capability-registry's own operations, alongside read-capability.
    why: The registry already publishes the one synchronous read a consumer depends on; a listing is the same read at a different cardinality, so it belongs beside read-capability rather than a second api.
  - location: scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly.md
    field: then
    unstated: Whether list-case-versions, when a case currently holds no version at all, reports that fact explicitly or simply returns an empty listing with nothing said about why.
    decided: The read states explicitly that the case currently holds no version, never presenting an unexplained empty listing.
    why: only-a-draft-case-version-may-be-discarded plus a-case-version-number-is-never-reused make zero-versions a real, standing state a case can reach (its sole draft discarded) rather than a transient one — the case's slug and next_version counter persist, so the case a curator names still resolves. An empty array is indistinguishable from a stalled read, a misnamed slug, or a case that legitimately holds nothing yet; only an explicit statement removes that ambiguity, and it costs the read no new field the case-query contract does not already have room to state through a scenario's own concrete case.
  - location: rules/knowledge/a-release-refusal-with-no-named-violation-says-so.md
    field: statement
    unstated: Whether a release refusal that carries no specific violation must say so explicitly, or may instead surface as an empty, unexplained list.
    decided: A curator refused a release is always told why; where release finds no rule specifically violated, it says so explicitly rather than leaving the curator with an unexplained, empty refusal.
    why: >-
      "What someone is told at an outcome is what the business decided" (a refusal's wording is
      never surface) — an empty list with no text leaves the curator unable to tell a genuine
      absence of findings from a broken response, so the specification must state which reading
      holds; explicit disclosure is the smaller, strictly more informative statement and costs
      the domain nothing the aggregation mechanism (contracts/knowledge/case-lifecycle) does not
      already presuppose.
  - location: domain/integration/connector-configuration.md
    field: type
    unstated: The material states a connector configuration's identity (its connector name) and that editing replaces the whole configuration, without stating which DDD construct records it.
    decided: value-object
    why: Editing replaces the whole record rather than modifying part of it — two configurations holding equal attributes are interchangeable — and nothing elsewhere in the specification ever needs to reference a past connector configuration by identity the way a citation pins to a specific capability registration, so no aggregate-root consistency boundary is needed; the same reasoning that already typed domain/glossary/concept a value object.
  - location: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability.md
    field: statement
    unstated: The material proposed, without deciding outright, whether a connector configuration may be test-run before any capability names it, and asked the analysis to decide or record why it decided otherwise.
    decided: Refused — a connector configuration is tested only through a specific, already-registered capability that names it as its connector; a bare, unattached configuration is not test-run against a real subject through this action.
    why: The registry only ever holds a capability whose nature is read-only (a-capability-is-read-only); scoping the test through a registered capability is the only reading that inherits this existing invariant for free, so the diagnostic action never has to be trusted on its own to stay read-only. This is also the material's own stated recommendation.
  - location: contracts/integration/connector-configuration-registry.md
    field: operations
    unstated: The material asked only for creating and editing a connector configuration, without stating whether the published surface also exposes reading one or listing all of them.
    decided: read-connector-configuration and list-connector-configurations are published alongside register-connector.
    why: Editing an existing connector configuration requires reading it first, exactly as capability-registry already publishes read-capability and list-capabilities alongside register-capability; this mirrors that sibling contract's own shape rather than introducing a new judgment about what an authoring surface needs.
  - location: contracts/integration/capability-registry.md
    field: operations
    unstated: >-
      The material asked for a way to resolve a specific, already-known capability directly by
      its own identity — name and version together — without depending on which concept it
      currently answers; this contract's operations list was already closed and exhaustive over
      read-capability, list-capabilities and register-capability, so the absence of an
      identity-keyed read was the specification's own current statement rather than a silence,
      until this material asked for one.
    decided: read-capability-by-identity, added to capability-registry's own operations, alongside read-capability, list-capabilities and register-capability.
    why: >-
      An admin frontend needs a detail/edit screen addressed by a capability's own (name,
      version) identity that loads directly on first navigation or a page refresh — the same
      shape read-connector-configuration already serves for connector-configuration-registry's
      own single identity (connector) — and read-capability's existing concept-keyed resolution
      cannot serve this, since a screen editing an already-known capability does not need, and
      may not yet know, which concept it currently answers. This mirrors the same reasoning
      already used when list-capabilities and read-capability were themselves added to this
      operations list — a new read at a different cardinality or key belongs beside the
      existing reads rather than opening a second api. Left off
      domain/integration/capability-registry.md's own operations, matching the established
      pattern there — that domain-service's operations already name only register-capability
      and resolve-concept, never read-capability or list-capabilities either, so a read is
      consistently a contract-level surface over this domain-service, not one of its own
      declared operations.
  - location: constraints/the-capability-identity-read-is-rate-limited.md
    field: statement
    unstated: >-
      The material asks for a limit "per client" but this build verifies no caller's claimed
      identity (no-route-enforces-authentication) — so "one caller" needs a concrete meaning
      the material itself never supplies.
    decided: >-
      One caller means one source IP address making the request; the limit and the refusal it
      triggers are keyed on that address, not on any claim the request body carries.
    why: >-
      A claimed identity is exactly what no-route-enforces-authentication already says this
      build never verifies, so keying a limit meant to hold back an unbounded loop on the one
      thing a caller supplies unverified would let the limit be defeated by simply claiming a
      different identity on every request. The connection's own source address is the one
      property of a request this build does not take on the caller's word.
  - location: constraints/the-capability-identity-read-refuses-an-unregistered-identity.md
    field: statement
    unstated: >-
      No node states what read-capability-by-identity answers when the name and version it is
      given is not currently registered at any capability — the specification's operations
      list (contracts/integration/capability-registry.md) names the read but not its miss
      behavior, and no rule or constraint anywhere in the specification pairs an HTTP status
      with a refusal condition except this route's own sibling rate-limit constraint.
    decided: >-
      An HTTP 404 response, naming CapabilityIdentityNotFoundError as the specific condition
      and message of the refusal.
    why: >-
      The route's own sibling constraint (the-capability-identity-read-is-rate-limited) already
      establishes this specification's idiom for stating this exact route's HTTP-level refusal
      shape as an Architecture Constraint rather than a domain Rule — every Rule and Scenario in
      the specification states a refusal in domain language alone and never cites a status
      code, while the one place a status code appears is that sibling constraint. The
      corrective scope's own text independently confirms CapabilityIdentityNotFoundError as the
      already-settled, unchanged condition and message for this miss (only its raising point is
      being relocated, not its identity), so the decision fixes the missing HTTP-response
      pairing for that already-given condition rather than inventing a new one.
  - location: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability.md
    field: statement
    unstated: >-
      Whether the test action's own refusal, on finding no capability registered at the
      identity it names, is the identity-keyed read's own not-found answer reused, or a refusal
      of the test action's own.
    decided: >-
      A refusal of the test action's own, distinct from the identity-keyed read's own not-found
      answer for the same identity.
    why: >-
      Nothing in the domain model gives "capability not found" a single shared value object —
      the registry's own resolution answers the absence as ordinary data, and each contract
      that turns it into a refusal names its own (the same way a command's own `refusal` field
      is always that command's own value object, never a shared one across contracts); the
      identity-keyed read and this diagnostic test action answer two different questions
      (retrieve a record versus exercise a call) about the same absence, so nothing licenses one
      to inherit the other's refusal.
  - location: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused.md
    field: statement
    unstated: >-
      What read-connector-configuration answers when the connector name it is given resolves to
      no registered configuration — the api contract publishes the operation but, as an api,
      cannot declare a refusal itself (that field is command-only per the contract schema), so
      the fact had no addressable home at all.
    decided: >-
      A read of a connector configuration by a connector name nothing has registered is refused
      with an HTTP 404 response reporting a ConnectorConfigurationNotFoundError.
    why: >-
      The only addressable home an api's own read can give a refusal is a rule constraining the
      domain element being read, and this registry already has one such rule —
      a-connector-configuration-holds-a-well-formed-object, anchored to
      domain/integration/connector-configuration rather than to the domain-service, because
      read-connector-configuration itself answers to no domain-service operation of its own.
      Naming the HTTP status and the error value keeps the refusal a fact the specification
      states rather than one left for code alone to carry, the same discipline
      the-capability-identity-read-is-rate-limited already used in naming its own status (429)
      rather than leaving a caller's slow-down refusal unstated.
  - location: rules/integration/one-capability-answers-one-concept.md
    field: statement
    unstated: >-
      What register-capability answers when the concept is already answered by a capability of another identity, and what a concept read answers over a holding with two capabilities for one concept.
    decided: >-
      Registration is refused with HTTP 409 reporting ConceptAlreadyAnsweredError; the read is refused with HTTP 500 reporting DuplicateConceptAnswerError rather than choosing one.
    why: >-
      The material is the reconciliation record siegard-reconcile/connector-capability-corrections-post-closure-drift.md, whose findings report the delivered backend stating this fact while no node held it. The policy already says one to one with no fallback, so a second registration must be refused rather than silently replace or coexist; 409 is the status the backend already answers for a conflicting write. A holding answering twice is a state the registry itself promised never to produce, so a read meeting it reports a server-side fault rather than a caller error, which is what 500 says and what the backend answers for an unmapped class today.
  - location: rules/integration/a-capability-declares-its-contract.md
    field: statement
    unstated: >-
      Whether an empty-string attribute counts as declared, what refuses a registration lacking a required attribute, and whether the timeout must be an integer.
    decided: >-
      An absent or empty attribute is undeclared; the registration is refused with HTTP 422 reporting IncompleteCapabilityContractError; the timeout is an integer count of milliseconds.
    why: >-
      The material is the reconciliation record siegard-reconcile/connector-capability-corrections-post-closure-drift.md, whose findings report the delivered backend stating this fact while no node held it. An empty string declares nothing anyone could execute a call from, and reading it as declared would admit a capability the registry could never resolve; 422 and the error name are what the delivered registry already answers, and the capability node already types timeout as integer.
  - location: rules/integration/a-capability-is-read-only.md
    field: statement
    unstated: >-
      The status and error value of the refusal of a non-read-only capability.
    decided: >-
      HTTP 422 reporting CapabilityNotReadOnlyError.
    why: >-
      The material is the reconciliation record siegard-reconcile/connector-capability-corrections-post-closure-drift.md, whose findings report the delivered backend stating this fact while no node held it. The sibling refusals of this same registration now name status and value, and the decision log already records that naming them keeps a refusal a fact the specification states rather than one left for code alone to carry.
  - location: rules/integration/a-capability-declares-well-formed-schemas.md
    field: statement
    unstated: >-
      The status and error value of the refusal of a malformed schema.
    decided: >-
      HTTP 422 reporting CapabilitySchemaNotWellFormedError.
    why: >-
      The material is the reconciliation record siegard-reconcile/connector-capability-corrections-post-closure-drift.md, whose findings report the delivered backend stating this fact while no node held it. Same reasoning as a-capability-is-read-only: one registration, one idiom for its refusals.
  - location: rules/integration/a-connector-configuration-holds-a-well-formed-object.md
    field: statement
    unstated: >-
      The status and error value of the malformed-write refusal, and whether a registration may supply the configuration as an object rather than as text while the value object declares text.
    decided: >-
      HTTP 422 reporting ConnectorConfigurationNotWellFormedError; a registration may supply text or the object it parses to, and the registry holds and answers the configuration as text.
    why: >-
      The material is the reconciliation record siegard-reconcile/connector-capability-corrections-post-closure-drift.md, whose findings report the delivered backend stating this fact while no node held it. The read rule beside this one already names its status and value. The value object declares configuration as string and the published read answers a string, so text is what the specification holds; accepting the parsed object on input is a tolerance of the registration surface that changes nothing a reader learns, so it is admitted rather than refused.
  - location: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability.md
    field: statement
    unstated: >-
      The status and error value of the test action's own refusal when no capability is registered at the named identity.
    decided: >-
      HTTP 404 reporting CapabilityNotRegisteredForTestError.
    why: >-
      The material is the reconciliation record siegard-reconcile/connector-capability-corrections-post-closure-drift.md, whose findings report the delivered backend stating this fact while no node held it. The rule already decided the refusal is the test action's own, distinct from the identity read's; it left the name unstated, and the delivered backend names it this way with the same 404 the identity read answers.
  - location: rules/integration/a-connector-configuration-names-its-connector.md
    field: statement
    unstated: >-
      What register-connector answers to a registration with no connector name, and whether an empty string is one.
    decided: >-
      Refused with HTTP 422 reporting IncompleteConnectorConfigurationError; an empty string is no name.
    why: >-
      The material is the reconciliation record siegard-reconcile/connector-capability-corrections-post-closure-drift.md, whose findings report the delivered backend stating this fact while no node held it. The domain node marks connector required and stops there; the delivered registry refuses this way, and 422 is the status the sibling incomplete-contract refusal answers — the delivered backend leaves this class unmapped and answers 500, which this decision does not follow, because an operator omitting a name has sent an incomplete registration, not met a fault.
  - location: rules/integration/an-http-connector-configuration-declares-its-call.md
    field: statement
    unstated: >-
      Which keys an HTTP connector configuration must carry, what each must be, and what happens when one is missing at observation.
    decided: >-
      method (GET, POST, PUT, PATCH or DELETE), responseMap (object of string paths), statusMap (object from status to evidence-result ending); an observation reaching a configuration lacking one issues no call and ends unavailable with a result detail reporting MalformedHttpConnectorConfigurationError.
    why: >-
      The material is the reconciliation record siegard-reconcile/connector-capability-corrections-post-closure-drift.md, whose findings report the delivered backend stating this fact while no node held it. The keys and their meanings are exactly what the delivered connector requires. The delivered connector throws instead of ending; domain/investigation/evidence states that the absence of data arrives as a result and never as an exception, and no-stage-aborts-on-its-deadline holds the collection stage to recording rather than raising, so the specification decides an unavailable ending carrying the cause, and the code owes a correction.
  - location: rules/integration/an-unclassified-status-ends-unavailable.md
    field: statement
    unstated: >-
      Which evidence-result ending an HTTP status the statusMap does not classify resolves to.
    decided: >-
      unavailable.
    why: >-
      The material is the reconciliation record siegard-reconcile/connector-capability-corrections-post-closure-drift.md, whose findings report the delivered backend stating this fact while no node held it. The delivered connector defaults to unavailable and its own comment says no node stated a default; of the four endings it is the one that asserts the least about the attempt and never enters the cache.
  - location: rules/integration/an-unresolvable-observation-ends-unavailable.md
    field: statement
    unstated: >-
      What an observation records when no capability answers the concept or the capability's connector has no registered configuration.
    decided: >-
      No call is issued and the observation ends unavailable, with a result detail reporting CapabilityNotResolvedForObservationError or ConnectorConfigurationNotRegisteredError respectively.
    why: >-
      The material is the reconciliation record siegard-reconcile/connector-capability-corrections-post-closure-drift.md, whose findings report the delivered backend stating this fact while no node held it. The delivered adapter throws both as faults. The evidence node says absence of data is a recorded fact, never an exception, and the connector-configuration node says a capability may be registered before its connector is configured, so the state is reachable in ordinary operation and must record an ending; the two names are kept as the result detail so the cause stays readable.
  - location: rules/glossary/a-glossary-read-by-an-unheld-name-is-refused.md
    field: statement
    unstated: >-
      What read-vocabulary-term and read-concept answer for a name nothing holds.
    decided: >-
      A refusal: HTTP 404 reporting VocabularyTermNotHeldError for a term, ConceptNotHeldError for a concept.
    why: >-
      The material is the reconciliation record siegard-reconcile/connector-capability-corrections-post-closure-drift.md, whose findings report the delivered backend stating this fact while no node held it. The delivered glossary service answers the miss as data internally and the published route turns it into these two 404 refusals; the connector-configuration read already drew the same distinction between an empty result and a miss, and a caller of the published read learns the refusal, not the internal value.
  - location: rules/glossary/a-vocabulary-holds-each-name-once.md
    field: statement
    unstated: >-
      What a read answers over a vocabulary or the concepts holding one name twice.
    decided: >-
      Refused with HTTP 500 reporting DuplicateGlossaryNameError, answering neither record.
    why: >-
      The material is the reconciliation record siegard-reconcile/connector-capability-corrections-post-closure-drift.md, whose findings report the delivered backend stating this fact while no node held it. The glossary context already guarantees each term exists exactly once, so a duplicated holding is a corrupted store rather than a business state; refusing is what the delivered service does, and 500 says the fault is the system's, which is what the backend answers for this unmapped class today.
  - location: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case.md
    field: statement
    unstated: >-
      Whether ensuring the two non-conclusion outcomes may remove or rewrite outcomes already held, and whether an outcome a released version or revision names may ever be removed.
    decided: >-
      Ensuring adds only what is missing and removes or rewrites nothing; an outcome a released case version or released hypothesis revision names is never removed.
    why: >-
      The material is the reconciliation record siegard-reconcile/connector-capability-corrections-post-closure-drift.md, whose findings report the delivered backend stating this fact while no node held it. The delivered service states this and cites a plan task that will not outlive the plan; a released version is written once and its revisions are never altered, so an outcome they name has to keep existing for them to stay readable.
  - location: constraints/the-capability-identity-read-is-rate-limited.md
    field: statement
    unstated: >-
      The statement did not carry what one caller means or what value the 429 response names, although this log already decided the caller is the source IP address.
    decided: >-
      One caller is one source IP address; the refusal carries a Retry-After value.
    why: >-
      The earlier entry for this field decided the source address and the statement never carried it, so a reader of the node could not find the decision; Retry-After is the value the delivered route answers and the ordinary way an HTTP response names when to retry.
  - location: constraints/listings-are-paged.md
    field: statement
    unstated: >-
      Whether the list operations of the published apis answer everything at once or in pages, what selects a page, and where the default and maximum page size come from.
    decided: >-
      Every published list operation answers one page selected by an optional offset defaulting to 0 and an optional limit defaulting to a configured default and clamped to a configured maximum, carrying data, total, offset, limit and page count.
    why: >-
      The material is the reconciliation record siegard-reconcile/connector-capability-corrections-post-closure-drift.md, whose findings report the delivered backend stating this fact while no node held it. The delivered listings are paged this way across the integration and glossary apis while the contracts said every record; a caller must page to learn the set, which is a fact about what can be learned and so belongs in a node; the two figures are deployment configuration, so their existence is stated and their values are not.
  - location: constraints/a-malformed-request-is-refused-with-a-validation-error.md
    field: statement
    unstated: >-
      What a caller is told when a request's path, query or body fails the route's declared shape.
    decided: >-
      HTTP 400 with error code VALIDATION_ERROR, a message naming which part failed, and details listing the issues.
    why: >-
      The material is the reconciliation record siegard-reconcile/connector-capability-corrections-post-closure-drift.md, whose findings report the delivered backend stating this fact while no node held it. The identity read's siblings state its 404 and 429 as facts and left its 400 unstated; the shape is the same on every delivered route, so it is stated once for the system rather than per route.
  - location: constraints/the-concept-read-refuses-an-unanswered-concept.md
    field: statement
    unstated: >-
      What the read-capability route answers for a concept no capability answers.
    decided: >-
      HTTP 404 naming ConceptNotAnsweredError.
    why: >-
      The material is the reconciliation record siegard-reconcile/connector-capability-corrections-post-closure-drift.md, whose findings report the delivered backend stating this fact while no node held it. The identity-keyed read of the same route family already states its miss this way, and the delivered route answers exactly this.
  - location: domain/integration/connector-configuration.md
    field: attributes.configuration.type
    unstated: >-
      Whether the configuration attribute is the JSON object text or the object, given the delivered registry holds a parsed object and the delivered read answers text.
    decided: >-
      string — the JSON object text.
    why: >-
      The material is the reconciliation record siegard-reconcile/connector-capability-corrections-post-closure-drift.md, whose findings report the delivered backend stating this fact while no node held it. The published read answers text and the value object already declared string; what the registry holds internally is representation, and the well-formed-object rule now admits an object on input while holding the answer to text.
  - location: rules/integration/an-unresolvable-observation-ends-unavailable.md
    field: statement
    unstated: >-
      Cross-check: one-capability-answers-one-concept refuses a concept read that finds two capabilities answering, while this policy decided only the case where none answers — an observation of a concept answered twice was decided by neither.
    decided: >-
      The observation issues no call and ends unavailable, with a result detail reporting DuplicateConceptAnswerError.
    why: >-
      Inside an investigation the collection stage records endings and never raises (domain/investigation/evidence, no-stage-aborts-on-its-deadline), so the published read's refusal cannot be what an observation answers; the same ending the other two unresolvable cases take, carrying the same name the read reports, keeps the cause readable without a second vocabulary.
  - location: rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused.md
    field: statement
    unstated: >-
      What a read or lifecycle operation answers for a slug, or slug and version, no case version answers.
    decided: >-
      Refused with HTTP 404 reporting CaseNotFoundError.
    why: >-
      The material is siegard-reconcile/post-analyse-refusals-and-endings-drift.md, whose judge over src/errors/status-map.ts reported this refusal's status and error name as decided in code alone. Every other read in this specification now names its miss; the delivered knowledge context answers exactly this, and the scenario for a case holding no versions already carves out the one neighbouring case that is not a miss.
  - location: rules/knowledge/a-case-has-at-most-one-draft.md
    field: statement
    unstated: >-
      The status and error name of refusing a second draft.
    decided: >-
      HTTP 409 reporting CaseAlreadyHasDraftError.
    why: >-
      The material is siegard-reconcile/post-analyse-refusals-and-endings-drift.md, whose judge over src/errors/status-map.ts reported this refusal's status and error name as decided in code alone. The refusal exists in the rule; 409 is the status the backend answers for an operation the resource's current state forbids, the same reading ConceptAlreadyAnsweredError already took.
  - location: rules/knowledge/a-hypothesis-position-is-unique-within-its-case.md
    field: statement
    unstated: >-
      The status and error name of placing a hypothesis at an occupied position.
    decided: >-
      HTTP 409 reporting ManifestPositionOccupiedError.
    why: >-
      The material is siegard-reconcile/post-analyse-refusals-and-endings-drift.md, whose judge over src/errors/status-map.ts reported this refusal's status and error name as decided in code alone. Same reasoning as a-case-has-at-most-one-draft: a state conflict, not a malformed request.
  - location: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle.md
    field: statement
    unstated: >-
      What a lifecycle operation answers when asked of a version not in draft, and whether release has a refusal of its own for that case.
    decided: >-
      Operations other than release: HTTP 409 CaseVersionNotDraftError; release: HTTP 409 CaseVersionNotDraftAtReleaseError.
    why: >-
      The material is siegard-reconcile/post-analyse-refusals-and-endings-drift.md, whose judge over src/errors/status-map.ts reported this refusal's status and error name as decided in code alone. The delivered backend distinguishes the two and the material keeps them apart because release is the one trigger that ever leaves draft, so a curator re-releasing a released version is told a different thing from one composing into it; both are state conflicts, hence 409. Recorded in the statement rather than as rejections of the machine, because discard removes a version rather than moving it to a state.
  - location: rules/knowledge/a-release-refusal-with-no-named-violation-says-so.md
    field: statement
    unstated: >-
      The status and error name of a release refused over violated rules.
    decided: >-
      HTTP 422 reporting CaseVersionNotReleasableError, naming every violated rule together.
    why: >-
      The material is siegard-reconcile/post-analyse-refusals-and-endings-drift.md, whose judge over src/errors/status-map.ts reported this refusal's status and error name as decided in code alone. The rule already required the curator be told why; 422 says the request was well-formed and the content would violate an invariant, the reading the sibling registration refusals took.
  - location: rules/knowledge/a-case-has-at-least-one-hypothesis.md
    field: statement
    unstated: >-
      The status and error name of a removal that would empty the manifest.
    decided: >-
      HTTP 422 reporting ManifestWouldHoldNoHypothesisError.
    why: >-
      The material is siegard-reconcile/post-analyse-refusals-and-endings-drift.md, whose judge over src/errors/status-map.ts reported this refusal's status and error name as decided in code alone. The removal is well-formed and the result would violate the invariant, so 422 for the same reason as the release refusal.
  - location: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability.md
    field: statement
    unstated: >-
      What test-connector answers when the named connector is not the one the found capability names.
    decided: >-
      HTTP 409 reporting CapabilityConnectorMismatchError.
    why: >-
      The material is siegard-reconcile/post-analyse-refusals-and-endings-drift.md, whose judge over src/errors/status-map.ts reported this refusal's status and error name as decided in code alone. The rule already restricts the test to the capability's own connector; the mismatch is a conflict with the capability's registered state rather than a missing resource, and the delivered backend answers 409.
  - location: rules/integration/a-capability-declares-its-contract.md
    field: statement
    unstated: >-
      Whether a stated timeout must be positive, or whether zero or a negative integer is an
      acceptable value the sixty-second default and the "undeclared" reading of an absent value
      don't otherwise reach.
    decided: >-
      A stated timeout is a positive integer; zero or negative is refused, distinctly from the
      absent-timeout default.
    why: >-
      The material is siegard-reconcile/backend-post-corrections-code-drift.md, whose judge over
      register-capability.dto.ts reported the schema's own `.positive()` timeout bound as a fact
      no node states. The reading matches non-integer-timeout-refusal's own precedent (a
      declared-but-malformed timeout takes the system-wide malformed-request route, distinct from
      the absent-timeout default) — a duration of zero or less bounds no call, the same as one
      that isn't a number at all.
  - location: rules/integration/a-connector-configuration-holds-a-well-formed-object.md
    field: statement
    unstated: >-
      Whether a null or an array configuration value is classified with the not-well-formed
      refusal or falls through to the incomplete one, and what an entirely absent configuration
      value answers.
    decided: >-
      A null value or an array is not well-formed, the same refusal unparsable text already gets;
      an entirely absent configuration is a separate refusal, IncompleteConnectorConfigurationError,
      the same class an absent connector name already gets.
    why: >-
      The material is siegard-reconcile/backend-post-corrections-code-drift.md, whose judge over
      connector-configuration-registry.service.ts reported this classification as decided in code
      alone (malformed-object-classification, commit 13014f2, whose own rationale classified null
      and an array as not well-formed but explicitly left an absent value's classification
      unresolved, since the node "does not clearly decide" it). Absence reads as incomplete rather
      than malformed for the same reason a-connector-configuration-names-its-connector already
      reads an absent connector name that way: nothing was supplied to judge the syntax of, so
      there is nothing to call not well-formed.
  - location: rules/integration/a-diagnostic-response-masks-a-resolved-credential.md
    field: statement
    unstated: >-
      Whether the diagnostic operation's echoed request may carry a resolved credential's real
      value.
    decided: >-
      It may not: the response masks any value a credential placeholder in the connector's own
      call resolved to.
    why: >-
      The material is siegard-reconcile/backend-post-corrections-code-drift.md, whose judge over
      test-connector.controller.ts reported the masking as this controller's own silent inference,
      citing only the project's own standard (SEC-03, SEC-04) rather than a specification node. A
      diagnostic response is read by whoever called the route; echoing back the real value of a
      secret an operator only ever meant a connector's own call to carry defeats the reason a
      credential is read from environment configuration rather than the configuration text in the
      first place.
  - location: rules/integration/a-connector-configuration-holds-a-well-formed-object.md
    field: statement
    unstated: >-
      What a present connector-configuration value that is neither a string nor a plain object —
      a boolean or a number — answers, distinctly from null, an array, or an entirely absent
      value.
    decided: >-
      The same refusal an absent configuration gets: HTTP 422 reporting
      IncompleteConnectorConfigurationError, not ConnectorConfigurationNotWellFormedError.
    why: >-
      The material is siegard-reconcile/post-analyse-timeout-malformed-credential-drift.md, whose
      judge over connector-configuration-registry.service.ts reported this classification as
      decided in code alone. wellFormedConfiguration passes a present non-string, non-object,
      non-null, non-array value through unchanged, and registrationProblems then refuses it the
      same way it refuses an absent one ("configuration is not a plain object") — a boolean or a
      number carries no syntax to call well-formed or not well-formed, the same reasoning that
      already put an entirely absent value on the incomplete side rather than the malformed one.
  - location: domain/knowledge/case-summary.md
    field: attributes
    unstated: >-
      What current_state and last_updated answer for a case currently holding no version at all
      — the node declared both required, but the deriving rule only knows how to compute either
      from the case's highest-numbered version, which presumes one exists.
    decided: >-
      Both are optional, present only where the case currently holds at least one version; a
      case holding none has neither, the same pattern domain/knowledge/case-version.released_at
      already uses ("present only once released").
    why: >-
      The material is siegard-reconcile/frontend-cases-list-screen-drift.md, whose judge over
      cases-list-screen.tsx reported the frontend already deciding this — treating both fields
      as absent and stating that absence explicitly in the UI ("No version yet", "—") — with no
      node backing the decision. A case reaches zero current versions exactly the way
      a-case-holding-no-versions-is-told-explicitly already describes: its one and only draft
      discarded before release, leaving nothing behind
      (rules/knowledge/a-case-version-number-is-never-reused). There being no version, there is
      nothing to derive either field from, and the frontend's choice to state the absence rather
      than invent a value is the same discipline released_at's own conditional presence already
      established in this specification.
  - location: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions.md
    field: statement
    unstated: >-
      What the rule's own derivation answers for a case currently holding no version, since it
      is stated only in terms of "the case's highest-numbered version."
    decided: >-
      version_count is zero and neither current_state nor last_updated is derived; both are
      absent.
    why: >-
      Same material and reasoning as the case-summary.md entry above — the rule's statement and
      description now say explicitly what was previously left to be inferred from a node that
      presumed a version always exists.
  - location: domain/investigation/evaluation.md
    field: attributes
    unstated: >-
      The material asks that each judgment call's token usage, duration and materialized prompt
      be captured and exposed per hypothesis, but leaves open whether these are evaluation's own
      attributes or a separate value-object, and explicitly defers that choice to this analysis.
    decided: >-
      A new value-object domain/investigation/usage (input_tokens, output_tokens) carries the
      call's token spend, referenced from evaluation's own optional usage attribute; elapsed_ms
      and prompt stay flat on evaluation itself, alongside reason and citations, none of them
      required — present exactly when a judgment call happened, absent on reason no-data.
    why: >-
      usage mirrors domain/investigation/cost's own token shape at single-call granularity, so a
      future call site measuring one provider call reuses the same value-object rather than
      inventing a second one; elapsed_ms and prompt describe the evaluation event itself, not a
      quantity shared across calls, so they follow the precedent reason and citations already
      set by staying evaluation's own attributes instead of a wrapper with one member.
  - location: scenarios/investigation/a-single-hypothesis-is-simulated.md
    field: subject
    unstated: >-
      The material proposes rules/investigation/a-simulation-writes-no-investigation as this
      scenario's subject by default, then asks the analysis to check whether the contract itself
      is the better anchor once scenario.json is reread, without deciding between them.
    decided: >-
      contracts/investigation/case-simulation is the subject; the other two new scenarios keep
      the rule as theirs.
    why: >-
      What this scenario grounds — that simulate-hypothesis narrows to one hypothesis and
      resolves no outcome — is a fact about that operation's own shape, not about the
      no-investigation, no-cache guarantee the rule states and the other two scenarios already
      ground concretely; anchoring it to the contract keeps one scenario per fact instead of
      stretching the rule's subject to cover a claim it never makes.
  - location: domain/investigation/assessment.md
    field: attributes
    unstated: >-
      No attribute anywhere — on the assessment, the investigation, or a dedicated record —
      carries what one assessment-consolidator call itself spent at the provider.
    decided: >-
      assessment gains a required usage attribute, type usage (bare, same-context reference to
      domain/investigation/usage), carrying the consolidation call's own token spend.
    why: >-
      Mirrors evaluation's own usage attribute exactly — the call's own record belongs on the
      value-object the call produces, and domain/investigation/usage already exists as the
      call-granularity shape for exactly this purpose. Unlike judgment, which may never run for
      a hypothesis (reason no-data), consolidation runs exactly once per investigation without
      exception — cost.md states one writing call, linear in hypotheses, with no conditional —
      so usage is required here rather than optional the way evaluation's is.
  - location: domain/investigation/assessment.md
    field: attributes
    unstated: >-
      Whether a case simulation's or diagnosis's response states which consolidation register
      (formal or plain) the consolidation step actually applied, for a case version that
      declares no consolidation_register of its own.
    decided: >-
      assessment gains a required register attribute, type
      domain/knowledge/consolidation-register, carrying the register the consolidation step
      actually used to produce the text — the version's own declared register when it holds one,
      the consolidation adapter's own default otherwise.
    why: >-
      domain/knowledge/case-version.md itself says an absent register leaves the actual choice to
      "whatever register its own adapter defaults to" — a fact settled at the adapter, outside the
      domain, and unknowable to a caller in advance; the only way a reader of the response ever
      learns which register actually produced the text on hand is for the response to state it.
      This mirrors usage, elapsed_ms and prompt on this same element, decided the same way for the
      same reason — a call-level fact this one writing call alone produces, with no other
      addressable home to hold it — and is required rather than optional for the same reason those
      three are: consolidation runs exactly once per investigation without exception, so the
      register behind its text is never absent either.
  - location: rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused.md
    field: statement
    unstated: >-
      What simulate-hypothesis answers when the hypothesis name it is given is absent from the
      named case version's manifest — contracts/investigation/case-simulation names the
      operation but, as an api, cannot declare a refusal itself (that field is command-only per
      the contract schema), and no rule or constraint anywhere in the specification pairs an
      HTTP status with this particular miss.
    decided: >-
      HTTP 404 reporting HypothesisNotInManifestError.
    why: >-
      Mirrors this specification's own established idiom for a name absent from the one set a
      request itself pinned — a-case-read-by-an-unknown-slug-or-version-is-refused,
      a-connector-configuration-read-by-an-unregistered-name-is-refused and
      a-glossary-read-by-an-unheld-name-is-refused all resolve an absent name with HTTP 404 and a
      distinctly-named …NotFoundError/…NotHeldError value rather than an ordinary empty result; a
      hypothesis name absent from the one manifest the request names is the same miss, so it
      takes the same status and the same naming idiom, scoped to what is actually absent (a
      manifest entry for that name).
  - location: domain/investigation/durations.md
    field: attributes.writing.required
    unstated: >-
      Whether writing is always present on durations, or present only when a consolidation call
      actually happened — planning for case-simulation-backend found simulate-hypothesis needs a
      durations answer that never includes it, since that operation never reaches consolidation,
      while the node declared it required unconditionally.
    decided: >-
      writing is no longer required; it is present exactly when a consolidation call happened,
      absent otherwise.
    why: >-
      Mirrors the conditional-presence pattern domain/investigation/evaluation already uses for
      its own per-call attributes (usage, elapsed_ms, prompt, each present exactly when that
      call happened) — writing is the same kind of fact, a stage that either ran or did not,
      never a number to invent for a stage that never executed. diagnose's own durations still
      carry writing on every call, since diagnose always reaches consolidation; only an
      operation that genuinely skips the stage, like simulate-hypothesis, now has a way to say
      so truthfully instead of being forced to report a duration for a call that never happened.
  - location: rules/integration/an-http-connector-configuration-declares-its-call.md
    field: statement
    unstated: >-
      Which further keys an HTTP connector configuration carries beyond method, responseMap and
      statusMap, and how a call embeds a Subject attribute, the requester or a credential into
      it — the material is
      siegard-reconcile/http-connector-address-placeholder-gap.md, whose three independent
      judgments found src/src/http-connector/connector-call-descriptor.ts and
      connector-request-resolver.ts already stating this fact, unprompted, with no node holding
      it.
    decided: >-
      The same configuration also declares an address (required, non-empty string), and may
      declare a query and headers (each an object of string values) and a body of any shape; any
      of the four may embed one or more `${kind[:argument]}` placeholders naming a Subject
      attribute (`subject:<attribute>`), the requester (`requester`), or a credential read from
      environment configuration at resolution time (`credential:<name>`), substituted as plain
      text and never evaluated as code. A configuration missing its address, declaring query or
      headers malformed, naming an unrecognized placeholder kind, naming a placeholder with no
      required argument, or naming a Subject attribute or credential that resolves to nothing, is
      refused before any call is assembled — a fact about the call's own assembly, left
      undecided whether it becomes the same unavailable ending the missing-key case above
      declares, since the source code's own call chain (connector-request-resolver.ts's
      resolveConnectorRequest, called unguarded inside
      http-declarative-observation-source.adapter.ts's observeConcept) does not visibly catch
      what it throws before evidence-collection-stage.ts's own comment states observe-concept
      "never throws" for the four evidence-result endings — a code-level question this analysis
      does not resolve.
    why: >-
      Read directly from src/src/http-connector/connector-call-descriptor.ts's own JSDoc and
      connector-request-resolver.ts's own implementation (SUBJECT_PLACEHOLDER_KIND,
      REQUESTER_PLACEHOLDER_KIND, CREDENTIAL_PLACEHOLDER_KIND, the `${...}` pattern,
      IncompleteConnectorCallDescriptorError and ConnectorPlaceholderNotResolvedError), confirmed
      against domain/integration/connector-configuration.md (which already designates this rule
      as the HTTP connector's own statement of what its configuration's keys mean) and
      rules/integration/a-diagnostic-response-masks-a-resolved-credential.md (which already
      presumes a credential placeholder exists, without ever stating the mechanism itself). This
      is the same rule rather than a new one because domain/integration/connector-configuration.md
      names no second place for an HTTP connector's own statement to live. The refusal's
      eventual ending is left undecided rather than assumed to match the missing-key case: the
      material shows the code raising rather than ending, an apparent tension with this same
      node's own Description, and inventing a resolution to that tension here would be deciding
      code behavior this increment did not verify — it is named to a human rather than settled.
  - location: rules/integration/a-capability-input-schema-holds-a-well-formed-object.md
    field: statement
    unstated: >-
      How a capability already registered before this rule existed, whose stored input schema
      does not hold the properties/required shape this rule now demands, reads once something
      needs its declared input attributes — whether that malformed shape is a fault when read, or
      something else.
    decided: >-
      Read as declaring properties and required both empty — malformed is nothing declared, never
      a fault at read.
    why: >-
      Mirrors the reading a-capability-declares-well-formed-schemas already gives a schema that
      fails to parse at all, wherever a citation reads an output schema's content; the shape this
      rule states did not exist when an already-registered row was written, so a stored value now
      short of it is read the same way a stored value that never parsed already is, never invented
      and never faulted.
  - location: rules/knowledge/a-case-versions-input-requirements-are-derived.md
    field: statement
    unstated: >-
      The material's own decision D7 asks that a capability whose stored input schema does not
      currently declare this shape be marked for an operator in the same read that lists a case
      version's input requirements, without saying where that mark attaches — nested under an
      attribute, or apart from every attribute — and a capability read as declaring nothing (by
      this same rule's own posture) never names any attribute to nest it under.
    decided: >-
      The read names such a capability apart from the attributes, never nested under one.
    why: >-
      A capability that declares nothing never appears among any case-input-requirement's own
      capabilities, so nesting the mark under an attribute has nowhere to attach it; naming the
      capability on its own is the only place left where the fact is still reachable.
  - location: domain/knowledge/case-input-requirement.md
    field: attributes
    unstated: >-
      The material's own worked example nests, per asking capability, that capability's version,
      connector and answered concept, and a schema hint (the property's own declared type and
      description), alongside the attribute and whether it is required.
    decided: >-
      The element declares only attribute and required; the capability itself is a relationship,
      by reference, to domain/integration/capability — never a restatement of its version,
      connector or concept, each already that capability's own declared fact, and never the
      schema's hint, which is presentation guidance for an operator's panel rather than a domain
      fact this specification holds.
    why: >-
      constraints/the-stored-schema-mirrors-the-declared-model already refuses a column no
      attribute declares for a stored fact; the same reasoning, applied to a derived read instead
      of a stored one, refuses a field that only restates what the referenced capability's own
      aggregate already answers, and SPEC-001's own floor admits no technical artifact such as a
      schema's free-text hint.
  - location: rules/integration/an-http-connector-configuration-declares-its-call.md
    field: statement
    unstated: >-
      This specification's own decision log already named, and left to a human, whether the
      assembly-failure conditions this rule's own third sentence lists — a missing address,
      malformed query or headers, an unrecognized placeholder kind, a missing required argument,
      or a Subject-attribute or credential placeholder that resolves to nothing — end unavailable
      the same way the missing-key case above already does, or remain an undecided fact about the
      call's own assembly.
    decided: >-
      All of them end unavailable: the four shape failures (missing address, malformed query or
      headers, unrecognized placeholder kind, missing required argument) report an
      IncompleteConnectorCallDescriptorError; a placeholder that is well-formed but resolves to
      nothing reports the ConnectorPlaceholderNotResolvedError an-unresolvable-observation-ends-unavailable
      now names for that condition.
    why: >-
      The material supplied for this increment states, as a fact verified against the delivered
      code on 2026-08-27, that IncompleteConnectorCallDescriptorError already degrades to
      unavailable and is unaffected by this change, and asks only that the
      placeholder-resolves-to-nothing case join it rather than continue propagating as an unmapped
      exception; resolving the whole sentence the same way closes the standing decision this
      specification's own log already deferred to a human, rather than settling one fifth of it
      and leaving the rest exactly as undecided as before.
  - location: rules/knowledge/a-hypothesis-collects-at-least-one-concept.md
    field: statement
    unstated: >-
      What HTTP status and error identity a hypothesis-revision request is refused with when it
      collects no concept at all.
    decided: >-
      HTTP 422 reporting a HypothesisRevisionCollectsNoConceptError.
    why: >-
      This specification's own decision log already settled the idiom for exactly this shape of
      refusal — a well-formed request whose content would violate a business invariant takes 422,
      the reading rules/knowledge/a-case-has-at-least-one-hypothesis's own sibling refusal
      (ManifestWouldHoldNoHypothesisError) already took, and which the release and registration
      refusals repeat throughout this log. The corrective scope that surfaced this gap
      (work/revise-hypothesis-status-map-hotfix/intake/scope.md) independently proposes this same
      pairing for the identical reason and states the human already reviewed and authorized it —
      but a proposal awaiting the specification's own decision is not yet a fact the specification
      holds, so it is recorded as decided rather than merely carried over.
  - location: rules/investigation/a-simulation-result-is-stale-once-its-source-changes.md
    field: statement
    unstated: >-
      The material (work/case-simulation-frontend/intake/scope.md's own "D8" decision, delivered
      in use-case-simulation-cockpit.ts) states that a shown simulation result is marked stale on
      return from editing, and names the mechanism the delivered code actually uses (compare a
      hash/updated_at if one exists; otherwise always mark stale) -- but never states the
      underlying fact as one the specification holds, nor whether staleness reaches a
      simulate-hypothesis result's own evaluation as well as a simulate-case result's assessment,
      nor whether an edit to a hypothesis-revision the version manifests counts the same as an
      edit to the version itself.
    decided: >-
      Both count, and both kinds of shown result go stale together: a case-simulation result --
      its evaluations and, where one was produced, its assessment -- is stale once the case
      version it was produced from, or a hypothesis-revision that version manifests, changes
      after the result was produced. The specification names this as the fact to hold, not the
      hash/updated_at-or-else-always mechanism the delivered code detects it by, which stays the
      implementation's own engineering choice.
    why: >-
      The cockpit shows both a case-run's assessment and a hypothesis-run's evaluation from the
      same history, and D8 draws no line between them -- "mark the last run stale" reads as
      whichever run is currently shown, not one kind specifically. And case-terms-exist-in-the-glossary's
      own sibling reasoning already treats a case version's manifested hypothesis-revisions as
      part of what a version names, so an edit reaching either is one fact, not two.
  - location: constraints/no-route-enforces-authentication.md
    field: statement
    unstated: >-
      The material (frontend/app/src/shared/components/app-shell.tsx, delivered since the
      frontend-bootstrap initiative) discloses this build's no-authentication posture to every
      user on every screen, worded "No auth in this build" -- but no node states that the
      frontend owes this disclosure at all, and the material does not settle whether that exact
      wording is itself the fact the specification holds, or only the disclosure's substance.
    decided: >-
      The specification holds only the substance -- that the frontend discloses, on every
      screen, that this build enforces no authentication -- and states no wording. The frontend
      is free to word and re-word the disclosure without the specification moving.
    why: >-
      This project's own routing rule treats a control's label or a screen's exact copy as
      surface — changeable without deciding anything — while what a person learns or can do is
      not; requiring a specific sentence here would freeze presentation the same way SPEC-001's
      own floor already refuses to hold code to an implementation choice nobody but the code
      picked. The fact worth holding the frontend to is that the disclosure happens at all, on
      every screen, for as long as this constraint's own backend half stands.
  - location: rules/glossary/a-concept-declares-its-description.md
    field: statement
    unstated: >-
      The material (temp/desenv/greenfield-judgment-semantics-proposal.md) states that a new
      concept with no description is refused, with an HTTP 422 response and "a typed error", but
      does not name the error class.
    decided: ConceptDescriptionRequiredError
    why: >-
      Mirrors this specification's own naming convention for a well-formed-input refusal
      (rules/integration/a-capability-declares-well-formed-schemas' own
      CapabilitySchemaNotWellFormedError) — the class names the missing fact directly.
  - location: domain/investigation/evidence.md
    field: attributes.concept_description
    unstated: >-
      The material explains why fields may snapshot empty for an unavailable result (the
      capability was never resolved) without separately saying whether concept_description
      follows the same carve-out, since a concept's name — and therefore its glossary
      description — is known independently of whether its capability resolved.
    decided: >-
      concept_description is snapshotted for every evidence item regardless of result, including
      unavailable; only fields is empty there.
    why: >-
      The concept being collected is always known before the capability read is attempted
      (evidence-collection-stage.ts resolves the concept's evidence by first knowing which
      concept it is), so the glossary lookup that fills concept_description has nothing blocking
      it that the capability read blocks; carving it out the same way as fields would degrade a
      fact nothing prevents recording.
  - location: domain/investigation/evidence.md
    field: attributes.elapsed_ms
    unstated: >-
      migrations/0011-investigation-evidence-elapsed-ms.sql's own comment states the assumption
      that no environment holds a pre-existing investigation_evidence row when elapsed_ms
      becomes required, so nothing anywhere states what an evidence item collected before this
      attribute existed reads as for it. That assumption held for every environment this
      migration was run against until now: this project's own production database already held
      four real investigation_evidence rows, collected before elapsed_ms existed, discovered
      when applying that migration against it failed on exactly those rows.
    decided: >-
      An evidence item collected before elapsed_ms existed reads it as 0, meaning not measured —
      never a read failure, never an invented duration.
    why: >-
      Mirrors this specification's own already-decided reading for concept_description on the
      very same element (a fact collected before its own attribute existed degrades to an
      honest, meaningless-by-construction value rather than failing the read or inventing a real
      one) — 0 is not a claim that the collection took no time, the same way an empty
      concept_description is not a claim the concept has no meaning; both are the specification's
      own marker for "this was never recorded," in the type each attribute already holds.
  - location: domain/investigation/evidence.md
    field: attributes.fields
    unstated: >-
      What an evidence item collected before the fields attribute existed reads for it when the
      record is read or returned over the wire.
    decided: >-
      An evidence item collected before fields existed as an attribute reads it as no fields at
      all — the same honest-empty value the element already sanctions for a different condition
      (a capability that never resolved) — never a read failure and never invented semantics.
    why: >-
      Mirrors this specification's own already-decided reading for elapsed_ms on the very same
      element (a fact collected before its own attribute existed degrades to an honest,
      meaningless-by-construction value rather than failing the read or inventing one) — a
      collected-before-the-attribute-existed record is the identical migration-backfill
      condition elapsed_ms already answered, and the value chosen is the one the element's own
      text already assigns to its other honest-degradation condition for this same field
      (capability never resolved), so no second value is introduced for a second reading of it.
  - location: domain/investigation/evidence.md
    field: attributes.concept_description
    unstated: >-
      What an evidence item collected before the concept_description attribute existed reads
      for it when the record is read or returned over the wire.
    decided: >-
      An evidence item collected before concept_description existed as an attribute reads it as
      an empty string — the same honest-empty value the element already sanctions for a
      different condition (a concept that had not yet declared a description) — never a read
      failure and never invented semantics.
    why: >-
      Mirrors this specification's own already-decided reading for elapsed_ms on the very same
      element (a fact collected before its own attribute existed degrades to an honest,
      meaningless-by-construction value rather than failing the read or inventing one) — a
      collected-before-the-attribute-existed record is the identical migration-backfill
      condition elapsed_ms already answered, and the value chosen is the one the element's own
      text already assigns to its other honest-degradation condition for this same field (a
      concept with no declared description), so no second value is introduced for a second
      reading of it.
  - location: rules/investigation/presentation-reads-the-evidence-snapshot.md
    field: statement
    unstated: >-
      What an operator-facing surface shows as a collected evidence item's semantics — its
      concept_description and its field semantics — is the item's own snapshot exactly as the
      simulation or investigation response carries it; no glossary or capability-registry read
      is issued at presentation to enrich, refresh or substitute for that snapshot.
    decided: >-
      An operator-facing surface presenting a collected evidence item shows its
      concept_description and its field semantics exactly as that item's own snapshot carries
      them; it issues no glossary or capability-registry read at presentation to enrich,
      refresh or substitute for that snapshot.
    why: >-
      rules/investigation/judgment-reads-the-evidence-snapshot already states this discipline
      for one consumer — a hypothesis's judgment — by name, reasoning that a live glossary or
      capability-registry read can silently disagree with what was actually collected;
      domain/investigation/evidence.md's own Description states the snapshot itself is fixed at
      collection and never re-read afterward, but that speaks to the record's own persisted
      immutability, not to what a second reader is permitted to additionally fetch, so an
      operator-facing surface was left without its own addressable statement of the identical
      constraint. The frontend's own intake material designs the panel to display exactly the
      snapshotted concept_description and fields with honest degradation for a legacy concept or
      an unresolved capability (never inventing a value), which is this same discipline already
      assumed by the scope that was cut — stating it here gives it the addressable home the
      judgment-specific rule already has, rather than leaving a second consumer of the identical
      record to a silent assumption.
  - location: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability.md
    field: statement
    unstated: >-
      Which configuration a connector test run exercises — the configuration text an operator
      currently has entered in an authoring surface, or the configuration currently registered
      under that connector name — is not stated. The rule scoped the test to an already-registered
      capability and the connector-diagnostics contract says the call exercised is "a connector
      configuration's own", but no node says which configuration answers to that phrase when an
      operator is holding edited, unsaved text in front of the same connector name.
    decided: >-
      The configuration currently registered under the named connector, read at the moment of the
      test — never configuration text held unsaved in an authoring surface or supplied alongside
      the test request.
    why: >-
      Every check this specification holds a connector configuration to is a registration-time gate
      (a-connector-configuration-holds-a-well-formed-object,
      a-connector-placeholder-is-declared-by-its-capability), so exercising unregistered text would
      issue a real outbound call from a configuration nothing had ever refused — the same exposure
      this rule already closes on the capability side by admitting only an already-registered,
      read-only capability, and the placeholder check it reports "for the pairing under test" has no
      registered pairing to check when one side was never written. Nothing is lost to an operator:
      register-connector is create-or-replace, so testing edited text costs one registration, which
      is also what makes the tested configuration the same one an investigation would actually run.
  - location: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability.md
    field: statement
    unstated: >-
      Which Subject attributes a connector test collects values for, and who names them, is not
      stated. The rule fixes the capability and the configuration a test exercises, and
      contracts/integration/connector-diagnostics says the call runs "against a subject assembled
      the same way any other observation assembles one" — but an ordinary observation's set is
      assembled by the entry point from what the pinned case version requires
      (domain/investigation/subject, a-diagnosed-subject-covers-its-cases-required-attributes),
      and a test names no case version, so no node says where the test's set comes from or
      whether an operator may name an attribute of their own alongside its value.
    decided: >-
      The subject a test assembles carries exactly the Subject attributes named by the
      ${subject:<attribute-name>} placeholders embedded in the registered configuration under
      test, one attribute-value per distinct attribute those placeholders name; the operator
      supplies each value, the attribute names are read from those placeholders rather than
      stated by the operator, and an attribute those placeholders do not name is no part of that
      subject.
    why: >-
      The placeholders are the only statement anywhere of which Subject attributes this
      configuration's call actually reads (an-http-connector-configuration-declares-its-call), and
      with no case version in play nothing else could derive the set — the alternative sources
      each fail on their own terms: a case's requirements presuppose a case the test does not
      name, and the capability's whole input schema properties would collect values for
      attributes this configuration never reads, since a-connector-placeholder-is-declared-by-its-capability
      holds the placeholders inside those properties without requiring the two to coincide. An
      operator-named attribute is refused by the same reasoning: the name is a governed value
      (a-subject-attribute-is-drawn-from-the-glossary, domain/glossary/subject-attribute) and a
      name the operator authored would either duplicate a placeholder's own or name an attribute
      the call never resolves, in both cases producing a subject that diagnoses a seam
      (a-connector-placeholder-is-declared-by-its-capability's own check "for the pairing under
      test") the registered pairing does not actually have. Stated on this rule rather than a new
      node because this rule is already where every fact about what a test exercises lives, and
      the log's own precedent extended this same field for the sibling question of which
      configuration answers to the test.
  - location: rules/investigation/a-composed-subject-presents-every-case-input-requirement.md
    field: statement
    unstated: >-
      Whether the subject-attribute inputs an operator is asked to supply before a diagnose or
      simulate call must be drawn from the case version's own authoritative case-input-requirements,
      or may instead be inferred some other way (e.g. scanning a connector's own call-assembly
      detail for a literal placeholder) -- and whether an attribute a case-input-requirement leaves
      optional is presented as an input at all, or only reachable by a manual addition.
    decided: >-
      The interface presents one input per case-input-requirement, required and optional alike,
      drawn only from that authoritative set, with only the required flag gating submission.
    why: >-
      A connector's own call-assembly detail is a weaker, sometimes-incomplete signal of what a
      capability's input schema actually requires -- a capability may name an attribute required
      without ever embedding it as a literal placeholder in its connector's own call -- and the
      authoritative read (case-input-requirements) already exists and is already trusted for
      exactly this purpose by a diagnose's own door refusal; a second, weaker derivation for the
      same fact is a silent, sometimes-wrong specification of its own. Presenting optional
      attributes too, rather than hiding them behind a manual control, lets the composer discover
      every attribute a currently-registered capability could use without already knowing its name
      from the glossary.
  - location: rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses.md
    field: statement
    unstated: >-
      Whether a simulate-case or simulate-hypothesis call is refused, the same way a diagnose is,
      for a subject missing an attribute a case-input-requirement of the pinned case version names
      required, or whether it is treated more permissively, letting the affected concept degrade to
      unavailable instead.
    decided: >-
      Simulate is never refused for this reason; the affected concept's own observation degrades to
      unavailable exactly as an optional attribute's own absence already does, and the call itself
      proceeds.
    why: >-
      Simulate is open to a draft case version specifically because a curator composing or testing
      one wants to see how it behaves before every input is wired up -- an-unresolvable-observation-
      ends-unavailable already exists to make exactly this kind of gap visible rather than blocking
      work on it, and a hard refusal here would take away the curator's own way of discovering the
      gap through the same run that would otherwise show it to them.
  - location: rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability.md
    field: statement
    unstated: >-
      Whether the interface assembling a subject discloses, to the person composing it, a
      capability the case-input-requirements read already names apart from its requirements for
      holding no well-formed input schema, or whether that fact stays a concern only for whoever
      separately curates the case version.
    decided: >-
      The interface discloses that capability's identity to the person composing the subject, the
      same read that already surfaces it.
    why: >-
      The read that names these capabilities apart from the requirements already exists exactly so
      "an operator can find and re-register it" (contracts/knowledge/case-input-requirements' own
      stated reason); withholding that same fact from the person actually looking at the subject
      being composed would waste the one read that already computed it, and the curator composing a
      subject for simulate is ordinarily the same person who could act on it.
  - location: rules/investigation/a-composed-subject-presents-every-case-input-requirement.md
    field: statement
    unstated: >-
      Whether the interface presenting one attribute input per a pinned case version's own
      case-input-requirements discloses, alongside each input, the capability asking for that
      attribute and that capability's connector -- and, where more than one currently-registered
      capability asks for the same attribute, whether every asking capability is named or only one.
    decided: >-
      The interface names, alongside each attribute input, every capability that requirement holds --
      each by its own name and version together with that capability's own connector -- never only one
      of them where more than one currently-registered capability asks for the same attribute.
    why: >-
      This is what the composer can learn, not how a panel is arranged: which capability asks for an
      attribute, and through which connector it will be used, tells them which observations a value
      they leave empty will degrade (a-simulated-subject-missing-a-requirement-degrades-not-refuses,
      an-unresolvable-observation-ends-unavailable) -- the only way a simulate whose gaps degrade
      rather than refuse is legible before the call. Naming every asker rather than one follows the
      authoritative set itself: domain/knowledge/case-input-requirement holds every currently-registered
      capability asking for the attribute at cardinality 1..*, and a-case-versions-input-requirements-are-derived
      derives that plurality deliberately, so picking one among several would be a silent,
      sometimes-wrong reduction of a set the derivation keeps whole. Stated on this rule rather than a
      new node because this rule is already where every fact about what the composing interface
      presents per requirement lives, and the sibling a-composed-subjects-interface-discloses-a-malformed-capability
      shows the same interface disclosing a capability's identity to the same person for the same
      reason. No field is added to domain/knowledge/case-input-requirement: the standing decision at
      that location's attributes keeps name, version, connector and concept as the referenced
      capability's own facts, and this statement reaches them by that reference, restating none --
      unlike the input schema's free-text hint, which that same entry placed outside the specification
      as presentation guidance and which this decision does not bring back in.
  - location: rules/investigation/a-pending-simulation-call-is-not-dispatched-again.md
    field: statement
    unstated: >-
      No node states whether the interface assembling a subject may have more than one simulate-case
      (or more than one simulate-hypothesis) call outstanding for the same subject at once, nor what a
      second dispatch does while the first has not yet ended.
    decided: >-
      A new policy: while a simulate-case or simulate-hypothesis call the interface dispatched for a
      subject has not yet ended, a further dispatch of that same operation for that subject issues no
      request at all and leaves the pending run untouched; the guard is keyed by the operation and the
      subject together, and the operation is dispatchable again the moment the pending call ends, in a
      returned result or in a refusal alike.
    why: >-
      Blocking rather than allowing follows from what a simulation deliberately does not produce:
      a-simulation-writes-no-investigation keeps every run out of the record, so two concurrent runs of
      one operation over one subject are indistinguishable afterwards and whichever returns last
      silently replaces what the curator was reading. The block is affordable because the run is a
      bounded on-screen wait, not an open-ended job, and the operation frees the instant the pending
      call ends -- including on a refusal, since a refusal is an ending too. It is keyed per operation
      and per subject, rather than one lock over the whole screen, because the two operations answer
      different questions and a pending one says nothing about a dispatch of the other, while a second
      subject composed elsewhere is a different subject and blocks nothing.
  - location: rules/investigation/a-simulation-carries-its-requester.md
    field: statement
    unstated: >-
      Whether a simulate-case or simulate-hypothesis call carries a requester at all, where its value
      comes from, and what happens to a call that carries none.
    decided: >-
      Both operations carry the requester in the call's own payload, required on each, and that is the
      requester whose authorization scope the call's collection runs in; a call whose payload carries
      no requester, or an empty one, is refused before any collection, taking the refusal every route
      already gives a body failing its declared shape rather than a refusal of its own.
    why: >-
      Decided the same way this specification already decided the identical question for diagnose --
      the caller supplies the requester directly in the call's own payload with no further resolution
      inside the domain. Required rather than optional because a simulation runs the very same
      collection a diagnosis runs, and collection-runs-in-the-requester-scope forbids the only fallback
      an absent requester leaves, the service's own scope. The payload is the only available home: the
      simulation writes no investigation, so no record can hold it and no read can recover it. No new
      status or error name is stated, because a missing required body field is a shape failure the
      standing validation constraint already answers for every route.
  - location: rules/investigation/a-composed-subject-presents-every-case-input-requirement.md
    field: statement
    unstated: >-
      What the interface assembling a subject before a diagnose, simulate-case, or
      simulate-hypothesis call presents where the pinned case version's own case-input-requirements
      read names no requirement at all -- whether that emptiness is stated to the person composing
      the subject explicitly, or left as an unexplained absence of inputs. The rule's own statement
      is quantified per requirement and so says nothing when there is none, and the sibling
      disclosure a-composed-subjects-interface-discloses-a-malformed-capability reaches only the
      subset of empty sets caused by a malformed input schema.
    decided: >-
      Where the read names no requirement at all, the interface states that emptiness explicitly to
      the person composing the subject -- that the pinned case version's own case-input-requirements
      name no attribute -- rather than leaving them an unexplained absence of inputs. Nothing else
      changes: no call is blocked or refused for it, and no field is added to any element.
    why: >-
      An empty set is reachable while every capability involved is well-formed and every concept
      singly answered -- a-capability-input-schema-holds-a-well-formed-object calls an empty
      properties object a valid declaration for a capability whose connector reads nothing from the
      subject, and a-case-versions-input-requirements-are-derived contributes nothing for an
      unanswered or multiply-answered concept -- so the malformed-capability disclosure covers only
      part of it and the remainder would reach the composer as silence. A bare absence of inputs is
      indistinguishable from a failed read, a mispinned version or an unfinished load, and the
      composer must still assemble a subject carrying at least one attribute-value
      (a-subject-carries-at-least-one-attribute), so the emptiness is exactly the fact they need in
      order to know that reaching for a glossary attribute themselves is the whole of what is left
      to do. This follows the specification's own precedent in the same direction twice:
      scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly decides the structurally
      identical question -- a real, reachable zero over a derived or stored set is stated rather
      than answered as an unexplained empty listing -- and differs only in governing a read's own
      answer where this governs what the composing interface presents;
      rules/knowledge/a-release-refusal-with-no-named-violation-says-so is on point for its
      principle rather than its shape, since it concerns a refusal and nothing here refuses, but its
      reasoning that what someone is told at an outcome is the business's own decision, and that an
      unexplained emptiness leaves the reader unable to tell absence from breakage, transfers
      unchanged.
  - location: rules/glossary/a-registered-concept-is-never-removed.md
    field: statement
    unstated: >-
      Whether registering concepts may remove a concept already held, and whether a concept a
      registered capability answers, a collected evidence item or its citation names, or a case
      version's manifested hypothesis-revision collects may ever be removed from the glossary --
      contracts/glossary/glossary-authoring states only that register-concept creates or replaces
      the named concept, and is silent on every concept the call does not name.
    decided: >-
      Registering concepts adds a concept at a new name or replaces the concept already held at
      that name, and removes no concept already held; a concept a registered capability answers,
      a collected evidence item or its citation names, or a case version's manifested
      hypothesis-revision collects is never removed from the glossary.
    why: >-
      Decided the same way this specification already decided the identical question for the
      sibling vocabulary outcome (rules/glossary/the-non-conclusion-outcomes-precede-the-first-case,
      itself decided from a reconciliation finding recorded at this log's own earlier entry for
      that rule): a prior reconciliation
      (siegard-reconcile/reconcile-glossary-files.md) found the delivered backend's
      writeConcepts stating this exact permanence while no node held it, citing a plan task
      (task/glossary-concept-write-upsert-hotfix) that does not outlive its own closed plan. The
      fact is not an arbitrary code choice: every foreign key this schema declares against
      concepts(name) -- capabilities.concept, investigation_evidence.concept,
      investigation_evaluation_citations.concept, concept_accepts.concept_name,
      hypothesis_collects.concept_name, and the case-version lifecycle schema's own
      collected-concept rows -- carries no ON DELETE CASCADE, so deleting a referenced concept
      row is a constraint violation the database itself refuses. Domain-level, the same
      conclusion already follows from rules/knowledge/case-terms-exist-in-the-glossary (a
      hypothesis-revision naming a concept the glossary does not hold is refused) joined with a
      released hypothesis-revision's own immutability: removing a concept a released
      hypothesis-revision collects would strand a reference that rule already requires to keep
      resolving. constrains lists domain/integration/capability, domain/investigation/evidence
      and domain/investigation/citation for the same reason case-terms-exist-in-the-glossary
      lists domain/knowledge/case-version and domain/knowledge/hypothesis-revision: each holds an
      attribute typed domain/glossary/concept whose continued resolution this policy protects.
  - location: rules/investigation/no-stage-aborts-on-its-deadline.md
    field: statement
    unstated: >-
      The rule already declares persistence the single stage that does not degrade and states that
      its failure "is an error to the requester", and scenarios/investigation/no-response-without-a-record
      states that the requester receives an error rather than the assessment -- but no node anywhere
      in the specification names which error that is or what the diagnose route answers with, so the
      error's name and its HTTP status existed only in code.
    decided: >-
      A diagnose whose persistence stage does not settle its write within that stage's own bound is
      answered with an HTTP 500 response reporting an InvestigationWriteDeadlineExceededError.
    why: >-
      Home: the same context's a-diagnosed-subject-covers-its-cases-required-attributes already
      states the diagnose route's own refusal -- status and error name together -- on a Rule, and this
      rule is the one node that already carries the domain half of this exact fact ("whose failure is
      an error to the requester"); stating the identity anywhere else would put one refusal in two
      houses. Name: InvestigationWriteDeadlineExceededError is the condition already named for
      exactly this failure in the material this fact arose from, so pairing it with a status fixes
      the missing half rather than minting a second name for a condition already named -- the same
      move the log's own CapabilityIdentityNotFoundError entry made. Status: 500 is this
      specification's established answer for a server-side condition the requester neither caused nor
      can correct by changing the request -- its only two other such refusals, DuplicateConceptAnswerError
      and DuplicateGlossaryNameError, both answer 500 -- whereas 503 or 504 would additionally assert
      that the condition is transient and worth retrying, a fact no node holds; the one place this
      specification tells a caller when to come back is the rate limit's own Retry-After, and nothing
      here can name such an instant.
  - location: rules/investigation/no-stage-aborts-on-its-deadline.md
    field: statement
    unstated: >-
      The rule states that persistence makes at most two write attempts and that both spend from
      the one stage bound -- the minimum of persistence's nominal two seconds and the time
      remaining before the propagated deadline when persistence begins -- but no node states how
      that one bound is divided between them, i.e. what bound the first attempt is itself held to,
      which is what decides whether any of the stage bound can ever be left for the retry.
    decided: >-
      The first attempt is held to the whole of persistence's stage bound -- it runs until it
      settles or until that bound elapses, whichever comes first, and no part of the bound is
      reserved; the retry therefore runs only where the first attempt failed before the bound
      elapsed, within whatever of the bound then remains.
    why: >-
      Reserving a slice for the retry would abandon a first write that was still going to land
      inside the bound, in the one stage the specification refuses to let degrade (no response
      exists without a record), and would put a retry in flight behind an abandoned but possibly
      still-committing write, which an-investigation-is-written-once admits no room for. The
      specification never subdivides a stage bound anywhere else -- a-slow-capability-yields-to-the-collection-budget
      has one call run to the stage's whole seven seconds with nothing held back, and the judgment
      sibling's retry (a-foreign-citation-is-refused) likewise follows a response that settled in
      failure and runs only "if the remaining deadline admits it," never a call cut short to make
      room. This reading keeps the retry meaningful -- a write that errors early retries with
      nearly the whole bound left -- while leaving the already-stated case ("a first attempt that
      consumes all of it leaves no retry to run") as exactly what an overrunning write yields.
  - location: rules/investigation/no-stage-aborts-on-its-deadline.md
    field: statement
    unstated: >-
      The rule already states that persistence's stage bound is the minimum of its nominal budget and
      the time remaining before the propagated deadline when persistence begins, and its own first
      clause makes an already-reached deadline reachable at persistence (collection and judgment
      record and continue rather than abort, so time may be past the deadline by the time control
      arrives). No node states what that stage does when the bound is zero or less -- whether a write
      is still issued into an effectively-zero window and left to time out into the already-stated
      retry-then-error path, or whether the store is never called at all.
    decided: >-
      Where persistence's stage bound is zero or less at the moment persistence begins, no write
      attempt is made at all and the store is never called; the HTTP 500 response reporting an
      InvestigationWriteDeadlineExceededError, already stated for a persistence that settles no
      write, is raised at once.
    why: >-
      The requester's answer is identical either way, so the only thing an issued write buys is a
      call that cannot settle inside a window of zero and is therefore abandoned the instant it is
      made -- leaving a write running past the response that told the requester no record exists,
      which is the same in-flight-behind-an-abandoned-write harm this rule's own rationale already
      refuses when it forbids truncating the first attempt, and which an-investigation-is-written-once
      leaves no room for. Whether such a race resolves as a write or as a timeout is decided by
      scheduling rather than by anything the business chose, and a specification that admits it would
      be stating a behavior nobody can hold the system to. The specification already reads a
      non-positive bound this way elsewhere in its own words -- a-capability-declares-its-contract's
      rationale that "a timeout of zero or less bounds nothing -- there would be no time left for a
      call to answer in" -- so refusing without calling extends a reading this specification holds
      rather than minting a second one. "At most two write attempts" already admits none, so this
      fixes which of the readings it admits holds, and constraints/the-deadline-is-an-absolute-propagated-instant's
      own fitness (no stage granted more than the remaining time) is the one a stage granted zero
      time would otherwise defeat by running on regardless.
  - location: rules/investigation/an-investigation-is-written-once.md
    field: statement
    unstated: >-
      The rule states that an investigation is written once and never mutated, and
      no-stage-aborts-on-its-deadline's own rationale leans on it ("would put a second attempt in
      flight behind an abandoned one that an-investigation-is-written-once leaves no room for"),
      but no node states what actually keeps a second record for one investigation out of the
      store, nor what a further write attempt means when it finds a record for that investigation
      already there -- whether that attempt is a write that settled or one that did not, which is
      what decides between answering the requester from the record and answering the
      InvestigationWriteDeadlineExceededError the rule reserves for a persistence that settles no
      write.
    decided: >-
      The investigation's own id identifies at most one record, so a write of an investigation the
      store already holds a record for persists no second record and counts as a write that
      settled.
    why: >-
      Home: this is the one node that states the write-onceness, and the one the persistence
      rule's own rationale names as leaving no room for a second attempt behind an abandoned one;
      stating the mechanism in the persistence rule or in a new rule of its own would put one fact
      in two houses, and unlike a-slug-identifies-one-case (which had no existing rule to extend
      once the file medium went away) the invariant this belongs to is already written. Mechanism:
      id is the investigation's own required attribute and the only property of the record that is
      fixed before any attempt is made and identical across both of the attempts
      no-stage-aborts-on-its-deadline admits, so it is the one thing an attempt can be refused on;
      an ordering or in-flight check cannot serve, because the premise of the fact is precisely
      that the first attempt's outcome is unknown to the caller while it may still be committing.
      Settled: a record for that investigation exists and is the very record this request built,
      so the-response-follows-the-record's condition ("only after the investigation is written")
      is met in full; reading it as unsettled would answer an HTTP 500
      InvestigationWriteDeadlineExceededError to a requester whose investigation is durably
      written -- telling them nothing was recorded when something was, and discarding the referral
      that the record exists to have acted upon -- and would make the requester's answer depend on
      whether an abandoned write happened to land before or after the retry looked, which is
      decided by scheduling rather than by anything the business chose, the same reasoning this
      log already used in refusing to issue a write into a non-positive bound.
  - location: domain/investigation/citation.md
    field: attributes.field
    unstated: >-
      The material behind rules/investigation/a-cited-field-exists-in-the-capability-output-schema
      states that a citation's field must exist among its own cited evidence item's snapshotted
      field names, and scenarios/investigation/a-collection-timeout-degrades-to-no-data already
      requires a no-data evaluation to cite the evidence responsible for it. No node states what
      such a citation's field holds when the item it names snapshotted no fields at all -- the
      honest-empty reading domain/investigation/evidence already gives an unresolved capability.
      The material is siegard-reconcile/backend-investigation-glossary-connector-cluster-code-drift.md,
      whose judges over judgment-stage.ts and anthropic-hypothesis-evaluator.adapter.ts both
      reported an empty-string field on a no-data citation as a value the invariant does not admit.
    decided: >-
      field is required only where a citation grounds a confirmed or refuted verdict; a citation
      naming which evidence a no-data verdict cites carries no field at all.
      rules/investigation/a-cited-field-exists-in-the-capability-output-schema's own condition now
      reads over a citation that carries one, and states the no-data case explicitly.
    why: >-
      A citation's whole purpose, per the element's own Responsibility, is to "point at exactly
      one place in the evidence that grounds a verdict" -- a no-data citation grounds no verdict at
      all, it names which absence caused the inconclusive one, so demanding a field of it asks for
      a fact the evidence it cites never had. domain/investigation/evidence already answers the
      identical absence honestly rather than inventing a value ("a concept whose capability never
      resolved snapshots no fields at all"), and domain/investigation/evaluation and
      domain/investigation/durations already use conditional presence for a per-call fact that
      exists only when its triggering event happened; making field optional on the same condition
      extends a reading this specification already holds three times over, rather than a fourth,
      inconsistent one (an invented sentinel the invariant would then have to carve an exception
      for).
  - location: domain/investigation/durations.md
    field: attributes.total
    unstated: >-
      rules/investigation/an-answer-arrives-within-the-declared-deadline states a twenty-second
      declared total, and constraints/the-deadline-is-an-absolute-propagated-instant's own fitness
      is measured against it ("no response later than the declared total"), but no node states
      what the stored total attribute itself counts: the whole call's real elapsed time, or the sum
      of the per-stage figures the same element already declares. The material is
      siegard-reconcile/backend-investigation-glossary-connector-cluster-code-drift.md, whose
      judges over investigation-pipeline.ts, simulate-hypothesis-pipeline.ts and
      relational-investigation-store.repository.ts all read total as computed by summing
      collection, judgment and (where present) writing.
    decided: >-
      total is the whole call's own real elapsed time, from the same entry instant the deadline
      was propagated from to the moment the response is ready -- never the sum of the per-stage
      figures.
    why: >-
      constraints/the-deadline-is-an-absolute-propagated-instant's own Description already states
      the reason a sum cannot serve: "Summing stage budgets and calling the sum a deadline leaves
      nothing for the overhead between stages." A total defined as a stage-figure sum inherits
      that same gap in the other direction -- it excludes the overhead and margin, the persistence
      stage, and any time between stages, so a run that genuinely overran the declared total could
      report one that reads under budget, defeating the one fact this attribute exists to answer
      ("who is exceeding the declared total budget"). Measuring from the same entry instant the
      deadline itself is measured from is the reading that keeps the two comparable.
  - location: rules/knowledge/a-collected-concept-declares-a-ttl.md
    field: statement
    unstated: >-
      The rule already states the default ttl a registration stating none takes, but nothing
      states what a stated ttl of zero or a negative number answers -- domain/glossary/concept
      declares ttl only `type: integer`, `required: true`, with no floor. The material is
      siegard-reconcile/backend-investigation-glossary-connector-cluster-code-drift.md, whose judge
      over register-concept.dto.ts reported the DTO's own `.positive()` bound as a fact no node
      states.
    decided: >-
      A stated ttl is a positive integer; zero or less is refused the same way a non-integer one
      already is, distinct from the absent-ttl default.
    why: >-
      This specification already reads an identical attribute this exact way:
      rules/integration/a-capability-declares-its-contract states of a capability's timeout that
      "a timeout of zero or less bounds nothing -- there would be no time left for a call to answer
      in", decided into that rule for the identical reason (decision-log, timeout.type entry) after
      an earlier reconciliation reported the same `.positive()` pattern on
      register-capability.dto.ts as unstated. A ttl of zero or less bounds no freshness tolerance
      at all, the same way a timeout of zero or less bounds no call -- the reasoning transfers
      without alteration, and reading it the other way here would leave two structurally identical
      attributes governed by two different rules for the same kind of value.
  - location: domain/investigation/durations.md
    field: attributes.total
    unstated: >-
      This same field was decided moments earlier in this log as "the moment the response is
      ready", but an execution-contract-binder judging a plan-work task against that text found it
      physically impossible for an investigation: durations is one of the attributes
      buildInvestigationOptions assembles onto the Investigation record before writeWithinDeadline
      persists it (src/investigation/run-diagnosis.ts), so total must already hold a value before
      persistence begins, and persistence is what stands between that assembly and the response
      becoming ready. The prior decision asked total to cover a span (the persistence stage, and
      everything after it) that has not happened yet at the instant total is fixed.
    decided: >-
      total is the real elapsed time from the run's own entry instant to the moment the record
      carrying this same durations value is assembled -- before persistence, for an investigation;
      before the answer leaves, for a simulation, which persists nothing. It still excludes never
      the sum of collection, judgment and writing, but for an investigation it now necessarily
      excludes the persistence stage itself, since durations cannot describe a stage that has not
      yet run when it is fixed.
    why: >-
      The binder's finding is not a second reading to weigh against the first -- it is a
      contradiction the first reading cannot survive, so this entry corrects rather than
      supersedes the original motivation for deciding total at all (a stage-figure sum still loses
      the overhead and the inter-stage gaps constraints/the-deadline-is-an-absolute-propagated-instant's
      own rationale names). The corrected endpoint is the latest instant the record itself proves
      total can actually be measured to: assembly, which precedes every use the record is put to
      afterward. Naming that instant, rather than "the response", is what makes the attribute
      answerable by the code that has to compute it.
  - location: rules/investigation/an-empty-ticket-reference-is-no-ticket-reference.md
    field: statement
    unstated: >-
      Whether an investigation's ticket_ref may hold the empty string as a value, or whether a
      ticket reference given as the empty string is the absence of a ticket reference. The
      element declares ticket_ref optional and its Description says not every diagnose call
      carries a ticket, but no node anywhere says what an empty one is -- the specification's
      four empty-string readings are each scoped to their own element (a capability's
      attributes, a connector configuration's name, a subject's attribute-value, a simulation's
      requester) and none reaches this attribute.
    decided: >-
      An empty string is no ticket reference at all -- ticket_ref never holds it. A diagnose call
      giving an empty ticket reference records no ticket reference and reads back none, and the
      call is not refused for it.
    why: >-
      Mirrors this specification's own established idiom for an empty string, stated four times
      and never contradicted: a-capability-declares-its-contract ("an attribute that is absent or
      an empty string is undeclared"), a-connector-configuration-names-its-connector ("An empty
      string is treated as no name at all"), a-diagnosed-subject-covers-its-cases-required-attributes
      and a-simulation-carries-its-requester (each reading "no value, or an empty one" as one
      absence). ticket_ref's only stated role is correlation with the ticketing system for
      traceability and audit, participating in no matching or deduplication logic, and an empty
      string correlates with nothing -- so admitting it as a value would give the audit link two
      indistinguishable encodings of nothing rather than one honest absence. The refusal half of
      the sibling rules does not carry across, because those attributes are required and this one
      is not: absence is already a decided, lawful state of ticket_ref, so an empty string
      reaching it needs no new refusal, only the same reading. Stated as a rule constraining
      domain/investigation/investigation rather than added to the element's Description, since
      the element schema's attribute declaration admits only name, type, required and many, and
      an operative claim living only in a Description has no addressable home.
  - location: rules/investigation/the-consolidation-answer-states-its-register.md
    field: statement
    unstated: >-
      What the assessment-consolidator's answer carries. The port's own node enumerates the text
      plus the call's usage, elapsed_ms and prompt and stops there, while
      domain/investigation/assessment requires a register the writing call settled on "whichever
      side supplied it" -- so no node states that the port's answer itself names which register
      the call used, nor what it names where the pinned case version declares none.
    decided: >-
      A consolidation call's answer states the one register that call used to produce the text --
      the pinned case version's own declared register where it holds one, the register the
      consolidation adapter defaulted to where the version declares none -- alongside the text and
      that call's own usage, elapsed_ms and prompt; held as a new invariant constraining
      domain/investigation/assessment-consolidator and domain/investigation/assessment.
    why: >-
      domain/knowledge/case-version already leaves an absent register to "whatever register its
      own adapter defaults to", a fact settled where the call ran and unknowable to a caller in
      advance, while domain/investigation/assessment already requires the register on every
      assessment; the call's own answer is therefore the only supply path that can satisfy that
      requirement in the default case, which is why the answer states it rather than a caller
      reconstructing it. Stated unconditionally rather than only in the default case, so one
      answer shape serves both and a reader never has to work out which side supplied the
      register this time -- mirroring usage, elapsed_ms and prompt, which already ride this same
      answer and are already required on the same element for the same "consolidation always
      runs" reason. A rule holds it because a domain-service declares no return in its own
      frontmatter, so a rule's statement is the only addressable home the fact's shape admits; the
      port node's Responsibility prose is brought into agreement with it and decides nothing on
      its own.
  - location: rules/investigation/a-citation-stays-within-the-hypothesis-collects.md
    field: statement
    unstated: >-
      Whether the containment requirement is enforced over an evaluation produced without any
      judgment call -- inconclusive with reason no-data, whose citations name the evidence whose
      result is not ok -- and what the system answers where such a citation names a concept
      outside the judged revision's collects, given the rule's own remedy (refuse the response,
      one retry, fall back to judgment-failure) presupposes an evaluator response that does not
      exist there. The rule's statement was unqualified over every evaluation while its rationale
      and its only scenario (scenarios/investigation/a-foreign-citation-is-refused) both speak of
      the evaluator's response, and scenarios/investigation/a-collection-timeout-degrades-to-no-data
      requires a no-data evaluation to cite evidence without saying what holds that citation to
      the collects.
    decided: >-
      The containment holds over every evaluation, whatever produced it, and is not weakened for
      a no-data one; where the evaluation was produced without any judgment call, it is held by
      drawing those citations from the evidence collected for that same revision's own collects,
      rather than by any check over a response -- so no refusal and no retry runs on that path,
      and the refuse-and-retry remedy is scoped to an outcome an evaluator returned.
    why: >-
      Home and form follow the sibling invariant
      rules/investigation/a-cited-field-exists-in-the-capability-output-schema, which states its
      own no-data case inside its own statement rather than in a second node. The remedy's scope
      is not new: this rule's own rationale is that a foreign citation is an invented reference
      because the judgment prompt contained nothing else, and a-foreign-citation-is-refused's
      given is already "the evaluator's response" -- a no-data evaluation went through no prompt
      and returned no response, so neither the refusal nor the retry has anything to act on. The
      containment itself stays universal rather than being exempted for no-data, because it names
      the obligation the synthesis actually bears -- draw those citations from that revision's own
      collected evidence -- which is falsifiable against a synthesis that drew from anything else,
      and inventing a further refusal for the violation half would state a behavior nothing can
      reach, the same reasoning already used in refusing to issue a write into a non-positive
      bound and in fixing durations.total at an instant the record can actually be measured to.
  - location: rules/investigation/a-judgment-failure-records-the-last-call-made.md
    field: statement
    unstated: Which call's record a judgment-failure evaluation carries when a refused response was followed
      by a retry that also failed. domain/investigation/evaluation states that usage, elapsed_ms and prompt
      are present exactly when a call happened and absent only for reason no-data, and scenarios/investigation/a-foreign-citation-is-refused
      states that one retry runs before the fallback to judgment-failure -- but no node says whether the
      surviving record is the first call's, the retry's, or a usage summed across both with an elapsed_ms
      and prompt named for one of them, leaving it to whichever call an implementation happened to keep.
    decided: The evaluation carries the usage, elapsed_ms and prompt of the last judgment call actually
      made for that hypothesis -- the retry's own record where a retry ran, the first call's where the remaining
      deadline admitted no retry -- never a superseded first call's record, and never a usage summed across
      both attempts. Held as a new invariant constraining domain/investigation/evaluation.
    why: 'domain/investigation/evaluation already defines the three as one call''s own record, singular,
      naming the prompt "as the call actually materialized it"; a usage summed across two attempts beside
      one attempt''s elapsed_ms and prompt would be a record no call ever produced, and would cost a reader
      the one check the trio supports -- reading the tokens against the prompt that earned them. Between
      the two determinate calls, the last one made is the one this specification''s own idiom already picks:
      written-at-records-when-the-write-settled dates the record by the attempt that settled the outcome
      rather than by the first attempt issued, and the attempt that settles a judgment-failure is the one
      after which the system gives up. It also collapses to a single reading over both branches of a-foreign-citation-is-refused,
      since where the deadline admits no retry the first call is the last call made. Undercounting total
      provider spend is not an objection to naming one call, because the total across every call an investigation
      made is domain/investigation/cost''s own attribute and not this per-hypothesis record''s. Stated as
      a rule rather than added to the element''s Description, because the element schema''s attribute declaration
      admits only name, type, required and many, and an operative claim living only in body prose has no
      addressable home -- the same home and reasoning this specification used for an-empty-ticket-reference-is-no-ticket-reference
      and the-consolidation-answer-states-its-register.'
  - location: rules/investigation/a-measured-duration-below-one-millisecond-is-zero.md
    field: statement
    unstated: Nothing states whether a duration measured for a span that actually ran may be recorded as
      0 milliseconds when that span was shorter than one millisecond, or whether such a measurement is always
      at least one millisecond. domain/investigation/durations declares collection, judgment, writing and
      total as integers with no floor, domain/investigation/evaluation and domain/investigation/evidence
      declare elapsed_ms the same way, and the only zero the specification speaks to is domain/investigation/evidence's
      legacy reading (an item collected before elapsed_ms existed reads 0, meaning not measured) -- a backfill
      condition, not a measurement of a span that really ran.
    decided: A millisecond duration measured for a span that actually ran is the whole number of milliseconds
      observed for that span and is recorded as 0 where the span settled in under one millisecond; it is
      never raised to one millisecond, so a stage figure, a durations total or an elapsed_ms may legitimately
      read 0 for work that really happened.
    why: 'The clock resolves whole milliseconds, so raising a sub-millisecond span to one would record a
      duration nothing observed -- precisely the invented duration domain/investigation/evidence already
      refuses for its own zero, and against this specification''s repeated reading that an unrecordable
      fact degrades to an honest value rather than a manufactured one (evidence''s fields and concept_description,
      decided the same way). A floor would additionally inflate every figure held against the declared total
      budget, defeating the one question durations exists to answer, and it would be an invention production
      code must perform. The apparent precedent the other way is not on point: a timeout of zero and a ttl
      of zero are refused because a declared bound of zero bounds nothing, whereas a measured zero bounds
      nothing and asserts nothing -- it reports the limit of the instrument. The legacy-absence zero on
      evidence is a distinct case and stays true as written; that 0 now also reads as a genuine sub-millisecond
      collection is accepted rather than resolved by a sentinel, because both readings say the same thing
      (no measurable time attributable) and a sentinel would be the invented value the element refuses.'
  - location: rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown.md
    field: statement
    unstated: What a curator reading a case version's manifest entry is shown for its pinned hypothesis-revision when that revision is absent from the page of revisions answered for that hypothesis — whether the pinned revision is stated regardless of the page, or not shown at all. manifest-entry declares that the entry references exactly one hypothesis-revision and listings-are-paged makes any listing of a hypothesis's revisions one page of a larger set, but no node says what the curator is shown where the two do not overlap.
    decided: The pinned revision is stated regardless of the page — a curator reading a case version's manifest is shown, for every entry, the hypothesis-revision that entry itself pins, whatever page of that hypothesis's own revisions was answered alongside it; an entry whose pinned revision is absent from the revisions answered still states that pinned revision, and is never shown as pinning no revision at all.
    why: 'The pinned revision is the manifest entry''s own declared reference, so a revisions listing is a second, independently paged read that can only ever corroborate it, never supply it; letting a page''s contents decide what is shown would make the entry''s reference disappear from view while the version keeps resolving through it. The omission is worst exactly where it matters most — a released version''s pin, which a-released-version-keeps-its-original-revision guarantees never moves, is the revision that later revisions push furthest off a first page, so the guarantee a curator most needs to verify is the one an omission would hide. And this specification has already decided the structurally identical question in this direction twice: a-case-holding-no-versions-is-told-explicitly refuses an unexplained emptiness over a stored set because absence, breakage and an unfinished load then read alike, and the same reasoning recorded for a-composed-subject-presents-every-case-input-requirement holds that what a person is shown at an outcome is the business''s own decision rather than a consequence of how the data happened to arrive. Nothing beyond the shown-or-not question is settled here: no field is added to any element, no listing''s paging changes, and no call is refused for it.'
  - location: rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis.md
    field: statement
    unstated: 'Whether the presentation of a released case version''s manifest entry states that a higher revision of its hypothesis exists, given that entry can never adopt it, or states this only for an entry of a version still in draft — no node says which manifest entries disclose a higher revision, and a released version''s entry is the one where the disclosure names something that entry can never take up.'
    decided: 'A surface presenting a case version''s manifest entry states that a higher revision of that entry''s hypothesis exists whenever one does, for a version in either state, draft or released; on a released version''s entry it states that existence alone and offers no adoption of it.'
    why: 'Two standing decisions in this specification already refuse to narrow a read of a case version by that version''s state — a-case-versions-input-requirements-are-derived is available "for a case version in either state, draft or released," and validation-runs-at-every-read holds every read to every rule "draft or released alike" — so state governs what may be composed and what may be diagnosed against, never how much of what is true about a version a reader is shown. The inability to adopt bounds what the presentation may offer, not what it may state: the existence of a higher revision is precisely what tells a reader auditing a released version that its pinned content has since moved on, and what tells a curator the case warrants a new draft. Withholding it would reproduce the ambiguous silence a-case-holding-no-versions-is-told-explicitly already rejects, since a bare "revision 1" reads identically whether it is the hypothesis''s only revision or its oldest.'
  - location: rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first.md
    field: statement
    unstated: 'In what order a listing of one hypothesis''s revisions answers those revisions, and therefore whether a given page of that listing carries the hypothesis''s highest existing revision. contracts/knowledge/case-query declares list-hypothesis-revisions and constraints/listings-are-paged makes its answer one page selected by an offset and a limit, but no node states the order the page is cut from, so which revisions a reader reaches without paging would follow from however rows came back.'
    decided: 'A listing of one hypothesis''s revisions answers them ordered by revision number descending, highest first, so the first page of that listing carries that hypothesis''s highest existing revision.'
    why: 'The revision number is the only ordering fact available — hypothesis-revision declares no timestamp — and a-hypothesis-revision-number-is-never-reused makes it a total order per hypothesis, starting at 1, never reused and never discarded, so it needs no tiebreak and no second aggregate read. The direction is decided by which revision a reader came for: the highest existing revision is the one a curator adopts into a draft and the one a reader auditing a pin compares against, and ascending order would place it on the last page, one page further away with every revision the hypothesis gains — the same accumulation a-manifest-entrys-pinned-revision-is-always-shown already identifies as what pushes an old pin off a page. Declaring the order rather than leaving it is the substitution hypotheses-are-ordered-by-precedence already refuses for a manifest, where an order left to the storage''s arrangement replaces a decided fact. It is an invariant over hypothesis-revision alone because both the sort key and the grouping are that element''s own declared revision attribute and its cardinality-1 reference to its hypothesis, so the condition is decidable from the answer itself and holds immediately; it adds no field, changes no listing''s paging, refuses no call, and leaves the two presentation rules untouched, since each compares against the hypothesis''s highest existing revision rather than against a page''s contents.'

  - location: rules/knowledge/a-released-hypothesis-revision-is-never-altered.md
    field: statement
    unstated: What an attempt to alter the stored content of a hypothesis-revision that a case version in
      released state references produces at the point of the attempt. The rule states that such a revision
      "is never altered again" and a-hypothesis-revision-is-overwritten-while-unreleased routes a revise-hypothesis
      away from it, but neither says what answers an attempt that reaches the revision anyway — an error
      carrying its own identity, or the attempt simply having no effect. The routing turns on a cross-aggregate
      reading this rule itself declares eventual, so the attempt is reachable and the answer is not derivable
      from either rule as written.
    decided: Refused at the point of the attempt with an HTTP 409 response reporting a ReleasedHypothesisRevisionNotAlterableError,
      rather than accepted and left with no effect.
    why: 'This specification has already decided the structurally identical question for the sibling immutability
      guarantee and decided it as a refusal: a case version released is likewise "never altered again" (a-case-version-is-written-once),
      and a write into one is answered with HTTP 409 reporting CaseVersionNotDraftError rather than silently
      dropped. Silence is the branch this specification repeatedly refuses — a-release-refusal-with-no-named-violation-says-so
      holds that a curator is always told why rather than left with an unexplained answer, and a-case-holding-no-versions-is-told-explicitly
      refuses an outcome in which a real state and a broken read are indistinguishable to the reader; an
      alteration that returns as though it succeeded is exactly that indistinguishability applied to the
      one content replay-is-pinned depends on never having moved. 409 rather than 422 follows this log''s
      own settled split: 422 is a well-formed request whose content would violate an invariant (ManifestWouldHoldNoHypothesisError,
      HypothesisRevisionCollectsNoConceptError, CaseVersionNotReleasableError), while 409 is an operation
      the target''s current standing forbids whatever the content is (CaseVersionNotDraftError, CaseAlreadyHasDraftError,
      ManifestPositionOccupiedError) — here the content is beside the point and the adoption by a released
      version is the whole of the bar, the same reading its sibling CaseHoldsNoDraftError on a-hypothesis-is-revised-only-against-its-cases-draft
      already took for this same operation. The name states the rule''s own condition in the specification''s
      own words (its slug is a-released-hypothesis-revision-is-never-altered) and follows the CaseVersionNotReleasableError
      idiom; it deliberately avoids naming the revision itself "released", because a revision declares no
      such state — being adopted by a released version is a fact read from the other aggregate.'
  - location: rules/knowledge/a-revise-answers-the-revision-number-it-saved.md
    field: statement
    unstated: Whether revising a hypothesis tells the curator the revision number the content was saved
      as. contracts/knowledge/case-lifecycle publishes revise-hypothesis and a-hypothesis-revision-is-overwritten-while-unreleased
      decides which revision the write lands on, but no node says what comes back to the curator, so whether
      the saved number reaches the curator at all would follow from whatever the operation happened to return.
    decided: A curator who revises a hypothesis is told the revision number the content was saved as — the
      number of the revision that revise wrote — in both branches of the overwrite rule, in place or next.
    why: 'The branch a revise takes turns on whether a released case version references the hypothesis''s
      highest revision, a fact of an aggregate the curator is not reading while saving, so the saved number
      cannot be derived from the curator''s own input; without it the curator cannot tell whether the number
      the draft''s manifest entry pins still names the content just written. Telling it follows the precedent
      a-manifest-entrys-pinned-revision-is-always-shown and a-case-holding-no-versions-is-told-explicitly
      already set, both refusing a silence over a stored fact the reader has no second way to learn, and
      the sibling a-released-hypothesis-revision-is-never-altered''s own reasoning that a curator answered
      with nothing reads an edit that never landed exactly as one that did. It holds in both branches because
      the branch is precisely what the curator cannot see, so an answer given in only one would leave the
      ambiguous case silent. Stated as an invariant over domain/knowledge/hypothesis-revision alone, mirroring
      a-hypothesis-revisions-listing-answers-highest-revision-first: the number and the hypothesis it references
      are the revision''s own facts, needing no second aggregate read.'
  - location: rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move.md
    field: statement
    unstated: Whether a curator who has just revised a hypothesis is offered a route to the case draft's
      own manifest, and on which outcomes of the revise. contracts/knowledge/case-lifecycle names revise-hypothesis
      and place-hypothesis as separate acts and a-hypothesis-revision-is-overwritten-while-unreleased decides
      which revision the revise writes, but no node states what follows the revise for the draft manifest
      entry that pins that hypothesis — so whether the offer appears after an in-place overwrite, after
      a created next revision, or when the draft manifests the hypothesis not at all, was settled nowhere.
    decided: 'The offer is made on exactly the two outcomes where the draft''s manifest does not already
      carry what the revise wrote — the revise wrote a revision higher than the one that draft version''s
      entry pinned immediately before it, and that draft version''s manifest holds no entry for the hypothesis
      at all — and is made on no other: a revise that wrote into the very revision the entry already pins
      offers nothing.'
    why: 'The offer''s whole content is that the draft is not yet using what was just written, so it is
      owed exactly where that is true and nowhere else. It is true on the create branch, where a-released-hypothesis-revision-is-never-altered
      forced a new number and the entry is left pinning a superseded one, and true when the hypothesis is
      absent from the manifest, where nothing written reaches any version until place-hypothesis puts it
      there. It is false on the in-place overwrite: a-draft-revision-is-overwritten-by-repeated-saves already
      states, as the rule''s own concrete case, that the entry still pins revision 2 and discloses no higher
      revision — the draft is already using the new content, and an offer would demand a correction to an
      entry that is already correct, defeating the loop a-hypothesis-revision-is-overwritten-while-unreleased
      exists to keep free of per-save ceremony. The condition is the comparison a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest
      already makes on a presented entry, applied at the revise instead of at the presentation, so the surface
      offers adoption on the same fact the entry itself discloses rather than on a second, differently-drawn
      one; the absent entry is that comparison with no pin to be behind, decided toward the offer for the
      same reason a-case-holding-no-versions-is-told-explicitly refuses a silence a reader cannot tell from
      a settled state. Scope-frontend states the first and third branches directly ("still offering it ...
      after a save that did create a new revision", "no longer forcing" it after an overwrite); the absent-entry
      branch it does not reach is decided here by that same reading. The rule states when the route is offered
      and nothing about what may be done through it, so no pin moves, no entry gains a disclosure, and no
      call is refused for it.'
  - location: rules/knowledge/a-revise-answers-the-revision-number-it-saved.md
    field: statement
    unstated: Whether the answer to a revise of a hypothesis, besides stating the revision number the content
      was saved as, also carries a field naming which branch of a-hypothesis-revision-is-overwritten-while-unreleased
      the write took — a replacement of the hypothesis's highest existing revision in place, or a created
      next revision. The rule already decided the saved number is told in both branches, and a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
      decided when a route to the draft's manifest is offered, but no node says whether the branch itself
      is disclosed, so whether a consumer could read it would follow from whatever the operation happened
      to return.
    decided: The answer states the revision number the content was saved as and carries no further field
      distinguishing a revise that replaced the hypothesis's highest existing revision in place from a revise
      that created the hypothesis's next revision.
    why: Nothing the specification decides on this answer rests on the branch. The one rule that reads the
      revise's outcome, a-revise-offers-the-draft-manifest-only-when-the-pin-must-move, states its condition
      as a comparison of the written revision against the revision the draft's entry pinned immediately
      before, and that comparison does not coincide with the branch — an in-place overwrite of a highest
      revision the draft's entry does not pin stands above that pin exactly as a created next revision does
      — so a branch field would be a second, differently drawn basis for the same offer, and the two would
      disagree in exactly that case. Whether the highest revision was frozen is also not the revision's
      own declared fact but a reading of every case version that might reference it, which a-hypothesis-revision-is-overwritten-while-unreleased
      makes once to choose where the write lands; disclosing its outcome would carry that cross-aggregate
      reading into a second home for no consumer that needs it, against this specification's own habit of
      keeping a fact in the one node that decides it. Deciding the negative rather than leaving it open
      keeps the rule falsifiable in both directions and follows the reasoning already logged for this rule,
      where the saved number was decided as the smallest answer that closes the curator's silence.
  - location: rules/knowledge/a-hypothesis-is-manifested-at-most-once-in-a-case-version.md
    field: statement
    unstated: Whether one case version's manifest may hold two entries referencing revisions of the same
      hypothesis. a-hypothesis-position-is-unique-within-its-case makes only positions unique, and expressly
      refuses a position "the manifest already places a different hypothesis at"; a-hypothesis-name-is-unique-within-its-case
      makes names unique across the case's hypotheses, not across one version's entries; manifest-entry
      and case-version declare the manifest as many entries with no uniqueness over the hypothesis referenced.
      Several nodes read a manifest as though the fact held — a-revise-offers-the-draft-manifest-only-when-the-pin-must-move's
      expression speaks of "d's manifest entry for h" and of a manifest holding "no entry for h", a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest
      of the entry's own comparison against its hypothesis's highest revision, requires-evaluation-of-names-exactly-the-manifested-hypotheses
      of the names the entries contribute, and a-released-version-keeps-its-original-revision of revision
      2 replacing revision 1 "in version 2's own manifest" — but no node states it, so it held only as a
      presupposition none of them was held to.
    decided: 'A case version''s manifest holds at most one entry for any one hypothesis: no two entries
      of one case version reference revisions of the same hypothesis. Stated as an invariant over domain/knowledge/case-version
      and domain/knowledge/manifest-entry.'
    why: 'The permissive alternative breaks two nodes that already stand. requires-evaluation-of is exactly
      the hypothesis names the manifest''s entries reference, and one-evaluation-per-required-hypothesis
      holds an investigation to exactly one evaluation per required hypothesis; a hypothesis manifested
      twice makes that list carry one name twice, which an investigation can satisfy only by holding two
      evaluations of one hypothesis or by having a name quietly collapse — and evaluations are indexed by
      hypothesis name, which a-hypothesis-name-is-unique-within-its-case already protects precisely because
      a collision would overwrite a verdict in silence. It also leaves resolve-outcome without an answer
      it can defend: the declared order would reach one claim at two positions, at two different revisions
      of its own content, and the first-confirmed reading would depend on which of the two the version happened
      to place first. The restrictive alternative costs nothing the material asks for: reordering, repinning
      to a different revision, and the copy a new draft starts from are all operations over a manifest that
      carries each hypothesis once, and every node that reads a manifest for a hypothesis is already written
      against exactly that shape. Stated bare, without a refusal answer, on a-hypothesis-name-is-unique-within-its-case''s
      own precedent — which answer place-hypothesis gives a request naming an already-manifested hypothesis
      is a fact about that operation, not about what a manifest may hold. Held as an invariant with case-version
      and manifest-entry alone, mirroring requires-evaluation-of-names-exactly-the-manifested-hypotheses,
      which likewise reads the hypothesis an entry''s revision belongs to without naming a second aggregate
      in constrains.'
  - location: rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version.md
    field: statement
    unstated: Which of a case's versions supplies the pinned revisions a surface presenting the case's hypotheses
      states as the ones the case currently uses. Every node that speaks of a pin is written against "a
      case version's manifest entry" with one version already named — a-manifest-entrys-pinned-revision-is-always-shown,
      a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest and a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis
      all presuppose it — while domain/knowledge/hypothesis belongs to the case identity rather than to
      any version and contracts/knowledge/case-query's list-hypotheses is keyed by the case alone, so no
      node says which version's manifest a case-keyed surface reads those pins from.
    decided: The manifest of the case's highest-numbered version among the versions the case currently holds,
      and no other version of that case.
    why: 'This specification has already decided the structurally identical question in this direction:
      a-case-summary-is-derived-from-its-existing-versions reads a case''s current_state and last_updated
      from the case''s highest-numbered version, for the reason that next_version issues each number once
      and always higher and a version is only ever created after every version before it — making the highest-numbered
      version the case''s most recently authored one regardless of state. Anchoring the pins to that same
      version keeps one reading of "the case as it currently stands" instead of two that could name different
      versions of one case. It is also the only version a curator can act on: a-case-has-at-most-one-draft
      plus that counter make the highest-numbered version the case''s own draft wherever it holds one, so
      the pins shown are the pins that may still be repinned, and the latest released version wherever it
      holds none. The alternatives were the latest released version, which would show a curator composing
      a draft the pins of a version a-case-version-is-written-once forbids changing, and the hypothesis''s
      own highest revision, which is not a pin at all and which a-manifest-entrys-pinned-revision-is-always-shown
      already refuses as a source for one. Deciding it as a policy over the case, the version, the entry
      and the hypothesis adds no field, moves no pin and refuses no call.'
  - location: rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version.md
    field: statement
    unstated: What a surface presenting a case's hypotheses, with the revision of each hypothesis's content
      the case currently uses, states for a hypothesis the case's highest-numbered version's manifest holds
      no entry for — including every hypothesis of a case currently holding no version at all, where no
      such manifest exists to read. This rule's own statement and expression were written only over "every
      hypothesis h that v's manifest holds an entry for", and the no-entry state is a standing one every
      neighbouring node already admits (a-hypothesis-is-manifested-at-most-once-in-a-case-version reads
      a manifest as one entry for a hypothesis or none, a-new-drafts-manifest-is-copied-from-an-existing-version
      gives a first-ever draft no manifest to copy, remove-hypothesis takes an entry out, and a discarded
      sole draft leaves the case with no version at all) — while every rule that says what a presented pin
      discloses is written over an entry that exists, so nothing said what is shown where none does.
    decided: The surface presents the hypothesis and states explicitly that the case currently uses no revision
      of it, stating no revision number for it — never omitting the hypothesis and never presenting any
      revision of it, such as its own highest existing revision or the pin another version of the case holds,
      as the one in use. The same holds for every hypothesis of a case currently holding no version at all.
    why: 'The three alternatives each break a decision this specification already stands on. Omitting the
      hypothesis hides exactly the hypothesis a curator must reach place-hypothesis for, which is the gap
      a-revise-offers-the-draft-manifest-only-when-the-pin-must-move offers a route to close on this very
      condition ("that draft version''s manifest holds no entry for the hypothesis at all"), so the surface
      would withhold what another rule assumes the curator can act on. Answering with the hypothesis''s
      own highest existing revision is the substitution a-manifest-entrys-pinned-revision-is-always-shown
      already refuses — a revision recovered from a listing is not a pin — and answering with another version''s
      entry is what this same rule''s first half already refuses. A bare blank is the silence a-case-holding-no-versions-is-told-explicitly
      rejects, because absence, a failed read and a pending read then read alike. Explicit statement is
      also the reading this specification already gave the structurally identical absence one step up: a-case-summary-is-derived-from-its-existing-versions
      states that a case holding no version has neither current_state nor last_updated rather than inventing
      either, and domain/knowledge/case-version''s released_at is present only once released. Stating it
      here rather than in a new node keeps one rule answering the one question of what a case-keyed surface
      reads for a pin, over the four elements this rule already constrains; it adds no field, moves no pin
      and refuses no call.'
  - location: domain/knowledge/case-summary.md
    field: attributes
    unstated: >-
      Whether a catalog listing exposing a case's when_to_use (so an automated consumer can
      choose the right case without reading version by version) needs a case's own title and the
      version number a diagnosis may pin to, and if so which of a case's own versions supplies
      them once its highest-numbered version is a draft still ahead of its last release.
    decided: >-
      Three new optional attributes — title, when_to_use, released_version — present only where
      the case currently holds at least one released version, and read from that version rather
      than from current_state's own highest-numbered version.
    why: >-
      diagnose() takes a case slug and version, and only-a-released-case-version-is-diagnosed
      refuses any version that is not released, so a catalog entry a consumer chooses a case by
      must name a version diagnose() itself would accept. current_state already answers "the
      case's highest-numbered version, whichever its state," which is exactly the version a draft
      in progress makes wrong for this purpose, so the three new fields need their own derivation
      rather than reusing it.
  - location: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions.md
    field: statement
    unstated: >-
      Same fact as the case-summary.md entry above — which of a case's own versions supplies
      title, when_to_use and released_version once its highest-numbered version is a draft still
      ahead of its last release.
    decided: >-
      title, when_to_use and released_version are read from the case's highest-numbered version
      in released state, distinct from current_state's own highest-numbered version of either
      state; a case with no released version has none of the three.
    why: >-
      Same material and reasoning as the case-summary.md entry above.

  - location: rules/knowledge/a-case-listing-answers-cases-in-slug-order.md
    field: statement
    unstated: >-
      In what order a paged listing of every case answers those cases, and therefore which cases
      a reader reaches without paging. contracts/knowledge/case-query declares list-cases and
      constraints/listings-are-paged makes its answer one page selected by an offset and a limit,
      but no node states the order the page is cut from, so which cases a reader reaches without
      paging would follow from however rows came back.
    decided: >-
      A listing of every case answers those cases ordered by slug ascending, compared character
      by character, so which cases a page carries follows from their slugs alone.
    why: >-
      The slug is the only ordering fact a case declares — its identity carries slug and
      next_version alone, and next_version counts drafts issued rather than ordering anything a
      catalog reader asked for — and a-slug-identifies-one-case makes it a total order needing no
      tiebreak and no second read. The derived summary cannot be the sort key:
      a-case-summary-is-derived-from-its-existing-versions leaves last_updated absent for a case
      holding no version, so it does not order the whole set, and it moves as curation proceeds,
      which would make a fixed offset answer one case twice or skip it while a reader pages
      through; a slug never changes. The direction is decided by there being no distinguished
      case: unlike a hypothesis's revisions, where
      a-hypothesis-revisions-listing-answers-highest-revision-first answers highest first because
      the newest is the revision a curator adopts and an auditor compares against, both readers
      case-query serves come for the whole catalog — the curator browsing what exists and an
      automated consumer comparing every when_to_use before choosing — so ascending order over the
      name each reader already addresses a case by is the neutral choice, and it lets a reader
      holding a known slug predict its page. Declaring the order at all is the same substitution
      hypotheses-are-ordered-by-precedence refuses for a manifest, where an order left to the
      storage's arrangement replaces a decided fact. It is an invariant over domain/knowledge/case
      because the sort key is that element's own declared attribute and the condition is
      decidable from the answer itself; it adds no field, changes no listing's paging, refuses no
      call, and decides nothing about the other listings listings-are-paged governs.

  - location: rules/integration/an-unreachable-connector-ends-unavailable.md
    field: statement
    unstated: 'What an observation records when its HTTP connector call is issued and then fails before
      any HTTP response is received — a refused connection, a DNS resolution failure, a socket error, or
      any rejection other than the capability timeout''s own deliberate abort. Every other collection-failure
      cause is placed in one of the four evidence-result endings by a node of its own — a call never issued
      (an-unresolvable-observation-ends-unavailable), a configuration whose call cannot be assembled and
      a status nobody classified (an-http-connector-configuration-declares-its-call, an-unclassified-status-ends-unavailable),
      a deadline overrun (no-stage-aborts-on-its-deadline) — while the one cause between a well-assembled
      call and a received response is placed by none: the ending, the result detail''s name, and whether
      the connector''s identity is carried in it were all unstated.'
    decided: The observation ends unavailable and never propagates out of observe-concept as a fault, with
      a result detail reporting a ConnectorUnreachableError together with the name of the connector whose
      registered configuration issued the call, and carrying no part of that call's own assembled address,
      query, headers or body. Stated as a new policy, rules/integration/an-unreachable-connector-ends-unavailable.
    why: 'Unavailable, because it is the ending this specification already gives every collection failure
      that asserts neither denial nor timeout and never enters the cache, and because the alternatives each
      say something untrue: timeout is the capability''s own deadline abandoning a call still in flight,
      which a connection refused, unresolved or broken never reached, and denied asserts an authorization
      outcome nothing observed. An ending rather than a fault, because domain/investigation/evidence states
      the absence of data arrives as a result and never as an exception and no-stage-aborts-on-its-deadline
      holds the collection stage to recording rather than raising — the same reading already applied to
      the four other causes, of which a fault here would be the sole exception, and one that aborts concepts
      and hypotheses that never touched the failing connector. ConnectorUnreachableError rather than a name
      built on "unavailable", because every sibling detail names the cause and not the ending — the ending
      is already on the same evidence item, so a detail repeating it distinguishes nothing — and "unreachable"
      is what separates a far end that refused, could not be resolved or broke the socket from one that
      answered late. The connector name is carried because the cause lies outside this system and the far
      end is the only thing anyone can act on; it is content in the existing free-text result_detail rather
      than a new field, so no fact is duplicated into a declared attribute. The assembled call''s own text
      is excluded because address, query, headers and body may each hold what a credential placeholder resolved
      to, which rules/integration/a-diagnostic-response-masks-a-resolved-credential keeps out of what a
      reader is shown. A new node rather than an extension of a neighbour, because each existing node''s
      condition is exclusive of this one — an-unresolvable-observation-ends-unavailable governs observations
      that issue no call, an-unclassified-status-ends-unavailable governs a response that did arrive, and
      an-http-connector-configuration-declares-its-call states what a configuration declares and how its
      call is assembled, never what happens once the assembled call is in flight — and this specification
      already gives each collection-failure cause its own rule beside the others.'
  - location: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle.md
    field: statement
    unstated: >-
      The read material (temp/hipotese-com-release-proprio-desacoplado-do-manifest.md) states
      that a hypothesis-revision gains its own draft-to-released state, moved once by the
      curator's own release action, but it never says what a second release attempt against an
      already-released revision is met with.
    decided: >-
      An HTTP 409 response reporting a HypothesisRevisionNotDraftAtReleaseError.
    why: >-
      a-case-version-moves-through-its-declared-lifecycle already gives the case version's own
      lifecycle the identical shape — one forward transition, one terminal state — and answers
      the same question with CaseVersionNotDraftAtReleaseError at HTTP 409; a hypothesis-revision's
      lifecycle is that same shape read over a different aggregate, so the same status and the
      same naming convention apply rather than inventing a second idiom for one more
      single-transition state machine.
  - location: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions.md
    field: statement
    unstated: >-
      The read material decides that a case version's release must refuse when any manifest
      entry still points at a draft hypothesis-revision, and that the refusal must list every
      such hypothesis, but leaves open (its own §6, point D) which refusal shape carries that:
      a new HTTP status and error code of its own, or the existing release-refusal aggregation.
    decided: >-
      No new error code. The violation is one more rule CaseVersionNotReleasableError's existing
      aggregation names together with whatever else the same release attempt violates, exactly
      as rules/knowledge/a-release-refusal-with-no-named-violation-says-so already generalizes
      for every structural or coherence rule constraining case-version.
    why: >-
      The material's own point D names this precedent directly — "CaseVersionNotReleasableError
      já lista violações de coerência de forma parecida... o padrão para 'hipóteses do manifest
      ainda em draft' deveria seguir esse mesmo formato" — and the release-refusal aggregation
      mechanism already presupposes exactly this shape: a rule constrains case-version and states
      its own violation in domain terms, and release names every violated rule together in one
      HTTP 422 response, never invents a parallel refusal channel per rule.
  - location: rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state.md
    field: statement
    unstated: >-
      The read material's own §6, point C, asks explicitly whether the hypothesis-revisions
      listing should disclose each revision's draft-or-released state, leaving it undecided
      because the product only described the release screen itself, never this listing's.
    decided: >-
      Yes — a listing of one hypothesis's revisions states, for every revision answered, that
      revision's own state.
    why: >-
      The state is now the one fact that decides whether a save on that revision overwrites in
      place or creates the next number, and this specification has already refused every silence
      of that shape once a fact is addressable at all — a-manifest-entrys-pinned-revision-is-
      always-shown and a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest
      both exist for exactly this reason, over the adjacent manifest-entry listing; withholding
      the new fact here would leave a curator to guess at a save's outcome from nothing the
      listing shows.
  - location: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle.md
    field: statement
    unstated: >-
      Which values a refused release of a hypothesis-revision reports alongside the
      HypothesisRevisionNotDraftAtReleaseError, and whether the state the revision stood in is
      among them. The rule's statement, and the decision-log entry that wrote it, settled only
      the HTTP status and the error identity; constraints/a-malformed-request-is-refused-with-a-
      validation-error states the carried content (code, message, details) of the shape refusal
      alone and expressly disclaims every domain condition, so nothing said whether this refusal
      additionally reports the revision it was asked of or the state that revision stood in.
    decided: >-
      The error identity is the whole of what the refusal reports —
      HypothesisRevisionNotDraftAtReleaseError as the refusal's own condition and message —
      carrying no further value; the state the revision stood in is not among them, and the
      statement records that it is released whenever this refusal is raised.
    why: >-
      Every refusal this specification states names its HTTP status and its error identity and
      nothing further; the only two that carry values beyond it — CaseVersionNotReleasableError
      naming every violated rule and every still-draft hypothesis, and
      MalformedCapabilityInputSchemaError naming every departure — carry exactly what the caller
      cannot derive from its own request, which is the whole reason those two enumerate
      anything. Neither reason reaches here. The revision is what the request itself named, and
      domain/knowledge/hypothesis-revision-state holds exactly draft and released, with draft as
      the machine's initial state and released its only other, so "not draft at release" already
      names released as the state it stood in; reporting it would put one fact in a second home
      while adding nothing a reader could not read off the error's own name. This is not the
      silence the specification's disclosure precedents refuse —
      a-manifest-entrys-pinned-revision-is-always-shown,
      a-hypothesis-revisions-listing-discloses-each-revisions-own-state and
      a-case-holding-no-versions-is-told-explicitly each turn on a stored fact the reader has no
      second way to learn, whereas this one is entailed by the refusal itself. Deciding the
      negative explicitly, rather than leaving the carried content open, follows the reasoning
      already logged for a-revise-answers-the-revision-number-it-saved, where "carries no
      further field distinguishing the branch" was decided as a statement rather than left to
      whatever the operation happened to return, and it keeps the rule falsifiable in both
      directions. It also keeps this lifecycle reading identical to
      a-case-version-moves-through-its-declared-lifecycle's, whose sibling refusals the earlier
      entry already took as this machine's precedent for status and naming.
  - location: rules/knowledge/a-released-hypothesis-revision-is-never-altered.md
    field: statement
    unstated: Whether an attempt to remove one of a released hypothesis-revision's own collects is met the same way as an attempt to alter its criterion, resolution or state — the material never distinguished the two, and the node's own statement, read literally over the collects attribute too, called for the same HTTP 409 refusal both branches would then need.
    decided: An attempt to alter a released hypothesis-revision's criterion, resolution or state is refused at the point of the attempt with an HTTP 409 response reporting a ReleasedHypothesisRevisionNotAlterableError. An attempt to remove one of its collects is not refused with an error; it is accepted and left with no effect, so the collect still reads back afterward.
    why: 'The schema already delivered and reviewed under this exact node''s own citation (migrations 0010 and 0021) implements two different mechanisms for the two relations: a trigger that raises the named error against hypothesis_revisions'' own row, and a query-rewrite rule that turns a DELETE against hypothesis_revision_collects into a no-op. A single refused-with-409 statement covering both would contradict the delivered, reviewed collects mechanism; stating the split is what the material''s own already-built answer requires, and it matches the sibling task''s own criterion that a released revision''s collects ''read back unchanged after an attempt to remove them,'' never naming a refusal for that case.'
  - location: scenarios/knowledge/releasing-an-already-released-revision-tells-the-curator-so.md
    field: then
    unstated: >-
      The intake scope (work/hipotese-release-proprio-frontend/intake/scope.md) states that
      releasing a hypothesis-revision not in draft state is refused with an HTTP 409
      HypothesisRevisionNotDraftAtReleaseError, and
      rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle states what that
      refusal itself reports. Nothing states what the curator who attempted the release is then
      told at the frontend, whether that telling is distinguishable from what the frontend says
      when a request fails for a reason it does not recognise, or what the specific message says.
    decided: >-
      The frontend tells the curator specifically that the named revision is already released and so
      cannot be released again, never only the notice it shows for a failure whose reason it does
      not recognise — and the specification holds that substance alone: the exact wording stays the
      frontend's own.
    why: >-
      This specification has decided this same shape twice already and is decided the same way
      again. scenarios/glossary/a-concept-with-no-description-is-refused's own `then` holds the
      identical construction for the adjacent surface ("the operator console tells the operator
      specifically that the description is missing, never only a generic failure notice — the exact
      wording stays the console's own"), and the decision-log entry filling
      constraints/no-route-enforces-authentication.statement decided that a frontend disclosure's
      substance is the specification's while its copy is not, because a control's exact copy is
      surface and freezing a sentence here would hold the frontend to a choice nobody but the
      frontend picked. The substance chosen adds no fact: the same rule's own statement records that
      the revision is released whenever this refusal is raised, so "already released" is read off the
      refusal's own condition rather than off a value the refusal would have to start carrying —
      which the entry above it expressly decided it does not. Distinguishability is what makes the
      telling worth stating at all, since the curator's next act differs between the two readings:
      an unrecognised failure leaves the outcome unknown and invites a retry, while this refusal
      means the revision already stands as asked and nothing remains to be done. Holding a refusal to
      an explicit, non-interchangeable statement rather than an undifferentiated one is the same
      discipline a-release-refusal-with-no-named-violation-says-so and
      a-case-holding-no-versions-is-told-explicitly already carry for other outcomes that would
      otherwise read as a broken response. A scenario's concrete case is the home because the fact is
      what happens at one named outcome of a rule that already exists, and the rule's own statement
      is already spent on what the refusal reports over the wire.
  - location: rules/knowledge/a-presented-manifest-entry-states-its-pinned-revisions-state.md
    field: statement
    unstated: >-
      Whether a curator reading a case version's manifest is told, for every entry, the
      draft-or-released state of the hypothesis-revision that entry pins, or learns which
      manifested hypotheses are still unreleased only from the refusal of that version's release.
      Every node that says what a presented manifest entry discloses was written before
      hypothesis-revision carried a state of its own — a-manifest-entrys-pinned-revision-is-always-shown
      covers the pinned revision number, a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest
      covers its latest-ness, a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis covers a
      higher revision's existence — and a-hypothesis-revisions-listing-discloses-each-revisions-own-state
      states the state on the revisions listing alone, so no node says whether the manifest entry
      carries it too.
    decided: >-
      A surface presenting a case version's manifest states, for every entry, the state — draft or
      released — of the hypothesis-revision that entry pins, unconditionally on the case version's
      own state and on any release having been attempted; the curator does not have to attempt a
      release to learn which pins are still in draft.
    why: >-
      The state is the fact a-released-case-version-manifests-only-released-hypothesis-revisions
      reads to decide whether the version may be released, so withholding it on the manifest makes
      the refused release the only way to learn something already true and already addressable on
      the entry's own referenced revision — the exact silence
      a-manifest-entrys-pinned-revision-is-always-shown and
      a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest were each written
      to close over this same surface, and that
      a-hypothesis-revisions-listing-discloses-each-revisions-own-state already closed for this
      same fact on the adjacent listing. Deciding the other way would give the specification two
      answers about one fact's disclosure depending on which screen reads it. It costs the refusal
      nothing: the release still names every offending hypothesis, and placement stays
      unrestricted, so the rule adds a disclosure and no gate. Policy with eventual consistency
      because the state belongs to hypothesis-revision, a separate aggregate root from the case
      version whose manifest presents the entry — identical to the two sibling disclosures over
      this surface.
  - location: rules/knowledge/a-presented-manifest-entry-states-its-pinned-revisions-state.md
    field: statement
    unstated: >-
      What a manifest entry's presentation states for its pinned hypothesis-revision's own
      draft-or-released state while the read of that revision's state has not yet completed, and
      what it states when that read fails. The rule's statement was written as an unconditional
      disclosure of a state already in hand, naming only three things it does not depend on (the
      case version's own state, a release having been attempted, the reader opening the revision
      selector), and its expression reads the state "from that revision itself" — a separate
      aggregate root, read separately — without saying what stands in the entry before that read
      returns or after it fails, so both windows would fall to whatever the interface happened to
      render.
    decided: >-
      Each window is stated explicitly on the entry and never left blank: while the read has not
      yet completed the entry states that this pin's state is still being read, and where the read
      fails the entry states that this pin's state could not be read. The three presentations — a
      state read, a read still outstanding, a read that failed — are distinguishable from one
      another, and none of them is the presentation of an entry carrying no state; neither window
      is ever presented as a draft or released state.
    why: >-
      This specification refuses, repeatedly and for one reason, a presentation that reads
      identically in materially different situations: a-manifest-entrys-pinned-revision-is-always-shown,
      a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest and
      a-hypothesis-revisions-listing-discloses-each-revisions-own-state each exist for that reason,
      and the entry filling a-cases-current-pins-come-from-its-highest-numbered-version.statement
      rejected a bare blank in this same neighbourhood in exactly these words — "absence, a failed
      read and a pending read then read alike". A blank here is worse than uninformative: it reads
      like an entry whose pin is releasable, which is precisely the reading this rule was written
      to stop a curator taking without evidence. Defaulting to either state instead would state a
      fact nobody read. The two windows are told apart rather than merged into one notice because
      the curator's next act differs — an outstanding read resolves itself, a failed one is worth
      retrying — the same distinguishability
      releasing-an-already-released-revision-tells-the-curator-so was decided on, and
      a-release-refusal-with-no-named-violation-says-so before it. The substance alone is stated
      and the wording is left to the interface, following the entry filling
      constraints/no-route-enforces-authentication.statement, and the rule's own closing line that
      already leaves the control and its wording to the interface. It lands in this rule's own
      statement rather than a new node because it answers the same one question this rule already
      answers — what a presented entry states about its pin's state — and it adds no field, moves
      no pin, refuses no call and leaves the read's source (the revision itself) untouched.
  - location: constraints/a-domain-error-unmapped-by-status-is-refused-generically.md
    field: statement
    unstated: >-
      What a caller is told when a domain error the status map does not name reaches the HTTP surface.
    decided: >-
      HTTP 500 with error code INTERNAL_ERROR and the fixed message "an unexpected error occurred"; neither the error's own message nor any context it carries is disclosed.
    why: >-
      The material is the reviewed, delivered error-handler middleware and its own unit tests
      (src/__tests__/unit/http/error-handler.middleware.spec.ts and
      src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts), whose findings from
      /review-change over hipotese-release-proprio report the delivered backend stating this
      fact — code, message, and the absence of any leaked detail — while no node held it. Stated
      once for the whole system, mirroring constraints/a-malformed-request-is-refused-with-a-validation-error's
      own placement for the sibling case of a request the route's own shape already refuses:
      every route answers an unmapped error identically, through the one shared middleware, so
      the fact belongs to the system rather than to any one route.
  - location: rules/knowledge/a-case-has-at-least-one-hypothesis.md
    field: statement
    unstated: >-
      What remove-hypothesis answers when asked to remove a hypothesis name the manifest does not currently hold.
    decided: >-
      Succeeds with no effect, never refused for the name's absence.
    why: >-
      The material is the reviewed, delivered manifest-composition.operations.ts and its own
      test (src/__tests__/integration/case/manifest-composition.operations.spec.ts, reported by
      /review-change over hipotese-release-proprio), which calls store.removeManifestEntry
      unconditionally with no existence check first — a DELETE affecting zero rows completes
      the same as one affecting one. The delivered, reviewed behavior is the fact stated, rather
      than inventing a not-found refusal nothing built raises.
  - location: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle.md
    field: statement
    unstated: >-
      Whether CaseVersionNotDraftAtReleaseError's refusal carries any further value beyond its own identity.
    decided: >-
      It carries the version's own slug, version number and the state it stood in.
    why: >-
      The material is the reviewed, delivered CaseVersionNotDraftAtReleaseError class and its
      own test (src/__tests__/integration/case/release.operation.spec.ts, reported by
      /review-change over hipotese-release-proprio), which already constructs and asserts
      exactly this context. Unlike the sibling hypothesis-revision refusal, which the material
      never built a context for, this refusal's context already exists and is exercised; stating
      the delivered fact rather than forcing an unbuilt symmetry with the sibling rule.
  - location: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle.md
    field: statement
    unstated: >-
      What HypothesisRevisionNotDraftAtReleaseError's own prior statement — that the revision
      stood in released state "whenever this refusal is raised" — implies about a release asked
      of a hypothesis-revision identity nothing was ever stored for, given
      ReleaseHypothesisRevisionOperation reads an undefined state for such an identity and
      raises the identical refusal.
    decided: >-
      The refusal is raised for a revision not currently in draft state, including an identity
      nothing was ever stored for, and it never discloses which of those triggered it.
    why: >-
      The material is the reviewed, delivered ReleaseHypothesisRevisionOperation and its own
      test (src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts,
      reported by /review-change over hipotese-release-proprio), which asserts the identical
      refusal for a never-stored identity as for an already-released one — the prior wording
      ("released whenever this refusal is raised") overclaimed a fact the delivered code
      contradicts; correcting the statement to what was actually built and reviewed, rather than
      changing the operation to draw a distinction nothing asked for and the refusal's own
      no-further-value design deliberately withholds.
  - location: rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused.md
    field: statement
    unstated: >-
      What CaseNotFoundError's HTTP 404 response's details payload carries.
    decided: >-
      The named slug and version.
    why: >-
      The material is the reviewed, delivered CaseNotFoundError class and its own test
      (src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts, reported by
      /review-change over hipotese-release-proprio), which already constructs and asserts
      exactly this details shape, matching the same disclosure the sibling 404s already state
      for their own misses.
  - location: rules/investigation/only-a-released-case-version-is-diagnosed.md
    field: statement
    unstated: >-
      What answers an attempt to diagnose a case version not in released state.
    decided: >-
      HTTP 409 reporting a CaseVersionNotReleasedError.
    why: >-
      The material is the reviewed, delivered status-map.ts (reported by /review-change over
      hipotese-release-proprio), the only place that already maps CaseVersionNotReleasedError to
      409; stating the delivered, reviewed fact rather than leaving the refusal's shape provable
      only by reading the map.
  - location: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft.md
    field: statement
    unstated: >-
      Whether a request to revise a hypothesis may carry a subject type of its own, and how a
      supplied value that disagrees with the subject type the case's draft version declares is
      treated — accepted and left without effect, or refused — is not stated. The rule already
      names the draft version's declared subject type as what the concept-acceptance check reads,
      and domain/knowledge/hypothesis-revision declares no subject attribute, but no node says
      whether the revise request itself carries one, so a caller-supplied subject type had no
      stated standing either way.
    decided: >-
      A revise-hypothesis request declares no subject type of its own: the check reads the subject
      type from the case's draft version and from nowhere else, and a subject type carried on such
      a request is accepted and left without effect — never read, never compared against the draft
      version's declared subject type, and never a ground for refusal.
    why: >-
      The subject type is domain/knowledge/case-version's own declared attribute, correctable only
      through update-draft while that version is draft; domain/knowledge/hypothesis-revision
      declares none. Giving the revise request a subject type of its own would make the curator a
      second home for a fact the case version already owns — exactly what lets
      a-concept-accepts-the-declared-subject-type's check run against a subject type no case
      version declared. Refusing a disagreeing value was the alternative and is rejected: it would
      give the value the standing this decision denies it, making the curator responsible for
      restating a fact the request never asks for and refusing an otherwise correct revision over a
      value that changes neither what is written nor what is checked. The refusal reasoning in
      a-released-hypothesis-revision-is-never-altered does not carry over — that refusal exists
      because a silently dropped alteration would read to the curator exactly like one that landed,
      whereas a supplied subject type asks for no alteration at all and its being dropped changes
      nothing the curator asked to change. The sibling precedents for the accepted-with-no-effect
      branch are already in this context: a-case-has-at-least-one-hypothesis (remove-hypothesis for
      a name the manifest does not hold succeeds with no effect) and the collects branch of
      a-released-hypothesis-revision-is-never-altered.
  - location: rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case.md
    field: statement
    unstated: 'Whether a surface presenting one case named by its slug alone tells a reader that the version
      the case currently uses does not read back as a case at that reading, and how that is told apart
      from a read that did not complete and from a case currently holding no version. validation-runs-at-every-read
      makes a stored version a case only while every validator rule holds, with no field marking one that
      fails, but no node says what a case-keyed surface presents when it meets that state: a-case-read-by-an-unknown-slug-or-version-is-refused
      answers only a slug or version no case version was ever written for, and a-case-holding-no-versions-is-told-explicitly
      answers only a case whose versions are all gone — leaving the case that exists, holds a version,
      and whose current version does not validate, unaddressed by either.'
    decided: The surface states explicitly that the case's current version does not read back as a case
      right now, presents no attribute of that version as the case's current content, and states it in
      terms distinct from both a read that did not complete and a case that currently holds no version;
      where the current version does validate, it states none of this. Recorded as a new policy over domain/knowledge/case
      and domain/knowledge/case-version, eventual.
    why: This specification has answered the identical shape twice in the same direction — a-case-holding-no-versions-is-told-explicitly
      refuses a silence because an absence, a failed read and a pending read all read alike, and a-cases-current-pins-come-from-its-highest-numbered-version
      states explicitly that no revision is in use rather than blanking or substituting one. The three
      states demand different acts of the curator who meets them (author a version, retry the read, correct
      the draft), so presenting any of them alike sends the reader to the wrong act; and a failed read
      already has its own distinct answer in constraints/a-domain-error-unmapped-by-status-is-refused-generically,
      whose deliberately uninformative text must not absorb a state validation-runs-at-every-read fully
      anticipates. No attribute of the version accompanies the statement because a-case-is-read-whole
      answers a complete validated version or nothing, so there is no partial content that could honestly
      be shown. It is a new node rather than an addition to a-cases-current-pins-come-from-its-highest-numbered-version
      because that rule's own Description bounds itself to which version's manifest is read and what is
      said for a hypothesis with no entry; the condition here is the whole version failing validation,
      a different question over the same surface. Which version is "currently in use" is borrowed from
      that rule rather than decided again, and the wording, control and placement are left to the interface,
      as this specification's other surface rules leave them.
  - location: rules/knowledge/a-presented-case-version-states-its-own-declared-attributes.md
    field: statement
    unstated: Whether a curator is shown a case version's own declared attributes — title, when-to-use,
      subject, fallback and consolidation register — on any surface, and what such a surface states where
      the optional one (consolidation register) is absent. Every stated presentation obligation reaches
      a case version's manifest entries (a-manifest-entrys-pinned-revision-is-always-shown, a-presented-manifest-entry-states-its-pinned-revisions-state,
      a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest, a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis),
      a case's hypotheses (a-cases-current-pins-come-from-its-highest-numbered-version) or the route from
      a versions listing to a manifest (a-listed-case-version-offers-a-route-to-its-own-manifest); a-case-is-read-whole
      and contracts/knowledge/case-query say the version's own attributes are assembled and answered,
      and no node says whether a reader is shown them or what stands where the register is absent.
    decided: A curator reading one of a case's versions is shown that version's own declared attributes
      — title, when-to-use, subject, the fallback's outcome and referral, and the consolidation register
      — each read from that version itself and never from another version of the case, for a version in
      either state, draft or released; where that version declares no consolidation register the reading
      states explicitly that this version declares none, never a blank in place of the statement and never
      the register another version declares or the consolidation adapter's own default presented as this
      version's.
    why: 'The attributes are recoverable nowhere else — a-case-summary-is-derived-from-its-existing-versions
      carries title and when_to_use only for a case''s highest released version and never its subject,
      fallback or register — so withholding them leaves a curator correcting a draft through update-draft
      (contracts/knowledge/case-lifecycle, promised by contracts/system/case-authoring) overwriting values
      nobody read, and an auditor of a released version unable to reach the subject a-subject-mismatch-refuses-the-case
      refuses on and the fallback no-confirmation-falls-back answers from, which a-case-version-is-written-once
      and every-case-version-remains-readable preserve for exactly that reading. It adds no read: a-case-is-read-whole
      already assembles a version''s own attributes in the same transaction as its manifest. Both states
      are covered because a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis already settled
      that a version''s state never narrows how much of what is true about it a reader is shown, and a-cases-current-pins-come-from-its-highest-numbered-version
      took that same answer. Sourcing any attribute from another version is the substitution a-manifest-entrys-pinned-revision-is-always-shown
      refuses for a pin. The absent register is stated rather than blank on the identical discipline a-case-holding-no-versions-is-told-explicitly
      and a-cases-current-pins-come-from-its-highest-numbered-version already carry — an emptiness a reader
      cannot tell from a silence — and the adapter''s default is a fact of the consolidation step, not
      a value the version declares, so showing it would misstate a record a-case-version-is-written-once
      fixes. Policy over one aggregate with immediate consistency because every attribute is the case
      version''s own; the surface, the controls and the wording are left to the interface, as every sibling
      presentation rule leaves them.'
  - location: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name.md
    field: statement
    unstated: What a read answers when the case version it names is stored and present but some validator
      rule does not hold at that reading. validation-runs-at-every-read makes such a version not a case,
      with no field marking it; a-case-read-by-an-unknown-slug-or-version-is-refused answers only a slug
      or version no case version was ever written for; a-case-holding-no-versions-is-told-explicitly answers
      only a case whose versions are all gone; contracts/knowledge/case-query publishes read-case but,
      as an api, cannot declare a refusal (that field is command-only per the contract schema); and a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
      obliges a surface to tell this state apart from a read that did not complete while stating nothing
      about the read's own answer. No node anywhere pairs this condition with a status or an error name.
    decided: Refused with an HTTP 409 response reporting a CaseVersionNotValidError — never the unmapped
      domain error's generic INTERNAL_ERROR fallback, and never CaseNotFoundError. Recorded as a new invariant
      over domain/knowledge/case-version.
    why: 'The generic fallback is scoped by its own node to what the system did not anticipate, and this
      condition is fully anticipated by validation-runs-at-every-read, so absorbing it there would make
      a state the specification names unreadable to the caller and would leave a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
      unsatisfiable, since a surface can only distinguish what its read distinguished. Reusing CaseNotFoundError
      was the other alternative and is rejected for the same reason: that refusal''s own Description already
      bounds it to a version never written, and collapsing the two would erase the very distinction the
      surface rule demands. 409 follows this specification''s established reading of an operation the
      target''s own current state forbids (CaseVersionNotReleasedError at diagnose, CaseAlreadyHasDraftError
      at create-draft, ConceptAlreadyAnsweredError at registration), while its 422 is reserved for a well-formed
      write whose result would violate an invariant (a-release-refusal-with-no-named-violation-says-so)
      and no write happens on a read. The error name follows the CaseVersionNot...Error family already
      in this context and names the condition directly. It is a new node rather than an addition to validation-runs-at-every-read,
      whose statement decides whether a stored version is a case at all and deliberately introduces no
      surface answer, nor to a-case-read-by-an-unknown-slug-or-version-is-refused, whose condition is
      a different one over the same read.'
  - location: rules/knowledge/validation-runs-at-every-read.md
    field: statement
    unstated: Whether a stored case version whose content does not assemble into a well-formed case document
      at a reading is a reading for which a validator rule of validation-runs-at-every-read does not hold,
      or a condition of its own with an answer of its own. The rule's statement said only "every validator
      rule" and no node enumerates them; a-release-refusal-with-no-named-violation-says-so names "any
      structural or coherence rule" for release without saying whether a read holds the same set; a-case-version-failing-validation-at-a-read-is-refused-by-name
      answers only the reading for which "some validator rule does not hold"; and the-stored-schema-mirrors-the-declared-model
      states what the store may hold without saying what a read does when stored content falls short of
      it.
    decided: Stored content that does not assemble into a whole, well-formed case version at that reading
      is a validator rule not holding — the structural family of the same validation — and never a condition
      of its own, so that read is refused exactly as a-case-version-failing-validation-at-a-read-is-refused-by-name
      already states, with no second refusal introduced.
    why: The alternative — a condition of its own — would route to the generic unmapped refusal the very
      state this rule's own Description already anticipates ("an incomplete or incoherent draft simply
      does not read back as a case yet"), while constraints/a-domain-error-unmapped-by-status-is-refused-generically
      scopes that fallback to what the system did not anticipate; it would also leave a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
      unsatisfiable for that commonest instance, since the surface must hold this state apart from a read
      that did not complete and can only state what its read distinguished. The specification already
      treats structural and coherence rules as one set answering together at release, and a-case-is-read-whole
      leaves nothing partial to answer with in either family, so the read takes the same set rather than
      splitting one refusal in two by which rule failed.
---