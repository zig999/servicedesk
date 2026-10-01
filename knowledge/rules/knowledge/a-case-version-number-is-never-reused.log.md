---
entries:
- field: statement
  unstated: The material states that a discarded draft's version number is never reused as a described behavior of rollback, without saying whether this is a standing invariant or an implementation detail nobody has to honor.
  decided: A standing rule of the case aggregate, not an implementation detail.
  why: The whole reason the material insists rollback always mints a new, higher version rather than reactivating an old one is auditability; leaving the no-reuse guarantee as an unstated implementation detail would let a future implementation derive the next number from whichever rows happen to still exist, silently reopening exactly the ambiguity rollback's own discipline exists to close.
---
