## Scope

Registering a connector configuration against a connector that already has more than one
capability currently registered under its name is accepted even when the configuration's own
text names a placeholder for a Subject attribute that is absent from one of those capabilities'
input schemas, so long as it is present in at least one of the others. The orphaned-placeholder
refusal only fires when the placeholder is absent from every currently-registered capability
sharing that connector's name at once, not when it is absent from any one of them.

## Reproduction

Register two capabilities against the same connector name, where only one of their input
schemas declares the Subject-attribute placeholder a connector configuration's text names.
Register a connector configuration for that connector naming that placeholder. The registration
succeeds; it should be refused, naming the capability whose input schema does not declare it.

## File

src/connector-registry/connector-configuration-registry.service.ts
