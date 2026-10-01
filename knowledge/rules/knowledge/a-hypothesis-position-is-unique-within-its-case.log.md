---
entries:
- field: statement
  unstated: Moving the order into a position field says nothing about two hypotheses holding the same position, which the document's arrangement made impossible without any rule.
  decided: No two hypotheses of one case share a position.
  why: resolve-outcome needs a total order to have a first confirmed hypothesis at all; with positions free to collide, a tie would be settled by whichever row was read first, which is the ambiguity the declared order exists to remove.
- field: statement
  unstated: The status and error name of placing a hypothesis at an occupied position.
  decided: HTTP 409 reporting ManifestPositionOccupiedError.
  why: 'The material is siegard-reconcile/post-analyse-refusals-and-endings-drift.md, whose judge over src/errors/status-map.ts reported this refusal''s status and error name as decided in code alone. Same reasoning as a-case-has-at-most-one-draft: a state conflict, not a malformed request.'
- field: statement
  unstated: What a ManifestPositionOccupiedError discloses beyond its HTTP status and its error name -- neither which values its message names nor what its details carry was stated by any node. The rule settled the 409 and the error identity alone; the intake scope lists this class's current message but says nothing of the payload the HTTP error envelope carries beside it.
  decided: The message names the case slug, the version number and the position already occupied, and the details carry exactly those three values and nothing else.
  why: Those three are the whole of what a curator refused a placement needs in order to act on the refusal -- which case version's manifest refused it, and which position is not free -- and they are the same three the material already records this refusal's message as naming; nothing further is carried because every other fact about that manifest is reachable by reading the version itself, and the hypothesis whose entry occupies the position is a second aggregate's fact the refused placement never asked about.
---
