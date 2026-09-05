---
type: invariant
statement: >-
  A surface presenting a newly created draft case version's content presents only the
  content the knowledge context's own record of that version answers; the attribute
  values the curator submitted to create the version are never presented as the created
  version's content, and while no answer for that version has arrived the surface states
  that the version is still being read rather than presenting content for it.
expression: >-
  For a case version v created through create-draft and a surface presenting v's content:
  every attribute of v the surface states is stated as the knowledge context's own record
  of v answers it, and no value the creating request carried is stated as v's own content
  where no such answer for v has arrived. Where no answer for v has arrived, the surface
  states no attribute of v at all and states that v is still being read; it presents
  neither a partial content nor an empty one as v's.
constrains:
  - domain/knowledge/case-version
---

## Description

What a curator submits to start a draft is a request, and what the draft then is is a
record — the two are not the same content, and this says which of them a reader is shown.
`a-new-drafts-manifest-is-copied-from-an-existing-version` makes the copied manifest the
draft's starting content, decided by the case's own existing version rather than by
anything the curator typed; `domain/knowledge/case-version` declares both that manifest
and the version's own state required. So the submitted attributes are strictly less than
the version, always, and presenting them as the version's content presents a case version
that the store never held and that the curator never composed.

A version's content is also not content until it reads back as one.
`validation-runs-at-every-read` makes a stored version read as a case only while every
validator rule holds at the moment it is read, draft exactly as much as released, with no
intermediate gate and no field marking a version not ready. An echo of the request passed
through no such read, so a surface showing it shows something this specification has no
reading of — and a later answer disagreeing with what was already shown would leave the
curator having seen two versions of one version.

The interval before the answer arrives is stated rather than furnished.
`a-case-holding-no-versions-is-told-explicitly` refuses an emptiness that reads alike
whether nothing is there, the read failed, or the read is still pending, and
`a-cases-current-pins-come-from-its-highest-numbered-version` took that same answer again
for a surface with nothing to state. Filling the interval with the submitted values is the
same confusion in the opposite direction: a pending read then reads exactly like a
completed one, and the one thing the curator cannot learn is which of the two they are
looking at. `a-manifest-entrys-pinned-revision-is-always-shown` already fixes the source
of what a reader is shown to the record's own reference rather than to whatever
neighbouring answer happened to arrive beside it; the record is the source here for the
same reason.

This decides the source of the content a surface states and what is said while none has
arrived. It adds no attribute to `domain/knowledge/case-version`, states nothing about
what `create-draft` itself answers, refuses no call, and leaves wholeness where
`constraints/a-case-is-read-whole` already binds it. Which control carries the pending
statement, its wording and where it sits are form and belong to the interface.
