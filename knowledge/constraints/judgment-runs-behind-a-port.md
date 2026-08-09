---
statement: Hypothesis judgment is invoked only through the hypothesis-evaluator port, with the LLM as one adapter among interchangeable ones.
scope: investigation
fitness: The investigation domain module imports no LLM client; adapters are the only classes implementing the port.
---

## Description

The rule the judgment applies lives in the case's prose, not in code, so the prose-versus-mechanical tension resolves by adapter — production LLM, test fake, future rule evaluator — without a second criterion form in the schema.
