---
title: Concept field's visual emphasis in the capability form's shared field markup
summary: Wraps the concept Select's existing FormField in TUI's Panel primitive (accent="alt",
  role="group"), titled "Emphasized field" rather than "Concept", so its container
  carries a border/background/notched-title weight none of the form's other seven
  fields carry, without giving the DOM a second accessible-name source that collides
  with FormField's own "Concept" label and without exposing an implicit landmark "region"
  role that capability-form-dialog.tsx's own create-mode composition never had before.
task: sha256:97e46a2897fba391baff616f1bd7f7e0ce897a6bbb39c1e69a1601b1de969765
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/capability-detail-concept-emphasis-concept-field-visual-emphasis-build-4
files:
- path: src/routes/capability-form-fields.tsx
  effect: 'Imports Panel from @tui/ui/panel and wraps the existing concept FormField
    (unchanged Controller/Select markup) in <Panel title="Emphasized field" accent="alt"
    titleLevel={2} role="group">, so the concept field''s container renders inside
    a bordered, background-filled, notched-title frame built entirely from that TUI
    primitive''s own accent-alt border/surface tokens, while every other field''s
    markup, the component''s props and its exported type stay untouched. Panel''s
    title is "Emphasized field" rather than the field''s own name "Concept" (fixing
    a getByLabelText("Concept") collision an earlier attempt introduced), and the
    call carries an explicit role="group" (fixing a second, independent regression:
    Panel''s <section> carrying an accessible name maps, per the HTML-AAM/ARIA mapping,
    to the implicit landmark role "region", which leaked into capability-form-dialog.tsx''s
    own unmodified create-mode composition of this same markup). Both fixes and their
    reasoning are documented in the file''s own header comment.'
criteria:
- criterion: Concept's field container carries at least one visual property (border,
    background, or typography weight/size) that none of the form's other seven field
    containers carry, so it reads as visually set apart rather than equal weight.
  met: true
  how: The concept FormField is the sole field wrapped in a Panel, whose CVA base
    class (relative border bg-surface p-4) plus its accent="alt" variant (border-accent-alt)
    gives concept's container a border, a background and a notched heading that none
    of name/version/nature/input_schema/output_schema/timeout/connector's own containers
    carry. Neither the title text nor the role attribute touches the border/background
    classes this criterion is about.
- criterion: Concept no longer shares that undistinguished visual weight with timeout
    and connector, the two fields it previously sat beside in one grid-cols-3 row
    with no distinguishing style.
  met: true
  how: Timeout and connector's own FormField containers remain unchanged (still plain,
    unbordered divs); only concept's is framed by Panel, so the three cells of that
    grid-cols-3 row still do not share equal visual weight.
- criterion: Every value used to build that visual distinction resolves to a semantic
    token already declared in frontend/tui/frontend/src/theme.css or frontend/app/src/design-system/tokens.css;
    no literal px, hex, or other raw value is introduced.
  met: true
  how: The only non-token values this delivery adds are enum/string literals -- Panel's
    accent prop ("alt"), its title prop ("Emphasized field", plain UI copy, not a
    visual value under MNT-02), titleLevel (2, a heading-depth selector) and role
    ("group", an ARIA semantics selector, not a visual value). Panel's own internals
    resolve accent="alt" to border-accent-alt and bg-surface, both declared in frontend/tui/frontend/src/theme.css
    (--color-accent-alt line 55, --color-surface line 44) -- no px, hex or other raw
    value is written by this change.
- criterion: The emphasis is built only from components already exported under frontend/tui/frontend/src/shared/components/ui
    plus this app's own typography utilities; no new component library is added and
    no existing TUI component's own source is copied or forked.
  met: true
  how: Panel is imported unchanged via the existing @tui/ui/panel alias; its own source
    under frontend/tui/frontend/src/shared/components/ui/panel/ is not touched, copied
    or forked across any of the three attempts -- Panel's own prop type already passes
    role through its native ...props spread onto the <section>, so an explicit role
    attribute at the call site overrides the implicit ARIA mapping with no edit to
    Panel's own component file. No package outside the authorized list was added.
- criterion: 'The concept Select''s own identity is unchanged: it still resolves its
    options from conceptOptions, stays driven by the same Controller field.value/field.onChange
    wiring, keeps its aria-invalid/aria-describedby wiring, and stays disabled exactly
    while isSubmitting is true.'
  met: true
  how: The Controller/Select block inside the concept FormField is untouched (conceptSelectOptions
    from conceptOptions, field.value/field.onChange/field.onBlur, disabled={isSubmitting},
    aria-invalid/aria-describedby tied to errors.concept) -- every edit across all
    three attempts is on an ancestor Panel's own props (title, then role), two levels
    above the Select, never on the Select or its Controller wiring.
