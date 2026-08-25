---
type: invariant
statement: A read over a vocabulary, or over the concepts, that finds one name held more than once is refused with an HTTP 500 response reporting a DuplicateGlossaryNameError rather than answering either record.
constrains:
  - domain/glossary/concept
  - domain/glossary/subject-type
  - domain/glossary/subject-attribute
  - domain/glossary/outcome
  - domain/glossary/action
  - domain/glossary/recipient
---

## Description

Each term exists exactly once is the glossary's own guarantee (domain/glossary/_context); a holding that breaks it is a corrupted store, not a business state, so no read chooses between the duplicates.
