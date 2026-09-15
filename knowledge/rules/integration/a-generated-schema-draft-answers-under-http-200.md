---
type: invariant
statement: Where draft-capability-schema-from-openapi answers a request with a generated capability schema draft rather than with one of its own refusals, that answer carries an HTTP 200 status and never HTTP 201, generating a draft creating no capability and no record of any kind; never HTTP 204, the draft being the whole of what the request asked for; and never HTTP 202, the draft standing in the answer to the request that asked for it.
constrains:
- domain/integration/capability-schema-draft
---

## Description

The same reasoning a-drafted-connector-configuration-is-answered-as-a-read already gives the sibling connector configuration draft's own successful answer, read here over this draft's own: a-capability-schema-draft-registers-nothing states that generating a draft issues no register-capability call and creates no capability, which 201 would assert; nothing here stores a draft or publishes a read of one, so 204 and 202 name conditions this operation never has.
