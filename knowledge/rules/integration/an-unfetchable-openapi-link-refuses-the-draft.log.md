---
entries:
- field: statement
  unstated: The rule already names a timeout as one of the three fetch failures that refuse a draft, but no node states how long the named OpenAPI document link may go unanswered before the backend abandons the fetch as a timeout, nor which unit it is counted in.
  decided: 60000 milliseconds (sixty seconds) from the fetch beginning, after which the fetch is abandoned as a timeout and the draft is refused naming the fetch failure.
  why: Sixty seconds is the figure this specification already holds for abandoning an outward call to a far end the system does not control and whose own bound nobody declared -- a-capability-declares-its-contract's absent-timeout default, and a-collected-concept-declares-a-ttl's default beside it -- and the application publishing an operator-supplied OpenAPI document is external in that same sense. Reusing it leaves one figure for that wait instead of two, and milliseconds is the unit every duration here is already counted in. The investigation's own deadlines were deliberately not reused -- they clamp stages of one attendant-facing diagnosis, while drafting is a one-off authoring read that enters no deadline chain and no investigation ever reads.
---
