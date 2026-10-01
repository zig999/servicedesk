---
entries:
- field: operations
  unstated: The material demands the glossary be readable by every context but names no operations.
  decided: read-vocabulary-term and read-concept
  why: The two reads the consumers actually perform; validation reads terms, normalization and collection read concepts.
- field: operations
  unstated: The same review decided the glossary's vocabularies and its concepts both need a listing, without naming the operations.
  decided: list-vocabulary-terms and list-concepts, added to glossary-query's own operations, alongside read-vocabulary-term and read-concept.
  why: Mirrors this api's own existing pairing of a term read and a concept read — one more operation per existing read, exposed through the one published-language interface a consumer already depends on, never a second interface.
---
