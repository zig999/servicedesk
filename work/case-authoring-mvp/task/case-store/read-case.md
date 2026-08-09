---
title: Read case
summary: The published read-case operation that answers a case by slug and version, validated whole at this reading, with all refusals at once.
rationale: Cut as the composition point of the plan because the scope's promise of all refusals at once spans both validator halves and only a single reading can demonstrate it; the scope stated the promise without stating where it composes.
objective: read-case answers a case by slug and version only while every validator rule holds at the moment of reading, refusing otherwise with every violation named at once.
criteria:
  - Reading a case every rule holds for answers the case whole, pinned by content.
  - Reading a case any structural or coherence rule fails at that moment is refused, with every violated rule named in the one refusal.
  - A case that validated at one read is refused at a later read when the glossary or registration it depends on no longer satisfies a rule.
  - A replay read of a pinned version answers the exact version pinned, without revalidation.
  - No publication gate stands between the authored file and its reading, so a file every rule holds for is a case at its next read.
depends_on:
  - task/case-store/versioned-file-store
  - task/case-model/case-document-model
  - task/case-model/case-coherence-validation
implements:
  - rules/knowledge/validation-runs-at-every-read
  - rules/knowledge/every-case-version-remains-readable
  - rules/knowledge/case-terms-exist-in-the-glossary
  - rules/knowledge/every-collected-concept-has-a-read-only-capability
  - rules/knowledge/the-contract-check-reads-the-current-registration
  - contracts/knowledge/case-query
  - contracts/system/case-authoring
  - constraints/the-mvp-persists-to-no-database
  - constraints/a-case-is-stored-as-one-json-document
sources:
  - intake/scope.md
---
## What it is
The system's promise to the curator made demonstrable: author one file, read it, and have every rule answer at that reading with all refusals at once.

## Notes
UNDERDETERMINED, from the specification — no criterion binds the form the case is stored and pinned in: the criteria speak of the authored file, answering whole and pinning by content, all satisfiable by a store that never materializes one JSON document, while constraints/a-case-is-stored-as-one-json-document refuses exactly that. Passes as written: a read-case answering, pinning and replaying each version straight off an authored markdown file, or off a case decomposed across several files composed whole at read, storing no whole JSON document at all.
Advisory — criterion 4 together with rules/knowledge/every-case-version-remains-readable sits in tension with the fitness of constraints/a-case-is-stored-as-one-json-document: a superseded version needs either every version embedded in the one document, straining the one-file pin, or one document per version, straining the fitness's per-case wording; a construct the specification admits exists either way, and the demonstration of criterion 4 should replay a superseded pin, since replaying only the latest would not falsify an index keeping the last version alone.
Advisory — criterion 2's structural rules are stated by these candidates only as far as document wholeness; the case's declared shape lives in domain/knowledge/case and the nodes it composes, outside these candidates, so the structural half of every validator rule arrives through the neighboring tasks that implement that shape, consumed here as members of the one validation suite whose refusals this read names at once.
Advisory — criterion 3 reads two seams whose content no candidate defines: the glossary and the capability registration, the latter stated by domain/integration/capability; the checks themselves are fully stated in the candidate rules, and the stores they read are neighboring tasks' to build, consumed here current, never remembered.
Decision, beyond the covers — stand: domain/knowledge/case and domain/integration/capability are named only to locate where the case's shape and the registration's shape are implemented; the case-model and capability-registry epics own them, and this read consumes their tasks' deliveries through its dependencies.
