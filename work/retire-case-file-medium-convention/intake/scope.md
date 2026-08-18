Corrective increment: src/case/parse-case-document.ts's slugProblems, and its fileName parameter,
still refuse a case whose slug does not equal "the name of the file that holds it" — a rule
(rules/knowledge/the-slug-matches-the-file-name) and a storage-medium constraint
(constraints/a-case-is-stored-as-one-json-document) that no longer exist under the specification
root, retired per knowledge/decision-log.md the moment persistence moved to one relational
database.

src/case/case.ts's CASE_DOCUMENT_ENDING export and its header comment still cite that same
retired constraint.

src/case/case-query.service.ts's structuralCase (in readCase) still manufactures a synthetic file
name (`${slug}${CASE_DOCUMENT_ENDING}`) purely to feed that dead check, for a case that is read
from the relational store, never from a file.

The live nodes governing this today are rules/knowledge/a-slug-identifies-one-case (bare slug
uniqueness, no file-name convention) and constraints/the-system-persists-to-one-relational-database
(nothing stays in a file) — both already state the correct, current fact; nothing is missing from
the specification.

Discovered via /reconcile over case-management-http-api's post-closure code drift
(siegard-reconcile/case-management-http-api-post-closure-drift.md): the specification-conformance
judgment found these three files still stating a domain fact the specification no longer holds,
with no node clearing it.

Corrective task: parse-case-document.ts's slugProblems (and the fileName parameter it exists for)
is removed, since rules/knowledge/a-slug-identifies-one-case's own uniqueness invariant is the
store's concern (already enforced relationally), not a structural-parse concern; case.ts's
CASE_DOCUMENT_ENDING export and its stale citation are removed; case-query.service.ts's
structuralCase stops manufacturing a synthetic file name and calls parseCaseDocument with only
what a case still needs to parse structurally.
