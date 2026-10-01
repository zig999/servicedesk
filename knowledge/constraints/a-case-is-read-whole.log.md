---
entries:
- field: statement
  unstated: Retiring the one-JSON-document constraint says the case stops being stored whole; it does not say whether the aggregate may now be read in pieces.
  decided: A case is read whole, in one transaction, or not at all.
  why: What kept hypotheses, resolutions and referrals arriving together was the document rather than any decision, so retiring the document silently retires the guarantee; a partially loaded case has a short collection plan and a holed precedence order, and resolve-outcome would answer from it without anything failing.
---
