# Full text

Derived by spec.py from the specification files; never edited. Grep here to locate;
open the node file a match names before claiming anything about it.

=== constraints/a-case-is-read-whole
---
statement: A case version read for diagnosis is assembled and validated whole — its own attributes, its manifest and every manifest entry's own hypothesis-revision, resolved in one transaction — or not at all; a hypothesis, its revisions and a draft's own manifest entries may otherwise be created, read, revised or removed independently.
scope: knowledge
fitness: The case-query read returns a complete, validated case version or nothing; independent hypothesis and manifest-entry operations are verified in their own tests.
---

## Description

The aggregate boundary that answers a diagnosis still outlives the one document that used to be it: a manifest entry's own hypothesis-revision sits in a relation of its own, reused rather than copied across versions, so what once kept every hypothesis arriving together was the document rather than a decision, and the decision now states exactly where wholeness still binds.
A partially assembled case version is a case whose collection plan is short and whose precedence order has holes, and neither announces itself — resolve-outcome would answer from whichever manifest entries happened to arrive — so case-query's own read never stops short of the whole manifest, even though authoring it, hypothesis by hypothesis, may.

=== constraints/a-domain-error-unmapped-by-status-is-refused-generically
---
statement: A domain error the status map does not name is answered with an HTTP 500 response whose error code is INTERNAL_ERROR and whose message is the fixed text "an unexpected error occurred"; neither the error's own message nor any context it carries reaches the caller.
scope: system
fitness: An automated test raises an error the status map does not name from a route handler and asserts the answer is HTTP 500 with code INTERNAL_ERROR, the fixed message, and no other field.
---

## Description

Stated once for the whole surface so no route decides the shape of this fallback on its own, mirroring constraints/a-malformed-request-is-refused-with-a-validation-error's own system-wide placement for the sibling case of a request the route's own shape already refuses.
A domain error nothing named is exactly the case this system did not anticipate, so the refusal discloses nothing about it: not the error's own message, which may describe internal state, and not any context object a domain error happens to carry — both stay server-side, and the caller learns only that something failed.

=== constraints/a-malformed-request-is-refused-with-a-validation-error
---
statement: Every route refuses a request whose path, query or body fails the route's declared shape with an HTTP 400 response whose error code is VALIDATION_ERROR, whose message names which of the three failed validation, and whose details list the issues found.
scope: system
fitness: An automated test sends a request with a malformed path segment, one with a negative offset, and one with a body missing a required field, and asserts each answer is HTTP 400 with code VALIDATION_ERROR and a non-empty details list.
---

## Description

Stated once for the whole surface so no route decides the shape of this refusal on its own.
A malformed request states nothing about the domain, so the refusal reports the shape violation and never a domain condition; the domain refusals each route may raise are stated in their own rules and constraints.

=== constraints/consolidation-runs-behind-a-port
---
statement: Assessment consolidation is invoked only through the assessment-consolidator port, with the LLM as one adapter among interchangeable ones.
scope: investigation
fitness: The investigation domain module imports no LLM client; adapters are the only classes implementing the port.
---

## Description

The same resolution `constraints/judgment-runs-behind-a-port` already gives judgment's own house-style tension, applied here: production LLM, test fake, or a future rule-based writer, without a second criterion form in the schema.

=== constraints/diagnosis-answers-synchronously
---
statement: Diagnosis answers within the request that asked it; no job, no queue and no polling stand between the attendant and the assessment.
scope: system
fitness: The diagnosis operation returns the assessment in its own response, verifiable in the api's contract tests.
---

## Description

The attendant waits on screen, which is what makes the absolute deadline and the degradation rules obligatory rather than refinements; a costly hypothesis fits the parallel or does not enter the case, because a second wave does not fit the budget.

=== constraints/evidence-normalization-is-an-anticorruption-layer
---
statement: Observations are translated to the glossary's vocabulary at the integration edge, and no source-system field name crosses into domain elements.
scope: integration
fitness: No domain element, rule or record names a field of a corporate system's response.
---

## Description

The normalizer looks like boilerplate and is the only thing preventing the source systems' vocabulary from becoming the domain's; an anti-corruption layer does not get simplified away.

=== constraints/hypotheses-are-judged-in-isolated-parallel-calls
---
statement: Each hypothesis is judged in its own call, in parallel, under a bounded pool.
scope: investigation
fitness: One provider call per hypothesis appears in the recorded cost, and the pool bound is configuration.
---

## Description

Isolation buys three things beyond its cost: a small prompt, no order bias between hypotheses, and an error contained to one hypothesis.
Judging all hypotheses in one call is roughly ten times cheaper and destroys exactly those properties; revisit only with measurement.

=== constraints/judgment-runs-behind-a-port
---
statement: Hypothesis judgment is invoked only through the hypothesis-evaluator port, with the LLM as one adapter among interchangeable ones.
scope: investigation
fitness: The investigation domain module imports no LLM client; adapters are the only classes implementing the port.
---

## Description

The rule the judgment applies lives in the case's prose, not in code, so the prose-versus-mechanical tension resolves by adapter — production LLM, test fake, future rule evaluator — without a second criterion form in the schema.

=== constraints/listings-are-paged
---
statement: Every list operation a published api offers answers one page selected by an optional non-negative integer offset, defaulting to 0, and an optional positive integer limit, defaulting to a configured default and clamped to a configured maximum; the answer carries the page's data, the total currently held, and the offset, limit and page count applied.
scope: system
fitness: An automated test calls a listing with no offset and no limit and asserts the answer carries data, total, offset 0, the configured default limit and a page count; calls it with a limit above the configured maximum and asserts the applied limit is the maximum.
---

## Description

The contracts describe each listing as every record currently held, and that stays what a caller can learn — in pages, not in one answer.
The default and the maximum are deployment configuration, not business figures, so this constraint names that they exist and never their values.
A page count of zero is what a total of zero yields; no request with a non-positive limit reaches the count, because a-malformed-request-is-refused-with-a-validation-error refuses it first.

=== constraints/no-route-enforces-authentication
---
statement: No route of the backend service is guarded by an authentication mechanism in this build; every request is accepted on the identity it claims, unverified, whoever the caller is; the frontend discloses this posture to every user, on every screen.
scope: system
fitness: No route handler in the API layer declares or invokes an authentication middleware, guard or check; a request reaching any route is dispatched without one.
---

## Description

The requester's identity travels as a claim the caller supplies, never as one the service verifies — consistent with collection running in the requester's own authorization scope rather than the service's, and with the requester being taken directly from the request's own payload with no further resolution inside the domain. Nothing here is a domain rule about who may see what: it is the current state of the solution's own perimeter, standing until a later build decides otherwise.
The disclosure is the substance, not a fixed wording: what the frontend owes every user is being told, on every screen, that this build enforces no authentication — the exact copy is the frontend's own to choose and free to change without this statement moving.

=== constraints/the-capability-identity-read-is-rate-limited
---
statement: The registry's read-capability-by-identity route accepts at most 60 requests per minute from one caller, where one caller is one source IP address; a request beyond that limit is refused with an HTTP 429 response carrying a Retry-After value naming when the caller may retry.
scope: integration
fitness: An automated test issues more than 60 requests within one minute against read-capability-by-identity from one caller and asserts that the response past the limit is HTTP 429 and carries a value naming when the caller may retry.
---

## Description

Nothing else in this build tells a caller of this route to slow down, so an unbounded loop against it competes for the same registry the rest of the system reads. The limit is confined to this one route rather than every route the api publishes, because this is the one the material names — a system-wide limit is a separate decision this constraint does not make. `no-route-enforces-authentication` already holds that no caller's claimed identity is verified here; this constraint's own caller identity is a distinct, narrower question, decided below.

=== constraints/the-capability-identity-read-refuses-an-unregistered-identity
---
statement: The registry's read-capability-by-identity route refuses a name and version no capability is currently registered at with an HTTP 404 response, naming CapabilityIdentityNotFoundError as the specific condition and message of that refusal.
scope: integration
fitness: An automated test requests read-capability-by-identity for a name and version no capability is currently registered at and asserts that the response is HTTP 404, naming CapabilityIdentityNotFoundError as the refusal's own condition and message.
---

## Description

Mirrors the-capability-identity-read-is-rate-limited's own idiom for this same route — an HTTP-level shape stated for the solution rather than the domain — so a miss is never a silent or generic answer but a distinct, named refusal a caller can act on, the same discipline a-release-refusal-with-no-named-violation-says-so and a-case-holding-no-versions-is-told-explicitly already hold for other reads that find nothing.

=== constraints/the-concept-read-refuses-an-unanswered-concept
---
statement: The registry's read-capability route refuses a concept no capability is currently registered for with an HTTP 404 response, naming ConceptNotAnsweredError as the specific condition and message of that refusal.
scope: integration
fitness: An automated test requests read-capability for a concept no capability answers and asserts that the response is HTTP 404 naming ConceptNotAnsweredError.
---

## Description

The same idiom the-capability-identity-read-refuses-an-unregistered-identity holds for the identity-keyed read of this route family: the registry resolves the absence as ordinary data, and the published read turns it into a named refusal of its own.

=== constraints/the-consolidation-prompt-is-closed
---
statement: A consolidation prompt contains only the required hypotheses' evaluations, the evidence any of their citations name, and the case's own consolidation register, in a delimited data block, with no tool calling available to the model.
scope: investigation
fitness: Prompt assembly is a pure function of the evaluations, the cited evidence and the register, and the provider call grants no tools.
---

## Description

The sibling discipline `constraints/the-judgment-prompt-is-closed` already gives judgment's own prompt, applied to consolidation: the register is a closed, fixed-value style choice, never free text, so nothing a curator authors can read as an open instruction to the model — data is data, never instruction, here as much as there.

=== constraints/the-database-is-externally-provisioned
---
statement: The database is provisioned outside the deployment and reached only through a connection URL supplied as configuration; the deployment provisions no database service.
scope: system
fitness: The deployment declares no database service, and the connection URL is read from environment configuration and from nowhere else.
---

## Description

A managed instance somebody else operates is what the deployment gets, so nothing here backs up, upgrades or fails over a database.
Which provider operates it is a deployment choice and not a solution bound: naming one would refuse a second environment provisioned differently, while the property a check can hold — that the deployment provisions nothing and hardcodes no endpoint — is what this states instead.

=== constraints/the-deadline-is-an-absolute-propagated-instant
---
statement: A request records one absolute deadline at entry, every stage receives the minimum of its nominal budget and the remaining time, and the internal total stays below the caller's timeout with margin.
scope: investigation
fitness: A load test at saturation shows no response later than the declared total and no stage granted more than the remaining time.
---

## Description

Summing stage budgets and calling the sum a deadline leaves nothing for the overhead between stages; a stage finishing early returns its balance to the next, a late one takes from those that follow, and the last to run pays.

=== constraints/the-domain-depends-on-no-infrastructure
---
statement: The domain layer — case behavior, investigation factory, evaluation, vocabulary — imports no framework, no driver and no provider client; infrastructure reaches it only through ports.
scope: system
fitness: A dependency audit over the domain modules' imports finds no framework, driver or client package.
---

## Description

The core is the case schema and its validator; keeping the domain importable without infrastructure is what keeps its logic testable as pure unit tests.

=== constraints/the-evidence-cache-admits-only-ok-results
---
statement: When an evidence cache exists, its key is concept, subject type, the subject's whole set of attribute-values and inputs, its ttl comes from the concept, and only evidence with result ok enters.
scope: investigation
fitness: A cache write of a non-ok result is impossible by construction, verifiable in the cache adapter's tests.
---

## Description

Caching unavailability makes the next investigation inherit an already-resolved failure, and the subject type belongs in the key because the same attribute-values of different subject types would otherwise collide.
The cache is a day-two lever: it shortens the tail, never the cold path the deadline actually presses on.

=== constraints/the-judgment-prompt-is-closed
---
statement: A judgment prompt contains only one hypothesis's criterion, its own evidence — each item carrying its snapshotted concept meaning and field semantics (name, and type and description where declared) exactly as they stood when that evidence was collected — and the pinned case's title and when_to_use, in a delimited data block, with no tool calling available to the model; prompt assembly makes no live read of the glossary or the capability registry.
scope: investigation
fitness: Prompt assembly is a pure function of the hypothesis's criterion, its own evidence's own snapshotted fields, and the pinned case's title and when_to_use, and the provider call grants no tools; nothing prompt assembly reads is answered by a registry or glossary lookup made at judgment time.
---

## Description

Without tool calling the model cannot be led to act, and the delimited block plus the fixed system rule keep a free-text field from leading it to judge wrongly — data is data, never instruction.
The case's title and when_to_use enter as situational context, so the model judges knowing which troubleshooting scenario it stands in; no other hypothesis's criterion and none of the subject's identifying attributes enter, and the block stays closed — only its permitted content grew by these two case facts, and again by the semantics domain/investigation/evidence now snapshots.
rules/investigation/a-cited-field-exists-in-the-capability-output-schema demands a citation's field exist among the field names its own evidence item snapshotted, and a model never shown those field names has no way to satisfy it; they enter per evidence item alongside their own type and description and the observation, still as data the model reads and never as an instruction.
rules/investigation/judgment-reads-the-evidence-snapshot is what keeps this pure: the semantics that ground a judgment are fixed at collection, inside the evidence itself, so a capability re-registered or a concept re-described after collection never changes what an already-collected item's judgment sees.

=== constraints/the-schema-replays-from-its-scripts
---
statement: The schema is reconstructible on an empty database by applying the migration scripts in the order they are numbered.
scope: system
fitness: Applying every script in order to an empty database produces the schema the current tree expects, with no step performed by hand.
---

## Description

This is the half of the property that outlives whichever registry a project sets for itself: where the scripts live and what form they take is one project's own arrangement, and a standard's rule is the only place that decides it.
Replay is what makes a schema readable before it runs — a fresh environment, a test database and a restored one all arrive the same way, and a step somebody performs by hand is a step no tree records.

=== constraints/the-stored-schema-mirrors-the-declared-model
---
statement: Every column of every relation that holds a record pairs with one attribute a Domain Model element declares; the schema's own migration bookkeeping is the one exemption.
scope: system
fitness: Each relation and column the migrations create pairs with the element and declared attribute it encodes; a column pairing with none, and a required attribute no column holds, are both departures.
---

## Description

It is what keeps the schema from becoming a second home for a domain fact: a column nothing in the specification declares is a fact the business never decided, arriving through the one door no review stands at.
The direction that costs more is the second one — a declared attribute no column holds is a fact the specification states and the system cannot record, and it is invisible from the schema alone.
The exemption is narrow on purpose: what tracks which scripts ran answers to no element because it is not a record of the domain, and every other relation is.
The pairing is per column and not per relation, so a relation may draw its columns from more than one element — which is what the evidence cache this specification already admits requires, its key being a concept, a subject type, a subject's attribute-values and the inputs, each declared by a different element and none of them a fact the cache invents.

=== constraints/the-system-persists-to-one-relational-database
---
statement: Everything the system records persists in one transactional relational store; no record is held in a file the deployment ships or writes.
scope: system
fitness: No store reads or writes a file to hold a record, and every record answers from the same connection.
---

## Description

The four things the system keeps — the cases, the published vocabularies, the capability registrations and the investigations — land in the same store, so one connection answers for every record and no fact is split across two media.
Which engine and which driver is the project's own standard to name, and naming them here as well would put the same fact in two houses that a later change has to remember to edit both of.
What the domain requires of a record, written once and whole before the response, binds a row exactly as it bound the file it replaces.

=== contracts/glossary/glossary-authoring
---
type: api
direction: published
operations:
  - register-concept
---

## Description

Now that an operator authors a concept directly rather than only ever reading one: register one — creating it at a new name, or replacing whatever concept already stood at that name — held apart from glossary-query because that surface is a read, and this one is not.

=== contracts/glossary/glossary-query
---
type: api
direction: published
operations:
  - read-vocabulary-term
  - read-concept
  - list-vocabulary-terms
  - list-concepts
---

## Description

The synchronous read the published language offers: resolve a vocabulary term or a concept exactly as the glossary currently holds it; or list every term one vocabulary currently holds and every concept currently registered, in pages (constraints/listings-are-paged).
A read by a name nothing holds is a refusal of its own (rules/glossary/a-glossary-read-by-an-unheld-name-is-refused).

=== contracts/integration/capability-registry
---
type: api
direction: published
operations:
  - read-capability
  - read-capability-by-identity
  - list-capabilities
  - register-capability
---

## Description

The synchronous surface the registry offers: the capability currently answering a concept, with its declared contract; the capability currently registered at a given identity, name and version together; every capability currently registered, in pages (constraints/listings-are-paged); and, now that an operator authors these directly, register one — creating it at a new name and version, or replacing whatever already stood at that identity.

=== contracts/integration/concept-observation
---
type: api
direction: published
operations:
  - observe-concept
---

## Description

The open host service of the integration context: observe one concept for one subject, read-only, within the requester's scope, answering in the glossary's vocabulary within the capability's timeout.

=== contracts/integration/connector-configuration-registry
---
type: api
direction: published
operations:
  - read-connector-configuration
  - list-connector-configurations
  - register-connector
---

## Description

The synchronous surface over connector configurations: the one currently registered under a name, or every one currently registered, in pages (constraints/listings-are-paged); and, now that an operator authors these directly, register one — creating it or replacing whatever configuration already answered to that name.

=== contracts/integration/connector-diagnostics
---
type: api
direction: published
operations:
  - test-connector
---

## Description

Exercise a connector configuration's own call once, through a specific registered capability that names it, against a subject assembled the same way any other observation assembles one — never a stored subject read back, because nothing in this system stores one. Diagnostic only: nothing this operation returns is evidence, and no investigation ever reads what it returned.

=== contracts/integration/corporate-records-source
---
type: api
direction: consumed
upstream: contracts/system/corporate-records
operations:
  - read-observation
---

## Description

The consumption of the external systems' supply, confined to this context so no source-system vocabulary crosses further in.
One generic read per registered capability, never a fixed operation against one named system: which system a call reaches is resolved by the capability's own connector, and the set of systems reachable this way changes over time.

=== contracts/integration/glossary-vocabulary
---
type: api
direction: consumed
upstream: contracts/glossary/glossary-query
operations:
  - read-concept
---

## Description

What normalization reads from the glossary: the vocabulary it translates into, which is why integration depends on the glossary and not on the knowledge context.

=== contracts/investigation/assessment-reviewed
---
type: domain-event
direction: published
payload: domain/investigation/assessment
---

## Description

The operator's later judgment of an assessment, a second event only because it arrives afterwards and from outside.
It is what labels the regression corpus.

=== contracts/investigation/case-simulation
---
type: api
direction: published
operations:
  - simulate-case
  - simulate-hypothesis
---

## Description

The curator's own entry to the same engine a diagnosis runs, open to a case version in either state — draft or released, where a diagnosis reads only released.
`simulate-case` runs the same collection, judgment, resolution and consolidation a diagnosis runs, and returns the whole record back: evidence per concept, evaluation per hypothesis with its citations, the resolved outcome, the assessment, cost and durations — the detail `rules/investigation/the-customer-sees-only-the-text` keeps from the customer, faced to the curator instead.
`simulate-hypothesis` narrows the same run to what one named hypothesis revision collects and judges, alone, and resolves no outcome — one hypothesis does not resolve a case.
Neither operation writes an investigation, emits an event, or lets anything it collects reach a cache: `rules/investigation/a-simulation-writes-no-investigation` holds both to that.
Neither operation carries a narrative or a ticket reference — both belong to the investigation record neither operation ever creates.

=== contracts/investigation/case-source
---
type: api
direction: consumed
upstream: contracts/knowledge/case-query
operations:
  - read-case
---

## Description

The customer-supplier edge: the investigation runs exactly the case the knowledge context published, pinned by slug and version at the start of the request.

=== contracts/investigation/diagnosis
---
type: api
direction: published
operations:
  - diagnose
---

## Description

The synchronous entry of the whole flow: case, subject, narrative and requester in, with an optional ticket reference, assessment out, within the declared deadline.
Every call is fresh: the whole engine runs again — collection, judgment, consolidation and writing — and no call returns, reuses or joins an earlier investigation.
The ticket reference is correlation with the ticketing system, for traceability and audit, never a matching key.

=== contracts/investigation/glossary-source
---
type: api
direction: consumed
upstream: contracts/glossary/glossary-query
operations:
  - read-vocabulary-term
---

## Description

What the investigation reads from the published language: the subject types and terms its records name.

=== contracts/investigation/investigation-completed
---
type: domain-event
direction: published
payload: domain/investigation/investigation
---

## Description

The one event, and the whole learning loop is projection over it: hypotheses that never confirm, co-confirmations that expose wrong precedence, recurring non-ok results, recurring inconclusive reasons, cost and durations per case.
No additional event and no feedback context.

=== contracts/investigation/observation-source
---
type: api
direction: consumed
upstream: contracts/integration/concept-observation
operations:
  - observe-concept
---

## Description

The collection stage consuming the integration context's open host service, one call per concept in the plan, in parallel.

=== contracts/knowledge/capability-check
---
type: api
direction: consumed
upstream: contracts/integration/capability-registry
operations:
  - read-capability
---

## Description

What the contract check reads from the integration context: the current registration of every concept a case collects.

=== contracts/knowledge/case-input-requirements
---
type: api
direction: published
operations:
  - read-case-input-requirements
---

## Description

The read a curator composing a case version, and the interface assembling a subject before a diagnose, simulate-case, or simulate-hypothesis call, all need: which subject attributes the version's own collection plan reaches, which of those it cannot be diagnosed without, and which currently-registered capabilities ask for each (rules/knowledge/a-case-versions-input-requirements-are-derived).
Answers for a case version in either state, draft included; a draft still under composition is read here the same as a released one, though only a diagnose itself ever refuses one for being a draft.
Names, apart from the attributes themselves, every capability the collection plan resolves whose own input schema does not currently hold a well-formed shape (rules/integration/a-capability-input-schema-holds-a-well-formed-object) — one that answers a concept the plan reaches but currently declares no attribute at all, so an operator can find and re-register it.

=== contracts/knowledge/case-lifecycle
---
type: api
direction: published
operations:
  - create-draft
  - revise-hypothesis
  - release-hypothesis
  - place-hypothesis
  - remove-hypothesis
  - update-draft
  - release
  - discard
---

## Description

The curator's entrance now that no file is the medium: start a draft, revise a hypothesis, place it in (or remove it from) the draft's own manifest, correct the draft's own declared attributes, as many times as curation needs, then release — every validator rule answering together at that one moment, before the version stands immutable — or discard the draft instead, with nothing ever having been usable in its place.
Revising a hypothesis writes into that hypothesis's own highest existing revision, in place, for as long as that revision is itself in draft state; once released, revising instead creates the next revision — `rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased` holds the target, `rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft` still holds the draft it is checked against.
A hypothesis's own release, `release-hypothesis`, is a curator's action taken directly against a hypothesis-revision — never against a case, and answering to no manifest at all: `rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle` governs it, and `rules/knowledge/a-released-hypothesis-revision-is-never-altered` is the guarantee it establishes.
Written once is what makes release the one act that turns editing into a version nothing may still merge into — a release naming a slug and version that already exist is refused rather than merged, and revising a released case always starts the next draft. A case version's own release additionally requires every manifest entry to reference a released hypothesis-revision (`rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions`) — refused together with every other violated rule, never partially.

=== contracts/knowledge/case-query
---
type: api
direction: published
operations:
  - read-case
  - list-cases
  - list-case-versions
  - list-hypotheses
  - list-hypothesis-revisions
---

## Description

The synchronous read the knowledge context offers: a case by slug and version, validated at this reading, and read whole; and the listings a curator browses by — every case, the versions of one named case, the hypotheses of one named case, and the revisions of one named hypothesis.

=== contracts/knowledge/vocabulary-terms
---
type: api
direction: consumed
upstream: contracts/glossary/glossary-query
operations:
  - read-vocabulary-term
  - read-concept
---

## Description

What case validation reads from the glossary: every term a case names must exist there at the moment of reading.

=== contracts/system/case-authoring
---
type: capability
---

## Description

The system's promise to the curator: compose a case version freely while it is a draft — its manifest and its own declared attributes alike, pointing at a hypothesis-revision whatever state it is in — release it only once every validator rule answers together, with all refusals at once, and trust a released version never to change again — so knowledge improves by curation rather than by code, at whatever pace revising a hypothesis takes, without forcing every adjustment to become a new version of its own. A hypothesis's own release is the curator's, too: a revision may be released independently, on the hypothesis's own terms, whether or not any case has ever pointed at it.

=== contracts/system/corporate-records
---
type: capability
---

## Description

