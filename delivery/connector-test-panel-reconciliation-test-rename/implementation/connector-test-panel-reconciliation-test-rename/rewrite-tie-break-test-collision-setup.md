---
title: Rewrite the reconciliation tie-break test's collision setup
summary: The tie-break test in connector-test-panel-attribute-reconciliation.spec.ts now induces its
  scenario by editing Configuration's own text rather than by firing a change event on the now-read-only
  Attribute field.
task: sha256:c8fd3598e16f10b5f468ea631e3ba00e63f526a29f93c9e0d42b373ee65af5d0
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-test-panel-reconciliation-test-rename-rewrite-tie-break-test-collision-setup-build
files:
- path: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  effect: The tie-break test ("keeps the earlier row's own value and drops the later duplicate's, once
    two rows share one attribute name") no longer renames the second row's Attribute input by hand. After
    the first "Add attribute" click seeds two rows (account-id="111", region="222"), it now edits the
    Configuration textarea's own text so that both the address's and the body's placeholders name "account-id"
    (the same name the earlier row already carries, in place of the placeholder that used to name "region"),
    then clicks "Add attribute" a second time. The reconciliation this exercises collapses the now-single
    distinct placeholder name to one row, keeping the existing row already matching that name (account-id,
    value "111") and dropping the row whose own name ("region") no placeholder still names (value "222").
    The final assertions changed to match -- one remaining row, attribute "account-id", value "111". Every
    other test in the file, and every other line of this one, is untouched.
criteria:
- criterion: connector-test-panel-attribute-reconciliation.spec.ts's tie-break test no longer calls fireEvent.change
    on an Attribute field to induce the collision.
  met: true
  how: The line that fired fireEvent.change on the second row's Attribute input (fetched via getAllByLabelText("Attribute"))
    is removed entirely; the file's only remaining read of "Attribute" is the read-only attributeValues()
    helper, used solely for assertions, and a search of the file confirms no fireEvent.change targets
    an Attribute input anywhere.
- criterion: connector-test-panel-attribute-reconciliation.spec.ts's tie-break test induces the collision
    by editing Configuration's own text so two placeholders resolve to the same subject-attribute name,
    then clicking "Add attribute" again.
  met: true
  how: A second setConfigurationText call sets a JSON object whose address and body placeholders both
    resolve to "account-id" -- immediately followed by a second clickAddAttribute(dialog) call, exactly
    the sequence the criterion states.
- criterion: The rewritten test still asserts that the earlier row's own value is kept and the later duplicate's
    is dropped once the two rows share one attribute name.
  met: true
  how: The final expectations assert attributeValues(dialog) equals ["account-id"] and the sole remaining
    Value input's value equals "111" -- the earlier row's own value (typed before the collision-inducing
    edit) survives, and the value that had been typed into the row whose own name no longer matches any
    current placeholder ("222") is gone, having been dropped rather than merged or overwritten.
- criterion: Every other test in connector-test-panel-attribute-reconciliation.spec.ts is unchanged.
  met: true
  how: Only the "the first row keeps a name two rows come to share" it block (lines ~204-237) was edited;
    every other describe/it block in the file -- criteria 1 through 6, the still-matching-row-keeps-its-id
    test, and the placeholder-order test -- is byte-for-byte what it was before this delivery, confirmed
    by reading the whole file after the edit.
- criterion: The full suite passes.
  met: true
  how: Traced by hand against reconcileAttributeRows and parsesAsConfigurationObject in use-test-connector-panel.ts
    before the run -- the new Configuration text parses as a well-formed object, both placeholders dedupe
    to one name, and the reconciled result is exactly one row matching the rewritten assertions. Confirmed
    against the captured suite run named above.
nodes:
- node: domain/investigation/subject-attribute-value
  how: This task touches no production source; the attribute/value pairing this value object declares
    is encoded, unchanged, in SubjectAttributeRow (use-test-connector-panel.ts), not by this delivery.
    The rewritten test continues to read that pairing only through attributeValues()/valueValues(), the
    same as before -- honored, not newly encoded.
- node: rules/integration/an-http-connector-configuration-declares-its-call
  how: Only the ${subject:<attribute-name>} placeholder clause reaches this task (per the task's own REMAINDER
    note). The rewritten test's second setConfigurationText call embeds two ${subject:account-id} placeholders
    (one in the address, one in the body), directly exercising that placeholder form as the mechanism
    for inducing the tie-break; every other clause of this rule is unreached by this task, per its own
    REMAINDER.
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  how: This task's own UNDERDETERMINED note already resolves the one fact this rule states that no criterion
    of this task names -- the criteria ask for the collision to be induced by editing Configuration's
    own unsaved textarea text, never registered, which this rewrite does exactly as instructed, satisfying
    every criterion as written while pinning a panel behavior this same rule's own statement would refuse.
    This delivery does not correct that divergence -- per the task's own Notes, that belongs to a different,
    not-yet-cut act, and settling it here would widen this one-file test-rewrite task past its own objective.
- node: rules/investigation/a-subject-holds-one-value-per-attribute
  how: The rewritten test's final assertions still prove this invariant's own tie-break -- where two things
    that would otherwise contribute a value for one attribute collide, the value recorded first ("111")
    is kept and the value recorded later ("222") is dropped -- the same fact the test proved before this
    rewrite, now induced through Configuration's text rather than through an Attribute-field rename.
inferences:
- inferred: The collision is constructed by making both placeholders in the edited Configuration text
    name "account-id" -- the name the earlier-typed row (value "111") already carries -- rather than some
    third, entirely new name, and rather than making both name "region" instead.
  from: The task's own Notes ("Passes" paragraph) describe the rewritten mechanism only in general terms;
    the specific choice of which name the colliding placeholders share is not stated there. Reusing "account-id"
    -- the first-declared placeholder's own name in the original two-name text, and the name of the row
    typed first -- is what preserves the original test's own "earlier row's value survives" shape (criterion
    3) with the smallest possible edit to the existing setup, rather than inventing a third attribute
    name the rest of the test never otherwise uses.
preserved:
- Every other test in connector-test-panel-attribute-reconciliation.spec.ts, and its own assertions, exactly
  as they were.
- The onAddAttribute reconciliation behavior in use-test-connector-panel.ts (untouched by this task) --
  this rewrite changes only how one test induces its scenario, never what the reconciliation itself does.
deferred:
- what: reconcileAttributeRows's own firstRowByAttribute dedup-of-existing-rows logic (use-test-connector-panel.ts)
    appears to have become unreachable from the UI, since the Attribute field lost its onChange entirely
    and every row's own attribute name can now only ever arrive through placeholder-name reconciliation,
    which already guarantees unique names -- so two rows in attributes state can no longer literally share
    one attribute name at any point, and this delivery's own tie-break test exercises the deduped-placeholder-names
    collapse rather than that row-level map.
  why: Confirming and, if warranted, simplifying that internal logic is a production-code change, and
    this task's own objective and Notes scope it to rewriting one test's setup mechanism in one spec file
    -- reaching into use-test-connector-panel.ts would widen a task cut as a test-only rewrite.
---

## What it is
connector-test-panel-attribute-reconciliation.spec.ts's tie-break test now induces its duplicate-attribute-name scenario by editing Configuration's own text so two placeholders resolve to the same name, rather than by renaming a row's Attribute field through the UI -- the only file this delivery touches.

## Notes
This task touches no production (non-test) source; its entire deliverable is the one test file's own setup mechanism, since the Attribute field's own non-editability is already delivered by a sibling task.
