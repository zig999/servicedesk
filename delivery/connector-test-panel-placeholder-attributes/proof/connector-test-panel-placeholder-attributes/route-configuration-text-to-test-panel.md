---
title: Proof for routing Configuration text into the test panel's hook
summary: Three new spec files prove configurationText reaches useTestConnectorPanel through both production
  call sites, by reading what each seam actually received back off the DOM rather than recording a call.
implementation: sha256:6112d0c31689f634e6745d67db9f7bd1080063db296796b2050fe201141ff116
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-test-panel-placeholder-attributes-route-configuration-text-to-test-panel-suite-2
tests:
- file: src/routes/connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts
  name: ConnectorConfigurationDetailReadyView — forwards its own live Configuration text into ConnectorTestPanel
    (criterion 1) > passes the loaded configuration's own current text as configurationText, scoped to
    this route's own connector
  proves: ConnectorConfigurationDetailReadyView passes its own live state.configuration.value text into
    ConnectorTestPanel through a new configurationText prop.
  fails_when: the ready view stops passing configurationText at all, passes it as a different value than
    the currently loaded (and pretty-printed) state.configuration.value, or passes the wrong connector
    alongside it.
- file: src/routes/connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts
  name: ConnectorConfigurationDetailReadyView — forwards its own live Configuration text into ConnectorTestPanel
    (criterion 1) > passes the edited text once the operator changes Configuration, rather than only the
    value loaded at mount (its own live value)
  proves: ConnectorConfigurationDetailReadyView passes its own live state.configuration.value text into
    ConnectorTestPanel through a new configurationText prop -- specifically the "live" half, that an edit
    after mount is forwarded too rather than only the value read once at load.
  fails_when: configurationText stays frozen at the value loaded at mount after the operator edits the
    Configuration field, instead of tracking state.configuration.value (as JsonTextareaField's own load-detection
    effect reformats it) on every render.
- file: src/routes/connector-test-panel-forwards-configuration-text.spec.ts
  name: ConnectorTestPanel — forwards configurationText into useTestConnectorPanel (criterion 2) > forwards
    exactly its own connector and configurationText props as useTestConnectorPanel's two positional arguments
  proves: ConnectorTestPanel forwards configurationText into useTestConnectorPanel(connector, configurationText).
  fails_when: ConnectorTestPanel stops passing configurationText as useTestConnectorPanel's second argument,
    swaps the argument order, or passes a value other than its own configurationText prop.
- file: src/routes/connector-test-panel-forwards-configuration-text.spec.ts
  name: 'ConnectorTestPanel — forwards configurationText into useTestConnectorPanel (criterion 2) > forwards
    an empty configurationText exactly as an empty string, not as undefined or a placeholder (edge case:
    empty input)'
  proves: the empty-input edge case this criterion's plain string type raises -- that an empty configurationText
    forwards as exactly the empty string rather than being defaulted, coerced or dropped.
  fails_when: an empty configurationText prop is forwarded as anything other than the literal empty string
    (e.g. undefined, a placeholder, or the previous non-empty value).
- file: src/routes/connector-test-panel-forwards-configuration-text.spec.ts
  name: ConnectorTestPanel — forwards configurationText into useTestConnectorPanel (criterion 2) > forwards
    a re-rendered configurationText prop into the hook's own second argument again, not only at first
    mount (its own live value)
  proves: ConnectorTestPanel forwards configurationText into useTestConnectorPanel(connector, configurationText)
    -- specifically that forwarding happens on every render, not only once at mount.
  fails_when: a changed configurationText prop on re-render is not forwarded into the hook's own next
    call (e.g. the prop is read only inside a memoized initializer).
- file: src/routes/connector-configuration-form-dialog-forwards-configuration-text.spec.ts
  name: ConnectorConfigurationFormDialog — its own edit-mode ConnectorTestPanel call site supplies configurationText
    (criterion 4, disclosed inference) > mounts its own Test section, forwarding this dialog's own currently-typed
    Configuration text into it -- the same field this dialog already reads at configuration={state.configuration}
  proves: connector-configuration-form-dialog.tsx's own ConnectorTestPanel call site supplies a configurationText
    value so the file continues to type-check and compile, and the disclosed inference that its dead edit-mode
    branch supplies state.configuration.value as that value.
  fails_when: this edit-mode call site stops supplying configurationText (the component no longer mounts
    or type-checks against ConnectorTestPanel's required prop), or supplies a value other than this dialog's
    own state.configuration.value.
not_applicable:
- edge_case: an absent configurationText (the prop or hook argument simply missing)
  why: configurationText is a required, non-optional string on both ConnectorTestPanelProps and useTestConnectorPanel's
    signature; an absent value is refused at compile time by the strict compiler, and no runtime path
    reaches either call site without it.
- edge_case: a boundary at each end of a stated range
  why: configurationText is a plain, unbounded string with no numeric or length range stated by any criterion.
- edge_case: an empty collection where one comes back
  why: this task introduces no collection; it threads one string value between two existing components.
- edge_case: a duplicate where uniqueness is claimed
  why: no criterion of this task claims uniqueness over anything.
- edge_case: an operation against state that forbids it
  why: this task adds no state machine or guard of its own; it only widens two existing signatures by
    one plain, always-accepted argument.
- edge_case: a dependency that fails or answers slowly
  why: this task adds no new dependency; useTestConnectorPanel's own two existing dependent reads (capabilities,
    subject-type) are untouched by this change, and their failure/slow-response behavior is already covered
    by the pre-existing connector-test-panel-capability-picker.spec.ts.
