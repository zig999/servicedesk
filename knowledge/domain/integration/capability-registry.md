---
type: domain-service
operations:
  - register-capability
  - resolve-concept
---

## Description

The one lookup from a concept to the capability that answers it, one to one, with no fallback chain until a second source of the same concept exists.
The most generic piece of the system; nothing in it is for case curation to read.

## Responsibility

Refuse any registration that is not read-only, lacks its declared contract, or declares a schema that is not valid JSON, and resolve each concept to exactly one capability as currently registered.
