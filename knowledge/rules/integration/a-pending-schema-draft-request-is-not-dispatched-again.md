---
type: invariant
statement: Where the Schema Helper of a surface authoring or editing a capability has requested a capability schema draft and that request has not yet ended, a further draft request from that same Schema Helper issues no draft-capability-schema-from-openapi call at all and leaves the outstanding request untouched, whatever link or operation the surface names by then; that helper requests again as soon as the outstanding request ends, whether it ended in a stated draft or in a refusal.
constrains:
- domain/integration/capability-schema-draft
---

## Description

A schema draft request stores no draft and writes nothing a-capability-schema-draft-registers-nothing does not already hold it away from, so two outstanding requests from one helper leave nothing behind that tells their answers apart: whichever answers last silently replaces the draft the operator is reading, and nothing says which request produced the input_schema, the output_schema and the unresolved items standing in front of them.
The same reading a-pending-simulation-call-is-not-dispatched-again already gives an interface dispatching a call whose run leaves nothing behind, read here over the one helper and the one operation this surface dispatches.
Keyed by the helper alone, rather than by the link and the operation together: a-stated-capability-schema-draft-is-marked-stale-once-what-it-was-generated-for-changes marks the one draft the helper states as generated for the link and the operation of the request that produced it, so a second request naming another link or another operation is exactly the race that single marking cannot survive, the stale reading depending on knowing which request the standing draft came from.
A helper on another authoring surface is a different helper and blocks nothing.
The block costs a bounded wait rather than a lock -- the request is one fetch and one generation the operation answers -- and the helper is free the instant the outstanding request ends, including where it ends in one of the refusals a-refused-schema-draft-states-its-refusal-to-the-operator states rather than in a draft.
This is not a refusal the contract answers: no request is issued, so nothing at contracts/integration/capability-schema-draft ever sees the suppressed attempt and no status or error name belongs to it, and no-schema-draft-refusal-is-stated-before-the-operation-answers stands untouched, because a suppressed attempt is not a request awaiting an answer.
