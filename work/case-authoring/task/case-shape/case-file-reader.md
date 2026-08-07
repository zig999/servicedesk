---
title: Reading a case file
summary: A case file read into a case under edit, with the structured part deciding what is collected and the curator prose kept out of it.
rationale: The decomposition split reading the file from declaring the shape because the file format and the declared shape change for different reasons, and the rule that keeps the curator prose out of what is collected is a property of the reading.
sources:
  - intake/scope.md
objective: Reading a case file yields a case under edit whose collected concepts come from the structured part of the file alone.
criteria:
  - Reading a case file yields a case under edit holding what the structured part declared.
  - Two case files whose structured parts are identical and whose curator prose differs yield cases under edit whose collected concepts are identical.
  - The curator prose is carried on the case under edit as prose.
  - No collected concept is read out of the curator prose.
  - A file whose structured part does not parse yields no case under edit.
depends_on:
  - task/case-shape/draft-case-shape
nodes:
  - node: context/knowledge
    digest: sha256:58667e68e3c2c8d2702a225c28fe5342ca40fd5afe01abce4d0359fc194c6efd
  - node: definition/knowledge/draft-case
    digest: sha256:d462aa67ef753d09497e314fa00d0d9b5279bf0c5cea0063c6dd12a2e1bdcced
  - node: definition/knowledge/hypothesis
    digest: sha256:9bf1a22e47265a35f85bc3332bfcd216434359f95eb169e0c8e4ef33ce823b34
  - node: definition/knowledge/referral
    digest: sha256:7d74b30fc7b7813597b165588a4f8f5b7652235ebac9e320fa49a573f7eb9261
  - node: definition/knowledge/resolution
    digest: sha256:ce017e6342d08120ef1290be156eff861490e031d0e210d96cae2f5bc9f4f1bb
  - node: rule/knowledge/hypotheses-are-ordered-by-precedence
    digest: sha256:c5c1b66cff9265e8aa17c2be46f42bd4377e73801e215d95379cae6d60458fcb
  - node: rule/knowledge/the-body-does-not-change-what-is-collected
    digest: sha256:484135503755b64ba08db05907a618f768d07c641ae04e73486ce9bb668d1586
unresolved:
  - question: No base node says what a case file is — that a case is one file, what syntax its structured part is written in, and where the boundary between that structured part and the curator prose sits. The objective and criteria one, two, four and five all turn on that boundary, and no node states how a file separates them.
  - question: No base node says what reading answers when a case file's structured part does not parse. Criterion five says only that no case under edit results; whether that failure is one of the checks a validation carries, and so answers a refusal, or whether it answers nothing at all, is a fact no node holds.
waived:
  - gap: rule/knowledge/hypotheses-are-ordered-by-precedence#examples
    why: The gap is the missing fact of which cause dominates which, which only the specialists affirm. Reading a case file preserves the order the file declares and affirms no precedence of its own, so no criterion of this task takes a different value once the examples exist.
---
## What it is

The one place a case file becomes a value the rest of the source works on.
It separates the structured part from the curator prose and takes what is collected from the structured part only.

## Notes

The hash over the whole file, curator prose included, is cut in the publication epic and reads the same file this task reads.
UNDERDETERMINED, from the binding — no criterion states that the order of the hypotheses the file declares is preserved, while `rule/knowledge/hypotheses-are-ordered-by-precedence` makes that order the precedence the specialists affirm.
UNDERDETERMINED passes — a reader that carries the hypotheses as an unordered collection keyed by name, or that sorts them by any key, which meets all five criteria while the base refuses it.
UNDERDETERMINED, from the binding — criterion three says the curator prose is carried and no criterion covers a case file that carries none, while `definition/knowledge/draft-case` declares `curator_notes` optional.
UNDERDETERMINED passes — a reader that requires curator prose and yields no case under edit for a file whose structured part parses but that carries no prose.
UNDERDETERMINED, from the binding — criterion one's holding what the structured part declared is unbounded against the attribute set `definition/knowledge/draft-case` fixes, which excludes the version and the content hash publication assigns.
UNDERDETERMINED passes — a reader that carries every key it finds in the structured part onto the case under edit, a version or a content hash among them.
REMAINDER, from the binding — the second clause of `rule/knowledge/the-body-does-not-change-what-is-collected`, that anything which would change what is collected must be structured instead, is an obligation on whoever writes the case and no reader can enforce it.
REMAINDER belongs — the act of curating a case, where a curator decides where a fact goes, and not to any task that reads a file.
REMAINDER, from the binding — the clause that the prose never reaches any prompt reaches no criterion here, since the reader carries the prose and what is kept out of a prompt is decided where a prompt is built.
REMAINDER belongs — the task that assembles what a hypothesis's judgment reads, in the investigation act.
REMAINDER, from the binding — two rules of `context/knowledge` reach no criterion here, namely that every collected concept must accept the declared subject type and that every term a case names must already exist in the glossary, because this task constructs a case under edit and validates nothing.
REMAINDER belongs — `task/case-validation/concept-accepts-the-subject-type` and `task/case-validation/terms-exist-in-the-glossary`, under the epic that claims `rule/knowledge/concept-accepts-the-declared-subject-type` and `rule/knowledge/case-terms-exist-in-the-glossary`.
Decision, beyond the covers — stand: `rule/knowledge/concept-accepts-the-declared-subject-type` and `rule/knowledge/case-terms-exist-in-the-glossary` are `epic/case-validation`'s claim and are bound by its own tasks, this one being a reading and not a check.
REMAINDER, from the binding — the clause of `context/knowledge` that resolving the precedence is the case's own behaviour reaches no criterion, since reading only preserves what the file declared.
REMAINDER belongs — the task delivering how a case answers given the evaluations of its hypotheses, under the epic covering `definition/knowledge/case`.
Decision, beyond the covers — stand: `definition/knowledge/case` is `epic/case-publication`'s claim, and this plan builds no resolving behaviour over it.
From the binding — `rule/knowledge/the-fallback-follows-what-the-collection-returned` is a candidate this binding leaves unbound, because nothing in reading a case file selects a fallback, and `task/case-shape/draft-case-shape` binds it.
From the binding — criterion five's failure path runs into `rule/knowledge/a-validation-answers-with-every-refusal` and `definition/knowledge/refusal`, which is where the base says what a check answers over a case that did not hold, so this task's boundary is stated as reading only.
Decision, beyond the covers — stand: `rule/knowledge/a-validation-answers-with-every-refusal` and `definition/knowledge/refusal` are `epic/case-validation`'s claim, and every refusal is answered by `task/case-validation/refusal-and-accumulation`.
From the binding — a seam with `rule/knowledge/the-content-hash-covers-the-whole-file` stands unresolved by any bound node, since no bound node says whether the case under edit must keep the file's bytes, so a reader that normalised the prose it carries would matter to whichever task computes the hash.
Decision, beyond the covers — stand: `rule/knowledge/the-content-hash-covers-the-whole-file` is `epic/case-publication`'s claim and is bound by `task/case-publication/content-hash`, which digests the file's bytes rather than anything this reader carries.
From the binding — `definition/knowledge/hypothesis` declares the confirming criterion as prose sitting in the structured part, so criterion four's curator prose is the curator's audience alone and reading it as prose in general would drop each hypothesis's criterion from what the reader carries.
