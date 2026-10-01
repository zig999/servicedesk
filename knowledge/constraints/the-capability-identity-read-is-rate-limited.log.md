---
entries:
- field: statement
  unstated: The material asks for a limit "per client" but this build verifies no caller's claimed identity (no-route-enforces-authentication) — so "one caller" needs a concrete meaning the material itself never supplies.
  decided: One caller means one source IP address making the request; the limit and the refusal it triggers are keyed on that address, not on any claim the request body carries.
  why: A claimed identity is exactly what no-route-enforces-authentication already says this build never verifies, so keying a limit meant to hold back an unbounded loop on the one thing a caller supplies unverified would let the limit be defeated by simply claiming a different identity on every request. The connection's own source address is the one property of a request this build does not take on the caller's word.
- field: statement
  unstated: The statement did not carry what one caller means or what value the 429 response names, although this log already decided the caller is the source IP address.
  decided: One caller is one source IP address; the refusal carries a Retry-After value.
  why: The earlier entry for this field decided the source address and the statement never carried it, so a reader of the node could not find the decision; Retry-After is the value the delivered route answers and the ordinary way an HTTP response names when to retry.
---
