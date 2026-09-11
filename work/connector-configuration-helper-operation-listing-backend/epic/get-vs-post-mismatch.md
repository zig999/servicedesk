---
title: GET vs POST mismatch on read-openapi-document-operations
summary: Corrects the read-openapi-document-operations route to accept GET with the
  link as a query parameter, matching what the frontend already sends.
covers:
- constraints/a-malformed-request-is-refused-with-a-validation-error
- contracts/integration/openapi-document-operations
- domain/integration/openapi-document-operations
sources:
- intake/get-vs-post-mismatch.md
---

## What it is

Reproduced by running the deployed frontend against the deployed backend: the operations-read request the Configuration Helper issues answers HTTP 404, because the backend route only accepts POST while the frontend sends GET with the link as a query parameter.

## Notes

None.
