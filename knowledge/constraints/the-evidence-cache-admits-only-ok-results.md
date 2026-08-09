---
statement: When an evidence cache exists, its key is concept, subject type, subject id and inputs, its ttl comes from the concept, and only evidence with result ok enters.
scope: investigation
fitness: A cache write of a non-ok result is impossible by construction, verifiable in the cache adapter's tests.
---

## Description

Caching unavailability makes the next investigation inherit an already-resolved failure, and the subject type belongs in the key because ids of different types collide.
The cache is a day-two lever: it shortens the tail, never the cold path the deadline actually presses on.
