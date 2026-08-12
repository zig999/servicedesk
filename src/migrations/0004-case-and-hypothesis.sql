-- domain/knowledge/case, domain/knowledge/hypothesis,
-- domain/knowledge/resolution, domain/knowledge/referral and
-- domain/knowledge/consolidation-register, and the invariants that used to
-- be kept by the file system:
--   rules/knowledge/a-slug-identifies-one-case
--   rules/knowledge/a-case-version-is-written-once
--   rules/knowledge/a-hypothesis-position-is-unique-within-its-case
--   rules/knowledge/a-hypothesis-name-is-unique-within-its-case
--
-- "cases" holds one row per slug — the case's own identity, and nothing
-- else it declares belongs to the identity rather than to one written
-- version. Every other attribute case.md declares belongs to
-- "case_versions", whose primary key over (slug, version) is the unique
-- key rules/knowledge/a-case-version-is-written-once needs: a version
-- already stored cannot be stored a second time under the same key.

CREATE TABLE cases (
  slug TEXT NOT NULL,
  CONSTRAINT cases_pkey PRIMARY KEY (slug)
);

-- case.fallback (resolution, required) flattens into fallback_outcome and,
-- from resolution.referral, fallback_action and fallback_recipient.
-- case.consolidation_register is the one attribute case.md declares
-- optional, so it is the one column here that admits an absent value, and
-- it is restricted to its enumeration's two declared values.
CREATE TABLE case_versions (
  slug                    TEXT NOT NULL REFERENCES cases (slug),
  version                 INTEGER NOT NULL,
  title                   TEXT NOT NULL,
  when_to_use             TEXT NOT NULL,
  authored_at             TIMESTAMPTZ NOT NULL,
  subject                 TEXT NOT NULL REFERENCES subject_types (name),
  fallback_outcome        TEXT NOT NULL REFERENCES outcomes (name),
  fallback_action         TEXT NOT NULL REFERENCES actions (name),
  fallback_recipient      TEXT NOT NULL REFERENCES recipients (name),
  consolidation_register  TEXT,
  CONSTRAINT case_versions_pkey PRIMARY KEY (slug, version),
  CONSTRAINT case_versions_consolidation_register_check
    CHECK (consolidation_register IN ('formal', 'plain'))
);

-- domain/knowledge/hypothesis: named uniquely within its case and placed at
-- one position in its case's precedence. hypothesis.resolution flattens the
-- same way case.fallback does, into resolution_outcome, resolution_action
-- and resolution_recipient.
CREATE TABLE hypotheses (
  case_slug            TEXT NOT NULL,
  case_version         INTEGER NOT NULL,
  name                 TEXT NOT NULL,
  position             INTEGER NOT NULL,
  criterion            TEXT NOT NULL,
  resolution_outcome   TEXT NOT NULL REFERENCES outcomes (name),
  resolution_action    TEXT NOT NULL REFERENCES actions (name),
  resolution_recipient TEXT NOT NULL REFERENCES recipients (name),
  CONSTRAINT hypotheses_pkey PRIMARY KEY (case_slug, case_version, name),
  CONSTRAINT hypotheses_position_unique UNIQUE (case_slug, case_version, position),
  CONSTRAINT hypotheses_case_fkey FOREIGN KEY (case_slug, case_version)
    REFERENCES case_versions (slug, version)
);

-- hypothesis.collects (many domain/glossary/concept): one row per concept
-- one hypothesis collects.
CREATE TABLE hypothesis_collects (
  case_slug       TEXT NOT NULL,
  case_version    INTEGER NOT NULL,
  hypothesis_name TEXT NOT NULL,
  concept_name    TEXT NOT NULL REFERENCES concepts (name),
  CONSTRAINT hypothesis_collects_pkey
    PRIMARY KEY (case_slug, case_version, hypothesis_name, concept_name),
  CONSTRAINT hypothesis_collects_hypothesis_fkey
    FOREIGN KEY (case_slug, case_version, hypothesis_name)
    REFERENCES hypotheses (case_slug, case_version, name)
);
