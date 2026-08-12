-- domain/investigation/investigation and the value objects it carries
-- whole — domain/investigation/subject, domain/investigation/cost,
-- domain/investigation/durations and domain/investigation/assessment
-- (itself carrying domain/knowledge/referral) — plus the ones it carries
-- many of — domain/investigation/evidence, domain/investigation/evaluation,
-- domain/investigation/citation and
-- domain/investigation/subject-attribute-value — and the three
-- enumerations judgment and collection produce:
--   domain/investigation/verdict
--   domain/investigation/evidence-result
--   domain/investigation/evaluation-reason

-- investigation.subject (required) flattens its own "type" attribute into
-- subject_type; its "attributes" (many) is investigation_subject_attribute_values,
-- below. investigation.assessment (required) flattens outcome, and from
-- assessment.referral, action and recipient, plus determining_hypothesis
-- (the one attribute assessment.md declares optional) and text.
-- investigation.cost and investigation.durations flatten the same way. The
-- pinned-case relationship is pinned by slug and version, referencing the
-- one case_versions row that content names.
CREATE TABLE investigations (
  id                                  TEXT NOT NULL,
  requester                           TEXT NOT NULL,
  ticket_ref                          TEXT,
  narrative                           TEXT NOT NULL,
  subject_type                        TEXT NOT NULL REFERENCES subject_types (name),
  prompt_version                      TEXT NOT NULL,
  model                               TEXT NOT NULL,
  pinned_case_slug                    TEXT NOT NULL,
  pinned_case_version                 INTEGER NOT NULL,
  assessment_outcome                  TEXT NOT NULL REFERENCES outcomes (name),
  assessment_action                   TEXT NOT NULL REFERENCES actions (name),
  assessment_recipient                TEXT NOT NULL REFERENCES recipients (name),
  assessment_determining_hypothesis   TEXT,
  assessment_text                     TEXT NOT NULL,
  cost_calls                          INTEGER NOT NULL,
  cost_input_tokens                   INTEGER NOT NULL,
  cost_output_tokens                  INTEGER NOT NULL,
  durations_collection                INTEGER NOT NULL,
  durations_judgment                  INTEGER NOT NULL,
  durations_writing                   INTEGER NOT NULL,
  durations_total                     INTEGER NOT NULL,
  written_at                          TIMESTAMPTZ NOT NULL,
  CONSTRAINT investigations_pkey PRIMARY KEY (id),
  CONSTRAINT investigations_pinned_case_fkey
    FOREIGN KEY (pinned_case_slug, pinned_case_version)
    REFERENCES case_versions (slug, version)
);

-- investigation.evidence (many domain/investigation/evidence), "identified
-- within the investigation by its concept" per its own description.
-- result_detail is the one attribute evidence.md declares optional.
CREATE TABLE investigation_evidence (
  investigation_id    TEXT NOT NULL REFERENCES investigations (id),
  concept             TEXT NOT NULL REFERENCES concepts (name),
  inputs              TEXT NOT NULL,
  observation         TEXT NOT NULL,
  observed_at         TIMESTAMPTZ NOT NULL,
  ttl                 INTEGER NOT NULL,
  origin              TEXT NOT NULL,
  result              TEXT NOT NULL,
  result_detail       TEXT,
  capability_name     TEXT NOT NULL,
  capability_version  TEXT NOT NULL,
  CONSTRAINT investigation_evidence_pkey PRIMARY KEY (investigation_id, concept),
  CONSTRAINT investigation_evidence_result_check
    CHECK (result IN ('ok', 'unavailable', 'denied', 'timeout')),
  CONSTRAINT investigation_evidence_capability_fkey
    FOREIGN KEY (capability_name, capability_version)
    REFERENCES capabilities (name, version)
);

-- investigation.evaluations (many domain/investigation/evaluation),
-- "identified by the hypothesis name within the pinned case" per its own
-- description. reason is the one attribute evaluation.md declares
-- optional.
CREATE TABLE investigation_evaluations (
  investigation_id  TEXT NOT NULL REFERENCES investigations (id),
  hypothesis         TEXT NOT NULL,
  verdict            TEXT NOT NULL,
  reason             TEXT,
  CONSTRAINT investigation_evaluations_pkey PRIMARY KEY (investigation_id, hypothesis),
  CONSTRAINT investigation_evaluations_verdict_check
    CHECK (verdict IN ('confirmed', 'refuted', 'inconclusive')),
  CONSTRAINT investigation_evaluations_reason_check
    CHECK (reason IN ('no-data', 'judgment-failure', 'deadline-exceeded'))
);

-- evaluation.citations (many domain/investigation/citation).
CREATE TABLE investigation_evaluation_citations (
  investigation_id TEXT NOT NULL,
  hypothesis       TEXT NOT NULL,
  concept          TEXT NOT NULL REFERENCES concepts (name),
  field            TEXT NOT NULL,
  CONSTRAINT investigation_evaluation_citations_pkey
    PRIMARY KEY (investigation_id, hypothesis, concept, field),
  CONSTRAINT investigation_evaluation_citations_evaluation_fkey
    FOREIGN KEY (investigation_id, hypothesis)
    REFERENCES investigation_evaluations (investigation_id, hypothesis)
);

-- subject.attributes (many domain/investigation/subject-attribute-value).
CREATE TABLE investigation_subject_attribute_values (
  investigation_id TEXT NOT NULL REFERENCES investigations (id),
  attribute        TEXT NOT NULL REFERENCES subject_attributes (name),
  value            TEXT NOT NULL,
  CONSTRAINT investigation_subject_attribute_values_pkey
    PRIMARY KEY (investigation_id, attribute, value)
);
