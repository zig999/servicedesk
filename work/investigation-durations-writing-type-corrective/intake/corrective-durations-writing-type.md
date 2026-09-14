# Corrective increment — durations_writing typed as always present

Source: the conformance finding of `/review-change` over `backend-load-resilience-hardening`
(`siegard-reconcile/backend-load-resilience-hardening.md`, saved at
`siegard-reconcile/backend-load-resilience-hardening.returns/src____tests____integration__factories__diagnose-server.factory.spec.ts.yaml`),
quoted verbatim below.

## The wrong behavior

> investigationsFor is a general-purpose reader of the investigations table, not one scoped to
> runs that reached consolidation; typing durations_writing as an always-present, non-null number
> tells the next reader of this row shape that writing is unconditionally there, so a caller
> building on this same type for a run that never reaches consolidation — where the column is
> actually absent — reads a shape that promises a value the specification says is never recorded
> for that run, and looks to this type rather than to domain/investigation/durations for what
> "writing" means.
>
> node: domain/investigation/durations
>
> correction: type durations_writing as optional/nullable (e.g. `number | null` or an optional
> property), matching the attribute's conditional presence in domain/investigation/durations, which
> lists writing without `required: true` unlike collection, judgment and total.

## The file it lives in

`src/__tests__/integration/factories/diagnose-server.factory.spec.ts`
