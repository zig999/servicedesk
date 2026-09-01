---
type: invariant
statement: An investigation's written_at holds the instant the store settled the write that persisted that investigation's record — never the instant the diagnose request arrived, and never the instant a write attempt was issued against the store; where persistence makes two attempts, exactly one of them persists the record, and the persisted written_at is that write's own settle instant, unchanged by a later attempt that settles by finding the record already present.
constrains:
  - domain/investigation/investigation
---

## Description

written_at exists so an audit can say when the record came into being, which no other attribute of the record recovers.
An instant fixed before the write describes an event that had not yet happened when it was fixed — the same reasoning domain/investigation/durations gives for why a value already fixed cannot describe a stage that has not yet run — so an instant read at the request's arrival, or at the moment an attempt was issued, dates the record by the call that carried it rather than by the write it claims to record.
Two attempts need no tie-break: an-investigation-is-written-once leaves exactly one write persisting a record under one id, so that write's settle instant is unambiguous even where a first attempt is abandoned and lands unobserved, and an attempt that settles by finding the record already there persists nothing and changes nothing.
Where no-stage-aborts-on-its-deadline raises without reaching the store, or where both attempts overrun, no record exists at all and the-response-follows-the-record leaves nothing to ask this of.
