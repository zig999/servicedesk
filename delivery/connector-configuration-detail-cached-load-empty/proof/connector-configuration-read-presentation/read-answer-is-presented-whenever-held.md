---
target: frontend
title: Cached-load presentation of a read connector configuration
summary: Seven new tests over the connector configuration detail screen's cache-seeded first render, proving the
  task's six criteria and two of its UNDERDETERMINED notes against a real react-query cache hit, plus a test-support
  extension that lets a mount pre-seed the query client.
implementation: sha256:50dee58c032b8f4b2642c582b2e45acc952737c83aed5ff3a98b4ad6554f316c
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/connector-configuration-read-presentation-read-answer-is-presented-whenever-held-suite
tests:
- file: src/routes/connector-configuration-detail-screen-cached-load.spec.ts
  name: presents the connector name and the configuration exactly as the held answer carries them, and states nothing
    to the effect the configuration is still being read, while a further read of the same configuration remains
    outstanding underneath -- an implementation that leaves the fields at their loading defaults, or that states
    the still-being-read condition alongside the held answer, would fail this
  proves: Criterion 1 ("Where the read's answer is already held by the client before the screen's first render,
    the screen presents the connector name and the configuration exactly as the read answered them."), together
    with the task's UNDERDETERMINED note 2 (the clause of a-connector-configuration-answer-already-held-stands-presented-while-a-further-read-is-outstanding
    that has the screen state nothing to the effect the configuration is still being read).
  fails_when: The connector or configuration field is empty or at its loading default at first render despite the
    answer already being held, or the screen additionally states that the configuration is still being read while
    a further read of it is outstanding.
  demonstrates: rules/integration/a-connector-configuration-answer-already-held-stands-presented-while-a-further-read-is-outstanding
