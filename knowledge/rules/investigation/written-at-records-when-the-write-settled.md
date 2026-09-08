---
type: invariant
statement: An investigation's written_at holds the instant the store settled the write that persisted that investigation's record — never the instant the diagnose request arrived, and never the instant a write attempt was issued against the store; where persistence makes two attempts, exactly one of them persists the record, and the persisted written_at is that write's own settle instant, unchanged by a later attempt that settles by finding the record already present; written_at is filled by that settling write and by nothing that precedes it, so what persistence hands the store is the investigation's own content less written_at, the store answers the persisted investigation with its written_at fixed, and the domain model declares no second element for an investigation assembled but not yet settled.
constrains:
  - domain/investigation/investigation
---

## Description

written_at exists so an audit can say when the record came into being, which no other attribute of the record recovers.
An instant fixed before the write describes an event that had not yet happened when it was fixed — the same reasoning domain/investigation/durations gives for why a value already fixed cannot describe a stage that has not yet run — so an instant read at the request's arrival, or at the moment an attempt was issued, dates the record by the call that carried it rather than by the write it claims to record.
Two attempts need no tie-break: an-investigation-is-written-once leaves exactly one write persisting a record under one id, so that write's settle instant is unambiguous even where a first attempt is abandoned and lands unobserved, and an attempt that settles by finding the record already there persists nothing and changes nothing.
Where no-stage-aborts-on-its-deadline raises without reaching the store, or where both attempts overrun, no record exists at all and the-response-follows-the-record leaves nothing to ask this of.
Whatever calls the store fixes a value before the call, so a written_at supplied by the caller is fixed no later than the moment an attempt is issued — the reading this rule already refuses — which is why the value is not part of what is handed to the store at all: it is what the settling write fills, and the persisted investigation the store answers is the first form of the record that carries it.
An investigation assembled but not yet settled is therefore no element of the domain model: nothing publishes it, no rule reads it and no audit replays it, and the content it holds is content domain/investigation/investigation already declares, held for the length of one call by the stage that is about to write it — representation inside the persistence stage, the same way the connector registry's internally held object is representation of a configuration the specification answers as text.
Declaring a second element for it would put every attribute of the record in two houses and give the write-once record a second shape that is a record in nothing but name; what a call receives is stated here as a condition on the write, as the-writing-input-is-narrowed states what consolidation receives without minting an element for it.
