---
title: Capabilities Browser screen
summary: Replaces CapabilitiesPlaceholder at /capabilities with a real, read-only screen listing every
  registered capability via a new use-capabilities.ts hook, plus a client-side row-selection detail panel
  built over StatusTable's onRowClick.
task: sha256:3e1db612e274c6c6f187e0aa13dea60d7b2aa6bee0f363bf910b771d51c3b844
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/glossary-and-capabilities-browser-onda-6-full-suite
files:
- path: src/hooks/use-capabilities.ts
  effect: New hook mirroring use-glossary-vocabulary.ts's/use-concept-options.ts's own apiFetch/queryKey/`data`-only
    convention exactly; reads GET /v1/capabilities under queryKey ["capabilities"], exposes every one
    of domain/integration/capability's eight fields (none narrowed away, since the screen reads all of
    them), and returns {capabilities, isLoading, isError, refetch}.
- path: src/routes/capabilities-browser-screen.tsx
  effect: New screen -- renders one StatusTable row per capability (name, nature, connector, concept,
    timeout), an explicit loading state, an explicit generic-error state, an explicit empty state for
    zero capabilities, and (once a row is clicked) a TUI Panel below the table showing that same row's
    own version/input_schema/output_schema; selection is local state derived against the already-fetched
    list, so no second network call is ever issued.
- path: src/routes/route-tree.tsx
  effect: capabilitiesRoute's `component` now points at CapabilitiesBrowserScreen instead of CapabilitiesPlaceholder;
    the now-unused CapabilitiesPlaceholder import was dropped from this file's own destructured import
    of route-placeholders; no other route in this file was touched.
criteria:
- criterion: Visiting /capabilities renders one row per capability GET /v1/capabilities returns, each
    row showing that capability's own name, nature, connector, concept and timeout.
  met: true
  how: useCapabilities() reads GET /v1/capabilities; toRow() maps each returned capability to a StatusTable
    row carrying exactly those five fields, rendered through the five COLUMNS declared in capabilities-browser-screen.tsx.
- criterion: Before any row is selected, the screen renders no capability's detail panel.
  met: true
  how: selectedKey starts as useState<string | null>(null); selectedCapability (derived by matching selectedKey
    against the fetched list) is undefined until a row is clicked, and the CapabilityDetailPanel render
    is gated on selectedCapability !== undefined.
- criterion: Clicking a capability's row renders a detail panel showing that same row's own version, input_schema
    and output_schema exactly as GET /v1/capabilities already returned them.
  met: true
  how: StatusTable's onRowClick calls handleRowClick, which reads the clicked row's own id (capabilityKey(capability))
    into selectedKey; CapabilityDetailPanel then renders that capability's own version/input_schema/output_schema
    fields verbatim, unmodified from what the hook returned.
- criterion: Clicking a different row swaps the detail panel to that row's own version, input_schema and
    output_schema.
  met: true
  how: selectedCapability is derived fresh on every render from the current selectedKey against the current
    capabilities list (never mirrored into a separate state variable), so setting selectedKey to a different
    row's key immediately swaps which capability's fields the panel shows.
- criterion: Selecting a row issues no network request beyond the one GET /v1/capabilities call the table's
    own listing already made.
  met: true
  how: handleRowClick only calls setSelectedKey(); no apiFetch call, mutation or query exists anywhere
    in the row-selection path, and useCapabilities() itself issues exactly one query (queryKey ["capabilities"]).
- criterion: No control on the screen creates, edits or deletes a capability, or changes a capability's
    nature.
  met: true
  how: The screen renders only text, a read-only StatusTable and a read-only Panel -- no form, button,
    input or mutation of any kind appears anywhere in capabilities-browser-screen.tsx.