- file: src/routes/connector-configuration-detail-screen-cached-load.spec.ts
  name: shows the configuration exactly as held and no malformed-configuration warning, at the screen's first render
  proves: Criterion 3 ("Where the read's answer is already held before the first render and it carries a well-formed
    JSON object, the screen states no malformed-configuration condition.")
  fails_when: The configuration field does not hold the well-formed held answer's exact text, or the malformed-configuration
    warning is shown despite that content being well-formed JSON.
- file: src/routes/connector-configuration-detail-screen-cached-load.spec.ts
  name: disables Save and Discard changes at the screen's first render, before the operator has touched any field
    -- an implementation whose dirtiness baseline is not seeded from the held answer would enable one or both
  proves: Criterion 4 ("Where the read's answer is already held before the first render and the operator has not
    changed any field away from what the read answered, the screen offers no discard act and no register act.")
  fails_when: Save or Discard renders enabled at first render even though the operator has made no edit.
  demonstrates: rules/integration/a-presented-connector-configuration-with-no-edit-offers-no-discard-and-no-submission
- file: src/routes/connector-configuration-detail-screen-cached-load.spec.ts
  name: returns the configuration field to exactly what the held answer carried, once the operator edits it and
    confirms Discard
  proves: Criterion 5 ("...the discard act, once the operator states in a further explicit act that it is to be
    performed, returns the configuration to exactly what the read answered."), for the cache-seeded case.
  fails_when: Confirming Discard leaves the configuration field empty, at some default, or at any value other than
    the cache-held answer's own configuration.
- file: src/routes/connector-configuration-detail-screen-cached-load.spec.ts
  name: names the added Attribute row after the placeholder embedded in the held answer's configuration
  proves: Criterion 6 ("Where the read's answer is already held before the first render, the test surface derives
    its subject attributes from the placeholders of the configuration the read answered.")
  fails_when: The added Attribute row is unnamed, or named for anything other than the placeholder the cache-held
    configuration's own text embeds.
- file: src/routes/connector-configuration-detail-screen-cached-load.spec.ts
  name: returns the configuration to what the surface's own further read most recently answered, once that read
    has landed with different content, rather than to the answer the screen was first presented holding -- an implementation
    that always discards back to the first-held answer, regardless of a later read, would fail this
  proves: The task's UNDERDETERMINED note 4 (a discard that always returns to the answer first held, even where
    the surface's own further read has since answered with different content, is an implementation the specification
    refuses).
  fails_when: Confirming Discard restores the configuration field to the answer that was cached before first render,
    ignoring that the surface's own subsequent read has since answered with different content.
- file: src/routes/connector-configuration-detail-screen-cached-load.spec.ts
  name: states the malformed-configuration warning for a held answer whose configuration is not well-formed JSON
    object text, distinguishably from the load-error reading -- an implementation staying silent about it, or stating
    it indistinguishably from an outstanding, failed, refused or returned reading, would fail this
  proves: The task's UNDERDETERMINED note 5 (an implementation that stays silent, or states the condition indistinguishably
    from the four readings of the read, for a held answer whose configuration is not well-formed JSON, satisfies
    criterion 3 as written while the specification refuses it).
  fails_when: No malformed-configuration statement appears for a held, malformed-JSON configuration, or the statement
    shown is the same text used for the load-error ("Retry") or still-being-read reading rather than a distinguishable
    one.
not_applicable:
- edge_case: A further read of the same configuration that fails or is refused while an earlier answer is already
    held.
  why: Governed by rules/integration/a-held-connector-configuration-answer-stands-presented-through-a-failed-further-read-but-not-a-refused-one
    and rules/integration/a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under,
    neither of which this task implements; the task's own ADVISORY notes record that whether this screen even issues
    such a further read at all was left an open watch item, not decided here.
- edge_case: An empty string as the held answer's configuration.
  why: Falls in the same not-well-formed-JSON-object-text class the malformed-configuration test already represents;
    the obligation, so far as this task reaches it, does not distinguish an empty field from other unparsable text,
    so no separate representative is owed.
- edge_case: Two operations against the screen at once, a second Discard or Save click while one is already in flight.
  why: Guarded by isSubmittingRef and the existing Save and Discard disabled-while-submitting wiring, unchanged
    by this delivery and not reached by any of this task's six criteria.
untested:
- 'domain/integration/connector-configuration: its fact is the value object''s shape and its whole-replace-on-edit
  responsibility, which spans every rule and every write path across this specification; no single test in this
  task''s scope, which only touches how an already-held answer is copied into presentation state, decides that whole
  fact.'
- 'rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read: states three windows
  (outstanding, failed, returned) as one whole; the task''s own REMAINDER note excludes the failed window from this
  task''s criteria, so no test written here spans all three, and the loading and load-error phases are pre-existing
  and untouched.'
- 'rules/integration/a-presented-connector-configurations-fields-carry-the-answer-from-the-moment-that-reading-is-entered:
  its whole fact spans both the before-render and after-render timings and excludes several other content sources
  (a list page, a draft, a register-connector submission) that no test here exercises; the before-render timing
  is proven by this proof''s first test and the after-render timing by the screen''s own pre-existing, unmodified
  test, but no single test decides the node whole.'
- 'rules/integration/a-connector-configuration-surface-judges-its-configuration-fields-content: its whole fact spans
  three content sources (a read''s answer, an applied draft, the operator''s own typing) crossed with both validity
  states; this proof''s tests reach only the read-answered source, for both validity states, so no single test decides
  the node whole.'
- 'rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface: a policy decided once
  for two registries with many clauses (the further-explicit-act gating, no register call issued, remaining on the
  surface, the held-answer standing); the task''s own REMAINDER note excludes the capability-registry clauses, and
  no single test here or in the pre-existing discard tests spans the whole breadth of what remains.'
- 'The clause of rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface that
  the discard sets every field, connector-name included, to the read answer''s content (the task''s own UNDERDETERMINED
  note 3): the connector-name field is rendered permanently disabled on this screen (isEditingIdentity is hard-wired
  true in connector-configuration-detail-ready-view.tsx), so the operator has no route to edit it away from the
  loaded value in the first place; no test can exercise the note''s named alternative implementation without bypassing
  that disabled control by a means no real operator has.'
- 'rules/integration/a-presented-connector-configurations-test-collects-values-for-the-attributes-the-presented-answer-names:
  its second clause (stating that the configuration changed since the presented answer when the test-time configuration
  names a different attribute set) is the task''s own REMAINDER, out of this task''s scope; only the first clause
  (collecting from the presented answer) is proven here, so the node is not decided whole.'
---

## What it is

Seven tests in one new spec file, each mounting the connector configuration detail screen with the read's answer already seeded into the query client before the first render, the shape the running application takes when the listing was visited first.
The test-support module gained an optional third parameter so a mount can pre-seed the query client; every existing caller is unchanged.

## Notes

Criterion 2, the after-mount-arrival case, and the task's first UNDERDETERMINED note, the outstanding window before the answer arrives, are already protected by pre-existing, unmodified tests in connector-configuration-detail-screen.spec.ts and connector-configuration-detail-screen-return-to-origin.spec.ts, so no new test was written for either.
Two tests prove UNDERDETERMINED notes 4 and 5 by asserting what the specification requires where the criteria stop short: a discard follows the surface's own further read once it has answered, and a malformed held answer is stated distinguishably from the load-error reading.
The suite passed on its first captured run.
