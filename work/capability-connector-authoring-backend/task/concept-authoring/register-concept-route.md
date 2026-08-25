---
title: Expose register-concept as a write HTTP route
summary: A new HTTP route that creates or replaces a concept by name, built on the glossary store's new write path.
rationale: This task is cut apart from the store-write task because it is a separate seam — a route consuming a port the other task changes — and it depends on that task rather than folding into it, so the port change stays demonstrable on its own.
sources:
  - work/capability-connector-authoring-backend/intake/scope.md
objective: register-concept is exposed as a write HTTP route that creates a concept at a new name or replaces one in place at an existing name.
criteria:
  - Registering a concept at a name that does not yet exist creates it and the response reflects the registered concept.
  - Registering a concept at a name that already exists replaces it in place rather than creating a second entry.
  - A request to the route carrying no authentication credential is not refused for lacking one.
depends_on:
  - task/concept-authoring/glossary-store-concept-write
implements:
  - domain/glossary/concept
  - contracts/glossary/glossary-authoring
  - constraints/no-route-enforces-authentication
---

## What it is

A Fastify route, controller and DTO pair for register-concept, following the existing three-file route convention.

## Notes

None.
