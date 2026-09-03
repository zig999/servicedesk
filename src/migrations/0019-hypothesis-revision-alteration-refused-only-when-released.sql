DROP RULE hypothesis_revisions_no_update ON hypothesis_revisions;

CREATE FUNCTION hypothesis_revisions_refuse_when_released()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM case_version_hypotheses cvh
    JOIN case_versions cv
      ON cv.slug = cvh.case_slug AND cv.version = cvh.case_version
    WHERE cvh.case_slug = OLD.case_slug
      AND cvh.hypothesis_name = OLD.hypothesis_name
      AND cvh.revision = OLD.revision
      AND cv.state = 'released'
  ) THEN
    RAISE EXCEPTION 'ReleasedHypothesisRevisionNotAlterableError';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hypothesis_revisions_no_update_when_released
  BEFORE UPDATE ON hypothesis_revisions
  FOR EACH ROW
  EXECUTE FUNCTION hypothesis_revisions_refuse_when_released();
