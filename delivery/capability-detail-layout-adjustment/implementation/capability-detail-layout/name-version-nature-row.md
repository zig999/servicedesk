---
title: Group Name, Version and Nature into one row
summary: CapabilityFormFields now wraps Name, Version and Nature in one grid grid-cols-3 gap-4 row instead
  of Nature sitting in its own row beneath a separate Name/Version flex row.
task: sha256:629facf6f25d7a016ba1e61e5c98cb6e3b113521996b1bfd1f420f94e20e26c6
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/capability-detail-layout-name-version-nature-row-build-3
files:
- path: src/routes/capability-form-fields.tsx
  effect: Name, Version and Nature FormField elements are now siblings inside one shared <div className="grid
    grid-cols-3 gap-4"> wrapper, replacing the prior <div className="flex gap-4"> around Name/Version
    alone followed by Nature's own separate FormField block below it; no FormField's internal markup,
    Controller wiring, register() calls, or values changed.
criteria:
- criterion: CapabilityFormFields wraps the Name, Version and Nature FormField elements in one shared
    row container instead of Nature's current standalone FormField block rendered below the Name/Version
    row.
  met: true
  how: All three FormField elements (Name, Version, Nature) are now direct children of one <div className="grid
    grid-cols-3 gap-4"> container; Nature's previous standalone wrapping div is gone.
- criterion: Nature keeps its existing selectable values and its current selected value for any given
    capability; only its screen position changes.
  met: true
  how: Nature's FormField still wraps the same Controller with the same name="nature", the same NATURE_OPTIONS
    list, and the same field.value/onChange/onBlur wiring -- nothing inside the FormField or Controller
    was touched, only the div it sits in.
- criterion: Name and Version keep their existing values and validation behavior unchanged by the regrouping.
  met: true
  how: Name and Version's FormField elements keep their original register("name")/register("version")
    calls, disabled conditions, and aria-invalid/aria-describedby wiring verbatim; only the enclosing
    div's className changed from flex gap-4 (wrapping only these two) to grid grid-cols-3 gap-4 (now wrapping
    all three).
- criterion: The existing capability-detail-screen.spec.ts suite, which locates every field by screen.getByLabelText,
    passes without modification to its assertions.
  met: true
  how: Every label text, control type, id and aria attribute for Name, Version and Nature is unchanged
    -- only the surrounding row div markup and its className moved, which getByLabelText-based lookups
    do not observe. Confirmed by this delivery's own suite run (see below), not merely inferred.
inferences:
- inferred: The three-field grouping should reuse the codebase's own grid grid-cols-3 gap-4 pattern (identical
    to the Timeout/Connector/Concept row already in this same file) rather than a flex wrapper extended
    to three children.
  from: the inventory's noted convention that a row of three-or-more fields is a grid grid-cols-N gap-4
    wrapper while a two-field row is flex gap-4, and this file's own existing Timeout/Connector/Concept
    row already demonstrating that exact pattern for three fields
preserved:
- Nature's selectable options (NATURE_OPTIONS) and its current selected value per capability
- Name and Version's register() bindings, disabled conditions, and validation/error display
- Every field's accessible label text, id and aria-describedby wiring that capability-detail-screen.spec.ts
  locates by screen.getByLabelText
---

## What it is

One task of the capability-detail-layout-adjustment epic: a purely presentational regrouping of
three already-displayed fields into one row. Implements no specification node, per the task's own
rationale (confirmed independently by two execution-contract-binder reads).

## Notes

Two build attempts failed before this one, both for environment reasons unrelated to this task's
own file: this worktree's frontend/tui git submodule was uninitialized (empty directory), so every
file importing @tui/ui/* or @tui/lib/* failed to resolve (run/capability-detail-layout-name-version-nature-row-build).
After `git submodule update --init --recursive`, a second attempt
(run/capability-detail-layout-name-version-nature-row-build-2) still failed: the submodule's own
package at frontend/tui/frontend has its own, separately-installed node_modules
(documented by this app's own scripts/dedupe-tui-react.mjs), which this fresh worktree had never
installed, so every @tui/ui/* source file's own imports (react, lucide-react, @radix-ui/*, clsx,
tailwind-merge) failed to resolve in turn. Running `npm install` inside frontend/tui/frontend
resolved it; no source file was touched to make either attempt pass, and no file this task
implements is among the ones either failed run named.
