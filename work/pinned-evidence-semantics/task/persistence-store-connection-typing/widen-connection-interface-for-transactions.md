---
title: runInTransaction and openTransaction accept a connect()-capable interface instead of the concrete
  pool type
summary: database-access.ts declares an interface capturing exactly the connect()-then-query()-then-release()
  shape runInTransaction and openTransaction actually use, and both functions' own connection parameter
  is typed to it instead of the concrete DatabaseConnection.
rationale: This task implements no specification node — the type a helper function's own parameter carries
  is not a domain fact. It is cut as its own task, ahead of and separate from either store's constructor
  retyping, because introducing the interface and retyping its two direct consumers (runInTransaction,
  openTransaction) is one seam; retyping a store's own constructor against that seam is a separate change
  to a different consumer, joined to this one only by a dependency edge.
sources:
- intake/standard-conformance-arc01-mnt03.md
objective: database-access.ts declares a connect()-capable interface narrower than the concrete DatabaseConnection
  type, and runInTransaction and openTransaction are typed against it instead of the concrete type, with
  no change to either function's own behavior.
criteria:
- database-access.ts declares an interface whose only members are query() (IQueryable's own shape) and
  connect(), where connect() answers something offering query() and release() — a shape the concrete DatabaseConnection
  (pg Pool) already satisfies today without any change to database-connection.ts.
- runInTransaction's own `connection` parameter is typed to this new interface, not the concrete DatabaseConnection.
- openTransaction's own `connection` parameter is typed to this new interface, not the concrete DatabaseConnection.
- Every existing call site that passes a concrete DatabaseConnection into runInTransaction still compiles
  unchanged, since DatabaseConnection already satisfies the new interface structurally.
- npm run typecheck exits 0 for the whole backend target source root.
- database-access.ts's own existing unit spec passes with no assertion or outcome changed.
---

## What it is
A new interface in database-access.ts, wide enough to cover connect()+query()+release() and narrow enough to exclude the rest of the concrete pg Pool surface, and runInTransaction/openTransaction retyped against it.
No store's own constructor changes here — this task only widens the two functions every store's own transactional method already calls through.

## Notes
None.
