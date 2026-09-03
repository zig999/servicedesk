# Reconcile cost report — investigation/judgment/persistence + glossary/connector-registry backend batch (19 files)

**Written:** 2026-09-01
**Consumer project:** `siegard-generator` (the Siegard framework itself) — meant to be read cold, in
a fresh Claude Code session over that project, with no access to the conversation that produced it.
Everything needed to evaluate the cost concern is inlined here, including raw per-delegation numbers.
**Origin project:** `servicedeskn1`, a Siegard-managed application (backend at `src/`, frontend at
`frontend/app/`, specification at `knowledge/`). Not itself relevant beyond being the environment
that produced these numbers.
**Related prior report, same directory:** `temp/reconcile-cost-report-glossary-batch.md` (2026-08-31,
a 4-file/2-round batch). That report already covers the mechanism and several friction points in
depth; this one is self-contained but does not re-derive what that report already established —
where a finding here confirms or extends one of its points, this report says so explicitly instead
of re-arguing it.
**Ask that produced this report:** the human running `servicedeskn1` observed `/reconcile`'s cost is
climbing and asked, specifically for this 19-file run, for (a) bottleneck and top-token-consumer
identification across tool calls and reads, (b) anything spending tokens unnecessarily, and (c)
whether the `work/` and `delivery/` roots were touched during this process and how. This report does
not propose framework fixes; it lays out what happened, with numbers.

## 1. What was asked, end to end

Starting point: `/siegard-status` (a read-only status skill) ran `trace.py --check src`, which
reported 63 `code` drift findings over 19 backend files — pre-existing, not caused by anything in
this session (the working tree was clean before this reconciliation began: `git status --porcelain`
returned nothing at the outset). The human then invoked `/reconcile` naming exactly those 19 files:

```
src/connector-registry/connector-configuration-store.port.ts
src/errors/status-map.ts
src/factories/production-simulate-hypothesis.factory.ts
src/factories/simulate.factory.ts
src/http/dto/register-concept.dto.ts
src/http/read-concept.controller.ts
src/investigation/anthropic-hypothesis-evaluator.adapter.ts
src/investigation/assessment-consolidator.port.ts
src/investigation/citation-validation.ts
src/investigation/draft-assessment-text.ts
src/investigation/evidence-collection-stage.ts
src/investigation/field-semantics.ts
src/investigation/hypothesis-evaluator.port.ts
src/investigation/investigation-pipeline.ts
src/investigation/judgment-stage.ts
src/investigation/run-diagnosis.ts
src/investigation/simulate-hypothesis-pipeline.ts
src/persistence/relational-connector-configuration-store.repository.ts
src/persistence/relational-investigation-store.repository.ts
```

`trace.py --encodes src <these 19 paths>` located the full node set the trace currently binds to
them (not just the drifted subset `--check` reports): **85 unique specification nodes**. Per the
`/reconcile` skill's own rule ("the set is read from the trace's own bindings, never chosen ... a
path here is a path the trace will assert answers to this node"), all 85 were kept — including
nodes each file's binding still `matches` (unchanged), not only the ones `--check` flagged as
`stale`.

19 `specification-conformance-reviewer` delegations then ran **in parallel, one per file** (never
per node, never one context over the whole set — see the mechanism recap below and §4.1 of the
prior report). Each was handed:

- its own file's full bound node set (matches + stale, per above);
- as "candidates," **the union of all 85 nodes across the whole batch minus its own set** — i.e.
  roughly 65–83 extra node identifiers per delegation, so a fact one file states can be attributed
  to a node the trace actually binds to a *different* file in the batch, per the skill's
  misattribution-handling rule.

Unlike the prior 4-file/glossary batch, this run needed **no second round** and **no `/analyse`
detour**: every one of the 21 findings the judges returned cited a node the fold-blocked directly
(no re-judgment needed), the reconciliation record validated against `schemas/reconciliation.json`
on the first write, and `trace.py --bind-record` wrote all 64 clean bindings in one act. The
orchestrating session did have to hand-build the 85-node reconciliation record itself, by reading
all 19 delegations' free-form YAML answers and folding them into one schema-conformant markdown
file — this is where a large share of the orchestrating session's own (unmeasured) cost sits; see
§4.

## 2. Numbers

Subagent-reported usage, verbatim from each delegation's own completion notification (all 19 ran
on `specification-conformance-reviewer`, which CLAUDE.md pins to **opus** regardless of the session's
own model — see §4.4):

