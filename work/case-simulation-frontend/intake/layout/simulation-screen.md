# Layout — case simulation screen

A photograph of the form decided when this plan was cut, from section 6.2 of
`temp/plano-cockpit-simulacao.md`, dated 2026-08-26. **This decides form, never fact**: which
statuses exist, what each tells the curator, and when each appears come from the specification —
`contracts/investigation/case-simulation`, the `verdict`/`evidence-result`/`evaluation-reason`
enumerations, and the rules under `rules/investigation/` — never from this file. Where this layout
and the specification disagree, the specification wins.

Desktop; on narrow screens the regions stack in the order they appear here (header, then subject,
then hypotheses, then detail, then case result).

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ Cases › <slug> › v<version> › Simulate                                                │
│ <slug> · v<version>  ● draft            [Edit version]  [Manifest]  [▶ Simulate case] │
│ "<when_to_use>"                                                          ⏱ deadline   │
├───────────────────────────────┬───────────────────────────────────────────────────────┤
│ SUBJECT                       │ HYPOTHESES  (precedence order · N · all required)      │
│ Type      [<glossary> ▾]      │ # │ Hypothesis │ Collects │ Verdict │ Cost (tok) │ ▶ ✎ │
│ Requester [__________]        │ 1 │ …          │ 2        │ ● confirmed │ 1.2k  │ ▶ ✎ │
│                                │ 2 │ …          │ 1        │ ◐ inconclusive · no-data │—│▶✎│
│ Required by the connectors:   │ 3 │ …          │ 1        │ ○ idle      │       │ ▶ ✎ │
│  <attr>  [_______]            │ Determining: <h> → outcome <o> · referral <a> / <r>    │
│    ← <connector> (<capability>)│ Last run · 42s ago · 4.1s · 3 calls · 3.9k tok        │
│  <attr>  [_______]            │ [collect 1.8s ▓▓▓░░░░ 7s][judge 1.6s ▓▓░░░ 5s][write 0.7s ▓░░░ 4s]│
│  [+ attribute]                 │                                                       │
│ [View subject JSON]           │                                                       │
├───────────────────────────────┴───────────────────────────────────────────────────────┤
│ DETAIL ─ <selected hypothesis>                            [Evidence] [Prompt] [JSON]   │
│ Verdict ● confirmed     Citations  <concept>.<field> · <concept>.<field>               │
│ Criterion "<criterion>"                                                                │
│ Evidence                                                                                │
│  <concept>  ok        <capability> <version> → <connector>              214 ms         │
│   { …observation, collapsible JSON… }                                                  │
│  <concept>  timeout   <capability> → <connector>   "no observation within 5000ms"      │
│ Judgment  <model> · prompt <prompt_version> · 1 call · 980 in / 212 out · 1.6 s         │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ CASE RESULT                                                              run #3 · 14:02│
│ Outcome <o>     Referral <a> → <r>     Determining <h>                                │
│ Customer-facing text (<register>):  "<assessment.text>"                                │
│ Runs this session   #3 14:02 <o> 3.9k · #2 13:58 fallback 2.1k · #1 …   [Compare]      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

## Regions, for a task that builds only part of this

- **Header** — case-version identity, state pill, `when_to_use`, three actions ("Edit version",
  "Manifest", "Simulate case"), the declared deadline.
- **Subject** — subject type, requester, one field per connector-required placeholder (each
  annotated with the connector/capability that asks for it), a free-attribute add control, a link
  to view the raw subject JSON.
- **Hypotheses** — the precedence table (one row per manifest hypothesis, always all), the
  determining/outcome/referral summary line beneath it, the last-run stage timing bar.
- **Detail** — opens on row selection; verdict, citations, criterion, per-concept evidence, judgment
  metadata, three tabs (Evidence / Prompt / JSON).
- **Case result** — outcome/referral/determining line, the customer-facing text box, the in-memory
  run history with a compare action.

A task naming this file in `reference` reads only the region(s) its own objective builds — never
the whole layout for one component.
