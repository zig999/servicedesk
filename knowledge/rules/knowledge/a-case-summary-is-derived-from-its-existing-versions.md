---
type: policy
statement: A case's summary is computed from its own existing versions — current_state is the state of the case's highest-numbered version, version_count is the number of versions the case currently holds, and last_updated is that same highest-numbered version's authored_at; a case currently holding no version has version_count zero and neither current_state nor last_updated, there being no version to derive either from. title, when_to_use and released_version are read from the case's highest-numbered version in released state instead — the one a diagnosis may pin to, never a higher-numbered draft still ahead of it — and a case currently holding no released version has none of the three, there being no released version to derive any from.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/case-summary
consistency: eventual
---

## Description

every-case-version-remains-readable keeps every version a case has released, and a-case-version-number-is-never-reused already says a discarded draft leaves no version behind to read — so "the versions a case currently holds" is never anything but the rows still there, with nothing set aside for one discarded along the way, and version_count needs no rule of its own beyond this to say so.
A case's next_version counter assigns each version's number once, always higher than every number the case has ever held, and a new version is only ever created after every version that came before it — so among the versions a case currently holds, the highest-numbered one is always the most recently authored, whichever of draft or released its own state happens to be. That version's state is current_state, and its own authored_at is last_updated: the same version answers both, because nothing about being released makes a version any less the newest one a case holds.
A case whose one and only version was discarded before release holds none currently — only-a-draft-case-version-may-be-discarded's own discard leaves nothing behind to read, the same absence a-case-holding-no-versions-is-told-explicitly already tells a curator listing that case's versions. There being no version, there is no state and no authored_at to derive current_state or last_updated from; the summary states that absence rather than answering with either field invented.
current_state's own highest-numbered version is not always the version title, when_to_use and released_version answer from: a-case-has-at-most-one-draft lets a curator open a new draft over a case that already holds a released version, and only-a-released-case-version-is-diagnosed refuses to pin any investigation to that draft while it stays one — so the version a diagnosis may actually run against is the highest-numbered one whose own state is released, which a draft still being revised on top of it does not change. title, when_to_use and released_version follow that version instead, so a reader choosing a case by what it names is never pointed at a version diagnosis itself would refuse.
A case that has never once released a version — its one and only version still in draft — holds no released version to derive title, when_to_use or released_version from, whatever version_count and current_state themselves answer; the summary states that absence rather than reading any of the three off the draft.
