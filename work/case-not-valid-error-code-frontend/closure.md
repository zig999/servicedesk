The human declared this initiative over, answering a list that offered closing it among other
things, after its one task had gone through delivery, review and re-delivery.
The ask is recorded verbatim at intake/close-ask.md.
The initiative held one corrective increment: error-code-mapping-keys-on-the-current-name, keying
the frontend's error-code mapping on CaseVersionNotValidError, the name the backend's refusal has
carried since it was renamed, so a case whose current version fails a validator rule reaches the
curator as itself rather than as the generic error state.
One node was written into the specification on the way, through the decided-fact route, and
disclosed as decision-log entry 200: what a case-keyed surface presents for a refusal whose error
code it holds no presentation of its own for.
The delivery validates with zero criteria recorded unmet.
Three things stand at closing and are recorded here rather than left to be rediscovered.
The review's three findings were all answered by the re-delivery: two spec helpers that modelled
the refusal at HTTP 422 where the node fixes it at 409, and a describe block naming the function
rather than the behaviour.
Two coverage entries stay open, named in the proof's own `untested`: criterion 4's "presented
alike" is proven at the level of wording and mutual exclusivity but not of role, severity or
container, and criterion 5's "nor anything derived from them" has no derived value in the tree to
exercise.
The re-delivery's first suite run went red on a race in use-connector-configuration-detail.ts that
this initiative never touched; it was corrected under its own initiative rather than worked around
here, and both runs are on disk under their own names.