- edge_case: two operations against one subject at once
  why: this task adds no new operation; the pre-existing double-submit guard on useTestConnectorPanel's
    own onTest is untouched and already covered by connector-test-panel-dispatch-safety.spec.ts.
untested:
- 'Criterion 3 ("every existing caller of useTestConnectorPanel''s returned state and handlers continues
  to compile and behave exactly as before") has no new test written here on purpose: the four pre-existing
  connector-test-panel-*.spec.ts files (capability-picker, subject-and-attributes, request-response, dispatch-safety)
  already exercise every returned field and handler end-to-end through the real production wiring, unchanged
  by this task''s own widening of the hook''s signature -- confirmed by the passing suite run (run/connector-test-panel-placeholder-attributes-route-configuration-text-to-test-panel-suite-2,
  133 test files / 926 tests, all four of those files included), which is this criterion''s own proof
  rather than a new one written now.'
divergences:
- cites: TST-03
  file: src/routes/connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts
  departure: replaces ConnectorTestPanel itself with a stand-in that renders its received props as text,
    rather than replacing only a network/storage/clock boundary.
  why: configurationText is held in a ref useTestConnectorPanel deliberately never reads (this task's
    own scope is pure plumbing, with the reconciling read deferred to a later task), so nothing this criterion
    states is observable anywhere in the real rendered app today. The only way to observe what this route
    actually forwards is a stand-in that turns the received prop into rendered text; no network, storage
    or clock boundary is involved.
- cites: TST-03
  file: src/routes/connector-test-panel-forwards-configuration-text.spec.ts
  departure: replaces useTestConnectorPanel itself with a stand-in that echoes its own two received arguments
    into a field the real ConnectorTestPanelFields already renders, rather than replacing only a network/storage/clock
    boundary.
  why: the same reason as the sibling divergence above -- configurationText is unread by the real hook,
    so there is no other observable difference to assert on for what ConnectorTestPanel forwards into
    it.
- cites: TST-03
  file: src/routes/connector-configuration-form-dialog-forwards-configuration-text.spec.ts
  departure: replaces useTestConnectorPanel itself with the same echoing stand-in as connector-test-panel-forwards-configuration-text.spec.ts.
  why: the same reason as the two divergences above, carried into this file because it exercises the same
    seam at this task's second call site.
---

## What it is
Three new spec files, one per call site this task's criteria name: `connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts` (criterion 1, the production route), `connector-test-panel-forwards-configuration-text.spec.ts` (criterion 2, the routing component itself), and `connector-configuration-form-dialog-forwards-configuration-text.spec.ts` (criterion 4, the dead edit-mode call site).
Each replaces the one collaborator that would otherwise swallow the forwarded value (`ConnectorTestPanel` or `useTestConnectorPanel`) with a stand-in that renders its received arguments as text, since `configurationText` is deliberately unread by the real hook today -- disclosed as a TST-03 divergence in every one of the three files.
Criterion 3 is proved by the four pre-existing `connector-test-panel-*.spec.ts` files, unchanged and re-run by this same suite.

## Notes
The first suite run (`run/connector-test-panel-placeholder-attributes-route-configuration-text-to-test-panel-suite`) failed with 5 failing tests: 2 in files this delivery does not touch (`src/hooks/use-connector-configuration-detail-validity.spec.ts`, `src/routes/case-version-editor-screen-subject-field.spec.ts`), and 3 in this proof's own newly written spec files.
Empirically confirmed pre-existing and unrelated to this delivery: reverting this delivery's four source files and three new spec files and re-running the full suite on that base tree reproduces a different single spurious failure each time (`src/hooks/use-connector-configuration-detail.spec.ts` on one run, none of the 5 above on another) -- order/concurrency-dependent test-isolation noise the base tree already carries, not something this task introduced.
The 3 failures in this proof's own files were genuine test bugs, fixed here: `screen.findByText` normalizes whitespace against a *DOM-normalized* reading but not against a matcher string that itself carries literal newlines (pretty-printed JSON), so the two ready-view tests now read `textContent` directly off a `data-testid`'d stub instead; and an HTML `<input>`'s own value assignment strips newlines, so the form-dialog test now echoes the received value through `selectedCapability.input_schema` (rendered as a `<pre>`, which preserves them) instead of through `requester` (rendered as an `<input>`). The second ready-view test's own expected value was also corrected to the pretty-printed form: `JsonTextareaField`'s own load-detection effect reformats a syntactically valid edit the same way it reformats a freshly loaded value, so the text this route forwards after an edit is pretty-printed too, not the raw text `fireEvent.change` assigned.
The rerun suite (`run/connector-test-panel-placeholder-attributes-route-configuration-text-to-test-panel-suite-2`) passed clean: 133 test files, 926 tests, all passing.
