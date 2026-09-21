# Scope: hypothesis revision history states a generic load failure when the case's current version does not read back as a case

## Behavior observed

On the case detail screen (`http://localhost:5199/cases/ifs-sync-status`), opening the HYPOTHESES
tab and selecting a hypothesis that has been composed but not yet placed in any version's manifest
shows: "Unable to load this hypothesis's revision history." with a Retry button.

The hypothesis's own revision history read succeeds (`GET
/v1/cases/ifs-sync-status/hypotheses/ifs-failed-transactions/revisions` answers 200 with the
revision's own content). The read that fails is a different one — `GET
/v1/cases/ifs-sync-status/versions/1` answers 409, refused because the case's current (highest-
numbered) version, version 1, declares no hypothesis in its manifest (the hypothesis was composed
but never placed).

The screen folds that refusal into the same generic statement it uses for a read that genuinely
did not complete, even though the hypothesis's own revision data loaded successfully and could be
shown.

## Reproduction

1. Create a case, save a draft version without adding a hypothesis to its manifest.
2. Compose a hypothesis for that case (New Hypothesis), without placing it in the version's
   manifest.
3. Navigate to the case's detail screen, open the HYPOTHESES tab, select the composed hypothesis.
4. Observe: "Unable to load this hypothesis's revision history." — instead of the revision history,
   which is available and was in fact read successfully.

## File

`frontend/app/src/hooks/use-case-hypothesis-current-pin.ts`
