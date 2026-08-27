One wrong behavior in code already delivered, found by
siegard-reconcile/frontend-case-version-subject-field-drift.md's judgment over
frontend/app/src/routes/case-version-editor-form-fields.tsx against domain/knowledge/case-version.

The subject field is rendered unconditionally disabled ("Subject type (fixed)",
<Input {...register("subject")} disabled />), unlike every other declared-attribute field in the
same form, all of which use disabled={isBlocked}. domain/knowledge/case-version's own update-draft
operation and its Description state a draft's declared attributes "may likewise be corrected, as
many times as curation needs — the same freedom its manifest already holds." decision-log.md
(lines 378-382) names subject explicitly among the attributes update-draft lets a curator correct,
alongside title, when_to_use, fallback and consolidation_register.

Scope: case-version-editor-form-fields.tsx's subject field must honor disabled={isBlocked} the way
every other declared-attribute field in the form does, so a curator can correct a draft's subject
the same way they correct its other attributes. The label "Subject type (fixed)" must also stop
asserting the field is fixed. No other field or behavior in this file changes.
