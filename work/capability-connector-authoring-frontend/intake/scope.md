Build the frontend authoring surface for Capability, Connector Configuration and Concept — create
and edit for each — plus a debug-style UI for the diagnostic test-connector operation. Today
`/capabilities` is entirely read-only (a list and a read-only detail panel), and no
Concept/Connector screen exists at all.

Covers the specification nodes:
  domain/integration/capability, domain/integration/connector-configuration,
  domain/integration/connector-configuration-registry, domain/integration/capability-registry,
  domain/glossary/concept,
  rules/integration/a-capability-declares-its-contract,
  rules/integration/a-capability-is-read-only,
  rules/integration/one-capability-answers-one-concept,
  rules/integration/a-capability-declares-well-formed-schemas,
  rules/integration/a-connector-configuration-holds-a-well-formed-object,
  rules/integration/a-connector-configuration-is-tested-through-a-registered-capability,
  contracts/integration/capability-registry,
  contracts/integration/connector-configuration-registry,
  contracts/integration/connector-diagnostics,
  contracts/glossary/glossary-authoring

Frontend work:
- Augment the existing capabilities list/browser screen with a "New capability" action and, per
  row, an "Edit" action, replacing the current read-only-only detail panel with an editor for the
  fields that already exist (name, version, nature, timeout, connector, concept) plus its two
  schema fields.
- Capability editor: input_schema and output_schema are edited in a textarea styled and behaving
  like a source-code editor — indented/pretty-printed for reading and editing (a "Beautify"
  control reformats the current text; malformed JSON shows an inline error and blocks Save).
  Persistence sends the JSON minified (whitespace, tabs, and other insignificant characters
  stripped) — the beautified form is a reading/editing convenience only, never what gets stored.
  Registering with a `nature` other than `read-only` is refused server-side
  (rules/integration/a-capability-is-read-only); the UI should let the user see and correct that
  refusal, not merely block the read-only radio client-side.
- Concept editor: create and edit (name, accepts — a multi-select of subject types, ttl in
  seconds), most naturally added to the existing Glossary screen's "Concepts" tab, which is
  currently read-only.
- Connector Configuration editor: create and edit, by name; its `configuration` field is the same
  kind of JSON textarea-with-beautify as a capability's schemas, minified on persistence.
- Connector Configuration editor's "Test" section — a debug-style panel:
  - pick a specific, already-registered capability that names this connector configuration (only
    such capabilities are ever registered, so this is also what keeps the test scoped to
    something read-only, per rules/integration/a-connector-configuration-is-tested-through-a-registered-capability);
  - assemble a subject the same way a real diagnosis does — pick the subject type, then type in
    its attribute-values directly (there is no store of existing subjects to select from: a
    subject is always assembled fresh, never read back, per domain/investigation/subject.md);
  - edit a sample input against the chosen capability's own input_schema, in the same kind of
    JSON textarea;
  - a "Test" button that issues the call and shows, in full technical detail and nothing
    summarized away: the request actually sent (method, resolved address, headers, body) and the
    response actually received (status, headers, body, elapsed time) — or the raw error/timeout if
    the call failed. This is a debug screen; nothing it shows is evidence and nothing it produces
    is ever read by an investigation.
- No authentication or authorization gating any of this — matches
  constraints/no-route-enforces-authentication.
- Deletion of a capability, a connector configuration, or a concept is out of scope.

This is the frontend half of a two-target increment; the backend half (new HTTP routes for all of
the above) is planned separately, as initiative capability-connector-authoring-backend, against
the backend target. The frontend tasks here consume those routes; where the backend routes do not
yet exist, that is an expected cross-initiative dependency for whoever sequences delivery, not a
gap this plan closes on its own.
