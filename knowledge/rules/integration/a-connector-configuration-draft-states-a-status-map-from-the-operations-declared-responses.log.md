---
entries:
- field: statement
  unstated: The material maps a declared 2xx status to ok, 401, 403 and 407 to denied, every other 4xx and every 5xx to unavailable, and says nothing of a declared 1xx or 3xx status.
  decided: Every numeric status outside 200 through 299 and outside 401, 403 and 407 is drafted unavailable, a declared 1xx or 3xx status included.
  why: an-unclassified-status-ends-unavailable already ends any status the statusMap does not classify as unavailable, so drafting a 1xx or 3xx the same way states the ending it would take at observation and invents no fourth reading of a status the material never mentioned.
- field: statement
  unstated: No node states which keys of the chosen operation's responses object count as numeric HTTP status codes — the rule drafts one statusMap entry per numeric status key and the reading-note kinds name only a default key and a status-range key, leaving a purely numeric key such as 42 or 600 belonging to neither side of that reading.
  decided: A key of the responses object is a numeric HTTP status code when it is a three-digit decimal number from 100 through 599, and a purely numeric key outside that range is not one and is drafted into no statusMap entry.
  why: 100 through 599 is the whole of the space an observation's own status can fall in, so an entry drafted for a key outside it is one the runtime status match can never reach — the same reason a 2XX range key is drafted into no entry — while a three-digit decimal bound is decidable from the key's text alone, as the draft reads every other key of the responses object.
---
