# Reconcile cost report — glossary module backend batch

**Written:** 2026-08-31
**Consumer project:** `siegard-generator` (the Siegard framework itself) — this report is meant to
be read cold, in a fresh Claude Code session over that project, with no access to the conversation
that produced it. Everything needed to evaluate the cost concern below is inlined here.
**Origin project:** `servicedeskn1`, a Siegard-managed application (backend at `src/`, frontend at
`frontend/app/`, specification at `knowledge/`). Not itself relevant beyond being the environment
that produced these numbers — nothing here is specific to this app's domain.
**Ask that produced this report:** the human running `servicedeskn1` observed that `/reconcile`'s
cost is climbing and asked for an evaluation, to be handed to whoever maintains Siegard, aimed at
finding improvement opportunities. This report does not propose fixes; it lays out what happened,
with numbers, and names the friction points a maintainer would want to look at.

## 1. What `/reconcile` is, briefly

Siegard tracks a link between a specification node and the file(s) that encode it in
`siegard-trace.json` (the "trace"). When a file changes without an `/implement-task` delivery
rebinding it — a hand edit, a hotfix, a merge — the trace still asserts the file's old digest,
and `trace.py --check` reports that as `code` drift: "this file changed since it was last proven
against the specification."

`/reconcile` is the route that clears such drift without going through a full task delivery. Given
a human-named file set, it:

1. Locates, from the trace, every specification node currently bound to those files (both the
   ones `--check` flags as drifted and the ones that happen to be unchanged).
2. Delegates one `specification-conformance-reviewer` subagent **per file** (never per node, never
   over the whole set at once — this is a deliberate design choice, discussed below), each handed
   its file's own node set plus, as "candidates," every node bound to a sibling file in the same
   batch (in case a fact in file A is actually governed by a node the trace attaches to file B).
   The human may also name additional candidates explicitly — typically a node just written by
   `/analyse` that has never been delivered/bound to anything yet.
3. Each delegation reads the node fresh from the specification and the file fresh from disk, and
   answers, per node: does the file still state exactly what the node holds, contradict it, or
   state a fact no node in scope settles?
4. The orchestrating session writes one reconciliation record (a YAML-frontmatter markdown file
   under `siegard-reconcile/`) folding every delegation's answers, validates it against
   `schemas/reconciliation.json`, and runs `trace.py --bind-record` — which writes a binding for
   every node the judgment cleared and touches nothing for a node any delegation found against.
5. A node one delegation flags against is not bound anywhere, even if other delegations reading
   sibling files cleared it — the whole record's verdict for that node folds to "not conforming."

`/reconcile` never writes source. Where a delegation decides the *file* is right and the
*specification* is silent or wrong, the route out is `/analyse` (to decide the fact into the
specification) or `/plan-work`'s corrective increment (to fix the code) — both are separate,
human-invoked entry points, never taken automatically.

## 2. What was asked, end to end

The human asked to reconcile the glossary module's backend files, one small batch at a time,
starting with four files that `trace.py --check` reported as drifted:

- `src/glossary/glossary-store.port.ts`
- `src/glossary/glossary.service.ts`
- `src/glossary/terms.ts`
- `src/persistence/relational-glossary-store.repository.ts`

### Round 1

Four `specification-conformance-reviewer` delegations ran in parallel, one per file, against a
located, deduplicated union of 18 specification nodes. Three files cleared every node bound to
them. One file (`glossary-store.port.ts`) returned a real finding: its `writeConcepts` doc comment
asserts a permanence guarantee —

> "A previously-held concept named at a name none of the given concepts holds is left exactly as
> it was, never removed by this call: a concept's own row, once it exists, is never deleted here
> — including one another table now permanently references — so it is never at risk of a foreign
> key breaking merely because a different concept was written in the same call."

— citing a closed plan's task (`task/glossary-concept-write-upsert-hotfix/...`) as its authority,
while no specification node stated that fact at all. Because `contracts/glossary/glossary-authoring`
(the node the finding was filed against) is bound to three files in the batch, and this one
delegation found against it, the fold rule left the node unbound for **all three** files — including
the two whose own delegations had cleared it cleanly.

### The `/analyse` detour

To close that finding, the orchestrating session (not a delegation — this ran directly in the main
session) had to:

- Read the cited node (`contracts/glossary/glossary-authoring`) and the concept's own domain
  element to confirm the specification really said nothing about removal.