| # | File | Bound nodes | Tokens | Tool calls | Wall time |
|---|---|---:|---:|---:|---:|
| 1 | `connector-registry/connector-configuration-store.port.ts` | 2 | 37,058 | 9 | 59.5 s |
| 2 | `errors/status-map.ts` | 18 | 69,149 | 35 | 213.6 s |
| 3 | `factories/production-simulate-hypothesis.factory.ts` | 3 | 37,202 | 14 | 111.3 s |
| 4 | `factories/simulate.factory.ts` | 3 | 51,475 | 14 | 107.9 s |
| 5 | `http/dto/register-concept.dto.ts` | 3 | 62,173 | 23 | 180.8 s |
| 6 | `http/read-concept.controller.ts` | 3 | 28,382 | 9 | 87.2 s |
| 7 | `investigation/anthropic-hypothesis-evaluator.adapter.ts` | 10 | 60,589 | 29 | 271.9 s |
| 8 | `investigation/assessment-consolidator.port.ts` | 8 | 49,652 | 19 | 138.7 s |
| 9 | `investigation/citation-validation.ts` | 6 | 62,787 | 25 | 227.9 s |
| 10 | `investigation/draft-assessment-text.ts` | 7 | 44,548 | 12 | 107.1 s |
| 11 | `investigation/evidence-collection-stage.ts` | 14 | 81,905 | 41 | 346.4 s |
| 12 | `investigation/field-semantics.ts` | 1 | 44,340 | 15 | 82.0 s |
| 13 | `investigation/hypothesis-evaluator.port.ts` | 7 | 48,477 | 21 | 139.2 s |
| 14 | `investigation/investigation-pipeline.ts` | 8 | 68,043 | 21 | 268.8 s |
| 15 | `investigation/judgment-stage.ts` | 21 | 71,978 | 37 | 342.1 s |
| 16 | `investigation/run-diagnosis.ts` | 14 | 73,707 | 22 | 207.5 s |
| 17 | `investigation/simulate-hypothesis-pipeline.ts` | 7 | 68,974 | 29 | 344.5 s |
| 18 | `persistence/relational-connector-configuration-store.repository.ts` | 5 | 45,069 | 23 | 190.6 s |
| 19 | `persistence/relational-investigation-store.repository.ts` | 16 | 79,016 | 40 | 382.9 s |
| — | **Total** | 85 (unique) | **1,084,524** | **438** | 3,809.7 s cumulative / ~383 s wall (parallel, longest delegation) |

Average per delegation: 57,080 tokens, 23.1 tool calls, 200.5 s. Compare to the prior glossary
batch's own average of ~63,097 tokens/delegation across 7 delegations covering 4 distinct files with
a required second round — this batch's **per-file** average (57,080 tokens, one round, no `/analyse`
detour) came in cheaper than that batch's own round-2-inclusive extrapolation of ~110K tokens/file,
mainly *because* this batch needed no re-judgment and no specification gap surfaced that required a
new node. That is a property of what this batch happened to contain, not of the file count — see §5.

Outcome, measured against `trace.py --check` on `src/`, before and after:

| | `code` drift findings, 19-file set | Unique nodes affected |
|---|---:|---:|
| Before | 63 | 63 (one finding per node×file pair reported) |
| After | 29 (across 15 files; 143 more suppressed under frontend's `edits_freely`, untouched by this run) | 21 nodes stayed unbound; the other 8 files closed to zero |

64 of 85 nodes bound cleanly on the first record; 21 did not clear and stay exactly as they stood
(their drift is still a `--check` finding). Full detail, including the three findings that named no
node in scope and one node's binding that rested on how two files compose, is in
`siegard-reconcile/backend-investigation-glossary-connector-cluster-code-drift.md`.

## 3. Were `work/` and `delivery/` used?

**No, at no point.** Confirmed three ways:

1. `/reconcile`'s own required-inputs list (`SKILL.md`) states explicitly: "No work root, no
   delivery root, no task, no plan. This entry point deliberately asks for none of them." No
   command run in this session passed a work-root or delivery-root argument — every `trace.py`,
   `spec.py` and `project.py` invocation took only `<specification-root>`, `<target-source-root>`,
   or a reconciliation-record path.
2. `git status --porcelain` at both the start and the end of this session shows zero changes under
   `work/` or `delivery/` — only `siegard-trace.json` (modified) and the new
   `siegard-reconcile/*.md` record (untracked) changed anywhere in the repository.
3. None of the 19 delegated subagents were given a work-root or delivery-root path in their prompts
   (each was handed only: the one file path, its node set, its candidate list, the specification
   root, and the delivery-node contract path — the last one is `schemas/delivery-node.json`, a
   *contract* file, unrelated to the `delivery/` directory root).

This matches the framework's own design for this entry point (state relevant to `/reconcile` lives
entirely in `siegard-trace.json` and the reconciliation record itself, not in a plan or a delivery),
and confirms this run added no cost or side effect in either directory.

