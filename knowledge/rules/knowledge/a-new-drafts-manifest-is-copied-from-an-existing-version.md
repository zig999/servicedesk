---
type: policy
statement: A new draft version's manifest is copied, entry for entry, from a specified, already-existing version of the same case, as the draft's starting content; naming no source version copies the case's own latest released version instead.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
consistency: eventual
---

## Description

Creating a draft is never a second decision about what the draft starts holding: its one starting move, before any place-hypothesis or remove-hypothesis ever touches the new manifest, is copying the manifest of whichever existing version of the case it is asked to continue from. `a-case-version-number-is-never-reused` already says that reverting to an earlier version composes the new, higher-numbered draft "with that earlier version's manifest," never reactivating the old number; and `a-released-version-keeps-its-original-revision` narrates the ordinary path the same way — its new draft's revision 2 "replaces revision 1" in version 2's own manifest, which only reads true if version 2's manifest already held revision 1 the moment the draft began.
A case with no version yet has no existing manifest to copy — its first-ever draft starts with none, which is the one case this rule names no source for, not an exception to it.
Naming a source version is the exception, not the default: ordinary draft creation names none, and its copy source is then the case's own latest released version, empty only where the case holds none yet. Naming one explicitly is what a rollback does, to continue from an earlier version instead of the latest released one.
