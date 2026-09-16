---
type: policy
statement: >-
  A case comes into existence only through a create-draft naming a slug no case yet
  holds, which creates the case under exactly the slug that act carries — never one the
  system derives — together with that case's first version numbered 1, leaving the
  case's next_version at 2; a create-draft naming a slug some case already holds creates
  no second case and originates that existing case's next draft instead.
expression: >-
  For a create-draft naming slug s: where no case holds s, a case is created whose slug
  is exactly s as the act carried it, a case version numbered 1 referencing that case is
  created with it, and that case's next_version stands at 2 once the act settles; where a
  case c already holds s, no second case is written and the act originates c's next draft
  instead.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
consistency: eventual
---

## Description

No node said how a case starts existing. `domain/knowledge/case` declares the slug and next_version a case is known by and names create-draft among its operations, but its own Responsibility describes that act as originating a draft "when a curator starts revising it" — a case already named — and `contracts/knowledge/case-lifecycle` publishes create-draft as "start a draft" without saying what answers a slug no case holds yet. `a-case-listing-offers-a-route-to-author-a-new-case-on-every-reading` already reads create-draft as "the act that originates a case's first draft", and `a-case-authoring-surface-offers-no-submission-while-required-content-is-absent` already counts "the case's own slug" among the content that act requires; this rule is where those two readings become the case's own stated origin instead of descriptions standing in another rule's prose.

One act, not two. create-draft over an already-named case is an act other nodes require to exist: `contracts/knowledge/case-lifecycle` states that revising a released case always starts the next draft, `domain/knowledge/case`'s Responsibility gives the identity exactly that job, and `a-case-has-at-most-one-draft` refuses create-draft with CaseAlreadyHasDraftError only where the case already holds a draft — a refusal nothing could ever reach if naming an existing slug were itself refused. So a create-draft naming a slug some case holds is answered with that case's next draft, never with a second case and never with a refusal on the slug's account; the only refusal it meets over that slug is the one `a-case-has-at-most-one-draft` already states, and `a-slug-identifies-one-case` stays true because no act here ever writes a second case under a slug.

The slug is the curator's, never derived. `a-slug-identifies-one-case` makes it the case's identity, every pin an investigation holds names it, and `a-case-listing-answers-cases-in-slug-order` makes it the order a curator reads the whole catalog in — a name meant to be read and predicted by whoever addresses the case, which a system-minted one cannot supply. `a-case-authoring-surface-offers-no-submission-while-required-content-is-absent` already withholds the submitting act while the slug's own field is empty, which only reads true where the act carries a slug the curator typed.

Numbering follows from the counter already declared. `domain/knowledge/case` states next_version as the number this case's next draft is assigned, always greater than every number the case has ever held, and `a-case-has-at-most-one-draft` states that number is assigned the moment the draft is created rather than at release. A creation that wrote the first version as 1 and left next_version at 1 would hand the case's second draft the number 1 again, which `a-case-version-number-is-never-reused` forbids outright — so the creating act leaves next_version one past the number it has just issued. The first number is 1 rather than 0 because that number is a pin a curator reads and an investigation records — `a-successful-case-version-creation-lands-on-the-created-versions-own-surface` takes the curator to the surface keyed on exactly it — and because `domain/knowledge/case-summary`'s version_count counts the versions a case currently holds, so starting at 1 keeps the number a reader sees and the count that reader is shown agreeing for a case that has discarded nothing.

What the created version starts holding is not decided here: `a-new-drafts-manifest-is-copied-from-an-existing-version` already gives a case's first-ever draft no manifest to copy and so an empty one, and the title, when_to_use, subject and fallback the act carries are the required content `a-case-authoring-surface-offers-no-submission-while-required-content-is-absent` already names against `domain/knowledge/case-version`'s own declarations. The rule adds no field, refuses no call, moves no pin and changes no listing.

Consistency is eventual: the fact spans the case identity and the version the same act creates, each an aggregate root read on its own.
