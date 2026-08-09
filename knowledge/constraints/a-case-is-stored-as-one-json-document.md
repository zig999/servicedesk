---
statement: A case, with every entity it composes, is stored whole as one JSON document, never decomposed into separate stores.
scope: knowledge
fitness: The case store holds exactly one JSON document per case, and no second store holds any part of a case.
---

## Description

The aggregate boundary becomes the document boundary: hypotheses, resolutions and referrals travel inside their case's document, so loading a case is reading one file and pinning it is hashing one file.
The curator-facing prose the writing rules shield stays inside the document and out of every prompt, wherever the document holds it.
