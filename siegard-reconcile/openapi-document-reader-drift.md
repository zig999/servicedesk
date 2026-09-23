---
contract_version: siegard-reconcile/5
title: Reconcile openapi-document-reader.ts against the document-readability and version-refusal nodes
  it binds
summary: This file is asserted correct as it stands on disk; the trace's bindings for it are stale because
  the file changed without a rebind. This reconciliation reads it fresh against every node the trace currently
  binds to it, over one file.
target: backend
files:
- path: src/connector-registry/openapi-document-reader.ts
  change: The file as committed parses an OpenAPI document (JSON then YAML), refuses an unsupported or
    undeclared version and a malformed paths member — no further description beyond what the judge's own
    reading reports.
nodes:
- node: rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  conforms: true
  how: 'src/connector-registry/openapi-document-reader.ts: held at Only the unreadable-document half of
    this rule; the file never fetches, so the fetch-failure half (OpenApiDocumentNotFetchedError and the
    three fetch-failure kinds) is not present here. The unreadable half is held in parsedOpenApiDocument,
    refuseUnsupportedVersion and refuseMalformedPaths, each throwing OpenApiDocumentNotReadableError.
    — throw notReadable(''the fetched document text''); ... throw new OpenApiDocumentNotReadableError({
    kind: ''unsupported-version'', declaredVersion: document.openapi });'
  encoded_at:
  - src/connector-registry/openapi-document-reader.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
  conforms: true
  how: "src/connector-registry/openapi-document-reader.ts: held at parsedAsJsonOrYaml (JSON parsed first,\
    \ YAML tried only on JSON failure, never by content type) and refuseUnsupportedVersion (openapi vs\
    \ swagger fields, each named distinctly, with the no-version case given its own kind carrying no declaredVersion\
    \ at all). — function parsedAsJsonOrYaml(documentText: string): unknown {\n  try {\n    return JSON.parse(documentText);\n\
    \  } catch {\n    return parsedAsYaml(documentText);\n  }\n} ... if (typeof document.openapi === 'string')\
    \ {\n  if (!document.openapi.startsWith('3.')) {\n    throw new OpenApiDocumentNotReadableError({\
    \ kind: 'unsupported-version', declaredVersion: document.openapi });\n  }\n  return;\n} if (typeof\
    \ document.swagger === 'string') {\n  throw new OpenApiDocumentNotReadableError({ kind: 'unsupported-version',\
    \ declaredVersion: document.swagger });\n} throw new OpenApiDocumentNotReadableError({ kind: 'no-version-declared'\
    \ });"
  encoded_at:
  - src/connector-registry/openapi-document-reader.ts
- node: scenarios/integration/a-swagger-2-document-refuses-the-draft
  conforms: true
  how: "src/connector-registry/openapi-document-reader.ts: held at The swagger branch of refuseUnsupportedVersion,\
    \ which fires for a document declaring swagger: \"2.0\" and names the declared version in the thrown\
    \ error. — if (typeof document.swagger === 'string') {\n  throw new OpenApiDocumentNotReadableError({\
    \ kind: 'unsupported-version', declaredVersion: document.swagger });\n}"
  encoded_at:
  - src/connector-registry/openapi-document-reader.ts
notes: 'Judged by 1 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/openapi-document-reader-drift.returns/.

  Candidates: 3 opened across 1 of 1 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/openapi-document-reader-drift.returns/`, which are the evidence behind every entry above.