nodes:
- node: domain/integration/capability
  encoded_at:
  - src/hooks/use-capabilities.ts
  - src/routes/capabilities-browser-screen.tsx
  how: The Capability type in use-capabilities.ts declares all eight of this node's own attributes (name,
    version, nature, input_schema, output_schema, timeout, connector, concept) untouched from the wire
    shape; the screen renders five of them in the listing table and the other three (version, input_schema,
    output_schema) in the row-selection detail panel -- every declared attribute reaches the screen somewhere.
- node: domain/integration/capability-nature
  encoded_at:
  - src/hooks/use-capabilities.ts
  how: CapabilityNature is typed as exactly this node's own two values ("read-only" | "mutating"); the
    screen renders whichever value a capability carries as plain text in its own Nature column, inventing
    no third state and no color mapping this node does not name.
- node: contracts/integration/capability-registry
  encoded_at:
  - src/hooks/use-capabilities.ts
  how: This delivery reaches only the list-capabilities half of this contract (GET /v1/capabilities, called
    once by use-capabilities.ts); the read-capability-by-concept half is never called anywhere in this
    delivery -- this task's own criterion 5 forbids it, since every field the detail panel needs is already
    present on the row list-capabilities returned.
inferences:
- inferred: A capability's timeout renders with an explicit " ms" unit suffix (formatTimeout) rather than
    as a bare number.
  from: domain/integration/capability's own description states the timeout is declared "in milliseconds";
    no criterion of this task mandates a display format, so showing the unit rather than a bare number
    is this screen's own formatting choice.
- inferred: A row's own selection/identity key is the composite name::version, not name alone.
  from: domain/integration/capability's own description states it is "identified by name and version"
    together; the specification never states that name alone is unique across every currently registered
    capability, so keying selection and StatusTable's own row id on the composite avoids a collision the
    specification does not rule out.
- inferred: Nature renders as plain text, never as a StatusTable {color,label} status cell.
  from: no node names a color for either "read-only" or "mutating" -- introducing one here would be inventing
    a visual fact the specification does not state.
- inferred: A load failure renders a plain generic-error message ("Capabilities could not be loaded.")
    rather than routing through error-ui-state.ts's uiStateForApiError().
  from: GET /v1/capabilities throws no domain error that table names, so every code it could ever throw
    already collapses onto the shared generic-error kind; cases-list-screen.tsx and case-detail-screen.tsx's
    own VersionsPanel keep exactly this same plain-text convention for their own listing reads.
preserved:
- route-tree.tsx's other nine routes and their own components are unmodified -- only capabilitiesRoute's
  component and the file's own import list changed.
- CapabilitiesPlaceholder itself stays exported, unused, in route-placeholders.tsx, per that file's own
  established precedent for this exact kind of change -- this delivery removed only route-tree.tsx's now-dangling
  reference to it, never the export itself.
- Every existing StatusTable onRowClick consumer (cases-list-screen.tsx's navigate-to-case-detail, case-detail-screen.tsx's
  Link-based version actions) is untouched; StatusTable's own props and behavior were read, never modified.
- use-glossary-vocabulary.ts and use-concept-options.ts are untouched -- use-capabilities.ts is a new
  sibling file, not an edit to either.
deferred:
- what: GET /v1/capabilities is genuinely paginated (a shared PaginatedResponse<Capability> envelope),
    but useCapabilities() reads only the first page's data, ignoring total/limit/offset/pageCount, the
    same way both existing glossary hooks already do.
  why: matches the established convention this app's own inventory names for both existing glossary hooks;
    no criterion of this task asks for a pagination control, and widening this one new hook past that
    shared convention while the two it mirrors stay unpaginated would introduce a second, inconsistent
    behavior rather than fixing the shared one.
---

## What it is
The section 2.9 screen the scope describes, over a new sibling hook (use-capabilities.ts) mirroring the two existing glossary hooks' own conventions, and StatusTable's existing onRowClick prop composed as this codebase's first click-row/detail-panel-below pattern.
Independent of the Glossary Browser and the union-widening task: distinct hook, distinct route, distinct data.

## Notes
None.
