---
title: Reading a case file
summary: One case file read into a case under edit out of its frontmatter alone, with everything below the closing delimiter reaching nothing, or answered with one read failure naming where the frontmatter did not parse.
objective: Reading a case file yields a case under edit built from that file's frontmatter and from nothing below it, or, where the frontmatter does not parse, one read failure naming where it broke and no case under edit.
rationale: 'The decomposition split reading the file from declaring the shape because the file format and the declared shape change for different reasons, and the rule that keeps what the curator writes below the delimiter out of what is collected is a property of the reading. The read failure is cut into this task rather than beside it because the reading is one total answer over one file — a case under edit or a failure of reading — and no other act can produce the second half. The criterion that carried the body onto the case under edit was removed after a binder found the base refuses it: everything a case declares sits in the frontmatter, the body holds nothing it declares, and no parse retaining the curator prose is the stated reason the content hash is taken over the file''s bytes. The two criteria on a frontmatter that parses but under-declares were added in the same pass, because only a parse failure yields no case under edit and three rules of the base presuppose that a case with an empty hypothesis list reaches the validation and is refused there.'
sources:
- intake/scope.md
- intake/scope-2026-08-07.md
criteria:
- Reading a case file yields a case under edit holding what that file's frontmatter declared.
- A case under edit is read from exactly one case file.
- The boundary between what the case declares and what only the curator reads is the frontmatter's opening and closing delimiters.
- Nothing below the frontmatter's closing delimiter reaches the case under edit.
- A concept listed below the closing delimiter is not collected by the case under edit.
- Two case files whose frontmatter is byte-identical and whose text below the closing delimiter differs yield cases under edit that are equal.
- A hypothesis's confirming criterion is read out of the frontmatter, because the case declares it, though it is prose.
- The order in which the frontmatter declares the hypotheses is the order the case under edit carries them in.
- A file whose frontmatter parses yields a case under edit, even where that frontmatter declares less than a case under edit requires.
- A file whose frontmatter parses and declares an empty hypotheses list yields a case under edit, and no read failure.
- A file whose frontmatter does not parse yields no case under edit.
- A file whose frontmatter does not parse yields exactly one read failure, and not one per check.
- That read failure carries the line at which the parse broke.
- That read failure carries the column at which the parse broke.
- That read failure carries a text written for the curator.
- The text a read failure carries is written in Portuguese.
- A file whose frontmatter does not parse yields no refusal.
- A read failure names no rule.
- No check of the validation runs over a file whose frontmatter does not parse.
depends_on:
- task/case-shape/draft-case-shape
nodes:
- node: definition/knowledge/draft-case
  digest: sha256:9c3360b04b1eb11db3c2d54299b2909173b3ec7bfdfb6a4e5d47e69acbc668e9
- node: definition/knowledge/hypothesis
  digest: sha256:690eee99a05f5f75e890b6f1f06c278656b0fabd56ab9f6aac158dfdce3b065d
- node: definition/knowledge/read-failure
  digest: sha256:2acd7a3cac361d7d576b61f8d3cf04601a3aa4bacba5207359496189e3d8a39f
- node: definition/knowledge/referral
  digest: sha256:7d74b30fc7b7813597b165588a4f8f5b7652235ebac9e320fa49a573f7eb9261
- node: definition/knowledge/resolution
  digest: sha256:ce017e6342d08120ef1290be156eff861490e031d0e210d96cae2f5bc9f4f1bb
- node: rule/knowledge/a-case-is-one-file
  digest: sha256:58b96adc27a29ee585501b48210ed953e0575736fe400d200014277e8a4e6593
- node: rule/knowledge/an-unreadable-case-is-not-validated
  digest: sha256:a92f0fac8b5d14e69a456964e92e5a5899a13f8a003b5990581d2e5eeaaea977
- node: rule/knowledge/hypotheses-are-ordered-by-precedence
  digest: sha256:c5c1b66cff9265e8aa17c2be46f42bd4377e73801e215d95379cae6d60458fcb
- node: rule/knowledge/the-body-does-not-change-what-is-collected
  digest: sha256:42b51e33096a9e14dcac0a41ed89a24dc67624b87c2d6a34b3b191dd0b0fac8d
- node: rule/knowledge/the-frontmatter-holds-everything-the-case-declares
  digest: sha256:af27062ec0659e5923df7cee3e5e76546189d4f9cd525766a9cdf42588c7bdda
- node: rule/knowledge/what-the-curator-reads-is-written-in-portuguese
  digest: sha256:46716746cab8ff38b085f7267455aa6ea6b4ec1fa354479227cff3f2ec68cae9
waived:
- gap: rule/knowledge/hypotheses-are-ordered-by-precedence#examples
  why: The absent examples would name which cause dominates which, and this task only carries the declared order of the hypotheses across from the frontmatter into the case under edit unchanged. The reading neither interprets nor checks the precedence — the node itself states no validator can check it and that it is left to human review — so no example of a dominating cause changes what this task reads or what it yields.
---
## What it is

