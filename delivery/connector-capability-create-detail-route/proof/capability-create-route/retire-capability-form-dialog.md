---
title: Retiring the capability popup form dialog
summary: Structural absence tests for the deleted dialog module and its retired form-target
  type, plus the one route-wiring fact the task's own UNDERDETERMINED note left unpinned.
implementation: sha256:04aa1b9b777ae11cd129c2324d98c6811468166b66ec13248abcb02f25d9ef64
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/capability-create-route-retire-capability-form-dialog-suite-2
tests:
- file: src/routes/capability-form-dialog.spec.ts
  name: "no longer exists in the tree"
  proves: 'Criterion 1, "The capability form dialog module no longer exists in the tree."'
  fails_when: src/routes/capability-form-dialog.tsx exists at that path again -- restored in
    full, left as an empty file, or reintroduced under any content at all.
- file: src/hooks/use-capability-form.spec.ts
  name: "no longer declares the nullable-identity CapabilityFormTarget type"
  proves: 'Criterion 4, "The nullable-identity capability form-target type is no longer
    declared."'
  fails_when: use-capability-form.ts's own source text declares CapabilityFormTarget again,
    anywhere in the file, whether or not anything inside the file consumes it.
- file: src/hooks/use-capability-form.spec.ts
  name: "still exports useCapabilityForm as a callable function"
  proves: 'Criterion 5, "The capability create/edit form hook the routed create screen consumes
    is not deleted."'
  fails_when: useCapabilityForm is removed, renamed, or no longer exported as a function from
    use-capability-form.ts.
- file: src/routes/route-tree.spec.ts
  name: "renders the /capabilities/$name/$version route through CapabilityDetailScreen -- the
    capability detail/edit screen a capability's own (name, version) identity is addressed by"
  proves: the task's own Notes entry opening "UNDERDETERMINED, from the specification" -- an
    implementation satisfying every stated criterion of this task could still leave the frontend
    app with no screen addressed by a capability's (name, version) identity, so an
    already-registered capability could no longer be opened for editing anywhere in the app; this
    test pins that the app, as delivered, in fact holds one.
  fails_when: the /capabilities/$name/$version route renders anything other than
    CapabilityDetailScreen -- a placeholder, no component at all, or the route removed entirely
    -- which is exactly the implementation the task's own Notes entry names as passing every one
    of this task's stated criteria while leaving that gap open.
not_applicable:
- edge_case: Absent or empty input
  why: this task's own criteria state facts about the tree's structure -- a module's presence,
    an import, a type declaration -- and involve no user input, form submission, or API payload
    for an empty or absent value to reach.
- edge_case: A boundary at each end of a stated range
  why: none of this task's criteria state a range-valued fact; each is a yes/no fact about a
    file, an import, or a declaration.
- edge_case: A duplicate where uniqueness is claimed
  why: no criterion of this task states a uniqueness constraint.
- edge_case: An operation against state that forbids it
  why: this task deletes a module and a type and introduces no new operation, so there is no
    forbidden-state transition for a test to trigger.
- edge_case: A dependency that fails or answers slowly
  why: this task's own delivery issues no network request and stands up no new asynchronous
    dependency. The routed create screen's own dependency-failure states (a failed
    concept-vocabulary load) are pre-existing behavior this task did not touch, already covered
    by capability-create-screen.spec.ts's own load-error tests.
- edge_case: Two operations against one subject at once
  why: the dialog this task retires composed only the shared form hook's own save mutation as
    its operation surface, and that mutation's concurrent-submission guard is pre-existing
    behavior inside use-capability-form.ts, untouched by this task and unexercised by the
    dialog's removal.
