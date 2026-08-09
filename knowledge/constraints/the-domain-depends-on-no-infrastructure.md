---
statement: The domain layer — case behavior, investigation factory, evaluation, vocabulary — imports no framework, no driver and no provider client; infrastructure reaches it only through ports.
scope: system
fitness: A dependency audit over the domain modules' imports finds no framework, driver or client package.
---

## Description

The core is the case schema and its validator; keeping the domain importable without infrastructure is what keeps its logic testable as pure unit tests.
