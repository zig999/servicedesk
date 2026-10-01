---
entries:
- field: type
  unstated: The material classifies the case as a value object identified by content, while also giving it composition of named hypotheses, outside references to it, and its own behavior.
  decided: aggregate-root
  why: Content identity is still identity — the domain cares which case answered — and only an aggregate root can own entities by name, be referenced from another aggregate, and carry the declared operations.
- field: attributes.version.type
  unstated: The material shows a version in the case pin without stating its form.
  decided: integer
  why: Versions are counted at each change of the file; a count is an integer.
- field: attributes.consolidation_register.required
  unstated: The material says the curator authors this alongside the hypotheses but does not say whether every case must declare one.
  decided: Not required.
  why: Forcing every existing case to declare a register retroactively is a burden the material never asks for; an absent register defers to whatever the consolidation adapter's own default carries, the same absence-is-data convention domain/investigation/assessment already uses for determining_hypothesis.
- field: attributes
  unstated: Version history used to be readable from the commits that produced the files; with the file gone, the material does not say whether a case version records when it was authored.
  decided: authored_at, a required datetime.
  why: Curation history was a fact of the version control the case no longer lives in, and an audit of which procedure was current when an old investigation ran needs it; the alternative was leaving a column no attribute declares, which constraints/the-stored-schema-mirrors-the-declared-model refuses.
- field: attributes
  unstated: The material describes a case's identity as distinct from any one of its versions, and gives the identity a next-draft behavior, but does not say whether it carries any attribute of its own beyond the slug.
  decided: slug alone.
  why: Everything the material once described as belonging to "the case" beyond bare identity — title, when-to-use, subject, fallback, its hypotheses — is now explicitly per-version or per-hypothesis; nothing the material states is a fact of the identity itself, and inventing one would be exactly the kind of technical bookkeeping this class refuses.
- field: attributes
  unstated: An earlier entry in this same log decided the case identity carries no attribute beyond slug, reasoning that a durable version-number counter was technical bookkeeping with no domain home. /plan-work's own execution-contract-binder later found this in direct conflict with a task built from the human-authored implementation scope, which requires exactly such a counter to satisfy a-case-version-number-is-never-reused (a version number, once issued, is never reused even after its draft is discarded — which a counter derived only from currently-existing rows cannot guarantee). The conflict was reported as a BLOCKING note, and the human explicitly chose to settle it by extending the specification rather than loosening the scope's own criterion.
  decided: The case identity gains a required attribute, next_version, an integer — the counter that assigns each new draft's version number, always greater than every version number the case has ever held, including one later discarded. This reverses the earlier "slug alone" entry rather than replacing it, since that entry is not itself wrong about anything the material stated in analysis, only insufficient once a-case-version-number-is-never-reused's own guarantee needed a durable, unambiguous home the analysis had not yet been asked to consider.
  why: The human's own explicit instruction, given the two paths a BLOCKING note offers (loosen the scope's criterion, or extend the specification) — this is the "extend the specification" path, chosen over asking whoever authors the scope to retract a criterion that is itself sound engineering, just previously homeless in the domain model.
- field: operations
  unstated: Whether the case aggregate declares any operation beyond create-draft.
  decided: delete is added to the case's own operations.
  why: a-case-holding-no-version-may-be-deleted gives the case a second act; the identity that originates a draft is the same identity that ends when nothing is left to hold.
---
