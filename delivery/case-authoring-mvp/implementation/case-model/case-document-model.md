---
title: Case document model with one-pass structural refusal
summary: One case JSON document parses into the whole aggregate — case, hypotheses, resolutions, referrals, in declared order — and any structural violation refuses it once through a typed error naming every violation at the same time.
task: sha256:6d51da49abe191c5ad2dca01193d0255549a75f72707f54e502d0703fff7fe25
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/case-model-case-document-model-build
files:
  - path: src/case/case.ts
    effect: declares the case aggregate as pure values — Case, Hypothesis, Resolution and Referral with every attribute spelled as the specification spells it, hypotheses held as an ordered readonly array, and the CASE_DOCUMENT_ENDING constant naming the medium's .json ending for the slug rule and a future file store to share
  - path: src/case/parse-case-document.ts
    effect: parseCaseDocument(document, fileName) reads the whole aggregate from the one document's data, holds it to every structural rule in one pass, and throws once naming every violation, or answers the aggregate with the document's declared hypothesis order preserved
  - path: src/errors/invalid-case-document.error.ts
    effect: the typed business error a structurally violating case document is refused with, carrying the file and every named violation in context, following the tree's problems-in-context error pattern
criteria:
  - criterion: A document holding slug, title, when_to_use, version, hash, subject, fallback and at least one hypothesis parses into one case aggregate.
    met: true
    how: parseCaseDocument answers one Case value built from exactly those declared attributes once documentProblems finds nothing
  - criterion: The whole aggregate — hypotheses, resolutions, referrals — is read from the one document, and no part of a case is read from a second store.
    met: true
    how: the parse's only inputs are the one document's parsed JSON data and the file's name; the module holds no port, reads no store, and imports nothing beyond its own types and its typed error, so a second source of any part is impossible by construction
  - criterion: A case whose slug differs from the name of the file that holds it is refused.
    met: true
    how: slugProblems compares a declared slug against the file's name — the .json ending stripped — and a mismatch is a named violation in the one refusal
  - criterion: A case declaring no hypothesis is refused.
    met: true
    how: hypothesesProblems names the violation for an absent hypotheses key and an empty array alike
  - criterion: A case with two hypotheses sharing a name is refused.
    met: true
    how: sharedNameProblems groups declared names by position and emits one violation per shared name, naming the positions that share it
  - criterion: A hypothesis collecting no concept is refused.
    met: true
    how: collectsProblems refuses an absent collects and an empty array, a non-array, and an entry that is empty or not a string
  - criterion: A hypothesis carrying an empty criterion is refused.
    met: true
    how: the criterion is held to being a declared, non-empty string — the empty string is refused as empty, never defaulted
  - criterion: A hypothesis or the fallback missing its outcome or its referral is refused.
    met: true
    how: one resolutionProblems collector runs identically over every hypothesis's resolution and the case's fallback, with referralProblems refusing a referral missing its action or recipient beneath them
  - criterion: A document violating several structural rules is refused once, with every violation named.
    met: true
    how: documentProblems collects every violation across all attributes, all hypotheses and both resolutions in one pass before anything is thrown, and a single InvalidCaseDocumentError carries the whole list in context
  - criterion: The document model's modules import no framework, no driver and no provider client.
    met: true
    how: case.ts imports nothing, parse-case-document.ts imports only its sibling types and the typed error, and the error imports nothing — not even a node builtin reaches the model
