---
title: Compare the drafted method against what is currently registered
summary: A method_mismatch naming both methods, each upper-cased, where a configuration registered under the same connector name declares a method differing (case-folded) from the chosen operation's, and no mismatch in the three cases the rule names.
rationale: The scope names the method comparison as its own concern; it is its own task because it is the only part of the draft that reads the connector-configuration registry, and it changes when that read changes rather than when the document reading does.
sources:
  - intake/scope.md
depends_on:
  - task/connector-configuration-openapi-draft-backend/draft-domain-shape
objective: The draft states a method_mismatch exactly where a connector configuration registered under the draft's connector name declares a method that, upper-cased, differs from the chosen operation's own method upper-cased, and states none otherwise, and that mismatch names both methods upper-cased.
criteria:
  - Where a configuration registered under the connector name declares method GET and the operation declares POST, the draft's method_mismatch names registered GET and operation POST.
  - Where a configuration registered under the connector name declares method GET and the operation's own method is the lower-case path-item key get, the draft states no method_mismatch, since the two are the same method once each is upper-cased.
  - Where the registered configuration's declared method, upper-cased, equals the operation's method upper-cased, the draft states no method_mismatch.
  - Where no connector configuration is registered under the connector name, the draft states no method_mismatch whatever the operation's method is.
  - Where the configuration registered under the connector name declares no method in its own text, the draft states no method_mismatch whatever the operation's method is.
  - A method_mismatch reports both its registered and operation values upper-cased, even where the registered configuration's own text or the operation's own document spelling was lower-case.
  - The comparison reads the method from the registered configuration's own text rather than from any capability attribute.
  - The comparison reads the configuration registered under that name live at generation time rather than from a copy held elsewhere.
  - The configuration registered under the connector name stands unchanged after the comparison.
implements:
  - rules/integration/a-connector-configuration-drafts-method-is-compared-against-what-is-currently-registered
  - domain/integration/connector-configuration-draft-method-mismatch
  - scenarios/integration/a-drafts-method-mismatches-what-is-registered
---

## What it is

The one read of the connector registry the draft performs, and the disclosure of a disagreement it never resolves.
Both methods are named side by side so the operator decides what to submit.

## Notes

The inventory records that the store exposes only read-all and write-all, so the per-name read goes through ConnectorConfigurationRegistryService.readConnectorConfiguration rather than a new store query.
UNDERDETERMINED, from the specification — the original criterion set demonstrated the case-folded comparison but never the upper-casing of the two *reported* values (both worked examples used already-upper-case sources); criterion 6 was added to close this. Implementation: fold case for the equality test and report both values upper-cased regardless of the source's own case.
ADVISORY, from the specification — the method vocabulary and key this task reads (GET/POST/PUT/PATCH/DELETE, declared inside a connector configuration's own text) is fixed by rules/integration/an-http-connector-configuration-declares-its-call, which is not among this task's candidates and is reached here only as restated inside this rule's own Description; nothing is contradicted, this is a seam by cut rather than a silence.
Decision, beyond the covers — stand: rules/integration/an-http-connector-configuration-declares-its-call is named only descriptively, restating that pre-existing rule's own already-fixed vocabulary; no criterion here claims to implement it.