What the registered external systems supply, collectively: read-only observations of registered concepts, read on demand within the requester's authorization scope.
The systems behind this supply are never fixed or enumerated here: one may start supplying observations and another may stop, and which one currently answers a given concept is exactly what a capability's own connector names — never a vendor name written into the specification.

=== contracts/system/guided-diagnosis
---
type: capability
---

## Description

The system's promise to the attendant: choose a case, name the subject and the narrative, and receive within the deadline an assessment with an outcome, a referral and a text — degraded if it must be, recorded always.

=== decision-log
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

=== domain/glossary/_context
---
strategic: supporting
---

## Description

The published language of the whole system: the five vocabularies — subject types, subject attributes, outcomes, actions, recipients — and the concepts a case may collect.
Pure data with no behavior; every other context depends on it and translates into it, never around it.

## Responsibility

Hold every term a case, an investigation or a capability may name, so each term exists exactly once, spelling cannot drift, and cross-case reporting stays possible; accept a new concept, or a changed one, exactly as an operator registers it.

=== domain/glossary/action
---
type: value-object
attributes:
  - name: name
    type: string
    required: true
---

## Description

What the recipient of a referral does (the material's "ação").
A global vocabulary: a new term enters when what somebody does changes, never when the motive changes.

## Responsibility

Name one act a referral can request.

=== domain/glossary/concept
---
type: value-object
attributes:
  - name: name
    type: string
    required: true
  - name: accepts
    type: subject-type
    required: true
    many: true
  - name: ttl
    type: integer
    required: true
  - name: description
    type: string
    required: true
---

## Description

A named observation a hypothesis may collect (the material's "conceito").
It declares which subject types it accepts and its ttl — the strictest freshness tolerance among the cases that use it, in seconds.
Deliberately thin on shape — the shape of the data it names belongs to the producing capability's output schema, never to the concept — but not on meaning: its description states what the named observation means, which is exactly what a published language owes the speakers who read it.

## Responsibility

Publish the name every collection, evidence and citation uses, and the two constraints the glossary must guarantee for it.

=== domain/glossary/outcome
---
type: value-object
attributes:
  - name: name
    type: string
    required: true
---

## Description

What a confirmed hypothesis, or the fallback, concludes (the material's "desfecho").
A contributed vocabulary: each confirmable hypothesis of each case contributes one, registered globally only to keep spelling stable and to allow reporting across cases.
The two non-conclusion outcomes exist before the first case does.

## Responsibility

Name one conclusion a diagnosis can reach.

=== domain/glossary/recipient
---
type: value-object
attributes:
  - name: name
    type: string
    required: true
---

## Description

The operational queue a referral addresses (the material's "destinatário").
Global and stable: real operational queues, a role and never a person.

## Responsibility

Name one role a referral can be forwarded to.

=== domain/glossary/subject-attribute
---
type: value-object
attributes:
  - name: name
    type: string
    required: true
---

## Description

One identifying attribute a subject instance may carry — an id, a phone number, a contract number (the material's "atributo do sujeito").
A discovered vocabulary, the same shape as concept, subject-type, outcome, action and recipient: it grows as a new kind of identifying data enters, never designed ahead of it.

## Responsibility

Name one attribute a subject's identity may be assembled from.

=== domain/glossary/subject-type
---
type: value-object
attributes:
  - name: name
    type: string
    required: true
---

## Description

A kind of subject an investigation may examine — a contract, a customer, a network element, a region (the material's "tipo de sujeito").
A discovered vocabulary: it grows as cases declare their subjects, never designed ahead of them.

## Responsibility

Name one subject kind exactly once, so cases and concepts agree on what they accept.

=== domain/integration/_context
---
strategic: generic
---

## Description

Access to the external systems: the registered capabilities, their registry, the connector configurations a capability's own connector may name, and the normalization that keeps source-system vocabulary out of the domain.
The systems behind a capability's connector are an open, variable set — one may start existing, another may stop — and nothing outside this context ever needs to know which one currently answers a concept.
Generic by construction — replaceable, and nothing in it is domain knowledge beyond the contract it promises.

## Responsibility

Execute read-only capabilities within the requester's authorization scope and deliver observations already translated to the glossary's vocabulary; hold what an operator registers directly — a capability, a connector configuration — and let one be exercised once, diagnostically, through a capability already committed read-only.

=== domain/integration/capability
---
type: aggregate-root
attributes:
  - name: name
    type: string
    required: true
  - name: version
    type: string
    required: true
  - name: nature
    type: capability-nature
    required: true
  - name: input_schema
    type: string
    required: true
  - name: output_schema
    type: string
    required: true
  - name: timeout
    type: integer
    required: true
  - name: connector
    type: string
    required: true
  - name: concept
    type: domain/glossary/concept
    required: true
---

## Description

One registered read-only observation the system can perform, identified by name and version (the material's "capacidade").
It answers exactly one concept, the one the registry resolves it by.
Its input schema, once its own shape is declared, names which subject attributes it uses and which it cannot observe without; its output schema, stated in the glossary's vocabulary, bounds every citation over the evidence it produces; its timeout is its own budget inside the collection's global deadline; its connector names the adapter that executes it.
The capability resolves internally whatever derivation its concept needs — an address from a contract, a region from an access — so derivation is never the case's work.

## Responsibility

Declare its contract completely — nature, both schemas, timeout in milliseconds, connector, the concept it answers — so the registry can refuse what departs from it and resolve by it.

=== domain/integration/capability-nature
---
type: enumeration
values:
  - read-only
  - mutating
---

## Description

What a capability may do to the world.
Only read-only registers; mutating exists as a value so the registry has something to refuse — the system diagnoses and refers, never acts.

## Responsibility

None.

=== domain/integration/capability-registry
---
type: domain-service
operations:
  - register-capability
  - resolve-concept
---

## Description

The one lookup from a concept to the capability that answers it, one to one, with no fallback chain until a second source of the same concept exists.
The most generic piece of the system; nothing in it is for case curation to read.

## Responsibility

Refuse any registration that is not read-only, lacks its declared contract, declares a schema that is not valid JSON, declares an input schema that does not hold a well-formed shape, names a connector whose registered configuration already embeds a placeholder its own input schema does not declare, or answers a concept a capability of another identity already answers; resolve each concept to exactly one capability as currently registered, and refuse to resolve one the holding answers more than once.

=== domain/integration/connector-configuration
---
type: value-object
attributes:
  - name: connector
    type: string
    required: true
  - name: configuration
    type: string
    required: true
---

## Description

A named, opaque configuration an operator authors directly, naming everything one connector needs to derive and issue its call.
Its shape is not fixed here, the same restraint a capability's own input and output schemas already hold: what it must be is a well-formed JSON object; what its keys mean is the executing connector's own statement, made for the HTTP connector by an-http-connector-configuration-declares-its-call and applied at observation rather than at registration.
Its configuration is held and answered as JSON object text, whatever form a registration supplied it in.
A capability's own connector attribute may name one of these by its connector value, but nothing enforces that the name resolves to a configuration that exists — exactly as a capability may be registered today before its connector is ever configured.

## Responsibility

Hold, by name, whatever configuration a connector currently answers to, replacing it whole on every edit rather than merging into what stood before; carry a connector name, since without one there is nothing to hold it by.

=== domain/integration/connector-configuration-registry
---
type: domain-service
operations:
  - register-connector
---

## Description

Registers a connector configuration by name, replacing whatever configuration already answered to it — the same replace-whole-on-edit a connector configuration itself declares, and the counterpart to the capability registry's own register-capability, kept as its own service because a connector configuration answers to no concept and resolves to no capability: it is named, not resolved.

## Responsibility

Refuse any registration whose configuration is not a well-formed JSON object, or whose own text embeds a placeholder naming a Subject attribute a capability already registered against that connector's name does not declare in its input schema; hold the current configuration for each connector name as currently registered.

=== domain/investigation/_context
---
strategic: supporting
---

## Description

The execution of one case over one subject: collect, judge, resolve, write, persist, respond.
Thin and obvious by design — the business logic lives on the case; this context runs it under an absolute deadline.

## Responsibility

Produce one immutable investigation per request within the declared deadline, degrading stage by stage rather than failing, and respond only after the record is written.

=== domain/investigation/assessment
---
type: value-object
attributes:
  - name: outcome
    type: domain/glossary/outcome
    required: true
  - name: referral
    type: domain/knowledge/referral
    required: true
  - name: determining_hypothesis
    type: string
  - name: text
    type: string
    required: true
  - name: register
    type: domain/knowledge/consolidation-register
    required: true
  - name: usage
    type: usage
    required: true
  - name: elapsed_ms
    type: integer
    required: true
  - name: prompt
    type: string
    required: true
---

## Description

The answer (the material's "parecer"): outcome, referral and determining hypothesis come from the case's resolve-outcome and are never decided here; the text is the only field the writing produces.
The writing receives narrowed input, so the text cannot contradict the outcome — it is never given the material to do so.
The determining hypothesis is absent when nothing confirmed and the fallback answered.
register is the register the writing call actually used to produce the text — the pinned case version's own declared register when it holds one, or whatever register the consolidation adapter defaults to when the version declares none (`domain/knowledge/case-version`). It is required, never absent, because the writing call always settles on some one register before it can produce text at all, whichever side supplied it; a reader is never left to guess which register is behind the text now on hand.
usage is the consolidation call's own record — what the provider charged for producing the text — the same call-level shape `domain/investigation/evaluation`'s own usage attribute already carries for a judgment call. It is required rather than optional: cost's own "one writing call, linear in hypotheses" holds unconditionally, so a consolidation call, unlike a hypothesis's judgment, never has a no-data reason to have skipped running.
elapsed_ms and prompt are the same call's own record for how long that call took and the consolidation prompt as it actually materialized — the same call-level facts `domain/investigation/evaluation`'s own elapsed_ms and prompt attributes already carry for a judgment call. Like usage, both are required rather than optional here, for the same reason: a consolidation call never has a no-data reason to have skipped running, so neither is ever absent.

## Responsibility

Carry what the requester acts on, whole, and only after the record is written.

=== domain/investigation/assessment-consolidator
---
type: domain-service
operations:
  - consolidate
---

## Description

The port through which the assessment's text is produced once every required hypothesis's judgment is closed.
Outcome, referral and the determining hypothesis are never decided here — they come from the case's own resolve-outcome, already computed, unchanged by this call. The rule this port applies is a house style, not a domain fact, so the tension between a curator's framing and a mechanical one resolves by adapter — an LLM in production, a fake in test — without a second criterion form in the schema, the same resolution `domain/investigation/hypothesis-evaluator` already gives its own tension.

## Responsibility

Given every required hypothesis's evaluation, the evidence any of their citations name, and the pinned case's own consolidation register, return the assessment's text together with the register that call used and the call's own usage, elapsed_ms and prompt.

=== domain/investigation/citation
---
type: value-object
attributes:
  - name: concept
    type: domain/glossary/concept
    required: true
  - name: field
    type: string
---

## Description

The traceability a decided evaluation must carry: one concept and one field of the observation that grounded the verdict.
Machine-checkable by construction: where field is present, it must exist among that evidence item's own snapshotted field names (rules/investigation/a-cited-field-exists-in-the-capability-output-schema).
field is present when the citation grounds a confirmed or refuted verdict, pointing at exactly one place in the evidence; it is absent when the citation names only which evidence a no-data verdict cites, since that evidence's own item snapshotted no fields at all to point at.

## Responsibility

Point at exactly one place in the evidence that grounds a verdict.

=== domain/investigation/cost
---
type: value-object
attributes:
  - name: calls
    type: integer
    required: true
  - name: input_tokens
    type: integer
    required: true
  - name: output_tokens
    type: integer
    required: true
---

## Description

What this investigation cost at the LLM provider: N hypotheses cost N judgment calls plus one writing call, linear in hypotheses.
Recorded so the projections answer which cases are expensive with data, not with opinion.

## Responsibility

None.

=== domain/investigation/durations
---
type: value-object
attributes:
  - name: collection
    type: integer
    required: true
  - name: judgment
    type: integer
    required: true
  - name: writing
    type: integer
  - name: total
    type: integer
    required: true
---

## Description

How long each stage took, in milliseconds, measured from the first delivery.
It is what says who is exceeding the declared total budget, per stage and per capability.
writing is present exactly when a consolidation call happened — the same conditional presence `domain/investigation/evaluation`'s own per-call attributes already use, and absent for a run that never reaches consolidation.
total is the whole call's own real elapsed time, measured from the same entry instant the deadline was propagated from to the moment the record carrying this same durations value is assembled — before anything downstream (persistence, for an investigation; the answer leaving, for a simulation) reads or stores it. It is never the sum of collection, judgment and writing, which loses the overhead and the gaps between stages that constraints/the-deadline-is-an-absolute-propagated-instant's own rationale already names as lost by a budget-sum reading. For an investigation, total necessarily excludes the persistence stage itself, since this attribute must already hold a value before the record it belongs to is complete enough to persist — durations cannot describe a stage that has not yet run when it is fixed. Held against the declared total, it is what a load test compares to find a stage granted more than the remaining time.

## Responsibility

None.

=== domain/investigation/evaluation
---
type: value-object
attributes:
  - name: hypothesis
    type: string
    required: true
  - name: verdict
    type: verdict
    required: true
  - name: reason
    type: evaluation-reason
  - name: citations
    type: citation
    many: true
  - name: usage
    type: usage
  - name: elapsed_ms
    type: integer
  - name: prompt
    type: string
---

## Description

One hypothesis's judgment, identified by the hypothesis name within the pinned case — a name and not a model reference, because a hypothesis lives inside the case aggregate and is reached only through its root.
Judgment is a non-deterministic domain operation; the guarantee the domain offers is not correctness but being cited and complete.
Usage, elapsed_ms and prompt are the call's own record — what the provider charged, how long the call took, and the judgment prompt as the call actually materialized it — present exactly when a call happened, absent when reason `no-data` means judgment was never called at all.

## Responsibility

Carry one verdict per hypothesis, its citations when decided and its reason when inconclusive.

=== domain/investigation/evaluation-reason
---
type: enumeration
values:
  - no-data
  - judgment-failure
  - deadline-exceeded
---

## Description

Why an evaluation is inconclusive: missing data, a failed judgment call, or a deadline that expired before or during the call.
The three are distinct causes and none is the umbrella of the others — confusing them poisons the projections and points curation at the wrong place.

## Responsibility

None.

=== domain/investigation/evidence
---
type: value-object
attributes:
  - name: concept
    type: domain/glossary/concept
    required: true
  - name: inputs
    type: string
    required: true
  - name: observation
    type: string
    required: true
  - name: observed_at
    type: datetime
    required: true
  - name: ttl
    type: integer
    required: true
  - name: origin
    type: string
    required: true
  - name: result
    type: evidence-result
    required: true
  - name: result_detail
    type: string
  - name: elapsed_ms
    type: integer
    required: true
  - name: fields
    type: field-semantics
    required: true
    many: true
  - name: concept_description
    type: string
    required: true
relationships:
  - target: domain/integration/capability
    type: reference
    cardinality: "1"
---

## Description

What one collected concept returned, normalized to the glossary's vocabulary and identified within the investigation by its concept.
The absence of data is a recorded fact: a timeout, a denial or an unavailability arrives as a result, never as an exception.
The capability reference pins which registered capability, at which version, produced this observation.
elapsed_ms is how long the collection itself took, in milliseconds, whatever the result — the same unit `domain/investigation/durations` already keeps its own stage totals in. An evidence item collected before this attribute existed reads elapsed_ms as 0, meaning not measured, never a read failure and never an invented duration.
fields and concept_description are this item's own snapshotted semantics — the producing capability's own declared field-by-field meaning and the concept's own declared meaning — exactly as the capability registry and the glossary held them at the moment this item was collected, never re-read afterward. A concept collected before it declared a description snapshots an empty one; a concept whose capability never resolved snapshots no fields at all, the same honest degradation the result itself already records. An evidence item collected before fields or concept_description existed as attributes of this element reads each the identical honest-empty way — no fields at all, and an empty concept_description — never a read failure and never an invented semantics.

## Responsibility

Record one observation per collected concept, with when it was observed, where it came from, how the collection ended, and the semantics that grounded it at that moment.

=== domain/investigation/evidence-result
---
type: enumeration
values:
  - ok
  - unavailable
  - denied
  - timeout
---

## Description

How one collection ended.
Only ok carries a usable observation; the other three are facts about the attempt, and only ok may enter a cache.

## Responsibility

None.

=== domain/investigation/field-semantics
---
type: value-object
attributes:
  - name: name
    type: string
    required: true
  - name: type
    type: string
  - name: description
    type: string
---

## Description

One field a capability's own output schema declares, read structurally from that schema's own top-level `properties` object: the key names the field, and its own `type` and `description`, where the schema states them, are read as this field's declared semantics.
No other content of that schema is read or validated — an operator's own hint, never enforced.

## Responsibility

Carry one field's name and, where the schema declares them, its type and description, snapshotted onto the evidence item that names it.

=== domain/investigation/hypothesis-evaluator
---
type: domain-service
operations:
  - evaluate
---

## Description

The port through which one hypothesis is judged against its evidence.
The rule it applies is not in code but in the case's prose, so the tension between a prose criterion and a mechanical one resolves by adapter — an LLM in production, a fake in test, a rule evaluator as a future option — without a second criterion form in the schema.

## Responsibility

Given one hypothesis's criterion, its own evidence — each item's own snapshotted concept and field semantics alongside its observation — and the pinned case's title and when_to_use, return an evaluation that is cited and complete, never inferred, reading nothing live from the glossary or the capability registry.

=== domain/investigation/investigation
---
type: aggregate-root
attributes:
  - name: id
    type: string
    required: true
  - name: requester
    type: string
    required: true
  - name: ticket_ref
    type: string
  - name: narrative
    type: string
    required: true
  - name: subject
    type: subject
    required: true
  - name: prompt_version
    type: string
    required: true
  - name: model
    type: string
    required: true
  - name: evidence
    type: evidence
    required: true
    many: true
  - name: evaluations
    type: evaluation
    required: true
    many: true
  - name: assessment
    type: assessment
    required: true
  - name: cost
    type: cost
    required: true
  - name: durations
    type: durations
    required: true
  - name: written_at
    type: datetime
    required: true
relationships:
  - target: domain/knowledge/case
    type: reference
    cardinality: "1"
    role: pinned-case
---

## Description

One diagnosis of one subject under one pinned case, written once and never mutated — an immutable result produced by a factory that cannot build an invalid instance.
The case reference is pinned by slug and version — a version is written once, so the pair names one content — and, together with model, prompt version and the evidence, forms the replay pins.
No budget, no steps, no closing state: the end is a verifiable condition, not a state to maintain.
written_at records when the one write happened and is not such a state — there is nothing it can be set to next, and nothing reads it to decide whether the investigation is finished.
requester and ticket_ref both arrive in the diagnose call itself; requester is always given, ticket_ref is not — not every diagnose call carries a ticket.

## Responsibility

Hold the complete record — narrative, evidence, evaluations, assessment, cost and stage durations — so the response can follow the record and an audit can replay it.

=== domain/investigation/subject
---
type: value-object
attributes:
  - name: type
    type: domain/glossary/subject-type
    required: true
  - name: attributes
    type: subject-attribute-value
    required: true
    many: true
---

## Description

The one thing this investigation examines: a subject type from the glossary and the set of attribute-values that identify the instance — an id, a phone number, whatever the case's chosen subject type is reached by.
The entry point is not the subject: the interface resolves the customer on the line to the set of attribute-values the chosen case requires, asking which instance when there is more than one, and assembles that whole set before a diagnose, simulate-case, or simulate-hypothesis call — the case itself declares only the subject type, never the attribute-values.
No attribute is filtered out for any one concept: every capability's connector receives the whole set and resolves, on its own, which of the attributes it needs and how to derive its call from them — the same responsibility the capability already holds for deriving what one concept's own contract requires.

## Responsibility

Identify what is under investigation, in the case's declared subject type, by the whole set of attribute-values the entry point assembled.

=== domain/investigation/subject-attribute-value
---
type: value-object
attributes:
  - name: attribute
    type: domain/glossary/subject-attribute
    required: true
  - name: value
    type: string
    required: true
---

## Description

One fact about the subject's identity: a governed attribute name and the concrete value it holds for this instance (the material's example: attribute "id", value "12345").
The same shape citation already gives a concept and a field: one governed name, paired with one free value, so the pair travels as one fact rather than two arrays kept in step by convention.

## Responsibility

Pair one attribute, drawn from the glossary, with the one value it holds for this subject.

=== domain/investigation/usage
---
type: value-object
attributes:
  - name: input_tokens
    type: integer
    required: true
  - name: output_tokens
    type: integer
    required: true
---

## Description

What one provider call spent, at the granularity of the call itself rather than `domain/investigation/cost`'s own total across every call an investigation or a simulation made.

## Responsibility

None.

=== domain/investigation/verdict
---
type: enumeration
values:
  - confirmed
  - refuted
  - inconclusive
---

## Description

What the judgment of one hypothesis concluded.
Every hypothesis receives one; precedence chooses the determining hypothesis and the others keep the verdict they received.

## Responsibility

None.

=== domain/knowledge/_context
---
strategic: core
---

## Description

The curated troubleshooting knowledge: which hypotheses exist for a case, what confirms each one, and which dominates which.
The core subdomain — the model lives in the case schema and its validator, not in classes, so the model is exercised only by validation and test.

## Responsibility

Hold every case as a stable identity with its own draft and released versions, each valid only while every rule holds against the current glossary and capability registry, and every hypothesis as a stable identity with its own revisions a version's manifest may adopt.

=== domain/knowledge/case
---
type: aggregate-root
attributes:
  - name: slug
    type: string
    required: true
  - name: next_version
    type: integer
    required: true
operations:
  - create-draft
---

## Description

A case's own stable identity, named once and never shared with another case.
Almost everything a curator once wrote directly onto "the case" — title, when-to-use, subject, fallback, its hypotheses — now belongs to a specific case version or to a hypothesis, each reached only through this identity. The one exception is next_version: the number this case's next draft is assigned, always greater than every version number this case has ever held, including one later discarded — a fact of the identity itself, since it must survive the deletion of any one case version without ambiguity.

## Responsibility

Name one case for as long as it exists, hold the one counter that assigns its next draft's version number, and originate a new draft version when a curator starts revising it.

=== domain/knowledge/case-input-requirement
---
type: value-object
attributes:
  - name: attribute
    type: domain/glossary/subject-attribute
    required: true
  - name: required
    type: boolean
    required: true
relationships:
  - target: domain/integration/capability
    type: reference
    cardinality: "1..*"
---

## Description

One subject attribute a case version's derived input requirements name: which glossary subject-attribute it is, whether the case cannot be diagnosed without it, and every currently-registered capability that asks for it — never fewer than one, since an attribute nobody currently asks for is not a requirement at all.
Held by no aggregate and stored nowhere, the same as domain/knowledge/case-summary: computed fresh at every read from the case version's own collection plan and the capabilities currently resolving it, never a fact any case version or capability carries as its own.
A capability referenced here already carries its own name, version, connector and the concept it answers; nothing here restates them, and nothing here carries what that capability's own input schema declares about this attribute — a property's own declared type and description are guidance for whoever displays an entry, never part of what the entry states — so an asking capability reaches whatever reads this entry, an interface assembling a subject included, by its identity alone.
A capability whose own stored input schema does not currently hold a well-formed shape stands in no entry's asking-capability place at all, since it is referenced by none (rules/knowledge/a-case-versions-input-requirements-are-derived); the read names it apart from the attributes instead, by identity, and that is the whole of what reaches the person composing a subject about it (contracts/knowledge/case-input-requirements, rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability).

## Responsibility

Name one subject attribute a case version's collection plan reaches, whether the case requires it or leaves it optional, and every capability currently asking for it.

=== domain/knowledge/case-summary
---
type: value-object
attributes:
  - name: current_state
    type: case-version-state
  - name: version_count
    type: integer
    required: true
  - name: last_updated
    type: datetime
  - name: title
    type: string
  - name: when_to_use
    type: string
  - name: released_version
    type: integer
---

## Description

A case's own identity declares only its slug and the counter that assigns its next draft's number; everything a curator reads about which state a case is in, how many versions it has accumulated, and when it was last touched is read off its versions, never carried by the identity itself. This is that read: one summary, held by no aggregate and stored nowhere, computed fresh from a case's own case-versions.
current_state and last_updated are present only where the case currently holds at least one version; a case whose every version was ever discarded before release holds none to derive either from, and both are absent rather than invented.
title, when_to_use and released_version are present only where the case currently holds at least one released version; a case still only in draft, never yet released, holds none to derive any of the three from, and all three are absent rather than read from a draft.

## Responsibility

Hold the facts a listing of cases needs about one case — current_state, version_count and last_updated derived from the case's own most recently authored version, and title, when_to_use and released_version derived from its own most recently released one — each read off the case's existing case-versions rather than declared by the case's own identity.

=== domain/knowledge/case-version
---
type: aggregate-root
attributes:
  - name: version
    type: integer
    required: true
  - name: title
    type: string
    required: true
  - name: when_to_use
    type: string
    required: true
  - name: authored_at
    type: datetime
    required: true
  - name: subject
    type: domain/glossary/subject-type
    required: true
  - name: fallback
    type: resolution
    required: true
  - name: consolidation_register
    type: consolidation-register
  - name: state
    type: case-version-state
    required: true
  - name: released_at
    type: datetime
  - name: manifest
    type: manifest-entry
    required: true
    many: true
relationships:
  - target: domain/knowledge/case
    type: reference
    cardinality: "1"
operations:
  - collection-plan
  - requires-evaluation-of
  - resolve-outcome
  - place-hypothesis
  - remove-hypothesis
  - update-draft
  - release
  - discard
---

## Description

One numbered attempt at a case's troubleshooting procedure, referencing the case it belongs to.
While in draft, its manifest may be freely composed: a hypothesis may be placed at a position, pointing at any of that hypothesis's own revisions, or removed again.
While in draft, its own declared attributes may likewise be corrected, as many times as curation needs — the same freedom its manifest already holds.
Once released, it is never altered again: its own attributes, and every manifest entry's position and referenced revision, stay exactly as they were at the moment of release.
The fallback is a disguised default hypothesis, explicit on purpose: a fallback claims nothing about the world.
The curator may author a consolidation register alongside the hypotheses; absent, the consolidation step keeps whatever register its own adapter defaults to.
released_at is present only once released.

## Responsibility

Compose, through its manifest, the hypothesis revisions this version of the case uses, in precedence order; correct its own declared attributes while draft state holds; and own the resolution logic over the manifest: the collection plan is the deduplicated union of every manifested revision's collects, requires-evaluation-of lists what totality demands, and resolve-outcome gives the first confirmed hypothesis in declared order its outcome, referral and determining role, with the fallback answering when none confirms.

=== domain/knowledge/case-version-state
---
type: enumeration
values:
  - draft
  - released
---

## Description

Whether a case version may still be revised, or has been published and stands immutable — the two states its lifecycle ever holds.

## Responsibility

Name the one state a case version currently stands in.

=== domain/knowledge/consolidation-register
---
type: enumeration
values:
  - formal
  - plain
---

## Description

The register a case's curator asks the write-up to keep — formal or plain, nothing else.
Fixed and known ahead of time, unlike a discovered vocabulary such as concept or subject-attribute: a register is a closed style choice, never a growing set a new case could extend.

## Responsibility

Name one register the consolidation step may write in.

=== domain/knowledge/hypothesis
---
type: aggregate-root
attributes:
  - name: name
    type: string
    required: true
relationships:
  - target: domain/knowledge/case
    type: reference
    cardinality: "1"
operations:
  - revise
---

## Description

One falsifiable claim's own stable identity within its case, named uniquely across every version the case ever holds — past, current or future.
Its content — the criterion it states, what it collects and the resolution that follows its confirmation — belongs to its revisions, never to this identity directly: revising a hypothesis never changes this name. While its own highest existing revision is itself still in draft state, revising replaces that revision's content in place; once that revision is released, revising instead adds a new revision for a case version's manifest to adopt.

## Responsibility

Name one falsifiable claim for as long as the case exists, and either replace its own highest revision's content in place or originate the next revision, whichever that revision's own state calls for, when its content changes.

=== domain/knowledge/hypothesis-revision
---
type: aggregate-root
attributes:
  - name: revision
    type: integer
    required: true
  - name: criterion
    type: string
    required: true
  - name: collects
    type: domain/glossary/concept
    required: true
    many: true
  - name: resolution
    type: resolution
    required: true
  - name: state
    type: hypothesis-revision-state
    required: true
relationships:
  - target: domain/knowledge/hypothesis
    type: reference
    cardinality: "1"
operations:
  - release
---

## Description

One numbered state of a hypothesis's own content, referencing the hypothesis it belongs to.
Its investigation is the pair collects plus criterion; the criterion is short business prose — one to three sentences — and it is the one field where the expert's nuance is the value, refactorable only by curation.
Carries its own state, draft or released, moved once by its own release — a curator's action taken directly against this revision, answering to no case version and no manifest. Once released, this content never changes again — a further edit always creates the next revision instead, leaving every version that already adopted this one reading exactly what it always read. Before release, a further edit replaces its content in place, and its number stays exactly what it already was. A case version's manifest may point at this revision in either state; pointing at it moves neither.

## Responsibility

State what to collect and what confirms the claim at this revision, declare the resolution that follows its confirmation, and hold its own release: draft until a curator releases it, released and immutable from then on.

=== domain/knowledge/hypothesis-revision-state
---
type: enumeration
values:
  - draft
  - released
---

## Description

Whether a hypothesis-revision's own content may still be edited in place, or has been released and stands immutable — the two states its lifecycle ever holds.

## Responsibility

Name the one state a hypothesis-revision currently stands in.

=== domain/knowledge/manifest-entry
---
type: value-object
attributes:
  - name: position
    type: integer
    required: true
relationships:
  - target: hypothesis-revision
    type: reference
    cardinality: "1"
---

## Description

One line of a case version's manifest: the precedence position this version places one hypothesis at, and exactly which revision of that hypothesis's content it uses.
Reordering two hypotheses between one version and the next changes only the position two manifest entries declare — never the revision either references, and never a fact any hypothesis-revision itself carries.

## Responsibility

Pin one hypothesis-revision at one position within one case version's declared precedence.

=== domain/knowledge/referral
---
type: value-object
attributes:
  - name: action
    type: domain/glossary/action
    required: true
  - name: recipient
    type: domain/glossary/recipient
    required: true
---

## Description

The forwarding a resolution carries: what to do and which operational role does it (the material's "encaminhamento").
It is exactly the part of an assessment that is acted upon, which is why the response never precedes the record.

## Responsibility

Name one action and one recipient from the glossary.

=== domain/knowledge/resolution
---
type: value-object
attributes:
  - name: outcome
    type: domain/glossary/outcome
    required: true
  - name: referral
    type: referral
    required: true
---

## Description

What follows a decided position: the outcome concluded and the referral to act on.
Declared by every hypothesis and by the case's fallback; the material states the two fields, and this analysis names their grouping.

## Responsibility

Pair one outcome with one referral so no position can declare one without the other.

=== rules/glossary/a-concept-declares-its-description
---
type: invariant
statement: The registry refuses to register or update a concept with no description, with an HTTP 422 response reporting a ConceptDescriptionRequiredError.
constrains:
  - domain/glossary/concept
---

## Description

A concept is the vocabulary a capability's evidence and a hypothesis's citation both draw on; a name with no stated meaning is a published term nobody can read.

=== rules/glossary/a-concept-with-an-empty-description-is-read-as-awaiting-one
---
type: invariant
statement: A read of a concept whose description is empty — a legacy concept registered before concepts declared descriptions — answers it as awaiting a description, visibly distinguished from a concept whose description states its meaning; the read invents no meaning for it, and never answers it as a concept holding no meaning.
constrains:
  - domain/glossary/concept
---

## Description

A concept registered before a-concept-declares-its-description existed holds no description at all, never a stated one; a read must say so honestly rather than either inventing a meaning that was never authored or reading the absence as the concept itself meaning nothing. Mirrors, on the glossary's own read side, the same honest degradation domain/investigation/evidence and scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone already hold for a judgment reading such a concept: an empty description is a gap left for an operator to fill, never a claim that the concept carries no meaning.

=== rules/glossary/a-description-states-meaning-never-policy
---
type: policy
statement: A concept's or a field's declared description states what its value means; it names no decision the case's own criterion or the specification's own rules and scenarios govern.
constrains:
  - domain/glossary/concept
  - domain/investigation/field-semantics
consistency: eventual
---

## Description

A description stating "2 = suspended for delinquency" states meaning; one stating "when 2, confirm the financial-block hypothesis" states a decision, and a decision belongs to the criterion that governs it, never to the vocabulary a description publishes.
A description that reads like the second is a second home for a fact the specification already places elsewhere, found and reported the same way any other one is.

=== rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
---
type: invariant
statement: A read of a vocabulary term by a name the named vocabulary does not hold is refused with an HTTP 404 response reporting a VocabularyTermNotHeldError, and a read of a concept by a name the glossary does not hold is refused with an HTTP 404 response reporting a ConceptNotHeldError.
constrains:
  - domain/glossary/concept
  - domain/glossary/subject-type
  - domain/glossary/subject-attribute
  - domain/glossary/outcome
  - domain/glossary/action
  - domain/glossary/recipient
---

## Description

An unheld name is not an ordinary empty result a caller could read as though something answered to it, but a refusal of its own — the same distinction a-connector-configuration-read-by-an-unregistered-name-is-refused draws for the registry.
The glossary's own resolution may answer the absence as ordinary data internally; the published read turns it into this refusal.

=== rules/glossary/a-recipient-is-a-role
---
type: invariant
statement: A recipient names an operational role, never a person.
constrains:
  - domain/glossary/recipient
---

## Description

Recipients are real operational queues; binding a referral to an individual would break the moment staffing changes.

=== rules/glossary/a-registered-concept-is-never-removed
---
type: policy
statement: Registering concepts adds a concept at a new name or replaces the concept already held at that name, and removes no concept already held; a concept a registered capability answers, a collected evidence item or its citation names, or a case version's manifested hypothesis-revision collects is never removed from the glossary.
constrains:
  - domain/glossary/concept
  - domain/integration/capability
  - domain/investigation/evidence
  - domain/investigation/citation
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

A concept, once registered, is load-bearing the moment anything else names it: a capability answers it, a collected evidence item or its citation identifies an observation by it, or a hypothesis-revision's own collects lists it — and case-terms-exist-in-the-glossary already requires that name to keep existing for as long as the hypothesis-revision or case version that named it does. Removing it would strand every one of those references. Registering a batch of concepts is never a reason to remove one the batch does not mention.

=== rules/glossary/a-vocabulary-holds-each-name-once
---
type: invariant
statement: A read over a vocabulary, or over the concepts, that finds one name held more than once is refused with an HTTP 500 response reporting a DuplicateGlossaryNameError rather than answering either record.
constrains:
  - domain/glossary/concept
  - domain/glossary/subject-type
  - domain/glossary/subject-attribute
  - domain/glossary/outcome
  - domain/glossary/action
  - domain/glossary/recipient
---

## Description

Each term exists exactly once is the glossary's own guarantee (domain/glossary/_context); a holding that breaks it is a corrupted store, not a business state, so no read chooses between the duplicates.

=== rules/glossary/an-action-names-what-its-recipient-does
---
type: invariant
statement: A new action enters the vocabulary only when what somebody does changes, never when only the motive changes.
constrains:
  - domain/glossary/action
---

## Description

The action vocabulary stays global and small because it names acts, not reasons.
Two hypotheses with different causes and the same act share one action.

=== rules/glossary/an-outcome-is-contributed-by-a-confirmable-hypothesis
---
type: policy
statement: Every confirmable hypothesis-revision contributes exactly one outcome to the glossary.
constrains:
  - domain/glossary/outcome
  - domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

The outcome vocabulary is contributed, not designed: it is registered globally only so spelling cannot drift and reporting can cross cases.

=== rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
---
type: policy
statement: The glossary holds the two non-conclusion outcomes, inconclusive-no-data and inconclusive-hypotheses-exhausted, before the first case version validates; ensuring them adds whichever of the two is missing and removes or rewrites no outcome already held, and an outcome a released case version or a released hypothesis revision names is never removed from the glossary.
constrains:
  - domain/glossary/outcome
  - domain/knowledge/case-version
consistency: eventual
---

## Description

Only a subset of the vocabularies must exist before the first case version: its recipients, its actions, and the two outcomes of non-conclusion.
The rest is discovered by writing cases.

=== rules/integration/a-capability-declares-its-contract
---
type: invariant
statement: A registered capability declares its input schema, its output schema and its timeout as a positive integer count of milliseconds; a registration that states no timeout takes the default of sixty seconds; an attribute that is absent or an empty string is undeclared, and a registration leaving any required attribute undeclared is refused with an HTTP 422 response reporting an IncompleteCapabilityContractError.
constrains:
  - domain/integration/capability
---

## Description

The input schema, once its own shape is declared, is what a diagnose's entry point and a case's derived input requirements hold the subject to; the output schema is what bounds citations; the timeout is what bounds the collection stage; a capability without any of the three cannot be held to anything.
A timeout of zero or less bounds nothing — there would be no time left for a call to answer in — so a stated timeout is refused the same way a non-integer one already is, distinctly from the absent-timeout default.

=== rules/integration/a-capability-declares-well-formed-schemas
---
type: invariant
statement: The registry refuses to register or update a capability whose input schema or output schema is not syntactically valid JSON, with an HTTP 422 response reporting a CapabilitySchemaNotWellFormedError.
constrains:
  - domain/integration/capability
---

## Description

Nothing checked this before a human could type this text directly: a malformed schema silently read as no fields at all, wherever a citation was checked against it (a-cited-field-exists-in-the-capability-output-schema). Refusing it at the door is what keeps that silent degradation from ever having a case to happen in.

=== rules/integration/a-capability-input-schema-holds-a-well-formed-object
---
type: invariant
statement: A registered capability's input schema, once syntactically valid JSON, declares at its top level an object named properties, and, where declared, an array named required that is a subset of properties' own keys; a registration whose input schema departs from this shape is refused with an HTTP 422 response reporting a MalformedCapabilityInputSchemaError naming every departure.
constrains:
  - domain/integration/capability
---

## Description

The output schema already lives by this same convention — a top-level properties object, its keys the field names a citation may name — but only by an inference this specification discloses, never checked at registration, because nothing yet reads an output schema's own content to decide anything at write time.
This rule is that same convention, now declared and enforced for the input schema alone: a properties key names one subject attribute the capability uses, and required names which of those it cannot observe without. An empty properties object is a valid declaration on its own — a capability whose connector reads nothing from the subject, only a credential or the requester, declares no attribute and requires none.
Distinct from a-capability-declares-well-formed-schemas, which only ever asks whether the text parses: a schema that parses and still holds no properties object, or a required naming a key properties does not hold, is well-formed JSON and malformed all the same, and this rule is what catches it.
A capability registered before this rule existed, whose stored input schema does not hold this shape, is read as declaring properties and required both empty — malformed is nothing declared, never a fault at read — the same posture a-capability-declares-well-formed-schemas already gives a schema that fails to parse at all, wherever anything reads a schema's content.

=== rules/integration/a-capability-is-read-only
---
type: invariant
statement: The registry refuses any capability whose nature is not read-only, with an HTTP 422 response reporting a CapabilityNotReadOnlyError.
constrains:
  - domain/integration/capability
---

## Description

A project decision, not a limitation: it erases human mutation approval, write scopes and half the security concerns, and it is imposed by the registry rather than by discipline.
The system diagnoses and refers, never acts.

=== rules/integration/a-connector-configuration-holds-a-well-formed-object
---
type: invariant
statement: The registry refuses to register or update a connector configuration whose configuration is not syntactically valid JSON object text — a null value and an array included — with an HTTP 422 response reporting a ConnectorConfigurationNotWellFormedError; a registration whose configuration is entirely absent, or is present but neither a string nor a plain object (a boolean or a number, among others), is refused instead with an HTTP 422 response reporting an IncompleteConnectorConfigurationError; a registration may supply a well-formed configuration as that text or as the object it parses to, and the registry holds and answers it as text either way.
constrains:
  - domain/integration/connector-configuration
---

## Description

The same discipline a-capability-declares-well-formed-schemas holds for a capability's two schemas, held here for the one field a connector configuration carries: a human authoring this text directly can now write something a runtime call would fail on, and the registry is where that gets caught, not the call.
A null value and an array are both syntactically valid JSON, but neither is an object, so both are not well-formed the same way unparsable text is not. An entirely absent configuration is a different failure — there is no syntax to judge at all — and is refused as incomplete instead, the same distinction a-connector-configuration-names-its-connector already draws for the connector name. A present value that is neither a string nor a plain object — a boolean, a number, or anything else the registration's own shape could carry there — is the same kind of failure as absence: there is no text and no object to judge the syntax of, only a value of the wrong shape entirely, so it is incomplete rather than not well-formed too.

=== rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
---
type: policy
statement: A connector configuration is tested only through a specific, already-registered capability that names it as its connector; the configuration the test exercises is the one currently registered under that connector name, read at the moment of the test, never configuration text an operator holds unsaved in an authoring surface or supplies alongside the test request; the subject that test assembles carries exactly the Subject attributes named by the ${subject:<attribute-name>} placeholders embedded in that same registered configuration, one attribute-value per distinct attribute those placeholders name, each value supplied by the operator with the test request and each attribute name read from those placeholders rather than stated by the operator — an attribute those placeholders do not name is no part of the subject the test assembles; finding no capability registered at that identity refuses the test with an HTTP 404 response reporting a CapabilityNotRegisteredForTestError — a refusal of its own, never the identity-keyed read's own not-found answer for that same identity reused across the two operations — and naming a connector the found capability's own connector attribute does not match refuses the test with an HTTP 409 response reporting a CapabilityConnectorMismatchError.
constrains:
  - domain/integration/connector-configuration
  - domain/integration/capability
consistency: eventual
---

## Description

The registry only ever holds a capability whose nature is read-only (a-capability-is-read-only); scoping the test this way is what keeps it from ever exercising anything the registry has not already committed to being read-only, without a second invariant standing over the test action itself. A connector configuration nothing yet references is not test-run against a real subject through this action — only once a capability names it does testing it become possible at all.

The registry's own resolution answers an unregistered identity as ordinary data, never a domain-level refusal of its own (domain/integration/capability-registry); each contract-level operation that turns that absence into a refusal — the identity-keyed read and this test action alike — does so on its own account, the same way a command's own `refusal` is always that command's own value object rather than one shared across contracts. Testing and reading answer two different questions about the same absence, so the test's own refusal is never the read's, reused.

The configuration under test is the registered one for the same reason the capability under test is a registered one: registration is where every gate a connector configuration passes stands — a-connector-configuration-holds-a-well-formed-object and a-connector-placeholder-is-declared-by-its-capability are both checks the registry performs at the write — so a diagnostic issuing a real call from text no write had ever been held to would exercise exactly what those gates exist to keep out, and would report a seam (a-connector-placeholder-is-declared-by-its-capability's own check for the pairing under test) against a pairing that does not exist. Register-connector is create-or-replace and replaces the whole configuration on every edit, so an operator wanting to test edited text registers it first; what the diagnostic never offers is a call to a real system from a draft nothing has committed to.

Which attributes the operator supplies values for follows from that same registered configuration rather than from any case: a test names no case version, so the case-derived requirement governing an ordinary diagnose (a-diagnosed-subject-covers-its-cases-required-attributes, which this test is already exempt from) has nothing to say about it, and the configuration's own ${subject:<attribute-name>} placeholders (an-http-connector-configuration-declares-its-call) are the only statement anywhere of which Subject attributes this call actually reads. Each such name is already governed twice over — held inside the paired capability's input schema properties by a-connector-placeholder-is-declared-by-its-capability, and drawn from the glossary by a-subject-attribute-is-drawn-from-the-glossary — so it is a name the operator reads rather than authors; what the operator contributes is the value, the other half of the attribute-value pair domain/investigation/subject-attribute-value declares, which is what identifies the instance the test call reaches. Two placeholders naming the same attribute name one attribute, so the test collects one value for it, not two.

=== rules/integration/a-connector-configuration-names-its-connector
---
type: invariant
statement: A connector configuration registration whose connector name is absent or an empty string is refused with an HTTP 422 response reporting an IncompleteConnectorConfigurationError.
constrains:
  - domain/integration/connector-configuration
---

## Description

The connector name is the one identity a connector configuration has, so a registration without one names nothing the registry could hold or a capability could later reference.
An empty string is treated as no name at all, the same reading a-capability-declares-its-contract gives an empty capability attribute.

=== rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
---
type: invariant
statement: A read of a connector configuration by a connector name nothing has registered is refused with an HTTP 404 response reporting a ConnectorConfigurationNotFoundError.
constrains:
  - domain/integration/connector-configuration
---

## Description

Nothing said what read-connector-configuration answers when the name it is asked for resolves to nothing: an unregistered name is not an ordinary empty result a caller could read as though something answered to it, but a refusal of its own, addressable by an error value of its own — the same distinction a-connector-configuration-holds-a-well-formed-object already draws for a malformed write, held here for a miss on read.

=== rules/integration/a-connector-placeholder-is-declared-by-its-capability
---
type: policy
statement: A connector configuration registration or edit is refused if a placeholder naming a Subject attribute, in its own text, names an attribute absent from the properties the input schema of a capability currently registered against that connector's name declares; a capability registration is refused likewise if the connector it names already holds a registered configuration whose own text embeds a placeholder naming a Subject attribute absent from this registration's own input schema properties. Either refusal is an HTTP 422 response reporting a ConnectorPlaceholderOutsideInputSchemaError naming every orphaned placeholder together with the capability that fails to declare it.
constrains:
  - domain/integration/capability
  - domain/integration/connector-configuration
consistency: eventual
---

## Description

a-capability-input-schema-holds-a-well-formed-object fixes what properties declares; this is the other half — what a connector configuration's own placeholders actually name must stay inside it, checked at both writes that could put them out of step, against whatever is registered on the other side at that moment.
Registering a capability before its connector is ever configured stays possible, and so does configuring a connector before any capability names it — this rule reconciles only what already exists on both sides at the moment of a write, never forcing an order. The two registrations can still transiently disagree between one write and the next, in an order the specification permits; an-unresolvable-observation-ends-unavailable's own degrade, not a fault, is what an observation reaching that gap answers with meanwhile.
Only a placeholder naming a Subject attribute is held to this — a placeholder naming the requester or a credential names no subject attribute, so properties has nothing to check it against.
Testing a connector configuration through its capability (a-connector-configuration-is-tested-through-a-registered-capability) reports this same check for the pairing under test, since that diagnostic exists exactly to expose this seam to an operator.

=== rules/integration/a-diagnostic-response-masks-a-resolved-credential
---
type: invariant
statement: A connector configuration's diagnostic call masks whatever value a credential placeholder in its own call resolves to, so the response echoing that call back never carries a credential's real value.
constrains:
  - domain/integration/connector-configuration
---

## Description

A connector configuration's call may name a credential the executing connector reads from environment configuration rather than from the configuration text itself, so nobody has to author a secret directly into an operator-editable field. The diagnostic operation exists to let an operator see the request a connector configuration would actually issue (contracts/integration/connector-diagnostics), and that same visibility would otherwise hand back the one thing the indirection was meant to keep out of an editable field and a response body alike. Masking is what keeps the diagnostic honest about shape without being honest about the secret.

=== rules/integration/an-http-connector-configuration-declares-its-call
---
type: invariant
statement: A connector configuration executed by the HTTP connector declares a method that is one of GET, POST, PUT, PATCH or DELETE, a responseMap that is an object of string paths, and a statusMap that is an object mapping an HTTP status to one evidence-result ending; an observation reaching a configuration that lacks any of the three issues no call and ends unavailable, with a result detail reporting a MalformedHttpConnectorConfigurationError. The same configuration declares an address, a non-empty string, and may declare a query and headers, each an object of string values, and a body of any shape; any of the four may embed one or more placeholders naming a Subject attribute, the requester, or a credential read from environment configuration at resolution time, substituted as plain text and never evaluated as code. Such a placeholder is written as the literal text form ${kind} or ${kind:argument}; a placeholder naming a Subject attribute is written ${subject:<attribute-name>}, with the attribute name as its argument; a placeholder naming the requester is written ${requester}, with no argument; and a placeholder naming a credential is written ${credential:<name>}, with the credential name as its argument. A configuration missing its address, declaring query or headers as anything but an object of string values, naming a placeholder kind this connector does not recognize, or naming a placeholder with no argument where one is required, issues no call and ends unavailable, with a result detail reporting an IncompleteConnectorCallDescriptorError; a configuration naming a Subject attribute or a credential that resolves to nothing issues no call and ends unavailable the same way, with the result detail an-unresolvable-observation-ends-unavailable itself names for that condition.
constrains:
  - domain/integration/connector-configuration
---

## Description

The registry still holds a connector configuration to nothing but well-formedness (a-connector-configuration-holds-a-well-formed-object), because what its keys mean is the executing connector's own business.
This rule is that connector's statement of what it needs, for the one connector kind this build ships, so an operator learns the required keys from the specification rather than from a failed collection.
The absence is answered as an ending rather than a fault because collection records how an attempt ended and never raises (domain/investigation/evidence).
The address, query, headers and body, and their placeholder mechanism, are the same connector's statement of how its call reaches into a Subject, a requester and a credential without either living in the configuration's own text — `rules/integration/a-diagnostic-response-masks-a-resolved-credential` already presumes a credential placeholder exists and masks what it resolves to; this is the first node stating the mechanism itself.
A configuration missing its address or naming an unrecognized or malformed placeholder never reaches a call at all — the same evidence-result ending the missing-key case above already declares, distinguished only by its own named cause. A configuration whose placeholder is well-formed but resolves to nothing is a different fact, about the data or the environment rather than about the configuration's own shape, and ends unavailable through an-unresolvable-observation-ends-unavailable's own condition for it instead.

=== rules/integration/an-unclassified-status-ends-unavailable
---
type: policy
statement: An HTTP status the executing connector configuration's statusMap does not classify ends the observation as unavailable.
constrains:
  - domain/integration/connector-configuration
  - domain/investigation/evidence-result
consistency: eventual
---

## Description

Every collection ends in exactly one of the four evidence results, and a status nobody classified still has to land in one of them.
Unavailable is the ending that claims the least: it asserts no denial and no timeout, and it never enters the evidence cache.

=== rules/integration/an-unreachable-connector-ends-unavailable
---
type: policy
statement: An HTTP connector call an observation has issued that fails before any HTTP response is received — a refused connection, a DNS resolution failure, a socket error, or any other rejection short of a response, the capability timeout's own deliberate abort excepted — ends the observation as unavailable and never propagates out of observe-concept as a fault, with a result detail reporting a ConnectorUnreachableError together with the name of the connector whose registered configuration issued the call, and carrying no part of that call's own assembled address, query, headers or body.
constrains:
  - domain/integration/connector-configuration
  - domain/investigation/evidence-result
consistency: eventual
---

## Description

Every collection ends in exactly one of the four evidence results, and a call nothing at the far end ever answered still has to land in one.
Unavailable is the ending that claims the least — it asserts no denial and no timeout, and it never enters the evidence cache — the same reading an-unclassified-status-ends-unavailable already gave a status nobody classified and an-unresolvable-observation-ends-unavailable already gave a call that was never issued at all.
Timeout is not it: a timeout is the capability's own declared deadline abandoning a call still in flight (no-stage-aborts-on-its-deadline), while a connection refused, unresolved or broken never reached a deadline to exceed, and recording one as the other would tell an operator a far end is slow when it is down.
The absence of data is a recorded fact and never an exception (domain/investigation/evidence), and the collection stage records endings rather than raising (no-stage-aborts-on-its-deadline), so a rejection at issue is an ending like every other collection failure rather than a fault — a fault here would abort the whole call it arrived in, taking with it every hypothesis that never collected the concept whose connector was down.
The detail names the connector because this cause is outside the system: which far end did not answer is the whole of what anyone can act on, and the registered connector name is the only identifier of it that is not the call's own text — the address, query, headers and body may each hold what a credential placeholder resolved to, which a-diagnostic-response-masks-a-resolved-credential keeps out of what a reader is shown.
The name says unreachable rather than unavailable because unavailable is already the shared ending of every collection failure: a detail repeating it would restate the result the same evidence item already carries instead of distinguishing this cause from the others, which is the whole job the sibling details do.

=== rules/integration/an-unresolvable-observation-ends-unavailable
---
type: policy
statement: An observation of a concept no registered capability currently answers, that more than one currently answers, whose capability names a connector no configuration is registered under, or whose call cannot be assembled because a placeholder naming a Subject attribute or a credential resolves to nothing, issues no call and ends unavailable, with a result detail reporting a CapabilityNotResolvedForObservationError, a DuplicateConceptAnswerError, a ConnectorConfigurationNotRegisteredError or a ConnectorPlaceholderNotResolvedError respectively.
constrains:
  - domain/integration/capability
  - domain/integration/connector-configuration
  - domain/investigation/evidence-result
consistency: eventual
---

## Description

A capability may be registered before its connector is ever configured (domain/integration/connector-configuration), so an investigation can reach a concept whose call cannot be assembled.
The absence of data is a recorded fact and never an exception (domain/investigation/evidence), so what the investigation records is an ending that names its cause, not a fault that aborts the stage.
A placeholder resolving to nothing joins these three for the same reason each already degrades rather than faults: for a diagnose, with a-diagnosed-subject-covers-its-cases-required-attributes refusing at the door whatever a case's own derived requirements demand, what still reaches a call unresolved here is always something optional — an attribute the capability's own input schema does not require, a required one its registration under-declared (a-connector-placeholder-is-declared-by-its-capability catches that at the write it escaped), or a credential's environment variable absent from configuration. For a simulate-case or simulate-hypothesis call, no such door stands (a-simulated-subject-missing-a-requirement-degrades-not-refuses), so a required attribute's own absence can reach this same ending too — a fact of data or configuration either way, exactly the class this rule already resolves as a recorded ending rather than a fault that aborts the stage.

=== rules/integration/evidence-arrives-in-the-glossary-vocabulary
---
type: policy
statement: An observation reaches the domain expressed in the glossary's vocabulary, never in the source system's.
constrains:
  - domain/investigation/evidence
  - domain/glossary/concept
consistency: eventual
---

## Description

The normalization is the one thing standing between the source systems' vocabulary and the domain's; technological leakage happens in the response, not in the call.

=== rules/integration/one-capability-answers-one-concept
---
type: policy
statement: Each concept resolves to exactly one capability; registering a capability for a concept that a capability of another identity already answers is refused with an HTTP 409 response reporting a ConceptAlreadyAnsweredError, and a concept read that finds more than one currently registered capability answering it is refused with an HTTP 500 response reporting a DuplicateConceptAnswerError rather than choosing one.
constrains:
  - domain/integration/capability
  - domain/glossary/concept
consistency: eventual
---

## Description

One to one until a second source of the same concept appears; the fallback resolution plan was cut and stays cut until it hurts.

=== rules/investigation/a-citation-stays-within-the-hypothesis-collects
---
type: policy
statement: Every concept an evaluation cites belongs to the collects of the hypothesis-revision it judges, whatever produced that evaluation; where the evaluation was produced without any judgment call — inconclusive with reason no-data, citing the evidence whose result is not ok — that containment is held by drawing those citations from the evidence collected for that same revision's own collects, so nothing is checked against a response there, and the refusal and the retry that answer a foreign citation apply only to an outcome an evaluator returned.
constrains:
  - domain/investigation/citation
  - domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

The judgment prompt contained nothing else, so a citation outside the judged revision's own collects is an invented reference, and the adapter refuses the response.
A no-data evaluation reaches no evaluator at all: its citations are synthesized from the evidence collected for that revision's own collects, so there is no response to refuse and no call to retry, and the containment holds by where those citations are drawn from rather than by a check over what a model returned.

=== rules/investigation/a-cited-field-exists-in-the-capability-output-schema
---
type: invariant
statement: Every field a citation names, where the citation carries one, exists among the field names its own cited evidence item snapshotted, read from that item's own producing capability's output schema at the moment it was collected; a citation grounding a no-data verdict carries no field, since the evidence it cites snapshotted none.
constrains:
  - domain/investigation/citation
  - domain/investigation/evidence
---

## Description

This is what makes the validity of a citation machine-checkable; without it, traceability is a promise that does not survive six months.
The vocabulary a citation is held to is the cited evidence item's own snapshot, never a live read of the capability registry: a registration replacing the producing capability's own record between collection and judgment never changes what a citation may name (rules/investigation/judgment-reads-the-evidence-snapshot).

=== rules/investigation/a-composed-subject-presents-every-case-input-requirement
---
type: policy
statement: Before a diagnose, simulate-case, or simulate-hypothesis call, the interface assembling the subject presents one attribute input per the pinned case version's own case-input-requirements, required and optional alike, each carrying that requirement's own required flag through unchanged; only a required flag, never an attribute's mere presence in this set, gates whether its own input blocks the call from proceeding. Alongside each such input the interface names every capability that requirement holds — each by its own name and version, together with that capability's own connector — never only one of them where more than one currently-registered capability asks for the same attribute. Where that read names no requirement at all, the interface states that emptiness explicitly to the person composing the subject — that the pinned case version's own case-input-requirements name no attribute — rather than leaving them an unexplained absence of inputs.
constrains:
  - domain/investigation/subject
  - domain/knowledge/case-input-requirement
  - domain/integration/capability
consistency: eventual
---

## Description

The case-input-requirements read already computes the authoritative set once, for a diagnose's own door refusal (a-diagnosed-subject-covers-its-cases-required-attributes) to hold a subject to; this rule is the same set reaching the person composing that subject in the first place, before either call, so what blocks a diagnose was already visible rather than discovered at the door.
An optional requirement is presented the same as a required one because the case-input-requirements read already names it as something a currently-registered capability asks for — the composer benefits from knowing that without first learning the attribute's name from the glossary on their own.
Each input names its own askers because the requirement already holds every one of them (domain/knowledge/case-input-requirement, at cardinality 1..*, derived by a-case-versions-input-requirements-are-derived), and because a value the composer leaves empty degrades exactly those capabilities' own observations rather than the call (a-simulated-subject-missing-a-requirement-degrades-not-refuses, an-unresolvable-observation-ends-unavailable): a composer who can see which observations depend on an input can weigh leaving it empty, and one asker named among several would hide the rest. Two capabilities ask for one attribute whenever they answer two different concepts the collection plan reaches, since a concept more than one capability answers contributes no attribute at all.
A capability's name, version and connector are each that capability's own declared fact, reached through the requirement's reference to it and restated nowhere here — the same restraint domain/knowledge/case-input-requirement already holds by declaring neither.
Nothing here forbids the composer from adding an attribute-value the requirements set does not name; a-subject-attribute-is-drawn-from-the-glossary already governs what any added attribute must be.
A set naming no requirement at all is a real state rather than a degenerate one, and reachable with nothing wrong anywhere: a-capability-input-schema-holds-a-well-formed-object admits an empty properties object as a valid declaration — a capability whose connector reads nothing from the subject, only a credential or the requester — and a-case-versions-input-requirements-are-derived contributes nothing for a concept no registered capability currently answers, or that more than one answers. Shown as a bare absence of inputs, that state is indistinguishable from a read that failed, a mispinned case version, or a panel still loading, while the composer still owes the call a subject carrying at least one attribute-value (a-subject-carries-at-least-one-attribute) and would be left to reach for one without ever being told why nothing was offered. The sibling a-composed-subjects-interface-discloses-a-malformed-capability states the narrower half of the same care — the concept a malformed capability answers asks the composer for nothing, and without disclosure nothing would tell them why — and covers only that one reason, which an empty set does not require.

=== rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability
---
type: policy
statement: Where the pinned case version's own case-input-requirements name a capability apart from its requirements because that capability's own stored input schema does not currently hold a well-formed shape, the interface assembling the subject before a diagnose, simulate-case, or simulate-hypothesis call discloses that capability's identity to the person composing the subject.
constrains:
  - domain/integration/capability
  - domain/knowledge/case-input-requirement
consistency: eventual
---

## Description

The case-input-requirements read already names such a capability separately exactly so an operator can find and re-register it; withholding that same fact from the person actually composing the subject would waste the one read that already computed it, and the composer is ordinarily the same person who could act on it.
This is a disclosure, not a refusal: nothing about the call or the composed subject is blocked by a malformed capability's presence, the same restraint a-simulated-subject-missing-a-requirement-degrades-not-refuses and an-unresolvable-observation-ends-unavailable already hold elsewhere in this specification.

=== rules/investigation/a-decided-evaluation-cites-evidence
---
type: invariant
statement: Every confirmed or refuted evaluation carries at least one citation.
constrains:
  - domain/investigation/evaluation
  - domain/investigation/citation
---

## Description

What replaces determinism in the prose criterion is imposed traceability: a decided verdict points at the evidence that grounded it.

=== rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
---
type: policy
statement: A diagnose whose subject holds no attribute-value, or an empty one, for an attribute a case-input-requirement of the pinned case version names required is refused before any collection, with an HTTP 422 response reporting a SubjectDoesNotCoverCaseInputsError naming every missing attribute together and, for each, the capabilities that require it.
constrains:
  - domain/investigation/subject
  - domain/knowledge/case-input-requirement
consistency: eventual
---

## Description

Everything an-unresolvable-observation-ends-unavailable already treats as a per-capability ending during collection is checked once, at the door, for whatever a case's own derived requirements demand: a subject missing what those requirements name required is refused before any capability is ever called, rather than discovered concept by concept mid-collection at the cost of the calls that already ran.
An attribute a case-input-requirement leaves optional never enters this refusal: absent, the observation asking for it degrades to unavailable on its own (an-unresolvable-observation-ends-unavailable), never blocking the rest of the diagnose.
The test of one connector configuration through a registered capability (a-connector-configuration-is-tested-through-a-registered-capability) is not held to this refusal: it exists to diagnose exactly this seam between a subject and a capability's own call, and the resolver's own unresolved-placeholder answer, surfaced raw, is its diagnosis.

=== rules/investigation/a-judgment-failure-records-the-last-call-made
---
type: invariant
statement: An evaluation inconclusive with reason judgment-failure carries the usage, elapsed_ms and prompt of the last judgment call actually made for that hypothesis — the retry's own record where a retry ran, and the first call's where the remaining deadline admitted no retry — never a superseded first call's record where a retry ran, and never a usage summed across both attempts.
constrains:
  - domain/investigation/evaluation
---

## Description

domain/investigation/evaluation holds the three as one call's own record — what the provider charged, how long that call took, and the judgment prompt as that call actually materialized it — so a usage summed across two attempts, paired with one attempt's elapsed_ms and prompt, would describe a call that never happened and leave a reader unable to hold the tokens against the prompt shown.
Which of two attempts a record names is a question this specification has already answered once, and this answers it the same way: written-at-records-when-the-write-settled dates an investigation by the write that settled it rather than by the first attempt issued, and the call that settles a judgment-failure is the last one made, after which no further attempt follows.
A per-hypothesis record naming one call is not a total and was never meant to be one — what an investigation spent across every call it made is domain/investigation/cost's own to carry.
Where the remaining deadline admitted no retry, the first call is the last call made, so one reading serves the retried and unretried paths alike, and a-foreign-citation-is-refused's two outcomes need no separate answer.

=== rules/investigation/a-measured-duration-below-one-millisecond-is-zero
---
type: invariant
statement: A millisecond duration recorded for a span that actually ran — a durations stage figure, a durations total, an evaluation's elapsed_ms for a judgment call that happened, an evidence item's elapsed_ms for a collection that ran — is the whole number of milliseconds observed for that span, and is 0 where the span settled in under one millisecond; no measured duration is ever raised to one millisecond to avoid recording a zero.
constrains:
  - domain/investigation/durations
  - domain/investigation/evaluation
  - domain/investigation/evidence
---

## Description

The clock these figures are read from resolves whole milliseconds, so a span shorter than one is not a span in which nothing happened -- it is a span the instrument cannot resolve, and recording one millisecond for it would state a duration nothing observed, the invented duration domain/investigation/evidence already refuses when it reads a pre-existing item's elapsed_ms as 0 rather than as a made-up number.
A floor of one millisecond would also corrupt the one question domain/investigation/durations exists to answer -- who is exceeding the declared total budget, per stage and per capability -- by adding to every figure a millisecond the run never spent, and by doing so most where the runs are fastest and the figures smallest.
A measurement is not a bound: rules/integration/a-capability-declares-its-contract refuses a timeout of zero and rules/knowledge/a-collected-concept-declares-a-ttl refuses a ttl of zero because a bound of zero bounds no call and no freshness at all, but a measured zero bounds nothing and only reports what the clock could see, so the reasoning that refuses a declared zero does not reach a measured one.
On domain/investigation/evidence, 0 therefore carries two honest readings -- an item collected before the attribute existed was never measured, and an item collected since resolved in under a millisecond -- and the record separates them by nothing, which costs nothing: both say the same thing to every reader an elapsed_ms has, that no measurable time is attributable to that collection, and neither invents one.
Conditional presence is untouched: an elapsed_ms absent because no call happened at all -- an evaluation whose reason is no-data, a durations writing for a run that never reaches consolidation -- stays absent, and is never recorded as 0 instead.

=== rules/investigation/a-pending-simulation-call-is-not-dispatched-again
---
type: policy
statement: Where the interface assembling a subject has dispatched a simulate-case or a simulate-hypothesis call for that subject and that call has not yet ended, a further dispatch of that same operation for that subject issues no request at all and leaves the pending call's own run untouched; the guard is keyed by the operation and the subject together, and that operation is dispatchable again as soon as the pending call ends, whether it ended in a returned result or in a refusal.
constrains:
  - domain/investigation/subject
consistency: eventual
---

## Description

A simulation writes no investigation and emits no event (rules/investigation/a-simulation-writes-no-investigation), so two runs of the same operation over one subject leave nothing behind that tells them apart: whichever returns last replaces what the curator is reading, and nothing says which dispatch produced the evaluations in front of them or which composed subject they were produced from. One outstanding dispatch per operation is what keeps the shown result answerable to a run the curator actually asked for.
The block costs a bounded wait rather than a lock — a simulation runs the same collection, judgment, resolution and consolidation a diagnosis runs (contracts/investigation/case-simulation), which answers inside its own declared total (rules/investigation/an-answer-arrives-within-the-declared-deadline) — and the operation is free again the instant the pending call ends, including where it ends in a refusal (rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused) rather than a result.
Keyed by the operation and the subject together: simulate-case and simulate-hypothesis answer two different questions about one case version, and a curator watching one has no reason to be shut out of the other; a second subject composed on another screen is a different subject and blocks nothing.
This is not a refusal the contract answers. No request is issued, so nothing at contracts/investigation/case-simulation ever sees the suppressed attempt, and no status or error name belongs to it — unlike a refusal the specification does state, which is always a request that reached the operation.

=== rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
---
type: policy
statement: A simulate-hypothesis request naming a hypothesis absent from the named case version's manifest is refused with an HTTP 404 response reporting a HypothesisNotInManifestError.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis
consistency: eventual
---

## Description

`simulate-hypothesis` narrows its run to one hypothesis named by the request; a name the pinned case version's manifest currently holds no entry for is not an ordinary empty result the caller could read as though something answered to it, but a refusal of its own — the same distinction `a-case-read-by-an-unknown-slug-or-version-is-refused`, `a-connector-configuration-read-by-an-unregistered-name-is-refused` and `a-glossary-read-by-an-unheld-name-is-refused` already draw for a miss elsewhere in this specification.

=== rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses
---
type: policy
statement: A simulate-case or simulate-hypothesis call is never refused for a subject omitting an attribute-value a case-input-requirement of the pinned case version names required; the concept that requirement answers reaches collection and degrades to unavailable the same as an optional attribute's own absence would.
constrains:
  - domain/investigation/subject
  - domain/knowledge/case-input-requirement
consistency: eventual
---

## Description

A diagnose's own door refusal (a-diagnosed-subject-covers-its-cases-required-attributes) exists for a released version a customer's own answer already depends on; a simulation is open to a draft precisely because a curator composing or testing one wants to see how it behaves before every input is wired up, and a hard refusal here would take away the curator's own way of discovering that gap through the very run that would otherwise show it to them.
An-unresolvable-observation-ends-unavailable already treats an unresolvable observation as a recorded ending rather than a fault; this rule is what keeps that ending reachable for a required attribute too, under simulate alone, rather than letting a-diagnosed-subject-covers-its-cases-required-attributes's own door read as though it applied here as well.

=== rules/investigation/a-simulation-carries-its-requester
---
type: invariant
statement: A simulate-case and a simulate-hypothesis call each carry, in the call's own payload, the requester whose authorization scope that call's collection runs in; a call whose payload carries no requester, or an empty one, is refused before any collection, with the refusal every route gives a body that fails its declared shape.
constrains:
  - domain/investigation/evidence
---

## Description

rules/investigation/collection-runs-in-the-requester-scope holds every collection to the requester's own authorization scope and never the service's, and a simulation runs that same collection through the same connectors — so a simulation arriving with no requester has no scope to run in, and the only scope left to run it in is the service's own, which that rule forbids outright. Requiring the requester on both operations is what keeps the two from meeting in that gap.
Nothing else could carry it: rules/investigation/a-simulation-writes-no-investigation keeps a simulation out of the record, so domain/investigation/investigation's own requester attribute — which arrives in the diagnose call alone — says nothing about a simulation, and neither operation resolves an identity of its own. The value is the caller's claim, unverified, exactly as constraints/no-route-enforces-authentication states for every requester this build accepts.
The refusal is the standing one rather than a new one: a required field absent from a body is a failure of the route's declared shape, which constraints/a-malformed-request-is-refused-with-a-validation-error already answers for every route, so no status or error name of its own is stated here.
rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses is untouched by this door — that rule is about an attribute-value of the subject, whose absence one concept's own observation records as unavailable, while a missing requester has no degraded form: there is no scope in which anything could be collected at all.

=== rules/investigation/a-simulation-result-is-stale-once-its-source-changes
---
type: policy
statement: A case-simulation result — its evaluations and, where one was produced, its assessment — is
  stale once the case version it was produced from, or a hypothesis-revision that version manifests, changes
  after the result was produced.
constrains:
- domain/investigation/assessment
- domain/investigation/evaluation
- domain/knowledge/case-version
- domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

A curator judges a simulation result against the case content it was run against, not against whatever that content has since become; editing the version or a hypothesis it manifests, after a result was already shown, is exactly the gap this closes. The rule names no mechanism for detecting the change — hashing, timestamps, a version counter — because none of those is a fact the specification decides; it is free to name the coarsest safe answer (every return from editing) or a finer one, provided a real change is never missed.

=== rules/investigation/a-simulation-writes-no-investigation
---
type: policy
statement: A simulation runs the engine over a case version in any state and writes no investigation; nothing it collects ever enters a cache, and nothing it collects or judges is ever read by a diagnosis.
constrains:
  - domain/investigation/investigation
  - domain/knowledge/case-version
consistency: eventual
---

## Description

A curator composing a draft needs to watch the engine judge it before releasing it, and a curator or an auditor needs to see a released version's own verdicts and evidence without writing another investigation over it — neither want is a diagnosis.
`rules/investigation/only-a-released-case-version-is-diagnosed` keeps every diagnosis on a released version; this rule keeps every simulation out of the record that one protects, so the two never meet — what a simulation collected cannot warm a cache a diagnosis later reads from, and what it judged is never the answer anyone was given.

=== rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
---
type: policy
statement: Every attribute a subject's attribute-values name exists in the glossary.
constrains:
  - domain/investigation/subject
  - domain/investigation/subject-attribute-value
  - domain/glossary/subject-attribute
consistency: eventual
---

## Description

The glossary is the published language; an attribute name the entry point assembles that the glossary does not hold is not a name at all — the same discipline case-terms-exist-in-the-glossary already holds a case to, applied here because a subject's attribute-values are never declared by a case: the entry point resolves and assembles them at request time, so no case-time check ever reaches them.

=== rules/investigation/a-subject-carries-at-least-one-attribute
---
type: invariant
statement: A subject carries at least one attribute-value.
constrains:
  - domain/investigation/subject
---

## Description

A subject with no attribute-value at all identifies nothing, and no capability's connector would have anything to derive its call from.

=== rules/investigation/a-subject-holds-one-value-per-attribute
---
type: invariant
statement: A subject holds at most one attribute-value per subject attribute — where two attribute-values assembled for one subject name the same subject attribute, the subject carries the value of the one recorded first and the later one's value is dropped.
constrains:
  - domain/investigation/subject
---

## Description

The entry point assembles the whole set of attribute-values before the diagnose call (domain/investigation/subject), and nothing about that assembly stops one attribute from being reached twice — two resolutions of the same customer, or two placeholders naming one attribute in the same call.
A subject carrying two values for one attribute identifies two things at once, and every consumer of the set would have to choose between them on its own account: a capability's connector resolves ${subject:<attribute-name>} to one value (rules/integration/an-http-connector-configuration-declares-its-call), and the coverage check reads one value per required attribute (rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes). Deciding it once, at assembly, is what keeps those consumers from each answering it differently.
The first recorded value wins because assembly is additive — what is already established about the subject's identity stands, and a later arrival never silently rewrites it. This drops a value rather than refusing the subject: a duplicate is not a subject that identifies nothing (a-subject-carries-at-least-one-attribute) nor a name the glossary does not hold (a-subject-attribute-is-drawn-from-the-glossary), and the set the capabilities receive is still the whole set of what identifies the instance.

=== rules/investigation/an-answer-arrives-within-the-declared-deadline
---
type: policy
statement: A diagnosis answers within the declared total deadline of twenty seconds, and that deadline is smaller than the caller's timeout.
constrains:
  - domain/investigation/investigation
---

## Description

The attendant waits on screen; past the caller's timeout they see a network error instead of a degraded assessment.
The total is an engineering proposal pending operational confirmation, set at twenty seconds — two of overhead and margin, seven of collection, five of judgment, four of writing and two of persistence.

=== rules/investigation/an-empty-ticket-reference-is-no-ticket-reference
---
type: invariant
statement: An investigation's ticket_ref never holds the empty string — a ticket reference given as an empty string in a diagnose call is the absence of a ticket reference, recorded as none and read back as none, and the call is not refused for it.
constrains:
  - domain/investigation/investigation
---

## Description

ticket_ref is optional: not every diagnose call carries a ticket (domain/investigation/investigation), and its whole role is correlation with the ticketing system for traceability and audit, never a matching key (contracts/investigation/diagnosis).
An empty string correlates with nothing, so admitting it as a value would leave two encodings of the same nothing — a record holding no ticket reference and a record holding an empty one — that an audit would have to distinguish while neither reaches a ticket.
This is the reading the specification already gives an empty attribute elsewhere: a-capability-declares-its-contract calls an attribute that is absent or an empty string undeclared, a-connector-configuration-names-its-connector treats an empty string as no name at all, and a-diagnosed-subject-covers-its-cases-required-attributes and a-simulation-carries-its-requester each read "or an empty one" as the absence of the value.
Unlike those, ticket_ref is optional, so the reading ends at absence rather than at a refusal: nothing is missing when a call carries no ticket.

=== rules/investigation/an-inconclusive-evaluation-declares-its-reason
---
type: invariant
statement: Every inconclusive evaluation declares its reason, and a no-data reason cites the evidence whose result is not ok.
constrains:
  - domain/investigation/evaluation
---

## Description

Inconclusive by technical failure, by queue and by missing data must be distinguishable, or an infrastructure failure is read as a domain fact — the pathology the rest of the system exists to avoid.
A judgment that never received a slot, or that started and did not return in time, is deadline-exceeded: nothing failed and the data arrived.

=== rules/investigation/an-investigation-is-written-once
---
type: invariant
statement: An investigation is written once and never mutated; no intermediate domain state persists; the investigation's own id identifies at most one record, so a write of an investigation the store already holds a record for persists no second record and counts as a write that settled.
constrains:
  - domain/investigation/investigation
---

## Description

Persisting in stages would reintroduce the intermediate states and the rich aggregate that were cut.
A crash before the write costs one re-execution, acceptable because collection is read-only and parallel.
The id is what holds the once-ness rather than any ordering of attempts: a write abandoned without its outcome being known may still be landing, so nothing that follows it can tell an attempt that failed from one that succeeded unobserved, and only the record's own identity can refuse the duplicate that would otherwise follow.
An attempt that finds the record already present has found exactly what it was sent to write — the same investigation, under the same id, written once — so it settles rather than failing: the requester is then answered from a record that exists, which is the whole of what the-response-follows-the-record asks, while the error no-stage-aborts-on-its-deadline reserves for a persistence that settles no write would report a missing record that is in fact there.

=== rules/investigation/collection-has-its-own-budget-within-the-total
---
type: policy
statement: The collection stage carries its own nominal budget of seven seconds inside the declared total deadline; a capability's own declared timeout governs a single call, but never past whatever of that seven-second budget the propagated remaining time still allows.
constrains:
  - domain/investigation/investigation
---

## Description

Decision 3 asked for two figures, not one: a capability's own timeout (a-capability-declares-its-contract) bounds one call, and this is the other — the ceiling the collection stage itself never exceeds, whichever capability is slowest. Without this second figure, a capability that never declares a timeout shorter than its own generous default still holds the whole stage hostage to that default, and the propagation constraint has no nominal budget left to clamp against.

=== rules/investigation/collection-runs-in-the-requester-scope
---
type: invariant
statement: Collection runs in the authorization scope of the requester, never of the service.
constrains:
  - domain/investigation/investigation
  - domain/investigation/evidence
---

## Description

If what the attendant may see is limited, the collection must respect it; retrofitting later means rewriting every connector.

=== rules/investigation/judgment-does-not-infer
---
type: invariant
statement: What cannot be deduced from the evidence is inconclusive, never inferred.
constrains:
  - domain/investigation/evaluation
---

## Description

The instruction is fixed in the judgment prompt: evidence grounds verdicts, and absence of ground is a reason, not an invitation.

=== rules/investigation/judgment-reads-the-evidence-snapshot
---
type: invariant
statement: A hypothesis's judgment reads only its own evidence's snapshotted concept and field semantics, fixed at the moment that evidence was collected; it never re-reads the glossary or the capability registry.
constrains:
  - domain/investigation/evidence
---

## Description

Two verified defects made a live read costly: a capability registration silently replaces whatever it already held at that name and version, and a citation vocabulary drawn from a live lookup fails silently once collection and judgment disagree about which registration answered a concept.
The snapshot domain/investigation/evidence carries — fields and concept_description — is what a hypothesis's judgment reads instead, always; nothing later than collection can change what an already-collected item's judgment sees.

=== rules/investigation/no-stage-aborts-on-its-deadline
---
type: policy
statement: No stage aborts on deadline overrun — collection records a timeout result and judgment records deadline-exceeded — with persistence as the single declared exception, which makes at most two write attempts against persistence's own stage bound — where that bound is zero or less at the moment persistence begins, no write attempt is made at all and the store is never called, the failure being raised at once; otherwise a first attempt is held to the whole of that bound and abandoned only once the bound elapses, never truncated to hold time back for what follows, and one retry runs only in whatever of the bound a first attempt that failed before the bound elapsed left unspent — and a persistence that settles no write, in either case, is answered with an HTTP 500 response reporting an InvestigationWriteDeadlineExceededError.
constrains:
  - domain/investigation/investigation
  - domain/investigation/evidence
  - domain/investigation/evaluation
---

## Description

This rule is what makes the time budget a guarantee instead of an intention.
Persistence cannot degrade because no response exists without a record, which is why it holds its own budget and retries within what remains.
The retry opens no second grant of time: both attempts spend from the one stage bound, so a first attempt that consumes all of it leaves no retry to run.
Truncating the first attempt to reserve a slice for the retry would abandon a write that was about to land, in the one stage that may not degrade, and would put a second attempt in flight behind an abandoned one that an-investigation-is-written-once leaves no room for; so the first attempt spends the bound to its end, and the retry is what answers a write that fails before the bound does.
A bound of zero or less is no window at all: nothing could settle inside it, and a call issued into it would be abandoned the instant it was made and left running past the response, which is the one thing this stage's own discipline refuses — so persistence raises without ever reaching the store, and the requester is answered exactly as it is when both attempts overrun.

=== rules/investigation/one-evaluation-per-required-hypothesis
---
type: invariant
statement: An investigation holds exactly one evaluation for every hypothesis its pinned case requires; inconclusive counts, silence does not.
constrains:
  - domain/investigation/investigation
  - domain/investigation/evaluation
---

## Description

The factory refuses an investigation whose evaluations do not cover requires-evaluation-of totally.
This is why a bad judgment response must degrade into an inconclusive evaluation rather than disappear.

=== rules/investigation/one-evidence-per-collected-concept
---
type: invariant
statement: An investigation holds exactly one evidence per concept in the case's collection plan.
constrains:
  - domain/investigation/investigation
  - domain/investigation/evidence
---

## Description

The collection plan is a set, so the concept already identifies the evidence and no separate id exists.

=== rules/investigation/only-a-released-case-version-is-diagnosed
---
type: policy
statement: An investigation may only be pinned to a case version in released state; a draft version may be read but never diagnosed against, and an attempt to diagnose one is refused with an HTTP 409 response reporting a CaseVersionNotReleasedError.
constrains:
  - domain/investigation/investigation
  - domain/knowledge/case-version
consistency: eventual
---

## Description

A draft exists to be composed and previewed while it is still incomplete or under revision; nothing built on it should ever answer a real diagnosis until a curator has released it.

=== rules/investigation/presentation-reads-the-evidence-snapshot
---
type: invariant
statement: An operator-facing surface presenting a collected evidence item shows its concept_description and its field semantics exactly as that item's own snapshot carries them; it issues no glossary or capability-registry read at presentation to enrich, refresh or substitute for that snapshot.
constrains:
  - domain/investigation/evidence
---

## Description

The same risk rules/investigation/judgment-reads-the-evidence-snapshot already closes for a hypothesis's judgment reaches a second consumer of the same record: a currently-registered concept's or capability's live description can silently diverge from what actually grounded the collected item, and a surface that quietly substitutes today's registry state for what the evidence actually snapshotted would show an operator a meaning nothing collected against.
The snapshot domain/investigation/evidence carries — fields and concept_description — is what an operator-facing surface reads and shows instead, always; a concept collected before it declared a description shows empty, and a capability whose connector never resolved shows no fields, the same honest degradation the record itself already carries, never a live-filled substitute.

=== rules/investigation/replay-is-pinned
---
type: invariant
statement: An investigation pins its replay — the case by slug and version, the model, the prompt version and the evidence.
constrains:
  - domain/investigation/investigation
---

## Description

Judgment is non-deterministic and models and prompts change; the pins are what make an audit read what actually ran.
Slug and version name one content without a digest over it, because a released case version, and every hypothesis-revision its manifest references, is never altered again.

=== rules/investigation/the-consolidation-answer-states-its-register
---
type: invariant
statement: A consolidation call's answer states the one register that call used to produce the text — the pinned case version's own declared register where it holds one, the register the consolidation adapter defaulted to where the version declares none — alongside the text and that call's own usage, elapsed_ms and prompt.
constrains:
  - domain/investigation/assessment-consolidator
  - domain/investigation/assessment
---

## Description

The register is settled inside the call: where the pinned case version declares one it is that one, and where it declares none only the adapter that ran knows which register it kept (`domain/knowledge/case-version`).
`domain/investigation/assessment` requires a register on every assessment, so an answer returning the text without naming the register it was written in leaves that required field unfillable in exactly the case the adapter's own default covers.
The register rides the same answer as the text, the usage, the elapsed_ms and the prompt — one answer carrying everything the one writing call produced — and it is stated in both cases, not only the default one, so a caller reads one answer shape rather than deducing which side supplied the register this time.

=== rules/investigation/the-customer-sees-only-the-text
---
type: invariant
statement: What an assessment exposes to the end customer is its text alone; outcome, referral, verdicts and evidence face the operation, never the customer.
constrains:
  - domain/investigation/assessment
---

## Description

The writing is the customer-facing surface of the whole diagnosis, which is why the writing rules narrow its input and why its quality is a curation concern.
Everything else in the record — what confirmed, what was referred where, what the evidence held — is operational material.

=== rules/investigation/the-outcome-comes-from-the-case
---
type: policy
statement: The outcome, referral and determining hypothesis of an assessment are exactly what the pinned case version's resolve-outcome returns.
constrains:
  - domain/investigation/assessment
  - domain/knowledge/case-version
consistency: eventual
---

## Description

The assessment produces no outcome outside the pinned case version; the writing only writes.
Leaving resolution to the application service would be the anemic model the case version's own behavior exists to prevent.

=== rules/investigation/the-response-follows-the-record
---
type: invariant
statement: The response to the requester leaves whole and only after the investigation is written.
constrains:
  - domain/investigation/investigation
---

## Description

The referral is exactly the part that is acted upon, and acting on an assessment with no record is what this rule exists to prevent.
The accepted cost is perceived latency: the attendant waits for the writing to see the action.

=== rules/investigation/the-writing-input-is-narrowed
---
type: invariant
statement: Consolidation receives every required hypothesis's evaluation — verdict, reason when present and citations — and the evidence any of those citations name, the same shape in any outcome; the case's hypotheses, their criteria and the when_to_use enter no consolidation prompt.
constrains:
  - domain/investigation/investigation
  - domain/investigation/assessment
---

## Description

Nothing stops a text from contradicting the outcome except never giving consolidation the case body to reason from.
Breadth is unconditional now, not only when nothing confirmed: a confirmed outcome does not mean every other hypothesis was untested, and the write-up needs what was ruled out alongside what was ruled in.

=== rules/investigation/written-at-records-when-the-write-settled
---
type: invariant
statement: An investigation's written_at holds the instant the store settled the write that persisted that investigation's record — never the instant the diagnose request arrived, and never the instant a write attempt was issued against the store; where persistence makes two attempts, exactly one of them persists the record, and the persisted written_at is that write's own settle instant, unchanged by a later attempt that settles by finding the record already present.
constrains:
  - domain/investigation/investigation
---

## Description

written_at exists so an audit can say when the record came into being, which no other attribute of the record recovers.
An instant fixed before the write describes an event that had not yet happened when it was fixed — the same reasoning domain/investigation/durations gives for why a value already fixed cannot describe a stage that has not yet run — so an instant read at the request's arrival, or at the moment an attempt was issued, dates the record by the call that carried it rather than by the write it claims to record.
Two attempts need no tie-break: an-investigation-is-written-once leaves exactly one write persisting a record under one id, so that write's settle instant is unambiguous even where a first attempt is abandoned and lands unobserved, and an attempt that settles by finding the record already there persists nothing and changes nothing.
Where no-stage-aborts-on-its-deadline raises without reaching the store, or where both attempts overrun, no record exists at all and the-response-follows-the-record leaves nothing to ask this of.

=== rules/knowledge/a-case-has-at-least-one-hypothesis
---
type: invariant
statement: A case version's manifest declares at least one entry; remove-hypothesis that would leave the manifest holding none is refused with an HTTP 422 response reporting a ManifestWouldHoldNoHypothesisError. Remove-hypothesis asked for a hypothesis name the manifest does not currently hold succeeds with no effect, never refused for the name's absence.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
---

## Description

A case version with no manifested hypothesis investigates nothing; the fallback alone is not an investigation.

=== rules/knowledge/a-case-has-at-most-one-draft
---
type: policy
statement: A case has at most one version in draft state at a time; create-draft asked of a case that already holds a draft is refused with an HTTP 409 response reporting a CaseAlreadyHasDraftError.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
consistency: eventual
---

## Description

A case's next version number is assigned the moment its draft is created, not at release; two drafts open at once would have nothing to decide which claims that number.
Revising a case is therefore always one working copy at a time, resolved to released or discarded before another draft may begin.

=== rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
---
type: policy
statement: >-
  A surface presenting one case a reader named by its slug alone states explicitly,
  whenever the version that case currently uses does not read back as a case at that
  reading, that the case's current version does not read back as a case right now; it
  presents no attribute of that version as the case's current content, and what it
  states there is distinct from what it states for a read that did not complete and
  from what it states for a case that currently holds no version, so that a reader
  tells the three apart.
expression: >-
  For a case c and a surface presenting c to a reader who named c by its slug and named
  no version of it: let v be the version, among the versions c currently holds, whose
  version number is highest. Where v exists and some validator rule of
  validation-runs-at-every-read does not hold for v at the moment of that reading, the
  surface states of c that the version c currently uses does not read back as a case,
  and states no attribute of v — its title, when_to_use, subject, fallback,
  consolidation_register, state or manifest, nor any fact derived from them — as the
  content c currently stands at. What it states there differs from what the same surface
  states where the read of c did not complete, and from what it states where c currently
  holds no version at all: no two of those three are presented alike. Where v exists and
  every validator rule holds for it at that reading, the surface states none of this.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
consistency: eventual
---

## Description

`validation-runs-at-every-read` makes this a standing state of the store rather than an edge of it: a stored version, draft or released, is read as a case only while every validator rule holds at that reading, and no field marks one that currently fails a rule. So a reader who reached a surface by naming a case's slug can meet a case that exists, holding a version that exists, where the read yields no case at all.

The neighbouring answers do not reach that state. `a-case-read-by-an-unknown-slug-or-version-is-refused` answers a slug, or a slug and version, that no case version currently answers — a version never written — and its own Description already sets aside the case that exists and holds no version as a different case, answered by `a-case-holding-no-versions-is-told-explicitly`. This is the third member of that family, and neither node states it: the case is there, the version is there, and validation says it is not a case at this reading.

That it is stated at all, and stated apart from the other two, is the reading this specification has already given the same shape twice. `a-case-holding-no-versions-is-told-explicitly` refuses an unexplained empty answer precisely because an absence, a failed read and a pending read then read alike, and `a-cases-current-pins-come-from-its-highest-numbered-version` took that same answer for a hypothesis the current version's manifest holds no entry for. The three states ask different things of the curator who meets them — a case holding no version is one to author a version for, a read that did not complete is one to attempt again, and a current version that does not validate is one to correct — so a surface that renders any of them like another sends the reader to the wrong act.

A read that failed is already answered elsewhere and answered differently: `a-domain-error-unmapped-by-status-is-refused-generically` gives what the system did not anticipate a fixed text that discloses nothing about it. A version that does not validate is anticipated by `validation-runs-at-every-read` itself, so it is never presented as that.

No attribute of the version is presented alongside the statement, because `a-case-is-read-whole` leaves nothing partial to present: the read answers a complete, validated version or nothing. Showing a title, a fallback or a manifest recovered beside that would state as the case's current content exactly what validation has just declined to read back as a case.

Which version "the version the case currently uses" names is decided nowhere new here: `a-cases-current-pins-come-from-its-highest-numbered-version` already fixed it as the highest-numbered version among those the case currently holds, on `a-case-summary-is-derived-from-its-existing-versions`'s own reasoning, and this reads that same version so that one reading of "the case as it currently stands" keeps serving every case-keyed surface.

The rule adds no attribute, moves no pin and refuses no call. It states only that this condition is disclosed and held apart from its two neighbours; the wording that carries it, the control it sits in and where on the surface it appears are the interface's, as they are wherever else this specification states what a surface tells a reader.

Consistency is eventual: the fact spans the case a reader named and the version whose validation is judged, each read separately.

=== rules/knowledge/a-case-listing-answers-cases-in-slug-order
---
type: invariant
statement: A listing of every case answers those cases ordered by slug ascending, compared character by character, so which cases a page carries follows from their slugs alone.
expression: For a listing of cases answering c1..cn in answer order, c_i.slug precedes c_i+1.slug in ascending character order for every i in 1..n-1; and the page selected by offset k carries the (k+1)-th through (k+limit)-th cases of that same ascending-slug ordering over every case currently held.
constrains:
  - domain/knowledge/case
---

## Description

The slug is the only ordering fact a case itself declares. A case's identity declares slug and next_version alone, and next_version names the number the case's next draft will be assigned rather than anything a reader of the catalog asked to order by; every other fact a catalog entry shows — current_state, version_count, last_updated, title, when_to_use, released_version — belongs to domain/knowledge/case-summary, derived per case from its own versions.

a-slug-identifies-one-case makes that fact a total order over the answered set: no two cases share a slug, so there is no tie to break and no second read to establish the order.
The derived summary cannot serve as the sort key. a-case-summary-is-derived-from-its-existing-versions leaves last_updated absent for a case that currently holds no version, so it does not order the whole set at all, and it moves as curation proceeds — a reader walking the catalog page by page with a fixed offset would meet a case twice, or never, because the order shifted underneath the offset. A slug never changes and a case never loses it.

listings-are-paged makes any listing of cases one page selected by an offset and a limit, and says nothing about which cases a given page carries.
Left undeclared, the order would be whatever the storage's own arrangement returned, and which cases a reader reaches without paging would follow from that arrangement rather than from a decision — the same substitution hypotheses-are-ordered-by-precedence refuses for a manifest's precedence and a-hypothesis-revisions-listing-answers-highest-revision-first already answered for one hypothesis's revisions.

The direction carries no preference, because no case is the one a reader came for.
A hypothesis's revisions have a newest that a curator adopts and an auditor compares against, which is why that listing answers highest first; the cases of the catalog have no such distinguished member — both readers contracts/knowledge/case-query serves reach for the whole set, the curator browsing what exists and an automated consumer comparing each entry's when_to_use before it chooses. So the order is the one over the name each reader already addresses a case by, read in the direction a name-ordered catalog is read, which also lets a reader holding a known slug predict which page it falls on.

The rule decides the order of this one listing and nothing about the other listings listings-are-paged governs. It adds no attribute to domain/knowledge/case or domain/knowledge/case-summary, changes no listing's paging, and refuses no call. It is an invariant over the case alone, because the sort key is that element's own declared slug and the condition is decidable from the answer itself.

=== rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
---
type: policy
statement: A read or a lifecycle operation naming a case slug, or a slug and version, that no case version currently answers is refused with an HTTP 404 response reporting a CaseNotFoundError, whose details carry the named slug and version.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
consistency: eventual
---

## Description

An unwritten version is not answered as something it is not, but refused by a name of its own — the same distinction the integration and glossary reads already draw for a miss.
A case that exists and currently holds no version is a different case, answered by a-case-holding-no-versions-is-told-explicitly rather than by this refusal.

=== rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
---
type: policy
statement: A case's summary is computed from its own existing versions — current_state is the state of the case's highest-numbered version, version_count is the number of versions the case currently holds, and last_updated is that same highest-numbered version's authored_at; a case currently holding no version has version_count zero and neither current_state nor last_updated, there being no version to derive either from. title, when_to_use and released_version are read from the case's highest-numbered version in released state instead — the one a diagnosis may pin to, never a higher-numbered draft still ahead of it — and a case currently holding no released version has none of the three, there being no released version to derive any from.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/case-summary
consistency: eventual
---

## Description

every-case-version-remains-readable keeps every version a case has released, and a-case-version-number-is-never-reused already says a discarded draft leaves no version behind to read — so "the versions a case currently holds" is never anything but the rows still there, with nothing set aside for one discarded along the way, and version_count needs no rule of its own beyond this to say so.
A case's next_version counter assigns each version's number once, always higher than every number the case has ever held, and a new version is only ever created after every version that came before it — so among the versions a case currently holds, the highest-numbered one is always the most recently authored, whichever of draft or released its own state happens to be. That version's state is current_state, and its own authored_at is last_updated: the same version answers both, because nothing about being released makes a version any less the newest one a case holds.
A case whose one and only version was discarded before release holds none currently — only-a-draft-case-version-may-be-discarded's own discard leaves nothing behind to read, the same absence a-case-holding-no-versions-is-told-explicitly already tells a curator listing that case's versions. There being no version, there is no state and no authored_at to derive current_state or last_updated from; the summary states that absence rather than answering with either field invented.
current_state's own highest-numbered version is not always the version title, when_to_use and released_version answer from: a-case-has-at-most-one-draft lets a curator open a new draft over a case that already holds a released version, and only-a-released-case-version-is-diagnosed refuses to pin any investigation to that draft while it stays one — so the version a diagnosis may actually run against is the highest-numbered one whose own state is released, which a draft still being revised on top of it does not change. title, when_to_use and released_version follow that version instead, so a reader choosing a case by what it names is never pointed at a version diagnosis itself would refuse.
A case that has never once released a version — its one and only version still in draft — holds no released version to derive title, when_to_use or released_version from, whatever version_count and current_state themselves answer; the summary states that absence rather than reading any of the three off the draft.

=== rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
---
type: invariant
statement: A read naming a stored case version for which some validator rule of validation-runs-at-every-read does not hold at that reading is refused with an HTTP 409 response reporting a CaseVersionNotValidError; it is never answered with the generic refusal a domain error the status map does not name receives, and never with the CaseNotFoundError that answers a slug or version no case version was ever written for.
constrains:
  - domain/knowledge/case-version
---

## Description

`validation-runs-at-every-read` makes this a standing state of the store rather than an edge of it: a stored version, draft or released, is read as a case only while every validator rule holds at that reading, and no field marks one that currently fails a rule. A caller may therefore name a slug and a version that a stored case version answers and still get no case back, and this states what that read answers.

It is named rather than left to the fallback. `constraints/a-domain-error-unmapped-by-status-is-refused-generically` exists for what the system did not anticipate and deliberately discloses nothing about it; this condition is anticipated by `validation-runs-at-every-read` itself, so answering it with that fixed, uninformative text would leave the caller unable to tell a version somebody must correct from a failure somebody must retry. `a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case` already owes its reader exactly that distinction, and a surface can only state what the read it made told it.

It is also held apart from its two neighbours in the same family. `a-case-read-by-an-unknown-slug-or-version-is-refused` answers a slug, or a slug and version, that no case version currently answers — a version never written — and `a-case-holding-no-versions-is-told-explicitly` answers a case that exists and holds no version at all. Here the case is there and the version is there; validation is what declines to read it back as a case.

The status is the one this specification already gives an operation the target's own current state forbids, as `only-a-released-case-version-is-diagnosed` and `a-case-has-at-most-one-draft` give it: the request is well formed and the resource it names exists, and what refuses it is the state of the stored version at that moment. The 422 of `a-release-refusal-with-no-named-violation-says-so` answers a well-formed write whose result would violate an invariant, and no write is attempted here.

Nothing partial accompanies the refusal, because `a-case-is-read-whole` answers a complete, validated version or nothing at all. A replay is untouched: it reads its pinned version without revalidation, so no reading of that kind reaches this refusal.

=== rules/knowledge/a-case-version-is-written-once
---
type: invariant
statement: A case version in released state, and every manifest entry it composes, is never altered again; revising a case's content composes the next draft version instead.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
---

## Description

It is what slug and version pin: with no digest over the content, a released version whose manifest could still change would leave every investigation that pinned it naming a procedure other than the one that ran.
Curation is therefore additive — a new draft, then a release — never an edit to a version already released, which is also what keeps every earlier version readable.

=== rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
---
type: state-machine
statement: A case version moves only along its declared lifecycle; a lifecycle operation other than release asked of a version not in draft state is refused with an HTTP 409 response reporting a CaseVersionNotDraftError, and release asked of a version not in draft state is refused with an HTTP 409 response reporting a CaseVersionNotDraftAtReleaseError, whose refusal carries the version's own slug, version number and the state it stood in.
subject: domain/knowledge/case-version
status: domain/knowledge/case-version-state
initial: draft
terminal:
  - released
transitions:
  - from: draft
    trigger: release
    to: released
---

## Description

Draft is where a version's manifest may still be composed; release is the one trigger that ever leaves it, and released is terminal because nothing transitions a case version any further once it has answered for an investigation.

=== rules/knowledge/a-case-version-number-is-never-reused
---
type: policy
statement: A case's next version number is always greater than every version number the case has ever held, including one later discarded.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
consistency: eventual
---

## Description

A discarded draft leaves no version behind to read, but its number is not returned to be issued again — reusing it would let two different draft attempts, at different times, ever have answered to the identical pin.
Reverting to an earlier version's content is therefore always a new, higher version number composed with that earlier version's manifest, never the old number reactivated.

=== rules/knowledge/a-case-versions-input-requirements-are-derived
---
type: policy
statement: A case version's input requirements are one case-input-requirement per subject attribute that the input schema of a capability answering a concept in its collection plan names in properties; that entry's required is true where any such capability's own input schema names the attribute in required, and its capabilities are every capability currently answering such a concept and naming the attribute in properties. A concept the collection plan holds that no registered capability currently answers, or that more than one currently answers, contributes no attribute to this set, and neither does a capability whose own stored input schema does not currently hold a well-formed shape; the read naming these requirements names such a capability separately, since it never appears among any entry's own capabilities.
constrains:
  - domain/knowledge/case-version
  - domain/integration/capability
  - domain/knowledge/case-input-requirement
consistency: eventual
---

## Description

This is where the knowledge and integration contexts negotiate for input, the same as every-collected-concept-has-a-read-only-capability already negotiates for output: a case version's collection plan is knowledge's own fact; which capability currently answers each of its concepts, and what that capability's input schema currently declares (a-capability-input-schema-holds-a-well-formed-object), are integration's. Neither side stores the other's answer — the set is recomputed at every read, never persisted, the same as every other projection this specification derives.
A concept the collection plan reaches that no registered capability currently answers, or that more than one currently answers, is already a fact an observation of it degrades on its own (an-unresolvable-observation-ends-unavailable); this derivation reads the same absence the same way, contributing nothing rather than guessing.
Available for a case version in either state, draft or released: a curator composing a draft wants the same read a diagnose will one day be held to, and only the diagnose itself, never this read, refuses a draft (only-a-released-case-version-is-diagnosed).

=== rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version
---
type: policy
statement: >-
  A surface presenting a case's hypotheses and, for each hypothesis, the revision of its
  content the case currently uses reads every one of those pinned revisions from the
  manifest of the case's highest-numbered version, and from no other version of that case;
  for a hypothesis that version's manifest holds no entry for — including every hypothesis
  of a case currently holding no version at all — the surface states explicitly that the
  case currently uses no revision of that hypothesis, never omitting the hypothesis and
  never presenting any revision of it as the one in use.
expression: >-
  For a case c and a surface presenting c's hypotheses with the revision of each
  hypothesis's content c currently uses: let v be the version, among the versions c
  currently holds, whose version number is highest. For every hypothesis h that v's
  manifest holds an entry for, the revision the surface states as the one c currently uses
  is exactly the revision that entry references; no manifest entry of any other version of
  c, and no revision of h read from anywhere else, ever supplies it. For every hypothesis h
  of c that v's manifest holds no entry for, and for every hypothesis of c where c
  currently holds no version at all and so no such v exists, the surface presents h and
  states of it that c currently uses no revision of it; it states no revision number for h
  and leaves nothing unsaid beside h's name.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
  - domain/knowledge/hypothesis
consistency: eventual
---

## Description

A hypothesis belongs to the case identity and to no one version of it, so a surface keyed by the case rather than by a version has no version named for it — while the revision the case currently uses is a fact only some one version's manifest carries.
Which version that is has to be decided, or the surface answers from whichever version happened to be read.

The highest-numbered version is the one this specification already reads as the case as it currently stands: `a-case-summary-is-derived-from-its-existing-versions` derives both `current_state` and `last_updated` from it, on the reasoning that a case's `next_version` counter issues each number once and always higher, and a version is only ever created after every version before it — so the highest-numbered version a case currently holds is always its most recently authored one, whichever of draft or released its own state happens to be.
`a-case-has-at-most-one-draft` makes that same version the case's own draft wherever it holds one, since a draft is assigned its number from that counter the moment it is created, and its latest released version wherever it holds none.
Reading the pins from any other version would show a curator composing a draft the pins of a version `a-case-version-is-written-once` no longer lets anyone change.

The version's state does not narrow this. `a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis` already holds that a version's state answers whether it may still be composed and whether it may be diagnosed against, never how much of what is true about it a reader is shown; which version a case-keyed surface reads is the same kind of question and takes the same answer.

A hypothesis of the case with no entry in that version's manifest is the ordinary second state of a manifest with respect to a hypothesis, not an edge of the store: `a-hypothesis-is-manifested-at-most-once-in-a-case-version` reads a manifest as holding one entry for a hypothesis or none, `a-new-drafts-manifest-is-copied-from-an-existing-version` gives a case's first-ever draft no manifest to copy at all, `remove-hypothesis` takes an entry back out while draft state holds, and a case whose one and only draft was discarded holds no version to read a manifest from.
In every one of those, the hypothesis still exists — it is named across every version the case ever holds — and the case simply uses no revision of it right now.
The surface says exactly that. Dropping the hypothesis from view would hide the one hypothesis a curator must reach `place-hypothesis` for, which is precisely the gap `a-revise-offers-the-draft-manifest-only-when-the-pin-must-move` offers a route to close; and answering with some revision of it — its own highest existing revision, or the pin some other version of the case holds — would state as in use a revision no manifest of the case's current version pins, which `a-manifest-entrys-pinned-revision-is-always-shown` refuses as a source for a pin.
Leaving the answer blank instead is the silence `a-case-holding-no-versions-is-told-explicitly` already rejects and `a-case-summary-is-derived-from-its-existing-versions` already answered the same way for a case with no version: the absence is stated, never inferred from an empty space that reads alike whether nothing is pinned, the read failed, or the read is still pending.

What this rule decides is only which version's manifest is read, and what is said where that manifest carries no entry for a hypothesis. What each entry that does exist then states stays exactly where it already sits: `a-manifest-entrys-pinned-revision-is-always-shown` makes the pinned revision the entry's own reference rather than anything recovered from a listing of that hypothesis's revisions, and `a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest` carries the comparison against the hypothesis's highest existing revision — both written over an entry, so neither reaches a hypothesis with no entry to present. No pin moves for this, no entry gains a disclosure, and no call is refused.

Consistency is eventual: the fact spans the case, the version whose number is compared against its siblings', and that version's own manifest entries, each read separately.

=== rules/knowledge/a-collected-concept-declares-a-ttl
---
type: policy
statement: Every concept a hypothesis-revision collects has a ttl defined in the glossary; a registration that states none takes the default of sixty seconds; a stated ttl is a positive integer, and zero or less is refused the same way a non-integer one already is, distinct from the absent-ttl default.
constrains:
  - domain/knowledge/hypothesis-revision
  - domain/glossary/concept
consistency: eventual
---

## Description

The ttl is the strictest freshness tolerance among the cases using the concept; without it the cache has no bound to respect.

=== rules/knowledge/a-concept-accepts-the-declared-subject-type
---
type: policy
statement: Every concept a case version's manifested hypothesis-revisions collect accepts the subject type the case version declares; a hypothesis-revision request is refused, with an HTTP 422 response reporting a ConceptRefusesSubjectTypeError, when a concept it collects does not accept the case version's declared subject type.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis-revision
  - domain/glossary/concept
consistency: eventual
---

## Description

It is what stops a case version with subject type customer from requesting equipment state.

=== rules/knowledge/a-hypothesis-collects-at-least-one-concept
---
type: invariant
statement: Every hypothesis-revision collects at least one concept; a revision that would collect none is refused with an HTTP 422 response reporting a HypothesisRevisionCollectsNoConceptError.
constrains:
  - domain/knowledge/hypothesis-revision
---

## Description

A revision without collection can cite nothing, and the citation obligation on decided evaluations would be unsatisfiable for it.

=== rules/knowledge/a-hypothesis-declares-a-criterion
---
type: invariant
statement: Every hypothesis-revision carries a non-empty criterion.
constrains:
  - domain/knowledge/hypothesis-revision
---

## Description

The criterion is what the judgment applies; without one there is nothing to confirm or refute.

=== rules/knowledge/a-hypothesis-is-manifested-at-most-once-in-a-case-version
---
type: invariant
statement: "A case version's manifest holds at most one entry for any one hypothesis: no two entries of one case version reference revisions of the same hypothesis."
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
---

## Description

A case version composes which hypotheses it investigates and, for each one, exactly which revision of that hypothesis's content it uses.
A second entry for a hypothesis the manifest already holds would place one claim at two positions at once — `a-hypothesis-position-is-unique-within-its-case` makes those two positions different by construction — and would adopt two revisions of one content inside one version, so the declared precedence would reach the same claim twice and nothing would say which revision the version actually uses.

The derivations the manifest already feeds read each hypothesis once: `requires-evaluation-of-names-exactly-the-manifested-hypotheses` contributes the name of the hypothesis every entry's revision belongs to, and `one-evaluation-per-required-hypothesis` holds an investigation to exactly one evaluation for every hypothesis that list requires — a name arriving there twice has no reading that is not a duplicate or a name silently dropped.
The rules that read a draft's manifest for one hypothesis read it the same way: `a-revise-offers-the-draft-manifest-only-when-the-pin-must-move` compares the revision a revise wrote against the revision that draft version's entry for the hypothesis pins, and knows exactly two states of a manifest with respect to a hypothesis — one entry, or none.
`a-new-drafts-manifest-is-copied-from-an-existing-version` copies entry for entry, so a draft starts holding this exactly as the version it continues from did.

This rule states what a manifest may hold, and nothing about what `place-hypothesis` then does with a request naming a hypothesis the manifest already holds.

=== rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
---
type: policy
statement: A hypothesis is revised only while its case holds a draft version, and the concept-acceptance check the new revision undergoes uses that draft version's declared subject type; a revision requested while the case holds no draft version is refused with an HTTP 409 response reporting a CaseHoldsNoDraftError. A revise-hypothesis request declares no subject type of its own — the check reads the subject type from the case's draft version and from nowhere else, and a subject type carried on such a request is accepted and left without effect, never read, never compared against the draft version's declared subject type, and never a ground for refusal.
constrains:
- domain/knowledge/case
- domain/knowledge/case-version
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
consistency: eventual
---
## Description

A hypothesis-revision names no case version of its own — it belongs only to the hypothesis identity, which belongs only to the case — so a concept-acceptance check at the moment of revision has no subject type to read unless one is anchored: the case's own draft, the one version a-case-has-at-most-one-draft guarantees is unambiguous. Revising while no draft exists would leave the check with nothing to hold against; the same discipline that keeps a released version's manifest closed to editing (a-case-version-is-written-once) already routes every content change through a draft, and this extends that routing to name which draft and which subject type.
The subject type is the case version's own declared attribute, corrected only through update-draft while that version is draft; a hypothesis-revision declares none. A revise request that carried an authoritative subject type would make the curator a second source of a fact the case version already owns, and would let the acceptance check run against a subject type no case version ever declared. Leaving a supplied value without effect rather than refusing it keeps the check's one source intact without making the request's acceptance depend on a value that changes nothing about what is written or what is checked.

=== rules/knowledge/a-hypothesis-name-is-unique-within-its-case
---
type: policy
statement: No two hypotheses of one case share a name, across every version the case ever holds.
constrains:
  - domain/knowledge/case
  - domain/knowledge/hypothesis
consistency: eventual
---

## Description

Evaluations are indexed by hypothesis name; a colliding name would overwrite a verdict in silence.

=== rules/knowledge/a-hypothesis-position-is-unique-within-its-case
---
type: invariant
statement: No two manifest entries of one case version share a position; place-hypothesis at a position the manifest already places a different hypothesis at is refused with an HTTP 409 response reporting a ManifestPositionOccupiedError.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
---

## Description

Precedence has to be a total order or resolve-outcome has no first confirmed hypothesis to find, only a tie it would settle by whatever it read first.
Position is declared on the manifest entry, not on the hypothesis-revision it references, precisely so that reordering two hypotheses between one version and the next never forces either one's content to gain a new revision.

=== rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
---
type: policy
statement: Revising a hypothesis that already holds a revision writes into that hypothesis's own
  highest existing revision, replacing its content in place and leaving its number unchanged,
  unless that revision is itself in released state, in which case revising instead creates the
  hypothesis's next revision; a hypothesis holding no revision yet always creates revision 1.
constrains:
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

A curator adjusting a criterion's wording before ever publishing it does not want a new number for every keystroke's worth of saving — draft and released are the revision's own declared state, moved once by its own release, independently of any case version that may come to reference it.
`a-released-hypothesis-revision-is-never-altered` is what makes this safe: it already refuses to let this rule's own overwrite reach a revision whose own state is released, so the two rules read the same field and never disagree.
This is a policy rather than an invariant because deciding which of the hypothesis's revisions is its highest existing one still reads across every revision that references the hypothesis — a fact no single hypothesis-revision instance carries alone, and hypothesis and hypothesis-revision are separate aggregate roots.

=== rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
---
type: state-machine
statement: A hypothesis-revision moves only along its declared lifecycle; release asked of a
  revision not currently in draft state — including a hypothesis-revision identity nothing was
  ever stored for — is refused with an HTTP 409 response reporting a
  HypothesisRevisionNotDraftAtReleaseError as the whole of what that refusal reports — its own
  condition and its own message — carrying no further value, and in particular never which of
  those triggers raised it.
subject: domain/knowledge/hypothesis-revision
status: domain/knowledge/hypothesis-revision-state
initial: draft
terminal:
  - released
transitions:
  - from: draft
    trigger: release
    to: released
---

## Description

Draft is where a revision's own content may still be edited in place; release is the one trigger that ever leaves it, taken by a curator directly against this revision — never derived from, and never blocked or granted by, any case version's own manifest or its own release. Released is terminal: a further edit always creates the hypothesis's next revision instead of altering this one (`rules/knowledge/a-released-hypothesis-revision-is-never-altered`).
This is the same shape `a-case-version-moves-through-its-declared-lifecycle` already gives a case version — one forward transition, one terminal state — read here over the hypothesis-revision's own aggregate instead.

=== rules/knowledge/a-hypothesis-revision-number-is-never-reused
---
type: policy
statement: A hypothesis's first-ever revision is numbered 1; each later revision is numbered exactly one past that hypothesis's own highest existing revision, and a revision number, once assigned, is never reused for that hypothesis.
constrains:
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

A hypothesis-revision's own number is what a manifest entry, and a released version's pin through it, address that content by — the same role a case version's own number plays for a released version. Reusing a number for a later revision would let two different pieces of content, authored at different times, answer to the same reference, which is exactly what a-released-hypothesis-revision-is-never-altered depends on staying impossible.
Unlike a case version, a hypothesis-revision is never discarded, so the guarantee holds without needing a counter that survives past a deleted row: the highest revision a hypothesis has ever held is always still on hand to number the next one from.
Replacing an existing, not-yet-frozen revision's own content in place, as `a-hypothesis-revision-is-overwritten-while-unreleased` allows, is not a reuse of its number: the content changes, but the number named never stopped naming that one revision, so nothing has been assigned twice.

=== rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
---
type: invariant
statement: A listing of one hypothesis's revisions answers them ordered by revision number descending, highest first, so the first page of that listing carries that hypothesis's highest existing revision.
expression: For a listing of the revisions of one hypothesis answering r1..rn in answer order, r_i.revision > r_i+1.revision for every i in 1..n-1; and where the total answered is not zero, the page at offset 0 carries the revision whose number is the highest any revision of that hypothesis currently holds.
constrains:
  - domain/knowledge/hypothesis-revision
---

## Description

Both facts this order rests on are the revision's own: the number it is identified by, and the hypothesis it references.
A hypothesis's first revision is numbered 1 and each later one is exactly one past its highest existing revision, never reused and, unlike a case version, never discarded (`a-hypothesis-revision-number-is-never-reused`), so ordering by that number is a total order over the answered set — no tie to break, and no second fact to read to establish it.

`listings-are-paged` makes any listing of a hypothesis's revisions one page selected by an offset and a limit, and says nothing about which revisions a given page carries.
Left undeclared, the order would be whatever the storage's own arrangement returned, and which revisions a curator can reach without paging would follow from that arrangement rather than from a decision — the same substitution `hypotheses-are-ordered-by-precedence` already refuses for a manifest's precedence.

Descending is the direction that keeps the newest content reachable.
The highest existing revision is what a curator adopts into a draft's manifest and what a reader auditing a pin compares against; ascending order would place exactly that revision on the last page, one page further out of reach with every revision the hypothesis gains.
It is the same asymmetry `a-manifest-entrys-pinned-revision-is-always-shown` reads from the other end — later revisions accumulate past an old pin — answered here so that the ordinary first page corroborates the comparison instead of burying it.

This makes no presentation depend on a page, and changes none.
`a-manifest-entrys-pinned-revision-is-always-shown` states an entry's pinned revision whatever page of revisions arrived beside it, and `a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest` compares the pin against the hypothesis's highest existing revision rather than against the highest one a page answered; both hold word for word whether or not any page carries the pin or the highest.
The rule decides the order of this one listing and nothing about the other listings `listings-are-paged` governs, and nothing about which revisions a pin may be moved to, which stays case-version's own.

=== rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
---
type: invariant
statement: A listing of one hypothesis's revisions states, for every revision answered, that
  revision's own state, draft or released.
constrains:
  - domain/knowledge/hypothesis-revision
---

## Description

Whether a revision may still be edited in place or is already immutable is now a fact of the revision itself, not something a curator reading the listing could previously see anywhere: two entries reading otherwise identically — same number, same criterion — answer differently to a save, and this specification has already refused every silence of that shape once a fact is addressable at all (`a-manifest-entrys-pinned-revision-is-always-shown`, `a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest`). Stating the state on the listing is the same discipline applied to the one new fact this increment gives the revision to carry.
This holds inside the one aggregate the listing already reads — `a-hypothesis-revisions-listing-answers-highest-revision-first` orders this same set — so it is an invariant, not a policy.

=== rules/knowledge/a-listed-case-version-offers-a-route-to-its-own-manifest
---
type: policy
statement: >-
  A curator reading a listing of a case's own versions is offered, for every version that
  listing presents, a route to that version's own manifest — for a version in either state,
  draft or released, and on every reading of the listing, with no revise of any hypothesis
  having to have happened for the route to be there.
expression: >-
  For a case c and a listing of the versions c currently holds: for every version v the
  listing presents, the presentation of v carries a route to v's own manifest. The route's
  presence turns on nothing further — not on v's state, whichever of draft or released it
  holds, and not on whether any revise of any hypothesis of c preceded the reading. A
  listing presenting no version of c carries no such route, there being no version to
  present.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
consistency: eventual
---

## Description

The listing is the read a curator browses one case's versions by — `list-case-versions` of `contracts/knowledge/case-query` — where each presented version names itself and nothing about its manifest is carried alongside it.
A version's manifest is where the revisions that version uses stand, so a curator reading the listing is one step away from the only place those revisions can be read, and this states that the step is offered rather than left to whatever address a reader could construct.
`listings-are-paged` makes the listing one page of a case's versions, so the route is owed per version the listing presents rather than per version the case holds.

The version's state does not narrow it. `a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis` already holds that a version's state answers whether it may still be composed and whether it may be diagnosed against — never how much of what is true about it a reader is shown — and `a-cases-current-pins-come-from-its-highest-numbered-version` took that same answer for a case-keyed surface reading a version's manifest. A released version's manifest is exactly what a reader auditing a past investigation has to reach, since `a-case-version-is-written-once` and `a-released-version-keeps-its-original-revision` make that manifest the record of which revisions actually ran; withholding the route there would put the audit's own subject furthest out of reach.

The route is independent of any revise. `a-revise-offers-the-draft-manifest-only-when-the-pin-must-move` states what a completed revise offers and on which of its own two outcomes, and is written over the revise alone; it says nothing about a listing, and this says nothing about a revise. The two carry different content and so do not stand in each other's way: that rule's offer carries the fact that the draft is not yet using what was just written, owed exactly where that is true and nowhere else, while this route carries nothing beyond where a version's manifest is read. A curator who reaches a manifest from the listing learns nothing about whether a pin must move, which is the whole of what the revise's own offer says.

What may then be done through the route this decides nothing about: composing a manifest stays exactly where `case-version` and `a-case-version-is-written-once` already put it — freely while draft state holds, never once released — so a released version's manifest is reached to be read and never to be altered. No manifest entry gains a disclosure for this, no pin moves, and no call is refused.
Which control carries the route, its wording and where it sits are form and belong to the interface, not here.

Consistency is eventual because the fact spans the case whose versions are listed and each of those versions, read separately.

=== rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis
---
type: policy
statement: A surface presenting a case version's manifest entry states that a higher revision of that entry's hypothesis exists whenever one does, for a version in either state, draft or released; on a released version's entry it states that existence alone and offers no adoption of it.
constrains:
  - domain/knowledge/manifest-entry
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/case-version
consistency: eventual
---

## Description

A released version's entry can never adopt the higher revision, and this states nothing suggesting it could: what it discloses is that the hypothesis's content has moved on since this version pinned it — the one fact a reader auditing a past investigation, or judging whether the case warrants a new draft, has no other way to learn from the entry in front of them. Adoption stays exactly where `a-case-version-is-written-once` already put it, in the next draft.
Two standing decisions already refuse to narrow a read of a case version by that version's state, and neither leaves room for a third answer here: `a-case-versions-input-requirements-are-derived` is available "for a case version in either state, draft or released," and `validation-runs-at-every-read` holds a version's reading to every rule "draft or released alike." A version's state answers whether it may still be composed and whether it may be diagnosed against (`only-a-released-case-version-is-diagnosed`) — never how much of what is true about it a reader is shown.
Withholding it on a released entry would be the silence `a-case-holding-no-versions-is-told-explicitly` already rejects: an entry reading revision 1 with nothing said beside it tells the same story whether revision 1 is the hypothesis's only revision or the oldest of five, and the reader is left to guess which.

=== rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown
---
type: policy
statement: A curator reading a case version's manifest is shown, for every entry, the hypothesis-revision that entry itself pins, whatever page of that hypothesis's own revisions was answered alongside it; an entry whose pinned revision is absent from the revisions answered still states that pinned revision, and is never shown as pinning no revision at all.
constrains:
  - domain/knowledge/manifest-entry
  - domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

A manifest entry's pinned revision is the entry's own reference, not a fact recovered from any listing of that hypothesis's revisions — `manifest-entry` carries exactly which revision of that hypothesis's content this version uses, and `hypotheses-are-ordered-by-precedence` already says nothing about how a case version is read back may change what the entry declares.
`listings-are-paged` makes a listing of one hypothesis's revisions one page of a larger set, so the revisions answered beside a manifest entry are a subset that can omit the pinned one; presenting only what that page carried would let the reference the version actually uses vanish from the curator's view while the version keeps using it.
What that omission would cost is the same cost this specification has already refused twice: `a-case-holding-no-versions-is-told-explicitly` refuses an unexplained emptiness over a stored set because absence, a failed read and a pending read then read alike, and `a-released-version-keeps-its-original-revision` is the very guarantee a curator would be unable to verify — the released version's own revision is exactly the one an older page is most likely not to carry, since later revisions accumulate past it.
The rule is a policy over two aggregates read separately, so it holds eventually: the manifest and the revisions arrive as two answers, and the entry's own reference is what governs where they disagree.

=== rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
---
type: policy
statement: A new draft version's manifest is copied, entry for entry, from a specified, already-existing version of the same case, as the draft's starting content; naming no source version copies the case's own latest released version instead.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
consistency: eventual
---

## Description

Creating a draft is never a second decision about what the draft starts holding: its one starting move, before any place-hypothesis or remove-hypothesis ever touches the new manifest, is copying the manifest of whichever existing version of the case it is asked to continue from. `a-case-version-number-is-never-reused` already says that reverting to an earlier version composes the new, higher-numbered draft "with that earlier version's manifest," never reactivating the old number; and `a-released-version-keeps-its-original-revision` narrates the ordinary path the same way — its new draft's revision 2 "replaces revision 1" in version 2's own manifest, which only reads true if version 2's manifest already held revision 1 the moment the draft began.
A case with no version yet has no existing manifest to copy — its first-ever draft starts with none, which is the one case this rule names no source for, not an exception to it.
Naming a source version is the exception, not the default: ordinary draft creation names none, and its copy source is then the case's own latest released version, empty only where the case holds none yet. Naming one explicitly is what a rollback does, to continue from an earlier version instead of the latest released one.

=== rules/knowledge/a-presented-case-version-states-its-own-declared-attributes
---
type: policy
statement: >-
  A curator reading one of a case's versions is shown that version's own declared
  attributes — its title, its when-to-use, its subject, its fallback's outcome and
  referral, and its consolidation register — each read from that version itself and never
  from another version of the case, for a version in either state, draft or released;
  where that version declares no consolidation register, the reading states explicitly
  that this version declares none, never leaving a blank in place of the statement and
  never presenting as the version's own the register another version declares or the
  consolidation step's own adapter would default to.
expression: >-
  For a case c, a version v of c, and a reading of v presented to a curator: the reading
  states v's title, v's when_to_use, v's subject, v's fallback's outcome and v's
  fallback's referral — its action and its recipient — and v's consolidation_register,
  each read from v itself; no other version of c, and no consolidation adapter's own
  default, ever supplies any of them. The statement turns on nothing further — not on v's
  own state, whichever of draft or released it holds. Where v declares no
  consolidation_register, the reading states that v declares no consolidation register; it
  states no register value for v and leaves nothing unsaid in its place.
constrains:
  - domain/knowledge/case-version
consistency: immediate
---

## Description

A case version's own declared attributes are the whole of what it says about itself apart from its manifest: the title and when-to-use a curator chooses it by, the subject type it accepts, the fallback that answers when no hypothesis confirms, and the register the consolidation step writes in.
Every node that says what a curator is shown about a case version was written over something else — `a-manifest-entrys-pinned-revision-is-always-shown`, `a-presented-manifest-entry-states-its-pinned-revisions-state`, `a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest` and `a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis` each state what one manifest entry carries, `a-cases-current-pins-come-from-its-highest-numbered-version` states what a case-keyed surface says about the case's hypotheses, and `a-listed-case-version-offers-a-route-to-its-own-manifest` carries a version's presentation no further than that route.
The version's own attributes were addressable nowhere, so what a reader learns of them fell to whatever a surface happened to render.

They are not recoverable from anywhere else. `a-case-summary-is-derived-from-its-existing-versions` carries a case's title and when_to_use only for its highest released version, never its subject, its fallback or its register, and never a draft's — so the catalog answers about the case, not about the version being read.
Taking one of them from another version is exactly the substitution `a-manifest-entrys-pinned-revision-is-always-shown` and `a-cases-current-pins-come-from-its-highest-numbered-version` each already refused for a pin: a draft's title shown from the last release, or a released version's fallback shown from the draft that follows it, states as this version's precisely what this version does not say.

The reading costs no new read. `a-case-is-read-whole` already assembles a case version's own attributes together with its manifest in one transaction, and `contracts/knowledge/case-query`'s read-case answers exactly that, so wherever a version is read at all these facts are already in hand.

Both states are covered because both readers need them. `contracts/system/case-authoring` promises the curator composes a draft's own declared attributes as freely as its manifest and `contracts/knowledge/case-lifecycle`'s update-draft is that correction — a correction made against values the curator cannot see is made blind, and overwrites what nobody read.
On a released version, `a-case-version-is-written-once` makes those attributes the record of the procedure that ran and `every-case-version-remains-readable` keeps them for exactly the audit that needs them: the subject `a-subject-mismatch-refuses-the-case` refuses on and the fallback `no-confirmation-falls-back` answers from are facts only that version carries.
`a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis` already holds that a version's state answers whether it may still be composed and whether it may be diagnosed against, never how much of what is true about it a reader is shown, and this takes the same answer.

The absent register is stated rather than left blank. The consolidation register is the one of these attributes `case-version` declares optional, and a version declaring none reads exactly like one whose register nobody showed — the emptiness `a-case-holding-no-versions-is-told-explicitly` and `a-cases-current-pins-come-from-its-highest-numbered-version` both already refuse, because a reader cannot tell it from a silence.
Putting the adapter's default there instead would be worse than a blank: `case-version` states that an absent register leaves the consolidation step with whatever its own adapter defaults to, which is a fact of that step and not a value this version declares, and a released version shown declaring a register it never declared misstates the record.

Nothing here is refused or moved: no call is refused, no attribute gains a value, no version's state changes for it, and what may be done with what is read stays where `a-case-version-is-written-once` and update-draft already put it — corrected while draft state holds, read only once released.
`validation-runs-at-every-read` still decides whether a stored version reads back as a case at all; this says what a reading states, never that a version failing that validation is presented anyway.

Which surface carries the reading, which control holds each attribute, where it sits and its wording are form and belong to the interface, not here.
Consistency is immediate because every attribute this states is the case version's own, read from the one aggregate root the reading already assembles whole, so no fact here spans two reads.

=== rules/knowledge/a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest
---
type: policy
statement: A presented manifest entry states whether the hypothesis-revision it pins is that hypothesis's highest existing revision, and where a higher revision exists it states that a higher revision exists — both readable on the entry as presented, without the reader opening that entry's revision selector.
expression: For a presented manifest entry e, latest(e) = the highest revision number the hypothesis e's revision belongs to currently holds; the presentation of e states whether e.revision == latest(e), and where e.revision < latest(e) it states that a higher revision exists, with neither statement conditional on e's revision selector being opened.
constrains:
  - domain/knowledge/manifest-entry
  - domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

A manifest entry pins one revision deliberately, and nothing moves that pin on its own: a released version's entry keeps the revision it adopted however many later revisions of that same hypothesis exist, which is what lets slug and version name one content without a digest over it.
The consequence is that a pin standing behind the hypothesis's highest existing revision is never an error and never announces itself — the entry reads exactly as it would if its revision were the only one — so a reader comparing the two has no way to tell them apart from the entry alone.
This rule is what closes that: the entry itself carries the comparison, so being behind is something the reader learns rather than something the reader has to go looking for.

Both statements are the entry's own, not a selector's: a reader who never opens the revision selector still learns whether the pin is the hypothesis's highest existing revision and, where it is not, that a higher one exists.
Consistency is eventual because the comparison spans two aggregates — the manifest entry inside its case version, and the hypothesis whose revisions are counted — and a hypothesis gaining a revision does not reach into any version's manifest to change it.

The rule states what a presented entry says, and nothing about what may then be done: whether the pin may be moved at all, and to which revisions, stays case-version's own — its manifest is freely composed while draft state holds and never altered once released.
Which control carries the statement, and its wording, are form and belong to the interface, not here.

=== rules/knowledge/a-presented-manifest-entry-states-its-pinned-revisions-state
---
type: policy
statement: >-
  A surface presenting a case version's manifest states, for every entry, the state — draft or
  released — of the hypothesis-revision that entry pins, so a curator reading the manifest
  learns which of its pinned revisions are still in draft from the manifest itself, never only
  from a refused release of that version; while the read of that revision's state has not yet
  completed the entry states explicitly that this pin's state is still being read, and where
  that read fails the entry states explicitly that this pin's state could not be read, so that
  neither window is ever presented as a state and neither is left indistinguishable from an
  entry carrying no state at all.
expression: >-
  For every entry e presented in a case version's manifest, the presentation of e states the
  value of e's referenced hypothesis-revision.state, read from that revision itself; the
  statement is unconditional — it does not depend on the case version's own state, on a release
  of that version having been attempted, or on the reader opening e's revision selector. Where
  that read has not yet returned, the presentation of e states that e's pinned revision's state
  is still being read; where that read fails, the presentation of e states that e's pinned
  revision's state could not be read. The three presentations — a state read, a read still
  outstanding, a read that failed — are distinguishable from one another to the reader, and
  none of them is the presentation of an entry that carries no state.
constrains:
  - domain/knowledge/manifest-entry
  - domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

A pinned revision's own state now decides whether the case version around it may be released at all: `a-released-case-version-manifests-only-released-hypothesis-revisions` refuses the release of any version whose manifest still references a revision in draft state.
Left unstated on the entry, that fact reaches the curator only through the refusal — a manifest whose every pin is releasable reads exactly like one where none is, and the single act that tells them apart is the act that fails.

This specification has already refused a silence of this shape three times around this same fact.
`a-manifest-entrys-pinned-revision-is-always-shown` and `a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest` both exist because an entry that reads identically in two materially different situations tells the reader nothing about which one they are in, and `a-hypothesis-revisions-listing-discloses-each-revisions-own-state` states this very fact — the revision's own state — on the adjacent listing of one hypothesis's revisions.
Disclosing the state where a curator inspects revisions and withholding it where a curator composes the version that depends on it would leave the fact addressable everywhere except the one surface whose next act it governs.

The state is read from the revision itself, an aggregate root separate from the case version whose manifest carries the entry, so between the manifest arriving and that read settling there is a window in which the entry has no state to show, and a read that fails leaves it with none at all.
A blank in either window is the same silence this rule was written against: an entry showing nothing reads exactly like one whose pin is released, one whose pin is still in draft, and one where nobody ever asked — and the curator would take the manifest as answered while the one fact governing its next release stayed unknown to them.
So each window is stated in its own right, and each is distinguishable from a state actually read and from the other, because the curator's next act differs across the three: an outstanding read resolves on its own and is worth waiting for, a failed read is worth retrying, and a state read is what the curator composes against.
`a-case-holding-no-versions-is-told-explicitly` already refuses an emptiness a reader cannot tell from a pending read or a failure over a stored set, and `releasing-an-already-released-revision-tells-the-curator-so` already refuses collapsing one known outcome into an undifferentiated failure notice; this is that same discipline, on this surface.
Neither window touches what the entry states about the pin itself: `a-manifest-entrys-pinned-revision-is-always-shown` still has the entry stating the hypothesis-revision it pins, which is the entry's own reference and needs no read of that revision to be known.

Nothing here moves what the refusal owes: a release attempted over a draft pin is still refused naming every such hypothesis among its violations, and that naming stays the refusal's own.
This rule makes the refusal predictable rather than the only source of the fact.
Nor does it restrict composition — placing an entry that pins a draft revision is still never refused, and the state shown beside it is a disclosure, not a warning this specification words.

On a released version's entry the state necessarily reads released, since that version's own release required exactly that and released is terminal; the statement stays universal rather than narrowed to drafts, because the rule says what an entry carries and not what its reader may still change — the same reading `a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis` already gives a released entry.
The rule is a policy holding eventually because the state is a fact of `hypothesis-revision`, an aggregate root separate from the case version the entry sits inside, and a revision's release reaches into no version's manifest to change it.
Which control carries the statement, and the wording of all three — a state read, a read still outstanding, a read that failed — are form and belong to the interface, not here.

=== rules/knowledge/a-release-refusal-with-no-named-violation-says-so
---
type: invariant
statement: A release whose draft fails any structural or coherence rule is refused once, with an HTTP 422 response reporting a CaseVersionNotReleasableError that names every violated rule together; where release finds no rule specifically violated, the refusal says so explicitly rather than leaving the curator with an unexplained, empty refusal.
constrains:
  - domain/knowledge/case-version
---

## Description

Release aggregates every violated rule into the one refusal (contracts/knowledge/case-lifecycle) — a mechanism that presupposes there is always something to name. Where that assumption still fails and nothing is named, the refusal owes the curator an explicit statement that no specific violation was identified, never a bare, unexplained empty list standing in its place.

=== rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
---
type: policy
statement: A case version's release requires every manifest entry it composes to reference a
  hypothesis-revision in released state; placing a manifest entry is never refused for
  referencing one in draft state, but a release attempted while any entry still does is refused,
  naming the hypothesis of every such entry among the CaseVersionNotReleasableError's violations
  (rules/knowledge/a-release-refusal-with-no-named-violation-says-so).
expression: For a case version v released with manifest entries e1..en, every ei's referenced
  hypothesis-revision.state == released; where some ei's referenced hypothesis-revision.state ==
  draft, release is refused and the violation names every such ei's hypothesis, together with
  every other rule the same release attempt violates. place-hypothesis is never refused by this
  rule, whatever state the revision it references is in.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
  - domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

The manifest is only ever selection: a case version's own release is what a released version's manifest promises to keep answering forever, and that promise now rests on each hypothesis-revision's own release rather than on a case version freezing whatever it happened to reference. This is the other half of the inversion `a-hypothesis-revision-is-overwritten-while-unreleased` and `a-released-hypothesis-revision-is-never-altered` already made: those two rules stopped reading a case version to decide a hypothesis-revision's own fate; this rule is what a case version's own release now reads instead — the hypothesis-revision's own state, never the other way around.
Gating this at release rather than at placement is deliberate: a draft's manifest stays exactly as freely composed as `case-version` already promises, pointing at a draft or a released revision alike, so a curator can place, remove and simulate against an unreleased hypothesis without ever touching this rule. Only the one act that turns a case version immutable also demands that everything it commits to has itself already stopped changing.
This is a policy rather than an invariant because it reads a fact of a third aggregate root, hypothesis-revision, that neither case-version nor manifest-entry itself declares — the same reasoning `a-hypothesis-is-revised-only-against-its-cases-draft` already gives for crossing from case-version to hypothesis.

=== rules/knowledge/a-released-hypothesis-revision-is-never-altered
---
type: invariant
statement: A hypothesis-revision in released state is never altered again. An attempt to alter
  its criterion, resolution or state is refused at the point of the attempt with an HTTP 409
  response reporting a ReleasedHypothesisRevisionNotAlterableError, rather than being accepted
  and left with no effect. An attempt to remove one of its collects is not refused with an
  error; it is accepted and left with no effect, so every collect this revision held before the
  attempt still reads back unchanged after it.
constrains:
  - domain/knowledge/hypothesis-revision
---

## Description

A revision's own content is what its own release promises to keep answering forever, and what every case version's manifest that comes to reference it then relies on in turn.
A hypothesis may still gain a new revision at any time — that revision simply is not the one released.
The refusal is what an attempt meets on arrival rather than a silence it disappears into. `a-hypothesis-revision-is-overwritten-while-unreleased` routes revising away from a released revision before any write is aimed at one, so an attempt that reaches one at all arrives from a state read that no longer held by the time it wrote — and a curator answered with nothing would read an edit that never landed exactly as one that did, against content this rule exists to guarantee never moved.

=== rules/knowledge/a-revise-answers-the-revision-number-it-saved
---
type: invariant
statement: A curator who revises a hypothesis is told the revision number the content was
  saved as — the number of the revision that revise wrote — whether the revise replaced the
  hypothesis's highest existing revision in place or created the hypothesis's next revision;
  that number is the whole of what the answer says about which revision was written, and the
  answer carries no further field distinguishing a revise that replaced the highest existing
  revision in place from one that created the next revision.
expression: For a revise of hypothesis h that wrote revision r of h, the answer to that
  revise states r.revision, and holds no field whose value differs between a revise that
  replaced h's own highest existing revision in place and a revise that created h's next
  revision.
constrains:
  - domain/knowledge/hypothesis-revision
---

## Description

`a-hypothesis-revision-is-overwritten-while-unreleased` lands a revise on one of two revisions — the hypothesis's own highest existing one, replaced in place with its number unchanged, or the next number — and which of the two it was turns on whether any case version in released state references that highest revision.
That fact belongs to an aggregate the curator is not reading at the moment of the save, so the number the content now lives at is not derivable from what the curator supplied: the same edit, typed twice against the same hypothesis, can land on 2 and then on 3 with nothing the curator did differently.
A curator answered with nothing therefore cannot tell whether the number a draft's manifest entry already pins still names the content just written.

Stating the number is the smallest answer that closes that, and it is the same silence this specification has refused before: `a-manifest-entrys-pinned-revision-is-always-shown` refuses to let the revision a version actually uses vanish from the curator's view, and `a-case-holding-no-versions-is-told-explicitly` refuses an unexplained emptiness over a stored set because absence and a failed read then read alike.
It is told in both branches because the branch is exactly what the curator cannot see — an answer given in only one of them would leave silent the case the curator most needs it for.

The number is also the whole of that answer: no further field names which of the two branches the revise took, because nothing decided on this answer needs the branch.
`a-revise-offers-the-draft-manifest-only-when-the-pin-must-move` turns on a comparison of numbers — the revision written against the revision the draft's entry pinned immediately before — and that comparison does not follow the branch: an in-place overwrite of a highest revision the draft's entry does not pin stands above that pin exactly as a created next revision does, so a field naming the branch would answer a differently drawn question and set a second, disagreeing basis beside the comparison that rule states.
Nor is the branch the revision's own fact: it is read from whether a released case version references the highest revision, the cross-aggregate reading `a-hypothesis-revision-is-overwritten-while-unreleased` already makes to choose where the write lands, and carrying its outcome out in the answer would put that reading in a second place for no decision resting on it.

Both facts this rests on are the revision's own — the number it is identified by and the hypothesis it references — so this constrains that one aggregate and holds immediately, the reading `a-hypothesis-revisions-listing-answers-highest-revision-first` already took for what a read of these revisions answers.
The rule states that the number reaches the curator and nothing about form: which control carries it, its wording, and what a surface then does with it belong to the interface.
It states nothing about which revisions a pin may be moved to, which stays case-version's own.

=== rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
---
type: policy
statement: >-
  A curator who has just revised a hypothesis is offered a way to reach the manifest of that
  case's draft version whenever the revision the revise wrote is higher than the revision
  that draft version's manifest entry for the hypothesis pinned immediately before the
  revise, and whenever that draft version's manifest holds no entry for the hypothesis at
  all; where the revise wrote into the very revision that entry already pins, no such offer
  is made.
expression: >-
  For a revise of hypothesis h whose case holds draft version d: let written be the revision
  number the revise wrote — h's own highest existing revision, overwritten in place, or the
  next revision it created — and pinned be the revision number d's manifest entry for h held
  immediately before the revise. The completed revise offers a route to d's manifest where
  d's manifest held no entry for h, and where written > pinned; it offers none where written
  == pinned. No third relation arises: pinned never exceeds h's highest existing revision
  before the revise, so written is never lower than pinned.
constrains:
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/manifest-entry
  - domain/knowledge/case-version
consistency: eventual
---

## Description

The offer exists for one reason: what the curator just wrote does not yet reach the version being composed, and the draft's own manifest is the only place that can be fixed.
Where the revise created the next revision — `a-hypothesis-revision-is-overwritten-while-unreleased`'s create branch, taken because a released version had already frozen the revision the draft pins — the draft's entry now names a superseded number, and only moving that pin makes the new content part of the version being composed.
Where the draft's manifest holds no entry for the hypothesis at all, the same gap is wider still: nothing the curator wrote is used by any version until the hypothesis is placed, which is what `place-hypothesis` (`contracts/knowledge/case-lifecycle`) exists for and what `a-case-has-at-least-one-hypothesis` will hold the release to.
The two offered branches are one condition read from two ends — the draft's manifest does not currently carry what was just written — and the missing entry is its degenerate case, where there is no pin to be behind.

The silent branch is the ordinary curation loop the overwrite rule was written for. An in-place overwrite leaves the entry pinning exactly the revision whose content changed, so the draft is already using what was just saved: `a-draft-revision-is-overwritten-by-repeated-saves` states precisely this — the entry still pins revision 2 and discloses no higher revision. Offering a repin there would send the curator to correct an entry that is already correct, and a step that is always available and never necessary teaches a curator to ignore it on the occasions it is necessary.

This rule states when the route is offered, and nothing about what may then be done through it. The comparison it turns on is the one `a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest` already makes on a presented entry, read here at the moment of the revise rather than at the moment of presentation; no new disclosure is added to any manifest entry, and no pin moves on its own — composing a draft's manifest stays exactly where `a-case-version-is-written-once` and `case-version` already put it.
Consistency is eventual because the fact spans two aggregates: the hypothesis whose revision was written, and the case version whose manifest is read to answer whether that revision is the one it pins.
Which control carries the offer, its wording and where it sits are form and belong to the interface, not here.

=== rules/knowledge/a-slug-identifies-one-case
---
type: invariant
statement: No two cases share a slug.
constrains:
  - domain/knowledge/case
---

## Description

The slug is the case's identity, and it stopped being kept unique by the file system the moment the file stopped being the medium.
Two cases under one slug would give every investigation that pinned it two procedures to have run, and no pin could tell which.

=== rules/knowledge/case-terms-exist-in-the-glossary
---
type: policy
statement: Every subject type, concept, outcome, action and recipient a case version or its manifested hypothesis-revisions name exists in the glossary; a hypothesis-revision naming a concept the glossary does not hold is refused with HTTP 404 reporting ConceptNotInGlossaryError.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis-revision
  - domain/glossary/subject-type
  - domain/glossary/concept
  - domain/glossary/outcome
  - domain/glossary/action
  - domain/glossary/recipient
consistency: eventual
---

## Description

The glossary is the published language; a case version naming a term it does not hold is naming nothing.

=== rules/knowledge/every-case-version-remains-readable
---
type: invariant
statement: Every version of a case remains readable; the store keeps every version, not the last.
constrains:
  - domain/knowledge/case
---

## Description

Keeping only the latest version would silently destroy the reproducibility of old investigations, discovered only when somebody needs to audit one.

=== rules/knowledge/every-collected-concept-has-a-read-only-capability
---
type: policy
statement: Every concept a hypothesis-revision names has a registered read-only capability that declares an output schema and a timeout.
constrains:
  - domain/knowledge/hypothesis-revision
  - domain/integration/capability
consistency: eventual
---

## Description

This is where the knowledge and integration contexts negotiate: a hypothesis-revision naming a concept with no capability is invalid.
If the check only ran at execution, the curator would discover the error during a customer call.

=== rules/knowledge/every-position-declares-a-resolution
---
type: policy
statement: Every hypothesis-revision and every case version's fallback declare an outcome and a referral.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

A confirmed hypothesis with no resolution would leave the attendant with a verdict and nothing to do about it.

=== rules/knowledge/hypotheses-are-ordered-by-precedence
---
type: invariant
statement: The declared order of a case version's manifest is the precedence the experts affirm.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
---

## Description

Which cause dominates which is a domain fact, verified by human review rather than by the validator.
The declared order is each manifest entry's own position, declared rather than arranged, so nothing about how a case version is stored or read back can change what the experts affirmed.
Two hypotheses confirming frequently in the same investigation is the signal that the declared order is wrong.

=== rules/knowledge/one-falsifiable-claim-per-criterion
---
type: invariant
statement: One criterion states exactly one falsifiable claim.
constrains:
  - domain/knowledge/hypothesis-revision
---

## Description

A criterion of the form "confirms when X, or also when Y" is two hypotheses.
Verified by human review, not by the validator.

=== rules/knowledge/only-a-draft-case-version-may-be-discarded
---
type: invariant
statement: A case version may be discarded only while in draft state; a released version is never removed.
constrains:
  - domain/knowledge/case-version
---

## Description

Nothing ever pinned a version that was never released, so discarding one loses no investigation's replay; discarding a released version would lose exactly that.
Discarding removes the version and its own manifest entries, never the hypothesis-revisions they referenced — a revision that only an abandoned draft ever adopted simply keeps existing, referenced by nothing.

=== rules/knowledge/requires-evaluation-of-names-exactly-the-manifested-hypotheses
---
type: invariant
statement: A case version's requires-evaluation-of lists exactly the hypothesis names its own manifest's entries reference, and never the version's fallback.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
---

## Description

requires-evaluation-of is a derivation over the version's own manifest, the same as the collection plan already is: each entry contributes the name of the hypothesis whose revision it references, and nothing outside the manifest contributes at all.
The fallback is a disguised default hypothesis, but it is a resolution rather than a manifested hypothesis and it claims nothing about the world, so there is nothing about it to evaluate: it answers when no listed hypothesis confirms, never by holding an evaluation of its own.
This is the set one-evaluation-per-required-hypothesis holds its totality against, so evaluations covering every hypothesis the manifest names cover requires-evaluation-of whole.

=== rules/knowledge/the-contract-check-reads-the-current-registration
---
type: policy
statement: The capability check reads the registration as it stands at the moment of reading, never a remembered one.
constrains:
  - domain/knowledge/case-version
  - domain/integration/capability
consistency: eventual
---

## Description

Release gates whether a case version's own content may still change, never whether the capability registry it depends on has; validity against that registry stays a fact about now, checked fresh at every read a released version answers, the same as while it was still a draft.

=== rules/knowledge/validation-runs-at-every-read
---
type: invariant
statement: A stored case version, draft or released, is read as a case only while every validator rule holds at the moment it is read; the validator rules are structural as much as coherence ones, so stored content that does not assemble into a whole, well-formed case version at that reading is a validator rule not holding and never a condition of its own; a replay reads the pinned version without revalidation.
constrains:
  - domain/knowledge/case-version
---

## Description

Validation is what decides whether a stored version exists as a case, and it runs at every read — while composing its manifest during authoring and at each load by the engine — with no intermediate gate.
This holds exactly the same way for a version still in draft as for one already released: an incomplete or incoherent draft simply does not read back as a case yet, whether previewed or released against — no separate field marks it "not ready," because failing this same validation already says so. Draft and released answer a different question entirely: not whether a version is coherent, but whether it may yet be diagnosed against (rules/investigation/only-a-released-case-version-is-diagnosed).
Both families of rule are this one validation, and neither is an edge of it. `a-release-refusal-with-no-named-violation-says-so` already names them together — "any structural or coherence rule" — and a read holds that same set: stored content naming a term the glossary does not hold fails a coherence rule, and stored content that does not assemble into a whole, well-formed case version at all — a required attribute the version does not carry, a manifest resolving to no entry, a stored value the declared model does not admit — fails a structural one. Reading the second as a condition of its own would send the composition state this rule already covers, a draft still short of what a case requires, out as something the system did not anticipate; and `a-case-is-read-whole` leaves nothing partial to answer with either way, so what such a read answers is one thing for both families, stated by `a-case-version-failing-validation-at-a-read-is-refused-by-name`.
Replay is the declared exception: an old investigation reads the exact version it pinned, because reproducibility pins content, not current validity.

=== scenarios/glossary/a-concept-with-no-description-is-refused
---
subject: rules/glossary/a-concept-declares-its-description
given:
  - an operator submits a concept registration naming no description
when:
  - register-concept processes the submission
then:
  - the registration is refused with an HTTP 422 response reporting ConceptDescriptionRequiredError
  - the glossary's held concepts are unchanged
  - the operator console tells the operator specifically that the description is missing, never only a generic failure notice — the exact wording stays the console's own
involves:
  - domain/glossary/concept
---

## Description

A concept with no stated meaning would publish a name nobody downstream — the glossary browser, a hypothesis's citation, a judgment prompt — could read.

=== scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused
---
subject: rules/integration/a-connector-placeholder-is-declared-by-its-capability
given:
  - a capability naming connector erp-http declares an input schema whose properties hold only contract_number
when:
  - the erp-http connector configuration is registered with a call embedding a placeholder naming the customer_document Subject attribute
then:
  - the registration is refused
  - the refusal names customer_document as a placeholder the capability naming erp-http does not declare
involves:
  - domain/integration/capability
  - domain/integration/connector-configuration
---

## Description

The capability was registered first and already stands; it is the new connector configuration write that is held to what it declares, the direction this rule checks whenever a connector configuration is the side being written.

=== scenarios/integration/a-legacy-capability-declares-no-input-attributes
---
subject: rules/integration/a-capability-input-schema-holds-a-well-formed-object
given:
  - a capability was registered before this rule existed, its stored input schema holding syntactically valid JSON with no properties object
when:
  - a case version's input requirements are derived over a collection plan this capability answers a concept of
then:
  - the capability is read as declaring no properties and no required attributes
  - it contributes no attribute to the case version's derived requirements
  - the read names the capability separately as not declaring this shape
involves:
  - domain/knowledge/case-input-requirement
  - rules/knowledge/a-case-versions-input-requirements-are-derived
---

## Description

Nothing about this capability's own registration changes on its own — re-registering it, with the shape this rule now demands, is an operator's act this scenario only makes visible, never one this specification performs for them.

=== scenarios/integration/an-optional-attribute-absent-degrades-its-observation
---
subject: rules/integration/an-unresolvable-observation-ends-unavailable
given:
  - a capability's input schema names customer_document in properties but not in required
  - its connector configuration's call embeds a placeholder naming the customer_document Subject attribute
when:
  - an investigation collects that capability's concept for a subject holding no customer_document attribute-value
then:
  - the evidence for that concept records result unavailable, with result_detail naming ConnectorPlaceholderNotResolvedError
  - the collection of every other concept proceeds unaffected
involves:
  - domain/investigation/evidence
  - domain/integration/connector-configuration
---

## Description

customer_document never blocked the diagnose at the door, because a-diagnosed-subject-covers-its-cases-required-attributes only ever holds a subject to what a case's requirements name required; an optional attribute's absence is this scenario's own, recorded ending instead.

=== scenarios/investigation/a-collection-timeout-degrades-to-no-data
---
subject: rules/investigation/no-stage-aborts-on-its-deadline
given:
  - the collection of equipment-state exceeds its capability timeout
when:
  - the collection stage closes
then:
  - the evidence for equipment-state records result timeout
  - the evaluation of the hypothesis collecting it is inconclusive with reason no-data, citing that evidence
  - the investigation proceeds and answers within the total deadline
involves:
  - domain/investigation/evidence
  - domain/investigation/evaluation
---

## Description

Failing fast to a recorded timeout beats waiting for data that may come: an inconclusive within the deadline is a result, an assessment past it is not.

=== scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
---
subject: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
given:
  - a released case version's collection plan resolves to a capability whose input schema names contract_number required
when:
  - a diagnose is called against that case version with a subject holding no contract_number attribute-value
then:
  - the diagnose is refused before any collection
  - the refusal names contract_number and the capability that requires it
involves:
  - domain/investigation/subject
  - domain/knowledge/case-input-requirement
---

## Description

The refusal happens before the collection stage ever starts, distinct from an observation degrading mid-collection: nothing is spent finding out what a look at the case's own derived requirements already knew.

=== scenarios/investigation/a-draft-case-version-is-simulated
---
subject: rules/investigation/a-simulation-writes-no-investigation
given:
  - a case version exists in draft state
  - a subject with at least one attribute
when:
  - a simulation of the case is requested
then:
  - the engine collects, judges, resolves and drafts the assessment
  - the response carries every evaluation with its verdict and citations, every evidence item with its result, the cost and the durations
  - no investigation is written
involves:
  - domain/knowledge/case-version
  - contracts/investigation/case-simulation
---

## Description

A draft may already be under revision and still worth judging end to end before a curator commits to releasing it — this is exactly that read, run for real, on a version a diagnosis would refuse outright.

=== scenarios/investigation/a-draft-case-version-refuses-diagnosis
---
subject: rules/investigation/only-a-released-case-version-is-diagnosed
given:
  - a case version exists in draft state
when:
  - a new investigation attempts to pin that version
then:
  - the request is refused, naming that the version is not released
involves:
  - domain/investigation/investigation
  - domain/knowledge/case-version
---

## Description

A draft may already validate — every rule it composed may already hold — and still be refused here: coherence and release are two different questions, and this scenario is the one where the first holds and the second still refuses.

=== scenarios/investigation/a-foreign-citation-is-refused
---
subject: rules/investigation/a-citation-stays-within-the-hypothesis-collects
given:
  - the evaluator's response for one hypothesis cites a concept outside that hypothesis's collects
when:
  - the adapter validates the response
then:
  - the response is refused
  - one retry runs if the remaining deadline admits it, and otherwise the evaluation falls back to inconclusive with reason judgment-failure
involves:
  - domain/investigation/hypothesis-evaluator
  - domain/investigation/evaluation
---

## Description

The prompt contained only that hypothesis's criterion and evidence, so a foreign citation is an invented reference; the deadline beats the retry, always.

=== scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
---
subject: rules/investigation/judgment-reads-the-evidence-snapshot
given:
  - a concept registered before concepts declared a description holds an empty one
when:
  - a hypothesis collecting that concept is judged
then:
  - the evidence item's concept_description snapshots empty
  - the judgment prompt names that item by its concept alone, with no stated meaning
involves:
  - domain/glossary/concept
  - domain/investigation/evidence
---

## Description

A legacy concept degrades to exactly what it always showed the judgment before this proposal — a name and an observation — never an invented meaning.

=== scenarios/investigation/a-malformed-capability-is-disclosed-to-the-composing-curator
---
subject: rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability
given:
  - a case version's collection plan resolves a capability whose own stored input schema does not currently hold a well-formed shape
when:
  - the interface assembles the subject before a diagnose or a simulate call against that case version
then:
  - that capability's identity is disclosed to the person composing the subject
involves:
  - domain/integration/capability
  - domain/knowledge/case-input-requirement
---

## Description

The concept this capability answers asks the composer for nothing at all; without this disclosure nothing would tell them why, and the capability would stay malformed until someone happened to notice on their own.

=== scenarios/investigation/a-queued-judgment-is-deadline-exceeded
---
subject: rules/investigation/an-inconclusive-evaluation-declares-its-reason
given:
  - the judgment pool is saturated and one hypothesis never receives a slot before the stage deadline
  - the evidence for that hypothesis arrived with result ok
when:
  - the judgment stage closes
then:
  - the evaluation is inconclusive with reason deadline-exceeded
  - the reason is neither no-data, because the data arrived, nor judgment-failure, because nothing failed
involves:
  - domain/investigation/evaluation
---

## Description

Reading a queue as a prompt problem points curation at the wrong place, and the signal that a case has too many hypotheses disappears inside the wrong reason.

=== scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
---
subject: rules/investigation/judgment-reads-the-evidence-snapshot
given:
  - a hypothesis's evidence for one concept was collected against capability lookup-account at version 1.0.0, snapshotting that version's own field semantics
  - after collection, an operator registers a capability at the same name and version, replacing the held record with different field descriptions
when:
  - the hypothesis is judged
then:
  - the judgment prompt carries the field semantics snapshotted at collection, unchanged by the later registration
  - the citation check still holds the evaluator's answer to those same snapshotted field names
involves:
  - domain/investigation/evidence
  - domain/integration/capability
---

## Description

The registry answers a name-and-version identity by whatever it currently holds, never by what it held when this evidence was collected; the snapshot is what keeps a judgment already grounded from silently reading differently the moment somebody edits the registry.

=== scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result
---
subject: rules/investigation/a-simulation-result-is-stale-once-its-source-changes
given:
- a case-simulation result is shown from a prior run
when:
- the curator edits the case version, or a hypothesis-revision it manifests, and returns to the cockpit
then:
- the shown result is marked stale
- the curator is told the result may no longer reflect the version's current content
involves:
- domain/knowledge/case-version
- contracts/investigation/case-simulation
---

## Description

The concrete case behind the rule: the curator never leaves the cockpit to edit anything else, so "returns to the cockpit" is the one moment this closes over, whichever of the version's own screens the edit happened on.

=== scenarios/investigation/a-simulate-screen-presents-an-undetected-required-attribute
---
subject: rules/investigation/a-composed-subject-presents-every-case-input-requirement
given:
  - a case version's collection plan resolves a capability whose input schema names user_id in required
  - that capability's own connector configuration never embeds user_id as a placeholder in its own call
when:
  - the interface assembles the subject before a simulate-case call against that case version
then:
  - an input for user_id is presented
  - the input is marked required
involves:
  - domain/knowledge/case-input-requirement
  - contracts/investigation/case-simulation
---

## Description

user_id reaches the composer even though no connector configuration's own call ever names it literally — the case-input-requirements read, not a connector's own call-assembly detail, is what the interface presents.

=== scenarios/investigation/a-simulated-subject-omitting-a-required-attribute-degrades
---
subject: rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses
given:
  - a case version names user_id a required case-input-requirement
  - a curator dispatches simulate-case against that version with a subject holding no user_id attribute-value
when:
  - the concept user_id's requirement answers is collected
then:
  - that concept's evidence records result unavailable
  - every other concept's collection proceeds unaffected
  - the simulate-case call itself is not refused
involves:
  - domain/investigation/evidence
  - contracts/investigation/case-simulation
---

## Description

The same missing attribute that would refuse a diagnose at the door (a-diagnose-refuses-a-subject-missing-a-required-attribute) here only ends one concept's own observation unavailable, leaving the rest of the run to show the curator everything else the version does.

=== scenarios/investigation/a-simulation-never-enters-the-cache
---
subject: rules/investigation/a-simulation-writes-no-investigation
given:
  - a simulation collected an evidence item with result ok
when:
  - a diagnosis of the same case and subject runs afterward
then:
  - the diagnosis observes the concept again
  - nothing the simulation collected is read back
involves:
  - domain/investigation/evidence
  - contracts/investigation/diagnosis
---

## Description

Result `ok` is exactly the class `domain/investigation/evidence-result` admits into a cache when one exists; this scenario is the one case that proves a simulation's own `ok` observation is the one exception even then.

=== scenarios/investigation/a-single-hypothesis-is-simulated
---
subject: contracts/investigation/case-simulation
given:
  - a case version whose manifest holds more than one hypothesis
when:
  - a simulation of one named hypothesis is requested
then:
  - only the concepts that hypothesis's revision collects are observed
  - exactly one evaluation returns
  - no outcome and no assessment are resolved
involves:
  - domain/knowledge/hypothesis-revision
  - domain/investigation/evaluation
---

## Description

Precedence and totality both presuppose every required hypothesis is in play; naming one and asking only for its own judgment sits deliberately outside that machinery, and this is the case that shows the narrower read is what `simulate-hypothesis` promises, not an accident of a manifest that happens to hold only one.

=== scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
---
subject: rules/investigation/collection-has-its-own-budget-within-the-total
given:
  - the case olt-saturated declares a hypothesis collecting equipment-state
  - the registered capability for equipment-state declares its own timeout of ten seconds
  - the collection stage's nominal budget is seven seconds, and the propagated remaining time still allows the full seven at collection's start
when:
  - the capability has not returned an observation by the seven-second mark
then:
  - the evidence for equipment-state records result timeout at seven seconds
  - the investigation proceeds, unaffected by the three seconds the capability's own declared timeout still had left
involves:
  - domain/investigation/evidence
  - domain/integration/capability
---

## Description

A capability's own timeout bounds one call; it is never the reason the collection stage waits longer than its own seven-second budget allows.

=== scenarios/investigation/an-in-place-revision-edit-stales-the-shown-result
---
subject: rules/investigation/a-simulation-result-is-stale-once-its-source-changes
given:
  - a case-simulation result is shown from a prior run of a draft case version
  - the draft's manifest pins hypothesis customer-equipment-fault at revision 2, not yet
    referenced by any case version in released state
when:
  - the curator revises customer-equipment-fault, overwriting revision 2's content in place, and
    returns to the cockpit
then:
  - the shown result is marked stale
  - the curator is told the result may no longer reflect the version's current content
involves:
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis-revision
  - contracts/investigation/case-simulation
---

## Description

The revision number staying at 2 throughout is exactly what rules out a number comparison as the detection mechanism: `a-simulation-result-is-stale-once-its-source-changes` already commits to no named mechanism for this reason, and an in-place overwrite is the case where that choice is load-bearing rather than incidental.

=== scenarios/investigation/no-response-without-a-record
---
subject: rules/investigation/the-response-follows-the-record
given:
  - the assessment is resolved and written text is ready
  - the persistence does not conclude within what remains of the deadline
when:
  - the request closes
then:
  - the requester receives an error, not the assessment
  - nothing is acted on, because no record exists
involves:
  - domain/investigation/investigation
---

## Description

Persistence is the single stage exempt from degrading, because the referral is exactly the part that is acted upon.

=== scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly
---
subject: contracts/knowledge/case-query
given:
  - a case exists whose one and only version was discarded, so it currently holds no version at all
when:
  - the curator lists that case's versions through list-case-versions
then:
  - the read states explicitly that this case currently holds no version
  - it is never an empty listing with nothing said about why
involves:
  - domain/knowledge/case
  - domain/knowledge/case-version
---

## Description

only-a-draft-case-version-may-be-discarded lets a case's one and only draft be discarded, and a-case-version-number-is-never-reused confirms the case survives that with its slug and its next_version counter intact — so the case a curator names still exists while list-case-versions has nothing left to return for it. An empty listing reads the same whether the case never held a version, held one now discarded, or the curator named a slug list-case-versions cannot resolve at all; only an explicit statement that this case currently holds no version tells the difference, instead of leaving the curator to guess whether the read is still pending or something failed unannounced.

=== scenarios/knowledge/a-catalog-entry-follows-the-released-version
---
subject: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
given:
  - a case whose version 1 is released and whose version 2 is a draft still being revised
when:
  - the case's summary is read for the catalog
then:
  - title, when_to_use and released_version are read from version 1, the released one
  - current_state still reports draft, read from version 2 — the case's highest-numbered version, not its released one
  - version 2's own when_to_use never surfaces in the catalog while it remains a draft
involves:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/case-summary
---

## Description

only-a-released-case-version-is-diagnosed refuses to pin an investigation to version 2 while it stays a draft, so a catalog entry naming version 2's own when_to_use would point a reader at a version diagnosis itself would refuse; released_version names version 1 instead, the one a diagnosis may actually run against, and title and when_to_use follow it rather than the newer draft above it.

=== scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves
---
subject: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
given:
  - hypothesis customer-equipment-fault holds one revision, revision 2, itself in draft state
  - the case's draft manifest pins revision 2 of customer-equipment-fault
when:
  - the curator revises customer-equipment-fault three times, each time changing its criterion
then:
  - customer-equipment-fault's highest revision is still numbered 2
  - revision 2's content is the content of the third, most recent revise
  - the draft's manifest entry still pins revision 2
  - the entry does not disclose a higher revision of customer-equipment-fault
involves:
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/manifest-entry
---

## Description

The ordinary curation loop the rule exists for: adjusting a criterion's wording before publishing never grows the revision history, and the draft's own pin never falls behind what it already points at.

=== scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
---
subject: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
given:
  - hypothesis customer-equipment-fault holds one revision, revision 1, in draft state
  - no case version's manifest holds an entry for customer-equipment-fault
when:
  - the curator releases revision 1
then:
  - revision 1's state becomes released
  - no case version is affected
involves:
  - domain/knowledge/hypothesis-revision
---

## Description

A hypothesis-revision's own release answers to no case: a curator may release one that has never been placed in any manifest at all, and nothing about any case version changes when they do.

=== scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
---
subject: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
given:
  - case version 1 of a case is in draft state
  - its manifest places hypothesis alpha at position 1, pinning alpha's revision 1, itself in
    released state
  - its manifest places hypothesis beta at position 2, pinning beta's revision 1, itself in
    draft state
when:
  - the curator releases case version 1
then:
  - the release is refused, reporting a CaseVersionNotReleasableError that names beta among its
    violations
  - case version 1 stays in draft state
  - alpha's revision 1 and beta's revision 1 are both unaltered
involves:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
---

## Description

The manifest entry for beta was always free to place — nothing about pointing at a draft revision was ever refused. Only release reads it, and only release refuses on it, naming beta so the curator knows exactly which hypothesis to release before trying again.

=== scenarios/knowledge/a-released-version-keeps-its-original-revision
---
subject: rules/knowledge/a-case-version-is-written-once
given:
  - case version 1 of a case is released, its manifest referencing revision 1 of hypothesis customer-equipment-fault
  - a new draft, version 2, is created and revision 2 of customer-equipment-fault replaces revision 1 in version 2's own manifest
  - version 2 is released
when:
  - version 1 is read again
then:
  - version 1's manifest still references revision 1 of customer-equipment-fault, unchanged
  - version 1's own hypothesis-revision content still reads exactly as it did before version 2 ever existed
involves:
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/manifest-entry
---

## Description

The revision a released version's manifest already adopted never moves, however many later drafts revise that same hypothesis — this is what lets slug and version keep naming one content without a digest over it.

=== scenarios/knowledge/a-subject-mismatch-refuses-the-case
---
subject: rules/knowledge/a-concept-accepts-the-declared-subject-type
given:
  - a case version declares subject type customer
  - one of its manifested hypothesis-revisions collects equipment-state, which accepts only contract
when:
  - the case version is read for validation
then:
  - the validation refuses the case version, naming the concept and the subject type that disagree
involves:
  - domain/knowledge/case-version
  - domain/glossary/concept
---

## Description

The coherence check runs where the curator is, at reading, never first at execution during a customer call.

=== scenarios/knowledge/no-confirmation-falls-back
---
subject: domain/knowledge/case-version
given:
  - every hypothesis-revision the pinned case version manifests was refuted or inconclusive
when:
  - the case version resolves the outcome over the evaluations
then:
  - the assessment carries the fallback's outcome and referral
  - no determining hypothesis is named
involves:
  - domain/investigation/assessment
---

## Description

The fallback is a disguised default hypothesis, explicit because a fallback claims nothing about the world.

=== scenarios/knowledge/placing-a-manifest-entry-is-never-refused-for-a-drafts-revision-state
---
subject: domain/knowledge/manifest-entry
given:
  - case version 1 of a case is in draft state
  - hypothesis alpha holds one revision, revision 1, in draft state
when:
  - the curator places alpha at position 1, pinning revision 1
then:
  - place-hypothesis succeeds
  - case version 1's manifest holds the entry, pinning alpha's revision 1
  - revision 1's own state stays draft, unaffected by being placed
involves:
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis-revision
---

## Description

Composing a draft's manifest stays exactly as free as `case-version` already promises: pointing at a hypothesis-revision never releases or freezes it, whatever state it is in, so a curator can place, remove and simulate against an unreleased hypothesis without that revision's own state ever entering the check.

=== scenarios/knowledge/releasing-an-already-released-revision-tells-the-curator-so
---
subject: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
given:
  - hypothesis customer-equipment-fault holds one revision, revision 1, itself in released
    state
when:
  - the curator asks to release revision 1
then:
  - the release is refused with an HTTP 409 response reporting a
    HypothesisRevisionNotDraftAtReleaseError
  - revision 1 stays released
  - the frontend tells the curator specifically that revision 1 is already released and so
    cannot be released again, never only the notice it shows when a request fails for a
    reason it does not recognise — the exact wording stays the frontend's own
involves:
  - domain/knowledge/hypothesis-revision
---

## Description

Release is the one trigger the lifecycle holds and released is terminal, so a second release asked of the same revision is refused rather than repeated — and the refusal's own condition is entirely undramatic: nothing is broken, nothing was lost, and the revision already stands in exactly the state the curator was asking for.
That is the whole reason the telling has to be distinguishable. A curator shown the frontend's notice for a failure whose reason it does not recognise learns that the request's outcome is unknown, and acts accordingly — retrying, reloading, escalating. A curator told the revision is already released learns the opposite, that there is nothing left to do, and the two readings are not interchangeable.
What the specification holds is that substance: the condition named, and named apart from the unrecognised-failure notice. Which control carries it, where it sits and how it is worded are form and belong to the frontend, not here — the same reading `constraints/no-route-enforces-authentication` already takes over its own disclosure.

=== scenarios/knowledge/revising-a-released-revision-creates-the-next
---
subject: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
given:
  - hypothesis customer-equipment-fault holds one revision, revision 2, itself in released
    state, referenced by no case version at all
when:
  - the curator revises customer-equipment-fault
then:
  - revision 3 of customer-equipment-fault is created, in draft state
  - revision 2's own content is unchanged
involves:
  - domain/knowledge/hypothesis-revision
---

## Description

Demonstrates the decoupling this specification now holds: revision 2 is released by the hypothesis's own action, whether or not any case version's manifest ever adopted it, and that alone — its own state, read directly — is what turns this revise into a create instead of an overwrite.

=== scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
---
subject: domain/knowledge/case-version
given:
  - the case version customer-without-internet manifests regional-incident, order-in-progress, financial-block and onu-offline, in that order
  - the judgment confirmed regional-incident and onu-offline and refuted the other two
when:
  - the case version resolves the outcome over the evaluations
then:
  - the assessment carries regional-incident's outcome and referral, with regional-incident as determining hypothesis
  - onu-offline keeps its confirmed verdict, unmarked
involves:
  - domain/investigation/evaluation
  - domain/investigation/assessment
---

## Description

Precedence chooses the determining hypothesis and the others keep the verdict they received; two frequent co-confirmations are the projection signal that the declared order is wrong.
