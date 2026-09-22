---
statement: >-
  A domain refusal's message text names a case "caso", a case version "versão", a hypothesis
  "hipótese", a hypothesis-revision "revisão", a concept "conceito", a case version's manifest
  "manifesto", a manifest entry's position "posição", the draft state "rascunho" and the
  released state "liberada", and names none of those nine by its English word nor a case
  version's or hypothesis-revision's state by the raw lifecycle token that names it internally.
scope: system
fitness: >-
  An automated test reads the message of every domain refusal the error envelope carries and
  asserts that each of these nine nouns is named there by its Brazilian-Portuguese word alone,
  with no occurrence of the English word for one of them and no occurrence of a raw lifecycle
  token such as draft or released.
---

## Description

Stated once for the whole surface so no error class picks its own name for a noun another error class already names, mirroring `constraints/a-domain-error-unmapped-by-status-is-refused-generically`'s own system-wide placement for the fixed text of the fallback refusal.
The refusal reaches an operator reading Portuguese while this specification's own element names are English, and with no word fixed per noun the same record is a "versão" in one refusal and a "version" in the next, leaving an operator comparing two refusals unable to tell whether they speak of one thing or two.
The lifecycle token a state carries is an internal name nobody outside the store is taught, so a refusal interpolating it would hand the operator a value they have no way of reading; the state reaches them as the word the rest of the sentence already uses.
What is fixed here is the vocabulary and not the phrasing: how each message is built around these words stays free to be written and rewritten for clarity, as every other telling's copy stays with whoever renders it.
