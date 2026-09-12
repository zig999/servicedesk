---
type: policy
statement: >-
  A surface authoring or editing a connector configuration under a connector name states, over
  each configuration text it presents that is well-formed JSON object text declaring a responseMap
  object — the content of its Configuration field and the configuration of a draft it states
  alike — which keys of that responseMap name a top-level output schema property of a capability
  currently registered naming that connector, naming that capability, which keys name none, and
  each top-level output schema property of every such capability that no key of that responseMap
  names, and states, where no capability is currently registered naming that connector, that
  which fields an observation would carry cannot be read.
constrains:
  - domain/integration/connector-configuration
  - domain/integration/capability
consistency: eventual
---

## Description

an-observation-carries-only-the-output-schema-fields-its-response-map-reaches makes a responseMap key useful only under a capability's own field name, and nothing at registration refuses a key under any other name — so the one moment the operator can learn that a key reaches nothing, or that a field the capability expects has no key, is while the text is in front of them.
The reading is made over the draft's configuration as well as over the field, because the draft keys every field by the document's name and the operator decides what to rename before applying it as much as after.
The surface reads the capabilities itself, through the registry's own published reads, and the draft's answer carries no capability, exactly as a-connector-configuration-draft-response-carries-no-capability leaves it.
Which control carries each statement, its wording and where it stands beside the text are the interface's own.