- Find the exact precedent already in `decision-log.md`: the sibling vocabulary `outcome` had this
  identical situation — a prior reconciliation found the delivered backend stating outcome
  permanence with no node behind it, and it was decided into
  `rules/glossary/the-non-conclusion-outcomes-precede-the-first-case`.
- Independently verify the claim was true and not just a code author's assumption: grep every
  foreign key in the project's 13 SQL migrations that references `concepts(name)` (six of them, in
  five different migration files) and confirm none carries `ON DELETE CASCADE` — i.e. the database
  itself would refuse the deletion the comment describes.
- Find a second, independent domain argument for the same fact: an existing rule
  (`rules/knowledge/case-terms-exist-in-the-glossary`) already requires a hypothesis-revision's
  named concept to keep existing, and hypothesis-revisions are immutable once released — so
  removing a referenced concept would already break that older rule.
- Write a new rule node (`rules/glossary/a-registered-concept-is-never-removed.md`), a
  decision-log entry disclosing why (citing all of the above), validate the whole specification,
  and regenerate its projections.

This is one `/analyse` invocation, run inline (no subagent — `/analyse` is a skill the session runs
directly), but it involved on the order of a dozen targeted reads across the specification and the
migrations tree, plus writing and validating two files. Its cost is not separately measured by any
harness counter; it is folded into the orchestrating session's own token usage, which this report
cannot isolate from the rest of the conversation.

### Round 2

With the new node in hand, the same three files that carried the unresolved
`contracts/glossary/glossary-authoring` finding needed re-judgment — not just the one file with the
original finding, because the node's fold-blocked status covered all three. Three fresh
`specification-conformance-reviewer` delegations ran (one per file; `terms.ts` was excluded, it was
never implicated). Result:

- `glossary.service.ts`: every node cleared, including the new one, attributed cleanly.
- `glossary-store.port.ts` and `relational-glossary-store.repository.ts`: their actual **behavior**
  now matches the new node (confirmed independently by both delegations), but their **doc comments
  still cite the closed plan task**, not the new node — read by both delegations as "a second home
  for the fact" and filed as a fresh, distinct finding against the very node that was supposed to
  close the first one.
