---
subject: contracts/knowledge/case-query
given:
  - a case exists whose one and only version was discarded, so it currently holds no version at all
when:
  - the curator lists that case's versions through list-case-versions
then:
  - the read states explicitly that this case currently holds no version
  - it is never an empty listing with nothing said about why
involves:
  - domain/knowledge/case
  - domain/knowledge/case-version
---

## Description

only-a-draft-case-version-may-be-discarded lets a case's one and only draft be discarded, and a-case-version-number-is-never-reused confirms the case survives that with its slug and its next_version counter intact — so the case a curator names still exists while list-case-versions has nothing left to return for it. An empty listing reads the same whether the case never held a version, held one now discarded, or the curator named a slug list-case-versions cannot resolve at all; only an explicit statement that this case currently holds no version tells the difference, instead of leaving the curator to guess whether the read is still pending or something failed unannounced.
