---
statement: Every list operation a published api offers answers one page selected by an optional non-negative integer offset, defaulting to 0, and an optional positive integer limit, defaulting to a configured default and clamped to a configured maximum; the answer carries the page's data, the total currently held, and the offset, limit and page count applied.
scope: system
fitness: An automated test calls a listing with no offset and no limit and asserts the answer carries data, total, offset 0, the configured default limit and a page count; calls it with a limit above the configured maximum and asserts the applied limit is the maximum.
---

## Description

The contracts describe each listing as every record currently held, and that stays what a caller can learn — in pages, not in one answer.
The default and the maximum are deployment configuration, not business figures, so this constraint names that they exist and never their values.
A page count of zero is what a total of zero yields; no request with a non-positive limit reaches the count, because a-malformed-request-is-refused-with-a-validation-error refuses it first.
