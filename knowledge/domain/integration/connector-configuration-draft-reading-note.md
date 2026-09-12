---
type: value-object
attributes:
  - name: kind
    type: connector-configuration-draft-reading-note-kind
    required: true
  - name: subject
    type: string
    required: true
  - name: detail
    type: string
---

## Description

One condition of the chosen operation's responses a connector configuration draft met while drafting its statusMap and responseMap — the kind naming the condition, the subject naming the thing the condition was met at exactly as the document names it, and the detail carrying what the kind needs said beside its subject, the path not taken for a repeated field name among them.
The thing a subject names is the response key, the property or the field the condition was met at, except where the condition was met at the chosen operation as a whole — no responses object declared, or no application/json success response schema among the responses declared — and there it is that operation itself, named as its method upper-cased followed by the path the document declares it under; no note's subject is ever a media type.
A note names what the draft read past or read through, so that a map shorter than the document is never read as a document shorter than it is.

## Responsibility

Name one reading condition, the thing it was met at and what the condition needs said beside it.