## 4. Where the tokens actually went

### 4.1 The dominant, structural cost is 19 full-Opus contexts, not any one wasteful call

Every `specification-conformance-reviewer` delegation runs on `opus` by CLAUDE.md's own pin table
("Six run on `opus` ... `specification-conformance-reviewer`"), independent of what model the
orchestrating session itself runs on. Issuing 19 of them in one batch means 19 separate
full-price-tier contexts, each paying its own system-prompt and tool-schema overhead before a
single file byte is read. This is the single largest lever on absolute cost for a batch of this
size, and it scales linearly with file count by construction (see §4.5's mitigation options) — it
is not something any one delegation did inefficiently.

### 4.2 Tool-call and token cost correlates with bound-node count, but not linearly

The three most expensive delegations by token count —
`investigation/evidence-collection-stage.ts` (81,905 tok / 41 calls, 14 bound nodes),
`persistence/relational-investigation-store.repository.ts` (79,016 tok / 40 calls, 16 bound nodes),
`investigation/judgment-stage.ts` (71,978 tok / 37 calls, 21 bound nodes) — are also the three files
with the most specification nodes bound to them (`judgment-stage.ts` carries the single largest node
set in the whole batch, 21). But the relationship is not proportional:
`errors/status-map.ts` (18 bound nodes, the second-largest set) cost only 69,149 tokens for 35 tool
calls, while `run-diagnosis.ts` (14 bound nodes, tied for third) cost 73,707 tokens for only 22
tool calls — a markedly higher token-per-call ratio, meaning its individual reads (the specification
nodes it opened, likely including several candidates around the two most recent decision-log
entries this file's prompt specifically flagged — see §4.3) were larger, not more numerous. Bound-
node count is a reasonable first-order predictor of a delegation's cost in a batch like this one, but
not the only variable; how many *candidates* a delegation actually chooses to open (as opposed to how
many it is merely offered) is the second, and this report cannot isolate that variable from the
subagent-reported totals alone — only from reading each delegation's own "looked_past"/attribution
notes, which name the candidate files it opened.

### 4.3 The candidate list handed to every delegation was the (near-)full batch, every time

Per the `/reconcile` skill's own instruction ("What is kept is every node those findings name, and
never a subset... a fact one file states can be governed by a node another file carries"), every one
of the 19 prompts carried a candidate list built from **the union of all 85 nodes in the batch minus
that file's own set** — so a file with only 1–3 bound nodes (e.g. `field-semantics.ts`,
`production-simulate-hypothesis.factory.ts`, `read-concept.controller.ts`) still received roughly
80 unrelated node identifiers as candidates it *may* open, most from specification contexts (case
lifecycle, capability registry, glossary authoring) with no plausible connection to what that file
actually does. This did not, on the evidence of what each delegation reports having actually opened,
translate into wasted *reads* in most cases — the delegations were disciplined about only opening a
candidate when the file's own content plausibly touched it (e.g. `production-simulate-hypothesis.factory.ts`'s
delegation opened exactly one candidate, `rules/investigation/an-answer-arrives-within-the-declared-deadline`,
and found a real cross-file issue there) — but it did inflate:

- the orchestrating session's own prompt-authoring cost: 19 prompts × a roughly 80-identifier list
  (each identifier ~35–55 characters) is on the order of 15,000–20,000 tokens of near-duplicate text
  written into this session's own context, once per prompt, with no reuse across prompts;
- the search space each delegation had to at least *consider* before deciding what to open, which is
  a plausible (though not separately measurable) contributor to the higher tool-call counts on
  files whose own node set was small relative to the candidate list (e.g. `register-concept.dto.ts`,
  3 bound nodes, still needed 23 tool calls and 62,173 tokens — comparable to files with 3–4× as
  many bound nodes — because its delegation went on to independently search the specification root
  for `ttl`-bound siblings and the decision log's own precedent for an identical `.positive()` bound
  on a different DTO).

This is the same tension the prior glossary-batch report names in its own §4.1, generalized: per-file
judging avoids one failure mode (a whole-set context saturating and re-surfacing stale findings) at
the cost of another (every delegation re-deriving, from a near-full candidate list, which parts of a
large shared specification are and are not relevant to it) — and this batch, being 4–5× larger than
the prior one, shows that cost scaling up with batch size specifically through candidate-list size,
not just delegation count.

### 4.4 A finding naming no node taints every node of its own file — including single-file nodes with no other evidence

