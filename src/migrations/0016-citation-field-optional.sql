ALTER TABLE investigation_evaluation_citations
  DROP CONSTRAINT investigation_evaluation_citations_pkey;

ALTER TABLE investigation_evaluation_citations
  ALTER COLUMN field DROP NOT NULL;

ALTER TABLE investigation_evaluation_citations
  ADD COLUMN id BIGINT GENERATED ALWAYS AS IDENTITY;

ALTER TABLE investigation_evaluation_citations
  ADD CONSTRAINT investigation_evaluation_citations_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX investigation_evaluation_citations_natural_key
  ON investigation_evaluation_citations (investigation_id, hypothesis, concept, field);
