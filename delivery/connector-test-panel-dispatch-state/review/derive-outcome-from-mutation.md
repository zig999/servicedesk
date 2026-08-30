---
title: Derive outcome from mutation, review
summary: What four passes found over the STA-01 corrective task that replaced testOutcome's
  own useState with a value derived from the mutation object.
reviewed:
- src/hooks/use-test-connector-panel.ts
- src/hooks/use-test-connector-panel.spec.ts
tasks:
- task/connector-test-panel-dispatch-state/derive-outcome-from-mutation
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed cleanly (all 8 steps), so there was no failure
    to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
coverage:
- criterion: useTestConnectorPanel no longer declares testOutcome as an independently-set
    useState assigned inside onSuccess/onError -- it is computed from the mutation
    object's own state at render/return time, so there is no second, separately-settable
    copy of what the mutation already holds.
  state: partial
  tests:
  - file: src/hooks/use-test-connector-panel.spec.ts
    name: 'starts as {kind: ''idle''} before any dispatch has ever been made'
  - file: src/hooks/use-test-connector-panel.spec.ts
    name: reports pending exactly while a dispatch is in flight, then succeeded once
      it resolves -- tracking the mutation's own status on every render rather than
      a value a callback set once
  why: 'The two tests exercise only the criterion''s behavioral half -- that testOutcome
    tracks idle/pending/succeeded correctly across renders. Neither, nor any renderHook-level
    assertion, can exercise the criterion''s other stated half: that there is no second,
    separately-settable useState. A hypothetical reintroduction of such a useState,
    kept in sync with the mutation''s own status inside onMutate/onSuccess/onError,
    would produce the exact same values these tests assert at every point checked,
    so neither would fail if that shape returned. The absence of a second useState
    is a fact about the source''s own shape (confirmed by reading the hook directly),
    not a fact any runtime test in this file witnesses or could be made to witness
    without asserting on the code''s own structure.'
- criterion: 'After a first dispatch succeeds and a second dispatch (against the same
    or a changed subject) fails, the returned testOutcome is exactly {kind: "failed",
    message} -- never a value also carrying the first call''s own result -- proving
    the original TYP-04 fix still holds under the new derivation.'
  state: covered
  tests:
  - file: src/hooks/use-test-connector-panel.spec.ts
    name: 'replaces a first dispatch''s own succeeded result with exactly {kind: "failed",
      message} once a second dispatch fails, carrying no leftover result field'
  - file: src/hooks/use-test-connector-panel.spec.ts
    name: 'replaces a first dispatch''s own failed message with exactly {kind: "succeeded",
      result} once a second dispatch succeeds, carrying no leftover message field'
---

## What it is
Four passes over the STA-01 corrective task: coverage pairs each of the 2 stated criteria with the tests that would fail if it stopped holding; conformance reads the file set against the specification (this task implements no node); standard reads the file set against the project's own frontend-typescript.yaml and confirms STA-01 is now satisfied; failures did not run because the captured run (install, typecheck, lint, style, build, a11y, secret-scan, test) passed cleanly on the first attempt.

## Notes
The standard pass confirms STA-01 is resolved: testOutcome is computed by testOutcomeFromMutation(mutation) from the mutation's own status/data/error at render time, with mutation.reset() called before every dispatch so a stale result/error cannot survive into the next read, and no API-sourced value is copied into a separate useState anywhere in the file.
Coverage's one partial state is not a gap in what was verified: "no second, separately-settable useState" is a fact about the code's own shape that no runtime test can witness (a reintroduced useState kept perfectly in sync would pass the same assertions) -- confirmed instead by reading the source directly, both by the coverage-auditor and by the standard-conformance-reviewer.
This is the third review in a row over this same file (use-test-connector-panel.ts) across two initiatives (connector-test-panel-placeholder-attributes, now closed, and this one) -- each one narrower and cleaner than the last: 0 findings here, versus 1 conformance + 3 standard findings over the sibling task, versus 3 standard findings over the pair of tasks before that. No new findings surfaced this time to carry forward.
