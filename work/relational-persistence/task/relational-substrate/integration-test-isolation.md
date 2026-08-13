---
title: Integration tests are isolated from each other against one database
summary: The arrangement that lets tests sharing one database each observe only the rows they arranged.
rationale: The inventory reports every integration test stands up its own temporary directory and expects total isolation, which a shared database withdraws; this is cut as its own task because how the suite isolates state is one decision, and repeating it inside each adapter's task would make it several.
sources:
  - intake/scope.md
depends_on:
  - task/relational-substrate/migration-step
objective: Two integration tests writing the same record in one suite run both pass, each observing only what it arranged.
criteria:
  - An integration test that writes leaves the database holding none of the rows it wrote once it has finished.
  - Two integration tests writing the same case slug in one suite run both pass.
  - Two integration tests writing the same investigation id in one suite run both pass.
  - A test observes no row another test wrote.
  - No integration test creates, drops or alters a table to obtain its isolation.
implements:
  - constraints/the-schema-replays-from-its-scripts
  - domain/knowledge/case
  - domain/investigation/investigation
---

## What it is

The single answer to what a test does about state it shares with every other test.
It replaces the fresh temporary directory per test that the file era gave for free.

## Notes

The inventory names seven integration tests that stand up their own state per test and expect total isolation.
The inventory also reports that a fixture-backed test copies committed fixtures into scratch before reading, so committed bytes are never written back.
UNDERDETERMINED, from the specification — no criterion holds the test database's schema to the migration scripts; a harness building the test schema through some other means than replaying the numbered scripts would still pass every criterion here, and a test must exclude it.
UNDERDETERMINED, from the specification — the objective's "one database" is not backed by any candidate stating that the suite writes to one store; a harness giving each test worker its own pre-migrated database would still pass every criterion as written.
UNDERDETERMINED, from the specification — criterion 2 presupposes that a second case written under one slug is a collision, which rules/knowledge/a-slug-identifies-one-case states and this task does not implement; an isolation arrangement letting two same-slug cases coexist and be cleaned up afterward would still pass criterion 2 as written, because nothing here refuses the duplicate.
ADVISORY, from the specification — criterion 3 presupposes that two investigations cannot share an id; no node of the specification states investigation-id uniqueness the way it states the case's slug uniqueness.
ADVISORY, from the specification — this task does not implement constraints/the-domain-depends-on-no-infrastructure, but threading a per-test connection or transaction into the adapters must not put a driver import in the domain modules the harness reaches through.
