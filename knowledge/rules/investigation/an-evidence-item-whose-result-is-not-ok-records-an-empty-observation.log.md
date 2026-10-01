---
entries:
- field: statement
  unstated: domain/investigation/evidence declares observation a required string and rules/investigation/an-observation-is-recorded-as-json-object-text fixes its content only for an item that ended ok; domain/investigation/evidence-result already holds what a reader may take from a non-ok item's observation — only ok carries a usable one, the other three being facts about the attempt — while no node states what that required string itself records when the result is a timeout, a denial or an unavailability.
  decided: The empty JSON object text `{}` — never an empty string, never an absent value and never a message or error name — from which a reader parsing it takes no observed field to read or cite, reading the cause from the item's result and result_detail instead.
  why: The observation string is parsed as one JSON object wherever it is read, so the only value that keeps every item on that one parse path is a well-formed object carrying no field; an empty string or an absent value would be indistinguishable from an observation never recorded, and a cause rendered into the field a reader parses for observed data would be read as data the collection never returned.
---
