---
type: invariant
statement: >-
  A connector configuration draft names in its reading_notes exactly one note for every pairing
  of a kind domain/integration/connector-configuration-draft-reading-note-kind names with a
  subject at which the chosen operation's responses exhibit that kind's condition — two success
  response schemas exhibiting one kind's condition at one and the same subject named by that
  single note rather than by one note each — and names no note for a pairing they do not
  exhibit; a note of kind non-json-success-content-not-read, variants-united or
  success-schema-declares-no-properties names as its subject the key of the response the
  condition was met at, exactly as the responses object declares that key; a responses key
  spelling a status range in lower case, such as 2xx, exhibits status-range-not-drafted exactly
  as the upper-case 2XX does; a responses key made only of digits that is not a three-digit
  number from 100 through 599, such as 42 or 600, is read as a status range and exhibits
  status-range-not-drafted exactly as 2XX does; and a repeated-field-name-path-not-taken note's
  detail names every path not drafted for that note's field name — all of them where three or
  more differing paths were read for it, each beside the success status it was read from and in
  ascending order of that status, none of them left out and none standing for the rest.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

A drafted statusMap or responseMap can honestly be shorter than the document — a default response, a status range, a non-JSON success body, a field name repeated under differing paths — or can have been read through an envelope or across variants, and an operator shown the maps alone cannot tell a short map from a short document.
Each note names the condition and the thing it was met at, so the operator knows what the draft read past, what it read through and what remains theirs to write by hand.
A reading note carries only kind, subject and detail and no status, so two success response schemas exhibiting one kind's condition at the same subject are named by that one note rather than by a second, indistinguishable one.
Where the condition is one a whole success response exhibits — its content declaring no application/json, its schema uniting variants, its schema declaring no properties — the thing it was met at is that response, named by its own key: the key is unique within the responses object and is the same name the drafted statusMap entry and every response field read from it already carry, so the operator joins the note to the rest of the disclosure without reading the document again, while a media type names application/json for two of the three conditions and repeats across responses for the third, identifying no response at all.
A document that spells a range key in lower case has written the wildcard OpenAPI itself spells in upper case, so read as no range at all that key would stand in the document with neither a drafted statusMap entry nor a note against it, which is the silent short map these notes exist to prevent.
A key made only of digits and outside 100 through 599 names no status an observation's own status can ever equal, which is the whole of what a range key is read past for, so it is read as a range of that same kind rather than as a numeric status the specification has already refused it or as the default key, and the operator is told it was passed over by the note that reading already produces.
A field name carried by three or more success response schemas under differing paths is still one condition met at one field name, so it is one note; its detail names every path the draft passed over, because the operator's act is to choose which path that field should be read under, and a detail naming one of the passed-over paths alone would hide the alternatives it was chosen against exactly where the choice is made.
