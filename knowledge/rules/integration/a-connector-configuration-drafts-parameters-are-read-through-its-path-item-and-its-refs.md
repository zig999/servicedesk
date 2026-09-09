---
type: invariant
statement: >-
  The parameters one operation declares are every parameter its own operation object declares
  together with every parameter its path item declares that no parameter of the operation's own
  names at the same location under the same name, the operation's own parameter standing where
  the two would otherwise conflict, and a $ref a parameter, a request-body schema, or a security
  scheme declares in place of stating itself directly is read through to the declaration it
  targets before a name, a location, a schema or a scheme kind is read from it.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

A path item's own parameters and a $ref in place of a direct declaration are read the way OpenAPI 3.x itself already defines them, not a preference this specification states: a path item's parameters apply to every operation under it unless that operation declares one of its own at the same name and location, and a $ref names a declaration to be read exactly as if it stood written where the reference sits. Reading either any other way would not be a narrower or a stricter reading of the same document — it would be reading a different document than the one the operator named, so both are read here as the format itself already fixes them.

This is the premise `a-connector-configuration-draft-places-each-part-where-the-call-carries-it` reads a parameter's own name, location and schema from.
