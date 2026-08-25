---
statement: The registry's read-capability route refuses a concept no capability is currently registered for with an HTTP 404 response, naming ConceptNotAnsweredError as the specific condition and message of that refusal.
scope: integration
fitness: An automated test requests read-capability for a concept no capability answers and asserts that the response is HTTP 404 naming ConceptNotAnsweredError.
---

## Description

The same idiom the-capability-identity-read-refuses-an-unregistered-identity holds for the identity-keyed read of this route family: the registry resolves the absence as ordinary data, and the published read turns it into a named refusal of its own.