untested:
- 'Criterion 2, "No module in the frontend app imports the capability form dialog component," is
  not proven by any test in this record. No spec file in this codebase scans the whole src tree
  for an absent import as a matter of convention: every existing structural check that reads
  source as text (e.g. cases-list-screen-comment-cites-the-current-nodes.spec.ts) reads one
  specific, named file, and the one tree-wide scan that does exist
  (tailwind-tui-source-scan.build.spec.ts) reads real compiled build output, not source text
  grepped for a string. A grep-based scan invented for this criterion alone would also be
  strictly weaker than what already ran: capability-form-dialog.tsx no longer exists on disk, so
  any import of it -- however the imported binding is named, aliased, or re-exported through a
  barrel file -- already fails module resolution under npm run typecheck and npm run build, both
  steps of this task''s own passing captured run (run/capability-create-route-retire-capability-form-dialog-suite),
  in a way a string search across the tree can miss but the compiler''s own module graph cannot.
  Closed by that passing run and by the implementation record''s own reproducible grep, neither
  of which is a test this record can list.'
- 'Criterion 3, "No spec file references the deleted capability form dialog module," beyond the
  one instance the task''s own Notes already settles: capability-detail-screen.spec.ts''s test
  description at line 84 still names "capability-form-dialog.tsx" in prose, which the task''s own
  Notes reads as reaching this criterion without that spec''s assertions needing to change. No
  test here re-scans every spec file in the tree for the same reason criterion 2''s tree-wide
  scan is not written above, and nothing found while writing this record indicates any further
  occurrence beyond the one the task''s own Notes already resolves.'
---

## What it is
Four tests: two structural facts read directly off the tree (the dialog module's own absence,
and the retired type's own absence from the one hook file that used to export it), one narrow
existence check that the hook itself survives as a callable export, and one route-wiring fact
that pins the frontend app still holding a screen addressed by a capability's (name, version)
identity -- the implementation the task's own Notes flags as passing every stated criterion
while leaving that gap open, closed here by showing the gap does not in fact hold.

## Notes
Criteria 1, 4 and 5 are read as structural facts about specific, named files -- whether a path
exists, whether a type name still appears in one file's own source text, whether a named export
is still a function -- rather than as runtime, user-observable behavior, because that is what
each criterion itself states: a module's presence, a type's declaration, an export's survival.
This mirrors the one local precedent for this shape of test already in the tree
(cases-list-screen-comment-cites-the-current-nodes.spec.ts, which reads a specific file's own
source text to assert a fact about its content) rather than inventing a new pattern; the file
existence check in capability-form-dialog.spec.ts follows the same process.cwd()-as-target-root
convention src/vite-config.spec.ts and that file both already document.

Criteria 2 and 3 are deliberately left with no new test, recorded above under `untested` rather
than answered by a grep across the whole src or spec tree: no existing spec in this codebase
scans a whole directory for an absent string, and inventing that pattern here would produce a
weaker guarantee than what already exists -- npm run typecheck and npm run build, both part of
this task's own passing captured run, already fail on any dangling import of a module that no
longer exists on disk, across the whole program's module graph, which a string search cannot
match for coverage (it cannot see through a renamed binding or a barrel re-export the way the
compiler's own resolution does). The implementation record's own grep evidence is independently
reproducible against the same tree.

Criterion 5's own hook-survival test is deliberately narrow -- a typeof check, not a rendered
mount -- because useCapabilityForm's actual behavior (its create-mode defaults, its save
mutation, its validation gating) is already exercised end to end by
capability-create-screen.spec.ts, capability-create-screen-save.spec.ts,
capability-detail-screen.spec.ts and capability-detail-screen-save.spec.ts, none of which this
task touched and none of which this task's own delivery could have broken (only an unused type
export was removed from the hook's own file). Per the rearrangement rule, no new behavioral test
is written to re-prove what those pre-existing specs already establish and would already fail on
if it stopped holding.

The task's own inference ("emptying capability-form-dialog.tsx to zero bytes ... was the closest
available substitute for deletion given this delegation's tool set") needs no test of its own:
the file was fully removed from the tree via `git rm` by the orchestrating session before this
proof was written, so nothing observable survives of the intermediate empty-file state for a
test to distinguish from a clean deletion -- criterion 1's own test already covers the final
state in full.

capability-detail-screen.spec.ts's own stale test description at line 84 (naming
"capability-form-dialog.tsx", a file that no longer exists) is left untouched, the same as the
implementation record's own `deferred` entry leaves it: the task's own Notes already settles that
this prose reference does not fail criterion 3, and rewriting another task's own test wording
reaches past what any criterion, inference, or edge case of this task asks for.