- criterion: Neither capability-form-dialog.tsx nor capability-detail-ready-view.tsx
    requires a prop or call-site change for the new layout to render, since both compose
    CapabilityFormFields unmodified today.
  met: true
  how: CapabilityFormFieldsProps and every prop it declares are unchanged; the Panel
    wrap, its title string and its role attribute all live entirely inside CapabilityFormFields'
    own render body, so both callers' existing, unmodified <CapabilityFormFields .../>
    call sites keep rendering the new layout with no edit of their own files -- including
    the region-landmark fix, which was surfaced by, but did not require editing, capability-form-dialog.tsx's
    own create-mode composition.
- criterion: None of the form's other seven fields (name, version, nature, input_schema,
    output_schema, timeout, connector) changes position, meaning, or validation behavior
    as a result of this change.
  met: true
  how: Every other field's FormField/Controller/Input/JsonTextareaField markup, its
    grid cell, its register()/Controller wiring and its validation-error rendering
    are untouched; the only change across all three attempts is to concept's own Panel
    wrapper (its title string, then its role attribute), inside the same grid-cols-3
    cell it already occupied.
inferences:
- inferred: Panel (accent="alt") is the correct existing-TUI-primitive vehicle for
    this emphasis, rather than a hand-rolled bordered div built from raw Tailwind
    border/background utility classes.
  from: The inventory explicitly flags Panel as "an existing, non-forking way to give
    one field a visually distinct container ... rather than hand-rolling a bordered
    box", and the task's own rationale states the mechanism must be "which existing
    TUI primitive, which token" -- both point at composing a cataloged component rather
    than assembling utility classes directly on a div.
