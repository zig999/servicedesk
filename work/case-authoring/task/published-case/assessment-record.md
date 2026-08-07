---
title: "The assessment that carries a resolution"
summary: "The assessment as the construct that names the determining hypothesis, carries the resolution reached and reads back the text it was written with."
rationale: "An earlier statement of the resolution behaviour spoke of what the answer carried without any construct carrying it, and what an assessment holds changes for what an investigation reports while the precedence reading changes for how a winner is chosen, so the construct is cut out and the behaviour that produces it depends on it; the tie between the assessment and the case that resolved it is deliberately not stated here, because this task is handed a resolution and never reads a case."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
objective: "An assessment is constructed carrying exactly one resolution and the hypothesis it names as determining, and every part it was constructed with reads back unchanged."
criteria:
  - "An assessment reads back the resolution it was constructed with."
  - "An assessment carries exactly one resolution."
  - "An assessment constructed with a determining hypothesis reads back that hypothesis by the name unique within its case."
  - "An assessment constructed with no determining hypothesis reads back none and is not refused for carrying none."
  - "An assessment reads back the text it was constructed with."
nodes:
  - node: definition/investigation/assessment
    digest: sha256:fe01c229097bb5a9b23e1f75b8bbbe60108838df39b8068129c5d7adaa2b69ac
  - node: definition/knowledge/resolution
    digest: sha256:ce017e6342d08120ef1290be156eff861490e031d0e210d96cae2f5bc9f4f1bb
  - node: definition/knowledge/hypothesis
    digest: sha256:9bf1a22e47265a35f85bc3332bfcd216434359f95eb169e0c8e4ef33ce823b34
  - node: rule/investigation/the-outcome-comes-from-the-case
    digest: sha256:fe6d313568bdc7eb9aaae70da1220bba3faddc2cf58285d0d9486a598d4ce12b
waived:
  - gap: definition/investigation/assessment#attributes.text.audience
    why: "This task constructs the assessment with a text and reads it back unchanged, deciding nothing about the text's content; what an assessment may expose to the end customer bears on the writing that produces the text, not on carrying it."
---

## What it is

The construct an investigation's conclusion is carried in, holding the resolution reached and what determined it.
The naming of the determining hypothesis by the name unique within its case, so what decided the conclusion is readable from the conclusion.
The two shapes the base allows, one determined by a hypothesis and one not.

## Notes

This task builds the construct and nothing here chooses what goes in it, which is the behaviour that depends on this one.
That an assessment's outcome and referral are the ones the case resolved is stated by the behaviour that reads the case and produces the assessment, since this task never sees the case.
UNDERDETERMINED, from the binding — no criterion checks where the resolution came from, while the bound nodes state a resolution is declared by the case and never produced during an investigation and the outcome rule requires what the assessment carries to be what the case resolved; what passes is a constructor accepting an outcome-and-referral pair assembled at the call site, never resolved by any case, with every part still reading back unchanged.
UNDERDETERMINED, from the binding — the assessment node says there is a determining hypothesis when one confirmed and none when the fallback applied, and criteria 3 and 4 each test one attribute in isolation; what passes is a constructor accepting a determining hypothesis alongside a fallback resolution or none alongside a hypothesis-borne one, a pairing the base refuses and a resolution carries no marker to check at construction.
REMAINDER, from the binding — the assessment node's rules on what the writing receives, the report, the confirmed hypothesis and its evidence when one confirmed, every verdict and reason when none did, and never the curator prose, reach no criterion of this task; they belong to the writing of the assessment text, the diagnose step that composes it from a narrowed input, which this plan does not hold.
From the binding — demonstrating criterion 1 instantiates a resolution whose embedded parts read through to the referral and the outcome, and those candidates are not bound because no criterion examines a resolution's internals; they are governed where the resolution's shape was delivered.
The pin was restated deliberately rather than re-bound: the base moved by the five decision nodes, the capability's new output_schema attribute and the corrected citation prose, and none of this task's bound nodes changed its declared gaps or anything a criterion here reads — the lines added to their Rules sections point at rules bound elsewhere in this plan. The validator's totality check over every bound node's open gaps holds that judgment, and it refuses this task if the reading is wrong.
