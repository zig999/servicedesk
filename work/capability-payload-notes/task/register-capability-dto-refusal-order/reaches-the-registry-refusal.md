---
title: A register-capability submission missing a required attribute reaches the registry's own completeness
  refusal
summary: Loosen register-capability.dto.ts's shape validation so an absent or empty required attribute
  passes the HTTP shape check and is refused by the capability registry's own 422 IncompleteCapabilityContractError
  instead.
sources:
- work/capability-payload-notes/intake/register-capability-dto-refusal-order.md
objective: A register-capability submission leaving a required attribute absent or empty is refused with
  HTTP 422 IncompleteCapabilityContractError, the registry's own stated refusal, never with a generic
  HTTP 400 shape-validation error for that condition.
criteria:
- A PUT /v1/capabilities/{name}/{version} submission whose body omits a required attribute (e.g. connector)
  is answered with HTTP 422 IncompleteCapabilityContractError naming that attribute, not HTTP 400 VALIDATION_ERROR.
- A PUT /v1/capabilities/{name}/{version} submission whose body states a required attribute as an empty
  string is answered with HTTP 422 IncompleteCapabilityContractError naming that attribute, not HTTP 400
  VALIDATION_ERROR.
- A PUT /v1/capabilities/{name}/{version} submission whose body states every required attribute, and whose
  payload_notes is left undeclared, is accepted and the held capability answers with no payload_notes
  value.
- The route's shape validation still refuses a submission whose required attribute holds the wrong type
  (e.g. timeout as a non-numeric string), independent of this change.
implements:
- rules/integration/a-capability-declares-its-contract
- domain/integration/capability
- constraints/a-malformed-request-is-refused-with-a-validation-error
---
## What it is

register-capability.dto.ts's shape schemas drop non-emptiness enforcement on the required
string attributes (name, version, nature, input_schema, output_schema, connector, concept), so
an absent or empty one now passes shape validation and reaches the registry's own completeness
check and its 422 refusal instead.

## Notes

UNDERDETERMINED, from the specification -- whether an absent timeout is carried into the loosened shape check (so the registry's own sixty-second default and required-attribute path decide it) or is kept refused at the shape layer as a special case; no criterion distinguishes timeout's absence from any other required attribute's.
UNDERDETERMINED, from the specification -- whether the loosened DTO also drops timeout's positive-integer bound; criterion 4 exercises only a non-numeric timeout, not a zero or negative one.
UNDERDETERMINED, from the specification -- whether a submission leaving two or more required attributes undeclared has the registry's refusal name only the first one it encounters or every one of them; criteria 1 and 2 each exercise exactly one missing attribute.
UNDERDETERMINED, from the specification -- criterion 4 requires only that the wrong-type timeout submission is still refused; it does not require the refusal's error code, message or details list to match constraints/a-malformed-request-is-refused-with-a-validation-error's own fitness description.
ADVISORY, from the specification -- constraints/a-malformed-request-is-refused-with-a-validation-error's own fitness names a demonstration ("a body missing a required field" answered 400 VALIDATION_ERROR) that can no longer be carried out on this route once this task lands; if any test currently demonstrates that fitness against register-capability specifically, it needs to move to a route whose declared shape still requires the field.
