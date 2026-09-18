---
type: invariant
statement: An evidence item's observed_at is an absolute instant in UTC — the moment that item's observation was captured, read off a UTC clock and carried as UTC wherever the item is stored, returned, presented or judged — never a local-zone reading of that moment.
constrains:
  - domain/investigation/evidence
---

## Description

domain/investigation/evidence declares observed_at a datetime, and a datetime on its own fixes no reference: the same recorded moment reads as two different instants to two readers sitting in different zones, and nothing in the record tells either which one the collector meant.
The ambiguity costs something precisely here, because observed_at is the point freshness is counted from — the item's own ttl is a span of seconds running from it — and a span measured from an unanchored point answers a different question in every zone it is read in.
UTC is the anchor rather than any particular local zone because no reader of an evidence item is the collector: the store that keeps it, the surface that presents it beside other items, and the judgment that reasons over it are all elsewhere, and only a reference none of them is local to leaves two items collected through two different capabilities comparable without first asking where each was collected.
