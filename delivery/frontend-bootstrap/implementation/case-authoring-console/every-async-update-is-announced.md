---
title: Every async UI update is announced to assistive technology (ACC-07)
summary: Adds an aria-live or role="alert" announcement to each of the four screens whose visible-only
  state change previously gave no signal to a screen-reader user, reusing this codebase's own established
  role="alert" convention where a paragraph already existed and aria-live="polite" where a region needed
  to be introduced.
task: sha256:c59699a7c2542ec25027fb72d5254db5f9045c4c1e8960f8a6cffa24faa1ce27
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/ux-consistency-sweep-full-suite
files:
- path: src/routes/cases-list-screen.tsx
  effect: A new <p aria-live="polite"> renders "{filteredEntries.length} case(s) found" beside the search
    input, recomputed on every searchText change.
- path: src/routes/case-version-editor-form-fields.tsx
  effect: The save-status <span> ("Last saved …") now carries aria-live="polite", announcing its own text
    once a save completes.
- path: src/routes/version-manifest-screen.tsx
  effect: RowActions' own moveErrorMessage paragraph now carries role="alert", matching FormField's own
    error-paragraph convention in case-version-editor-form-fields.tsx.
- path: src/routes/capabilities-browser-screen.tsx
  effect: CapabilityDetailPanel's conditional mount point is now wrapped in a <div aria-live="polite">,
    so the panel's own appearance after a row click is announced without adding focus-management machinery
    the component did not otherwise need.
criteria:
- criterion: Cases List's own filtered row count is exposed through an aria-live region (or an equivalent
    announcement) that updates as the search input's own value changes.
  met: true
  how: The <p aria-live="polite"> in cases-list-screen.tsx renders {filteredEntries.length} case(s) found,
    recomputed on every searchText change.
- criterion: The Version Editor's save-status indicator (the "saved at" text) is exposed through an aria-live
    region that announces its own text once a save completes.
  met: true
  how: The <span aria-live="polite"> in case-version-editor-form-fields.tsx renders Last saved ${savedAt}
    once savedAt is set.
- criterion: The Manifest Builder's own reorder-error message (moveErrorMessage) carries `role="alert"`,
    matching the role this codebase's own field-validation error messages already use.
  met: true
  how: version-manifest-screen.tsx's RowActions now renders <p role="alert" ...> for row.moveErrorMessage,
    matching FormField's own <p id={errorId} role="alert" ...> exactly.
- criterion: The Capabilities Browser's own detail panel, once it mounts after a row is clicked, either
    sits inside an aria-live region or receives focus, so its own appearance is announced.
  met: true
  how: capabilities-browser-screen.tsx now wraps CapabilityDetailPanel's conditional render in <div aria-live="polite">,
    so its mount (and its content) is announced.
inferences:
- inferred: The Capabilities Browser fix uses an aria-live wrapper rather than a focus move.
  from: The task file's own objective text states this exact preference ("the smaller, more idiomatic
    fix given the component is a plain function returning JSX with no existing ref/focus-management machinery")
    verbatim.
- inferred: The wrapping <div aria-live="polite"> sits around the conditional expression itself, always
    rendered, rather than only when a row is selected.
  from: 'Standard aria-live semantics: a live region must already exist in the accessibility tree for
    a later mutation inside it to be announced.'
preserved:
- RowActions' own up/down/Remove button cluster and its Dialog-confirmation flow for Remove are unchanged.
- version-manifest-screen.tsx's loading/load-error/blocked/StatusTable rendering paths are unchanged.
- capabilities-browser-screen.tsx's loading/error/empty-state rendering paths, its row-click selection
  logic (capabilityKey-based selectedKey), and CapabilityDetailPanel's own dl markup are unchanged.
- Cases List's and the Version Editor's own other rendering (StatusTable, form fields, Save button gating)
  is unchanged.
---

## What it is
The correction named by four standing ACC-07 findings: cases-list-and-detail-onda-2.md, version-editor-onda-3.md, manifest-hypothesis-authoring-onda-4.md, glossary-and-capabilities-browser-onda-6.md.
This codebase's own field-validation error paragraphs (e.g. case-version-editor-form-fields.tsx's own FormField) already use role="alert" for exactly this reason; the Manifest Builder's own fix reuses that same convention rather than inventing a second one.

## Notes
None.
