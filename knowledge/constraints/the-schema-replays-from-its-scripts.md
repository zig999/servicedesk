---
statement: The schema is reconstructible on an empty database by applying the migration scripts in the order they are numbered.
scope: system
fitness: Applying every script in order to an empty database produces the schema the current tree expects, with no step performed by hand.
---

## Description

This is the half of the property that outlives whichever registry a project sets for itself: where the scripts live and what form they take is one project's own arrangement, and a standard's rule is the only place that decides it.
Replay is what makes a schema readable before it runs — a fresh environment, a test database and a restored one all arrive the same way, and a step somebody performs by hand is a step no tree records.
