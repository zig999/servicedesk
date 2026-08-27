Found by siegard-reconcile/frontend-connector-configuration-detail-drift.md's judgment over
connector-configuration-detail-ready-view.tsx, reconciling delivered code against the
specification rather than any task's own criteria:

INVALID_CONFIGURATION_WARNING reads "This connector configuration's stored value is not valid
JSON. Correct it before Save can succeed." — shown whenever state.configuration.isValid is
false.

rules/integration/a-connector-configuration-holds-a-well-formed-object distinguishes two
failure kinds for a present configuration value: text that is not syntactically valid JSON at
all, and text that is syntactically valid JSON but not an object (a null value or an array
included). A person who typed a JSON array or a bare `null` holds syntactically valid JSON by
the node's own account, so the banner's claim ("is not valid JSON") is false for that case, and
gives no path to the actual correction — the value must be an object, not merely parseable.

use-connector-configuration-detail.ts's isValidConfigurationObject already gates
state.configuration.isValid on the correct, narrower test (must parse as JSON *and* be a plain
object, excluding null and arrays) — the fact the warning must communicate is already computed
correctly. Only the wording is wrong: it describes the failure as if isValid could only be false
for unparsable text, when it is also false for valid-JSON-non-object values.

Scope: correct INVALID_CONFIGURATION_WARNING's own text so it states truthfully, for every case
isValid can be false, what the registry actually requires — a JSON object, not merely a value
that parses. No change to isValidConfigurationObject or to what isValid gates: that mechanism
already conforms, per the same reconciliation's separate reading of use-connector-configuration-detail.ts
(carrying its own, different finding — a duplicated derivation of the rule, not a wrong result —
left as a registered, unactioned item rather than routed here).