One markdown file read into the case a curator is editing.
Everything the case declares is read out of the file's frontmatter, and everything below the closing delimiter reaches nothing at all.
A file whose frontmatter does not parse produces no case, one error, and a text saying where it broke.

## Notes

Prose and body are not one word here: a hypothesis's confirming criterion is prose the case declares, so it is read out of the frontmatter, and a reader that took the two words for one would drop it.
Criterion four is the strong form and it replaces the criterion that carried the body onto the case under edit; the two could not both stand, and the base holds the one that refuses.
Whether `curator_notes` is a frontmatter key or the text below the closing delimiter is a fact no node states, and no criterion here decides it — the rule's own example puts a curator's note below the delimiter while the case declares `curator_notes` as an attribute, which the same rule places above it, and the contradiction is settled in the base rather than by this cut.
Criteria nine and ten mark where reading stops and validating begins: an under-declared case is a case the validation refuses, never a file the reading rejects, and the check on an empty hypothesis list is refused as a validation only because the reading produced something for it to walk.
The read failure carries a text and that text is Portuguese because the base states both of a read failure by name; what that text says is stated nowhere, and no criterion here supplies it.
The hash over the whole file, curator prose included, is cut in the publication epic and reads the file rather than anything this reader carries — which is now the only way it could work, since this reader carries nothing of what sits below the delimiter.
That a case's slug matches the name of the file it was read from is a check the base registers and this plan does not build; it is declared uncovered on the validation epic.
UNDERDETERMINED, from the binding — nothing in the criteria says where the case under edit's values come from when the frontmatter declared none, and a reader that filled the slug from the file name would make the check that compares the two one that can never refuse.
UNDERDETERMINED passes — a reader that supplies a value for a required attribute the frontmatter did not declare, most concretely filling the slug from the case file's name, and generally substituting an empty string or an empty list so every case under edit satisfies the declared required-ness.
REMAINDER, from the binding — the kept-under-version-control clause of `rule/knowledge/a-case-is-one-file` and its body clause about the content hash reach no criterion; a reader of one file demonstrates nothing about how that file is versioned or hashed.
REMAINDER belongs — the act that keeps the case files under version control, and `task/case-publication/content-hash`, which hashes the file.
REMAINDER, from the binding — that the declared order is the affirmed precedence reaches no criterion, and the node states no validator can check it.
REMAINDER belongs — the specialists' own review of the case, which the base names as one of two things it leaves to human review.
REMAINDER, from the binding — of the three texts `rule/knowledge/what-the-curator-reads-is-written-in-portuguese` names, criteria 15 and 16 reach the read failure only; the refusal clause, the unavailable-check clause, and the body clause that a refusal's text comes from its rule reach nothing here, since this read failure names no rule.
REMAINDER belongs — `task/case-validation/refusal-and-accumulation` for the refusal, and `task/case-publication/unavailable-contract-check` for the unavailable answer.
REMAINDER, from the binding — that a resolution is never produced during an investigation and that a referral may not be seen before the investigation has a record reach no criterion; this reading builds both values out of the frontmatter and observes nothing about when they are produced or seen.
REMAINDER belongs — the investigation act, under `context/investigation`, which this plan does not build.
Decision, beyond the covers — stand: `definition/knowledge/refusal` and `rule/knowledge/the-slug-matches-the-file-name` are `epic/case-validation`'s claim — the first bound by `task/case-validation/refusal-and-accumulation`, the second declared uncovered there — `definition/knowledge/check-unavailable` and `definition/knowledge/case` are `epic/case-publication`'s, the five glossary definitions are `epic/published-language-ports`', and `context/investigation` is outside this plan entirely; naming them here records where the unreached clauses land rather than growing this epic over work it does not build.
From the binding — `context/knowledge` is a candidate left unbound, because everything it says that reaches these criteria is said more precisely by nodes bound here and its own three rules are validation and execution; if no other task of `epic/case-shape` binds it, the epic must declare it uncovered for coverage to reconcile.
From the binding — no candidate node names the concrete syntax this reader must parse, and the partition rule's own rationale says the analysis read the partition as a fact of the domain rather than one of format; the delimiter token, the structured format itself and the indexing convention of the read failure's line and column are therefore the project's own standard's and not a question for `/analyse-domain`.
From the binding — criterion 6 requires two cases under edit to be equal and no candidate states an equality over them; under the declared identity two files with byte-identical frontmatter are equal by slug alone, which would make criterion 6 falsify nothing criterion 4 does not already falsify, while structural equality over the declared attributes invents no domain fact.
From the binding — `definition/knowledge/draft-case` declares every attribute required and a minimum of one hypothesis, while criteria 9 and 10 require a case under edit that satisfies neither; the candidates reconcile it, but no candidate says outright that those attribute constraints are the validation's to enforce and not the reader's, and an implementer handed the definition as a schema answers criterion 10 with a read failure by default.
From the binding — five of the attributes this reader must read are by-identity refs whose target nodes are outside the candidates, so if the executor must know what identifies a concept or an outcome, that fact lives where this task may not bind and the epic's claim has to grow.
