---
type: invariant
statement: A case version's authored_at holds the instant the store settled the write that persisted that version — never an instant the curator's own surface fixed before submitting, and never the instant a write attempt was issued against the store; authored_at is filled by the settling write and by nothing that precedes it, so what a create-draft or a revise request carries to the store is the version's own content less authored_at, and the store answers the persisted version with authored_at fixed.
constrains:
  - domain/knowledge/case-version
---

## Description

authored_at exists so a reader — a curator comparing versions, a-case-summary-is-derived-from-its-existing-versions's own last_updated — can say when a version came into being, which no other attribute of the version recovers.

rules/investigation/written-at-records-when-the-write-settled already decided this exact shape once, for an investigation's own written_at: an instant fixed before the write describes an event that had not yet happened when it was fixed, so an instant a curator's own surface reads at the moment they submit dates the version by the surface that carried it rather than by the write that made it a version at all. The same reasoning holds here without a domain difference to answer for — a case version, like an investigation, is a record a store persists, and authored_at is exactly the kind of instant written_at already settles.

Whatever calls the store fixes a value before the call, so an authored_at supplied by the curator's own surface is fixed no later than the moment the request is issued — the reading this rule refuses — which is why the value is not part of what a create-draft or revise request carries to the store at all: it is what the settling write fills.