- Both of those same two delegations **also** independently opened a node nobody asked them to
  check (`rules/glossary/the-non-conclusion-outcomes-precede-the-first-case`, a candidate from the
  sibling file's node set) and found that a different, unrelated method on the same port
  (`writeTerms`, a whole-table replace) can violate that rule's never-removed clause if ever called
  with the `outcome` vocabulary. This exact same node, over these exact same two unchanged files,
  had been read and **cleared** by round 1's delegations. Nothing about the files changed between
  the two rounds — this is two independent fresh reviewer instances reaching different conclusions
  over byte-identical input.

To respect the fold rule without re-penalizing the one clean file, the orchestrating session split
the output into two separate reconciliation records (a pattern discovered by finding an existing,
undocumented precedent left by an earlorder reconciliation in this same project,
`siegard-reconcile/backend-final-sweep-glossary-service.md`, whose own `summary` field states it
did this "to avoid folding an unrelated finding onto files otherwise clean for the same node" —
this is not written anywhere in the `/reconcile` skill's own instructions).

## 3. Numbers

Subagent-reported usage, verbatim from each delegation's own completion notification:

| Round | File | Tokens | Tool calls | Wall time |
|---|---|---:|---:|---:|
| 1 | `terms.ts` | 53,471 | 21 | 178.2 s |
| 1 | `glossary-store.port.ts` | 56,346 | 16 | 202.8 s |
| 1 | `relational-glossary-store.repository.ts` | 66,761 | 25 | 253.6 s |
| 1 | `glossary.service.ts` | 75,921 | 31 | 287.5 s |
| — | **Round 1 subtotal** | **252,499** | **93** | ~288 s wall (parallel) |
| 2 | `glossary-store.port.ts` | 56,838 | 17 | 238.5 s |
| 2 | `glossary.service.ts` | 63,349 | 28 | 275.9 s |
| 2 | `relational-glossary-store.repository.ts` | 68,992 | 28 | 287.4 s |
| — | **Round 2 subtotal** | **189,179** | **73** | ~287 s wall (parallel) |
| — | **Total, both rounds** | **441,678** | **166** | 7 delegations |

Not counted above, and not separately measurable from this session:

- The orchestrating session's own token cost for the `/analyse` detour (reading migrations,
  domain nodes, decision-log precedent; writing and validating the new node and its decision-log
  entry).
- The orchestrating session's own token cost for building each delegation's prompt — in particular,
  the node-to-file binding sets had to be computed by reading `siegard-trace.json` directly with an
  ad hoc script, because `trace.py --check` only lists **drifted** bindings, not a file's complete
  current node set (see §4.5).
- Two full specification/trace soundness re-validations (`spec.py`, `trace.py`) plus one projections
  regeneration for the `/analyse` step, and the equivalent situate-step re-validations for each
  `/reconcile` round — individually cheap, paid multiple times.

Outcome, measured against `trace.py --check` on the backend target (`src/`), before and after:

| | Backend files with `code` drift | Backend `code` drift findings |
|---|---:|---:|
| Before this session's work | 21 | 151 |
| After | 17 | 122 |

Four files fully closed (0 remaining drift on any of them); 29 findings cleared. Three
conformance questions remain **open but invisible to `--check`**, because the files' content did
not change again after round 2's partial bind — they exist only as prose inside the reconciliation
records (see §4.6):

1. `glossary-store.port.ts` and `relational-glossary-store.repository.ts`'s doc comments still cite
   a closed plan task instead of the new node for the concept-permanence fact.
2. `glossary-store.port.ts`'s header comment misattributes a "no file access" claim to the wrong
   architecture constraint.
3. `writeTerms`'s whole-table-replace shape can violate the outcome-permanence rule if ever called
   with `vocabulary: 'outcome'` — currently true of nobody in the delivered code (confirmed by grep;
   the only other reference is a stale comment in a test-setup file describing behavior the
   production code no longer has), but true of the port's own declared contract.

## 4. Friction points observed, each with the evidence behind it

### 4.1 Per-file judge granularity re-reads shared nodes redundantly

A node bound to N files in a batch is independently read, interpreted, and judged N times — once
per delegation — because delegation scope is "one file, its own nodes, plus candidates," never
"one node, across every file that carries it." In this batch, `domain/glossary/concept` was bound
to 3–4 files in both rounds; it was read and separately re-derived as conforming seven times total
across the two rounds, by seven different fresh contexts, for a fact that never changed. The
skill's own rationale for per-file delegation (`SKILL.md`, "Judge" step) is that a whole-set
judgment "saturates" — a single context holding every node and file answers hundreds of pairs in
one reading and re-surfaces stale findings pass after pass. That tradeoff is real, but it is
currently all-or-nothing: there is no middle ground (e.g. one delegation per node, reading every
file that carries it) that was evaluated in the skill's own design note.

### 4.2 The fold rule forces full re-judgment of already-clean files

`contracts/glossary/glossary-authoring` was cleared by 2 of 3 round-1 delegations and found against
by the third. Per the fold rule, the whole node stayed unbound for all three files — meaning the
two clean files' clearance could not be recorded until a **second full round** re-confirmed them
from scratch, at full per-file cost, alongside fixing the third. Nothing about those two files'
node set changed between the rounds; their round-2 delegations spent tokens re-deriving conclusions
their round-1 delegations had already reached.

### 4.3 Splitting into multiple reconciliation records is an undocumented, precedent-only workaround

To avoid re-blocking the one genuinely clean file (`glossary.service.ts`) behind the two files still
carrying a citation problem, the orchestrating session split round 2's output into two separate
`siegard-reconcile/*.md` records. This is not described anywhere in `SKILL.md` for `/reconcile`. It
was discovered only because an earlier, unrelated reconciliation in this same project
(`backend-final-sweep-glossary-service.md`) had already hit the identical problem and left a
one-line note explaining the workaround. A maintainer or a fresh session without that specific
precedent on disk would not know this pattern exists and would likely either (a) accept the
fold-blocking as unavoidable, re-paying full cost on clean files every round, or (b) fold everything
into one record and accept that a single dirty file blocks every sibling indefinitely.

### 4.4 Judge coverage is not stable across independent runs on unchanged input

Round 1's delegations for `glossary-store.port.ts` and `relational-glossary-store.repository.ts`
read `rules/glossary/the-non-conclusion-outcomes-precede-the-first-case` and cleared it. Round 2's
delegations, over the exact same files (explicitly unchanged — this session's own reconciliation
records say so) and the exact same node text, opened the same node as a self-selected candidate
and found a real, still-standing issue (`writeTerms`'s whole-replace shape). This is not
drift — nothing about the input changed. It is variance in what two independent fresh reviewer
instances happen to notice. This matters for cost specifically because it means a single "clean"
reconcile round is not a reliable signal that a file has no more findings to surface; catching
what round 1 missed required paying for round 2 in full.

### 4.5 No command answers "what does this file currently encode" without hand-reading the trace JSON

Building an accurate node set and candidate list per delegation requires knowing every node
currently bound to a file — not just the drifted ones `trace.py --check` reports. There is no
`trace.py` subcommand for this; the orchestrating session read `siegard-trace.json` directly with
one-off Python snippets, twice in this session, to reconstruct the full node-to-file binding table
before writing each round's delegation prompts. This is manual, undocumented as a required step,
and easy to get wrong (a missed binding means a delegation is judged against an incomplete node
set, which the reconciliation record contract cannot detect on its own — `trace.py
--reconciliation` validates the record's internal shape, not whether the node set it used was
complete against the trace).

### 4.6 A cleared-behavior/wrong-citation finding blocks a bind exactly like a real behavioral bug, and has no defined route to close

Once the concept-permanence *behavior* was confirmed correct and specified, the only remaining gap
was that two files' comments cite a closed plan task instead of the new node. This is not a domain
fact stated wrong in code (the fact is right), not a capability surface change, and backend is not
declared `edits_freely` in `siegard.json` — so it does not fit any of the four routes CLAUDE.md's
"which route a change takes" table names. `/reconcile` cannot fix it (it never writes source). The
practical result: a correction that is purely "update which node this comment cites" currently has
no defined, proportionate path — it sits exactly as blocked as a real behavioral divergence would,
and the only visible way to close it is presumably a full `/plan-work` corrective increment plus
`/implement-task`, which is a heavyweight route for a one-line citation swap.

### 4.7 Fixed per-invocation overhead is paid on every round regardless of the marginal finding's size

Every `/reconcile` invocation re-validates the whole specification (`spec.py`) and the whole trace
(`trace.py`) before doing anything, checks git status on every named file, and (when the record
does not fully clear) hands back follow-up invocations. Every `/analyse` invocation does the same
for the specification plus a digest read and impact-set closure, and regenerates every projection
file even for a one-node change. These are individually inexpensive, but this session paid them
twice for `/reconcile` and once for `/analyse` — three fixed-cost passes — to close what was, in
the end, one decided fact plus two still-open citation fixes.

### 4.8 Closed status is not visible from the trace alone

After round 2's partial bind, `trace.py --check` reports **zero** drift on any of the four files —
because the three still-open items (see §3) never caused a digest mismatch; they were found by a
judgment that chose not to bind, not by a digest that changed. A reader who only runs `--check`
(which is what `/siegard-status` does) will see these four files as fully clean. The three open
conformance questions exist only as prose inside two `siegard-reconcile/*.md` files. There is
currently no mechanism (a report, a registry, a flag) that surfaces "this reconciliation found
something real but didn't fix it" outside of a human reading that specific record's `notes` field.

## 5. Scale extrapolation (rough, explicitly uncertain)

This session closed 4 files for ~442K subagent tokens (excluding the `/analyse` detour and the
orchestrating session's own overhead), leaving 17 backend files still carrying `code` drift in this
project. If the remaining files are similarly complex on average — a real caveat, since this batch
happened to contain one undocumented specification gap that triggered a full `/analyse` cycle,
which will not recur on every file — reconciling the rest of the backend alone could be on the
order of ~110K subagent tokens per file, i.e. roughly 1.8–2.0M additional subagent tokens, plus
however many more `/analyse` detours the remaining files' comments turn out to require, plus
whatever the equivalent frontend numbers are (143 further `code` findings currently suppressed
there under `edits_freely`, not reconciled by this session at all).

## 6. What this report is not

It does not recommend a specific fix, and it does not rank the friction points above by importance
— that judgment belongs to whoever maintains Siegard, with visibility this report does not have
into how these tradeoffs were chosen and what else depends on them (e.g. §4.1's per-file
granularity is an explicit, reasoned design choice in the skill itself, not an oversight). It is a
grounded account of one real batch, with numbers, so that account can be weighed against whatever
else is known about `/reconcile`'s design intent.