nodes:
  - node: domain/knowledge/case
    encoded_at:
      - src/case/case.ts
      - src/case/parse-case-document.ts
    how: the seven declared attributes are the Case type spelled as the node spells them, each required and refused when undeclared, empty or of the wrong type — version held to the node's integer; the 1..* hypothesis composition is the ordered hypotheses array; the three operations are not reached, per the task's advisory assigning their behavior to the resolution sibling
  - node: domain/knowledge/hypothesis
    encoded_at:
      - src/case/case.ts
      - src/case/parse-case-document.ts
    how: name, criterion, collects and resolution are the Hypothesis type, each required — a nameless hypothesis is refused per the task's first UNDERDETERMINED note
  - node: domain/knowledge/resolution
    encoded_at:
      - src/case/case.ts
      - src/case/parse-case-document.ts
    how: the value object pairs one outcome with one referral, and a position declaring one without the other is refused, on hypotheses and fallback alike
  - node: domain/knowledge/referral
    encoded_at:
      - src/case/case.ts
      - src/case/parse-case-document.ts
    how: action and recipient are the Referral type's two required attributes, each a glossary name held as a string here — whether the names exist in the glossary is the coherence sibling's read
  - node: rules/knowledge/the-slug-matches-the-file-name
    encoded_at:
      - src/case/parse-case-document.ts
    how: the parse takes the name of the file that holds the document as an input, and refuses a declared slug that does not equal that name once the medium's .json ending is stripped
  - node: rules/knowledge/a-case-has-at-least-one-hypothesis
    encoded_at:
      - src/case/parse-case-document.ts
    how: an absent and an empty hypotheses declaration are refused with the rule's own wording, so the fallback alone never parses as an investigation
  - node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
    encoded_at:
      - src/case/parse-case-document.ts
    how: each name declared by more than one hypothesis is refused naming every position that shares it, so no colliding name survives into the aggregate
  - node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
    encoded_at:
      - src/case/parse-case-document.ts
    how: a hypothesis collecting no concept — absent, empty, non-array, or holding an entry that names none — is refused
  - node: rules/knowledge/a-hypothesis-declares-a-criterion
    encoded_at:
      - src/case/parse-case-document.ts
    how: the criterion is held to being a declared, non-empty string
  - node: rules/knowledge/every-position-declares-a-resolution
    encoded_at:
      - src/case/parse-case-document.ts
    how: one collector runs over every hypothesis's resolution and over the fallback, so every position is held to declaring an outcome and a referral by the same code path
  - node: rules/knowledge/hypotheses-are-ordered-by-precedence
    encoded_at:
      - src/case/case.ts
      - src/case/parse-case-document.ts
    how: the aggregate holds hypotheses as a readonly array built with an order-preserving map over the document's declared sequence — never a set, never a name-keyed map — per the task's second UNDERDETERMINED note; which order is right is the experts' to affirm, and the code only preserves it
  - node: constraints/a-case-is-stored-as-one-json-document
    encoded_at:
      - src/case/parse-case-document.ts
      - src/case/case.ts
    how: the parse reads everything from the one document's data and consults nothing else, and CASE_DOCUMENT_ENDING names the medium's ending in one place; the case store the fitness clause measures is a later task's, and it will call this parse
  - node: constraints/the-domain-depends-on-no-infrastructure
    how: honored over the document model's modules, the span criterion 10 demonstrates — the three files import no framework, no driver, no provider client and no node builtin; there is no port here because this model needs no infrastructure at all
inferences:
  - inferred: the document's key for the composed hypotheses is hypotheses
    from: the case node declares the composition as a relationship with cardinality 1..* but names no attribute for it, and the task's criteria speak of a document holding at least one hypothesis
  - inferred: the name the slug is held to is the file's name without the .json ending, and a caller may state the file with or without that ending
    from: the storage constraint gives the medium its .json ending while the slug rule speaks of the file's name — a slug carrying .json would put the medium inside the identity
  - inferred: a required attribute that is present but empty, or not of its declared type, is refused as its own named violation — never defaulted or coerced
    from: the task's first UNDERDETERMINED note requires refusal over defaulting, and the convention the capability registry evidences
  - inferred: the parse takes the document's parsed JSON data plus the file name, rather than raw text
    from: the tree's persistence convention — json-file.ts owns reading and JSON-parsing with not-json raised as the store's own data error, so text-level failure is the store's to name and structural violation is the domain's
  - inferred: the structural refusal is hand-written checks in the domain rather than a zod schema
    from: the standard's boundary enumeration does not name a domain aggregate's invariants; the cross-field rules and the every-violation-named refusal shape are not a schema's issue list; and the tree's domain modules evidence exactly this pattern while keeping zod at the persistence boundary
  - inferred: keys the specification does not declare do not travel into the aggregate
    from: the strip behavior the tree's stores evidence, where every object schema drops unknown keys by default
preserved:
  - the glossary module, the capability-registry module, both file stores, both factories, json-file.ts and every existing error are untouched, and their suites exercise them as before
  - package.json is untouched — no dependency added or removed, and the document model uses none
  - src/index.ts still exports nothing and states no domain fact
deferred:
  - what: the case aggregate's three operations — collection-plan, requires-evaluation-of and resolve-outcome — are declared by the node and not implemented on the parsed aggregate.
    why: the task's advisory records that no criterion here demonstrates them and the epic's resolution sibling names the node for its behavior
  - what: no file-backed case store, port or factory reads case documents from disk yet.
    why: the plan cuts file persistence into its own task — this model takes the document's data and the file's name as inputs precisely so that store can call it without the domain touching the filesystem
---
## What it is
The aggregate boundary as the document boundary, in pure values: one parse, every structural rule in one pass, one typed refusal naming everything wrong, and the declared precedence order surviving into the aggregate untouched.
The two UNDERDETERMINED notes are answered in structure — every required attribute refused rather than defaulted, and the hypotheses an ordered array rather than a set or map.

## Notes
The model imports nothing at all — not even a builtin — which makes criterion 10's audit trivial and keeps the three operations the resolution sibling will add as pure as the values they read.
The parse takes parsed data plus the file name so the file store can own text-level failure while the domain owns structural violation, the same split the tree's other stores evidence.