`relational-connector-configuration-store.repository.ts`'s delegation returned one real, well-evidenced
finding (an unstated error identity and a `'read'`/`'write'` vocabulary for store failures) but named
no specification node for it. Per this reconciliation's own transcription rule (spelled out in the
`/reconcile` skill: "a finding naming no node lands on every node of the file its judge read"), this
correctly-conservative default meant **all five** nodes bound to that one file failed to bind —
including `domain/integration/connector-configuration` and
`domain/integration/connector-configuration-registry`, which are bound to *no other file in the
batch* and whose own readings (quoted in the record) show no divergence whatsoever on their own
substance. This is a variant of the prior report's §4.2 fold-rule problem (a bad finding on a shared
node blocks clean siblings), but sharper: here it blocks nodes that had **zero other evidence to
weigh against** the unattributed finding, purely because they happen to share a file with it. There
is no cost paid *this run* to fix it (nothing was re-judged), but it means 4 of the 21 "not
conforming" nodes in this batch's output are not actually contested findings about those nodes'
own substance — they are collateral from one file's judge declining to name a node, and would need a
fresh delegation (full per-file cost again) purely to re-clear them once the underlying finding is
routed and closed.

### 4.5 Two identical, redundant `trace.py --check` invocations

Before delegating, this session ran `trace.py --check src` and, separately,
`trace.py --check frontend/app` — following `/siegard-status`'s own instructions to check drift
"once per declared target." Both commands printed **the same content**: this project's
`siegard-trace.json` is one shared file at the repository root (not one per target, despite
`/siegard-status`'s own skill text describing "each keeps its own trace file"), so `--check` over
either target root reads and reports the identical 63-finding, 180-binding trace state. This did
not affect the reconciliation itself (only one file set was ever reconciled), but it is a concrete,
avoidable doubling of a several-kilobyte command output inside the orchestrating session's own
context, paid for no new information — confirmed by direct comparison of the two tool outputs in
this session's transcript.

### 4.6 The orchestrating session's own synthesis cost is large and unmeasured

Every one of the 19 delegations returned full free-form YAML — per-node `read`/`findings` blocks
with quoted evidence, `looked_past` notes, and file-path caveats — none of it shaped like the
reconciliation record schema (`node`/`conforms`/`how`/`encoded_at`/`observed_at`) it ultimately had
to become. The orchestrating session had to read all 19 results in full, cross-reference each of the
85 nodes against however many files bind it (up to 4, for the busiest shared nodes), decide the
folded `conforms` value per this reconciliation's own aggregation rule, and hand-write one ~700-line
YAML record. This synthesis step:

- is not counted by any harness token counter available to this report (subagent tokens are
  reported per-delegation; the orchestrating session's own input/output tokens for this step are
  not separately exposed);
- is the step most exposed to compounding error at this scale — the report's author had to manually
  build an 85-row node→file table by hand from 19 separately-formatted free-text answers before
  writing a single line of the record, a step the prior glossary report's own §4.5 flags in
  miniature (having to hand-read `siegard-trace.json` to reconstruct node sets) but which grows
  materially worse as batch size grows, because the fold logic (§4.2, §4.4) has to be applied
  correctly across all 85 nodes, by hand, before validation can even be attempted;
- is qualitatively the largest single block of orchestrator-side prose consumed and produced in this
  session: the 19 raw delegation results alone, concatenated, run well into the tens of thousands of
  words, all of which had to be held in context simultaneously to build one consistent record (a
  node bound to files judged in delegations #3 and #16, for instance, cannot be folded correctly
  without both of those results being visible at once).

## 5. Scale extrapolation (rough, explicitly uncertain)

This batch closed 8 of 19 files to zero remaining drift and reduced total findings from 63 to 29,
for 1,084,524 subagent tokens plus an unmeasured but substantial orchestrator-side synthesis cost,
in one round with no `/analyse` detour. The remaining 15 files (some already touched by this batch,
carrying 1–5 still-open nodes each) will need at least one further `/reconcile` invocation once the
21 open findings are routed (per the report's own next-invocation note): most will need only a
targeted re-judgment of the files whose findings get closed by a decision, but the connector-registry
cluster (§4.4) illustrates that some of that cost buys back nodes that were never actually in
question. Separately, the frontend carries 143 further suppressed `code` findings under its own
`edits_freely` declaration, entirely untouched by this run and not reconcilable through this same
route without first addressing whether `edits_freely` is meant to stay declared for that target.

## 6. What this report is not

It does not recommend a specific fix, and it does not rank the friction points above by importance.
Several of them (§4.1, §4.3) are consequences of an explicit, reasoned design choice already
documented in the `/reconcile` skill itself, not oversights; §4.4 and §4.5 are narrower, concrete
observations from this specific run. It is a grounded account of one batch, with numbers, for
whoever maintains Siegard to weigh against whatever else is known about `/reconcile`'s design intent
and against the prior glossary-batch report this one complements.