- inferred: Panel's title prop is "Emphasized field" rather than the field's own name
    ("Concept", the first attempt's choice), an empty string, or a change to Panel
    itself.
  from: Panel's section unconditionally carries aria-labelledby pointing at its own
    title heading (panel.tsx), so any title text equal to "Concept" recreates the
    duplicate-accessible-name regression regardless of nesting -- confirmed by the
    failure-diagnostician's reading of the first attempt's suite run (22 failures,
    all getByLabelText("Concept") throwing "Found multiple elements"). Modifying Panel
    itself was rejected as out of scope (a shared primitive every other consumer also
    uses); an empty title string was rejected because Panel was not designed for a
    titleless mode (title is required, with no conditional skip of the heading element
    when empty) -- "Emphasized field" is a real, non-colliding caption instead.
- inferred: accent="alt" (the magenta/roxo variant) rather than success/info/warning/danger,
    whose semantics (positive/neutral-data/cautionary/error) do not describe concept
    and would misleadingly imply a status the field does not have.
  from: theme.css's own header comment on --color-accent-alt ("alternate accent ...
    used by the Media Types KPI tile") and panel.component.spec.md's Do/Don't table
    ("alt exists specifically because the magenta/roxo intent is orthogonal to the
    other five") -- both describe accent="alt" as the variant for a visual highlight
    carrying no status meaning.
- inferred: titleLevel={2} (overriding Panel's own default of 3), so the panel's heading
    is an <h2> rather than an <h3>.
  from: CapabilityFormFields is composed at two different heading depths -- capability-detail-ready-view.tsx's
    caller sits directly under capability-detail-screen.tsx's own single <h1>, where
    a default <h3> would skip a level; capability-form-dialog.tsx's caller sits under
    its own DialogTitle, which Radix's Dialog.Title renders as an <h2> by default
    -- an explicit <h2> here closes the gap on the routed screen and is a same-level
    sibling (not a skip) in the dialog, so one titleLevel value serves both callers
    correctly.
- inferred: Concept stays in its existing grid-cols-3 cell/row beside timeout and
    connector, rather than being moved to its own row or a different grid.
  from: Criteria 1 and 2 require only a visual distinction, not a reposition, and
    criterion 7 forbids the other seven fields from changing position -- keeping concept's
    own cell unchanged is the narrowest change that satisfies every stated criterion
    without touching timeout's or connector's own grid placement.
- inferred: role="group" (not the implicit "region" Panel's section would otherwise
    resolve to, and not role="none") is the correct explicit override for Panel's
    wrapping <section> at this one call site.
  from: 'A manually verified, then reverted, experiment confirmed role="group" restores
    capabilities-browser-screen-detail.spec.ts''s own zero-region assertion. role="group"
    is the more semantically correct role for a single emphasized form field regardless:
    a landmark region is meant for page-level sections, not one field inside a form
    -- panel.component.spec.md''s own Do/Don''t table agrees, naming a bordered-surface-without-landmark-intent
    use as a Card use case, not a Panel one. role="none" was considered and rejected:
    it would strip the accessible name Panel''s aria-labelledby supplies ("Emphasized
    field") entirely from the accessibility tree, and nothing in the task''s criteria
    calls for suppressing that name -- only for not exposing it as a page-level landmark,
    which role="group" achieves without over-correcting.'
preserved:
- CapabilityFormFieldsProps' exact shape and every prop it already declared (form,
  conceptOptions, inputSchema, outputSchema, isEditingIdentity, isSubmitting, onSubmit,
  isDirty, trailingActions).
- The concept Select's resolution from conceptOptions, its Controller-driven field.value/field.onChange/field.onBlur
  wiring, its aria-invalid/aria-describedby wiring, and disabled={isSubmitting}.
- FormField's own label-wraps-control convention (and its aria-describedby-linked
  error text) for the concept field, and its role as the one accessible-name source
  every getByLabelText("Concept") call across the suite must keep resolving to.
- The other seven fields' grid placement, register()/Controller wiring, and validation-error
  rendering, all left byte-for-byte unchanged.
- capability-form-dialog.tsx's and capability-detail-ready-view.tsx's own existing,
  unmodified composition of CapabilityFormFields -- neither file was read as needing
  an edit, and neither was touched across any of the three attempts.
- capabilities-browser-screen-detail.spec.ts's own pre-existing assertion that opening
  the create-mode Dialog renders no detail panel (queryByRole("region") resolving
  to null) -- restored by the role="group" fix, and stated here as what a later reader
  checks a regression against if Panel's role is ever touched again.
deferred:
- what: The local FormField helper function stays duplicated verbatim between capability-form-fields.tsx
    and connector-configuration-form-fields.tsx.
  why: The inventory names this pre-existing duplication explicitly and states the
    plan "should not fold this pre-existing duplication into its own task's scope
    (out of scope per the surface-only nature of this change)" -- unifying it reaches
    outside this task's own objective of giving concept visual priority.
- what: 'src/hooks/use-connector-configuration-detail-validity.spec.ts fails intermittently
    on the full suite, unrelated to this delivery''s content. Confirmed: it passes
    894/894 on the base commit before this delivery, passes standalone, passes paired
    with only this delivery''s own new spec file, and across three full-suite runs
    of this same delivered code it failed on two different assertions in that same
    file on two separate runs and passed cleanly on a third rerun of identical code
    -- the signature of an order-dependent or resource-contention flake in that hook''s
    own test file, confirmed by a failure-diagnostician''s independent reading (cause:
    setup) of the run where it last appeared.'
  why: The file and hook are outside this task's own file set (capability-form-fields.tsx
    and its own proof file); investigating or fixing cross-test isolation in an unrelated
    hook's suite would widen this task past the one screen it was cut to change.
---

## What it is
The one file this task touches: capability-form-fields.tsx, where the concept field's own FormField now sits inside a TUI Panel (accent="alt", title="Emphasized field", role="group") that none of the form's other fields share.
No specification node is accounted for -- this task's own `## Notes` records the binder's independent confirmation that all 11 candidate nodes in its epic are uncovered by a visual-only change, and the plan-node contract's own rule for a task implementing nothing is answered there, in the task's rationale, rather than repeated as an empty claim here.

## Notes
This delivery implements no specification node -- consistent with the task's own `implements` being empty and its epic marking all 11 candidate nodes uncovered, confirmed independently by the execution-contract-binder before this task was ever written.
Every value this delivery introduces is an enum/string literal ("alt", "Emphasized field", "group") or a heading-depth integer (2), never a raw color, border or spacing value; the two semantic tokens the visual distinction actually resolves to (border-accent-alt, bg-surface) were already declared in frontend/tui/frontend/src/theme.css before this delivery and are unchanged by it.
Three attempts were needed. The first gave Panel's title the literal text "Concept" (the field's own name); its suite run failed 22 tests, all one cause (code): Panel's wrapping <section> unconditionally carries aria-labelledby pointing at its own notched-title heading, so a title reading "Concept" gave the DOM two independent accessible-name sources reading "Concept" for one control, and every getByLabelText("Concept") across the suite -- this task's own proof plus four pre-existing spec files composing this same shared component -- threw "Found multiple elements". The second attempt renamed the title to "Emphasized field", clearing that collision, but surfaced an independent regression: `capabilities-browser-screen-detail.spec.ts`'s own pre-existing assertion that the "New capability" create-mode Dialog renders no detail panel (`queryByRole("region")` resolving to null) started failing, because a `<section>` carrying an accessible name maps, per the HTML-AAM/ARIA mapping, to the implicit landmark role "region" -- and `capability-form-dialog.tsx` composes this same markup, unmodified, for its own create-mode flow. The third attempt (this record) adds an explicit `role="group"` to the same Panel call, overriding that implicit mapping with no edit to Panel's own source and no call-site change to either caller.
A full suite run after this fix reported exactly one failure, in `src/hooks/use-connector-configuration-detail-validity.spec.ts` -- a file this delivery never touches. Independent investigation (isolation run, paired run with only this delivery's own new spec, and a base-commit run before any of this delivery's changes existed, all clean) plus a failure-diagnostician's reading (cause: setup) established this as a pre-existing, order-dependent flake in that hook's own suite, unrelated to this delivery; a subsequent rerun of the identical delivered code passed all 901 tests, and that run (run/capability-detail-concept-emphasis-concept-field-visual-emphasis-suite-4) is what this record's proof stands on. Disclosed above under `deferred` rather than investigated further, since it sits outside this task's own file set.
