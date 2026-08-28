---
title: Proof for reporting orphaned placeholders in the connector test response
summary: Wire-level tests over POST /v1/test-connector proving orphaned_placeholders names an undeclared
  Subject-attribute placeholder, is empty when every embedded one is declared, and is never itself a reason
  the test is refused — including when the underlying call fails.
implementation: sha256:2e68dad6cd2401e9274633e1d4535fbabc426b82dd2163e1f660b3751e2ad596
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-configuration-and-placeholder-contract-report-placeholder-declaration-in-connector-test-suite
tests:
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: names, in its own orphaned_placeholders, a Subject-attribute placeholder the tested connector
    configuration's call text embeds that the tested capability's own input schema does not declare
  proves: Testing a connector configuration through a capability whose input schema does not declare a
    Subject-attribute placeholder the configuration's call text embeds reports that placeholder in the
    response.
  fails_when: the route stops computing orphanedPlaceholders against the resolved capability's input_schema
    and the connector configuration's raw call text, or the response's orphaned_placeholders field omits,
    empties, or misnames the 'id' placeholder the connector configuration's address template embeds when
    the capability's input_schema declares only an unrelated property.
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: names none in its own orphaned_placeholders when the tested capability's own input schema declares
    every Subject-attribute placeholder the tested connector configuration's call text embeds
  proves: Testing a connector configuration through a capability whose input schema declares every Subject-attribute
    placeholder the configuration's call text embeds reports none.
  fails_when: orphaned_placeholders reports 'id' even though the capability's input_schema declares it
    among its properties, or the field is anything other than an empty array once every embedded placeholder
    is declared.
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: is not refused, and still issues the call and returns the outcome, for a test whose own response
    reports an orphaned placeholder
  proves: The test is not refused on account of an orphaned placeholder its own response reports.
  fails_when: the route answers anything other than 200, or the response drops its ordinary request/response
    fields or carries an error envelope, for a request whose own orphaned_placeholders names a gap — i.e.
    a reported orphaned placeholder is used anywhere to refuse or short-circuit the call.
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: still names the orphaned placeholder in its own response, without itself refusing the test, when
    the underlying HTTP call fails
  proves: 'The test is not refused on account of an orphaned placeholder its own response reports, in
    the edge case where the network dependency itself also fails: the orphaned-placeholder report is not
    conditioned on the call''s own outcome, so it is not, even combined with an unrelated failure, a source
    of refusal.'
  fails_when: the response's own status stops being 200, or orphaned_placeholders is dropped or altered,
    once the underlying httpClient call rejects instead of resolving.
not_applicable:
- edge_case: two test-connector requests naming the same connector/capability pair issued at once
  why: handleTestConnectorRequest and orphanedPlaceholders are pure, per-request computations over that
    request's own data plus two read-only resolves; nothing this task adds is shared or cached state a
    second concurrent call could race with, so a concurrency test would assert a guarantee no criterion
    of this task states.
- edge_case: a connector configuration's call text embedding more than one orphaned Subject-attribute
    placeholder at once
  why: orphanedPlaceholders's own multi-placeholder behavior is already proven in connector-placeholder-declaration-check.spec.ts
    for task/connector-configuration-and-placeholder-contract/build-placeholder-declaration-check; this
    task only wires that pure, already-proven function onto the response, so repeating the multi-placeholder
    combination here would prove the wiring twice rather than proving anything this task adds.
- edge_case: a numeric or size boundary on the reported list
  why: no criterion of this task states a range or a limit; orphaned_placeholders is a list of names with
    no stated bound, so there is no boundary to test.
---

## What it is
Wire-level tests over POST /v1/test-connector proving orphaned_placeholders names an undeclared Subject-attribute placeholder, is empty when every embedded one is declared, and is never itself a reason the test is refused.

## Notes
None.
