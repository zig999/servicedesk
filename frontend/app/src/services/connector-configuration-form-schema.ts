/**
 * The client-side validation schema for the Connector Configuration
 * create/edit form
 * (task/connector-configuration-authoring/connector-configuration-create-edit-form):
 * the one attribute react-hook-form governs directly, `connector` --
 * domain/integration/connector-configuration's own identifying attribute,
 * mirrored from src/src/http/dto/register-connector.dto.ts's own
 * registerConnectorParamsSchema (`z.string().min(1)`, read from the path on
 * the wire rather than the body), the same convention capability-form-schema.ts
 * already keeps for a path-carried identity field this form's operator types
 * (create mode) or sees pre-filled and disabled (edit mode,
 * use-connector-configuration-form.ts's own header comment).
 *
 * `configuration` is deliberately absent from this schema: it is edited
 * through the shared JsonTextareaField (json-textarea-field.tsx), whose own
 * onChange already reports whether the current text is syntactically valid
 * JSON (criterion 4; rules/integration/a-connector-configuration-holds-a-well-formed-object)
 * -- use-connector-configuration-form.ts tracks its text and validity as
 * plain component state instead of a zod-validated form field, and blocks
 * submission while it is invalid, mirroring use-capability-form.ts's own
 * reasoning for input_schema/output_schema exactly.
 */

import { z } from "zod";

export const connectorConfigurationFormSchema = z.object({
  connector: z.string().min(1),
});

export type ConnectorConfigurationFormValues = z.infer<
  typeof connectorConfigurationFormSchema
>;
