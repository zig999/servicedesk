# Scope: bring four standard-conformance findings into conformance

Source: delivery/pinned-evidence-semantics/review/pinned-evidence-semantics.md (the first review of this same initiative), findings against standards/backend-node-service.yaml.

## Finding 1 (ARC-01)

src/persistence/relational-glossary-store.repository.ts's constructor is typed against DatabaseConnection (= the concrete pg Pool class) rather than an interface, forcing its own unit spec to cast a fake connection past the compiler (`{ connect } as unknown as DatabaseConnection`) for every test.

## Finding 2 (ARC-01)

src/persistence/relational-investigation-store.repository.ts's constructor has the identical binding to the same concrete Pool class, with the identical unsafe-cast fallout in its own unit spec.

## Finding 3 (MNT-03)

src/investigation/field-semantics.ts's parseJsonOrUndefined and isPlainObject helpers are byte-identical duplicates of citation-validation.ts's own pre-existing helpers of the same name and behavior.

## Finding 4 (MNT-03)

src/investigation/anthropic-hypothesis-evaluator.adapter.ts's isRecord function is a third independent copy of the same non-null/non-array-object guard citation-validation.ts's and field-semantics.ts's own isPlainObject already declare.

## Human's own words

"faça o plan-work dos dois achados ARC-01 e os 2 MNT-03"
