---
statement: The in-progress marker of an ongoing investigation is a lease in the idempotency store — a key and an instant — never a state of the investigation.
scope: investigation
fitness: The investigation store holds no record before completion, and the lease store holds nothing but keys and instants.
---

## Description

The distinction is what keeps the written-once rule standing while a second identical request still finds and joins the first.
