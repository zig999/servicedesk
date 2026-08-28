---
type: domain-service
operations:
  - register-connector
---

## Description

Registers a connector configuration by name, replacing whatever configuration already answered to it — the same replace-whole-on-edit a connector configuration itself declares, and the counterpart to the capability registry's own register-capability, kept as its own service because a connector configuration answers to no concept and resolves to no capability: it is named, not resolved.

## Responsibility

Refuse any registration whose configuration is not a well-formed JSON object, or whose own text embeds a placeholder naming a Subject attribute a capability already registered against that connector's name does not declare in its input schema; hold the current configuration for each connector name as currently registered.
