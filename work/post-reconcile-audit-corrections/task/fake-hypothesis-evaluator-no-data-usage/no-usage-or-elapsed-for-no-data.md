---
title: Fake hypothesis evaluator carries no usage or elapsed time for a seeded no-data outcome
summary: Stops the fake hypothesis-evaluator adapter from attaching a usage and an elapsed duration to
  an outcome seeded with reason no-data, where no call was ever made.
sources:
- intake/fake-hypothesis-evaluator-usage-scope.md
objective: A fake-evaluator outcome seeded with reason no-data answers with no usage and no elapsed_ms,
  exactly as an evaluator call that was never made.
criteria:
- Calling evaluate() against a seed whose reason is no-data and which carries no usage or elapsed_ms of
  its own answers an outcome carrying no usage and no elapsed_ms.
- Calling evaluate() against a seed whose reason is not no-data and which carries no usage or elapsed_ms
  of its own still answers an outcome carrying the fake's own placeholder usage and elapsed_ms.
implements:
- domain/investigation/evaluation
---

## What it is

Guards the fake hypothesis-evaluator adapter's evaluate() so a seeded outcome whose reason is
no-data is returned without a usage or elapsed_ms merged onto it, since no call happened for it;
every other seeded reason still receives the fake's placeholder usage and elapsed_ms.

## Notes

UNDERDETERMINED, from the specification -- neither criterion covers a no-data seed that already carries its own usage, elapsed_ms or prompt; domain/investigation/evaluation refuses those fields on a no-data outcome regardless of whether the seed supplied them. Passes: a fake that adds no placeholder for a no-data seed but otherwise returns the seed as given, which would return a seeded usage, elapsed_ms or prompt on a no-data outcome.
UNDERDETERMINED, from the specification -- domain/investigation/evaluation lists prompt alongside usage and elapsed_ms as present exactly when a call happened; no criterion here names prompt, and the adapter adds none. Passes: a fake that returns the placeholder usage and elapsed_ms for a non-no-data seed but no prompt.
ADVISORY, from the specification -- domain/investigation/evaluation and domain/investigation/usage say only that usage and elapsed_ms are present when a call happened; neither fixes the zeroed placeholder value itself, which is this test double's own choice. A test should check the fields' presence, not their value.
Decision, beyond the covers — stand: domain/investigation/usage is not claimed in implements; this task holds usage's own shape unchanged, only whether it is present or absent.
ADVISORY, from the binder -- constraints/judgment-runs-behind-a-port and constraints/the-domain-depends-on-no-infrastructure are neighbors of this file, not governors of this change: the fake stays one of the interchangeable adapters the first constraint describes, and this change touches no import.
Decision, beyond the covers — stand: constraints/judgment-runs-behind-a-port and constraints/the-domain-depends-on-no-infrastructure are not claimed in implements; this change implements no port and touches no import.
