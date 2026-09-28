## Scope

Re-seeding a fixture concept whose name the glossary store already holds leaves that concept's
ttl unchanged, and only adds subject types the fixture newly names to what it accepts — a
subject type the store already records as accepted, which the fixture no longer names, stays
accepted. Editing a fixture's ttl, or narrowing the subject types it accepts, silently fails to
take effect against a store that already holds a concept under that name.

## Reproduction

Seed a concept once. Change its ttl and remove one of its accepted subject types in the fixture
file. Seed again against the same store. The stored concept still carries the old ttl and still
accepts the removed subject type.

## File

src/seed.ts
