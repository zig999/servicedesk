---
title: Disclose the answered draft in all of its parts
summary: The section's reading of what came back -- the drafted configuration text, every unresolved item by name and reason, every generated credential by name and security scheme, the method mismatch where one stands, and the failure where one was answered instead.
rationale: I cut the disclosure as one task rather than one per part because the draft's own node states one responsibility -- hold what was resolved and disclose by name and reason everything it could not -- and all four parts change for the one reason, the draft value object's shape.
sources:
  - intake/frontend-scope.md
depends_on:
  - task/connector-configuration-openapi-draft-frontend/configuration-helper-section
objective: A draft the operation answered is disclosed in the section in each of its parts -- configuration text, unresolved items, generated credentials and method mismatch -- without the Configuration field's own content changing, and a refused request is disclosed as its own distinguishable failure with no part of a draft beside it.
criteria:
  - An answered draft's configuration text is disclosed in the section while the Configuration field's own content stands exactly as it stood.
  - Each item of an answered draft's unresolved list is disclosed with its name exactly as the draft gave it and with its reason.
  - An answered draft whose unresolved list is empty discloses no unresolved item.
  - Each generated credential of an answered draft is disclosed with its generated name and with the security scheme's own name.
  - No credential value appears in the disclosure of a generated credential.
  - An answered draft carrying a method mismatch discloses the registered method and the drafted operation's method side by side, with neither shown in place of the other.
  - An answered draft carrying no method mismatch discloses no disagreement of methods.
  - No name, reason, generated name, security-scheme name or method is disclosed for an answered draft that the draft's own response did not carry.
  - A request refused because its named link could not be fetched discloses that the link could not be fetched, distinguishable from the other two refusals, with no part of a draft disclosed beside it.
  - A request refused because the fetched document could not be read discloses that the document could not be read, distinguishable from the other two refusals, with no part of a draft disclosed beside it.
  - A request refused because the document declares no operation at the named path and method discloses that pairing, distinguishable from the other two refusals, with no part of a draft disclosed beside it.
  - A request refused with none of those three conditions discloses that the request failed for an unrecognised reason, never as one of the three and never as a draft.
  - No refusal disclosure changes the Configuration field's own content.
implements:
  - rules/integration/an-answered-draft-request-states-its-draft-to-the-operator
  - rules/integration/a-refused-draft-request-states-its-refusal-to-the-operator
  - domain/integration/connector-configuration-draft
  - domain/integration/connector-configuration-draft-unresolved-item
  - domain/integration/connector-configuration-draft-unresolved-reason
  - domain/integration/connector-configuration-draft-generated-credential
  - domain/integration/connector-configuration-draft-method-mismatch
---

## What it is

Everything the operator reads before deciding whether to apply.
It states what the draft resolved and, by name and reason, what it could not, and states a refusal on its own terms when one arrives instead.

## Notes

domain/integration/connector-configuration-draft-unresolved-reason is a closed set of four values, and the disclosure states the reason the draft gave rather than one derived from it.
UNDERDETERMINED, from the specification — the fetch-refusal criterion asks only that the disclosure say the link could not be fetched, not that it also carry which of network-failure/timeout/status-outside-2xx occurred or the status where applicable, though the rule states both. Implementation: disclose the kind and, where applicable, the status too.
UNDERDETERMINED, from the specification — no criterion holds each unresolved item's reason distinguishable from the other three the way the three refusal criteria are each held distinguishable from one another. Implementation: render each of the four reason values as its own distinct text, never collapsing two into one label.
UNDERDETERMINED, from the specification — no criterion here speaks to a request the operation has not yet answered; rules/integration/a-refused-draft-request-states-its-refusal-to-the-operator forbids stating a refusal before an answer arrives. Implementation: clear any prior refusal or draft disclosure the moment a new request is dispatched, and do not render a refusal until the operation actually answers with one.
REMAINDER, from the specification — the Configuration-field-changes-only-on-apply half of an-answered-draft-request-states-its-draft-to-the-operator's own statement is the apply task's, not this one's; this task only holds the field unchanged on arrival and on refusal.
ADVISORY, from the specification — rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper, contracts/integration/connector-configuration-draft and constraints/the-openapi-document-is-fetched-by-the-backend govern the seam this task discloses into, not the disclosure itself, and are left to their own tasks; domain/integration/connector-configuration is likewise not read here.
