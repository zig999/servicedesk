/**
 * The client-side validation schema for the Capability create/edit form
 * (task/capability-authoring/capability-create-edit-form): every attribute
 * PUT /v1/capabilities/{name}/{version}'s own request body validates,
 * mirrored from src/src/http/dto/register-capability.dto.ts's
 * registerCapabilityBodySchema exactly, the same convention
 * case-version-form-schema.ts and concept-form-schema.ts already keep --
 * this app and the backend are two separate deployments, so this is this
 * app's own copy of that shape rather than a shared import.
 *
 * `name` and `version` are this form's own addition over that body schema:
 * domain/integration/capability's own identity, read from the path on the
 * wire (registerCapabilityParamsSchema) rather than the body, but still a
 * field this form's operator types (create mode) or sees pre-filled and
 * disabled (edit mode, use-capability-form.ts's own header comment) --
 * required and non-empty here the same way registerCapabilityParamsSchema
 * requires them on the wire.
 *
 * `input_schema` and `output_schema` are deliberately absent from this
 * schema: both are edited through the shared JsonTextareaField
 * (json-textarea-field.tsx), whose own onChange already reports whether the
 * current text is syntactically valid JSON (criterion 3;
 * rules/integration/a-capability-declares-well-formed-schemas) --
 * use-capability-form.ts tracks each field's own text and validity as plain
 * component state instead of a zod-validated form field, and blocks
 * submission while either is invalid, so a second syntax check here would
 * duplicate that control's own responsibility rather than add anything a
 * zod string rule could express (JSON syntax is not a regex or a length
 * bound). This task's own inference, disclosed in its delivery record: no
 * precedent yet composes react-hook-form with a JSON-syntax-validated
 * field, so this is the shape chosen for the first one.
 *
 * `timeout` is optional, mirroring registerCapabilityBodySchema's own
 * optional field exactly: a registration that states none takes the
 * registry's own default (rules/integration/a-capability-declares-its-contract,
 * "a registration that states no timeout takes the default of sixty
 * seconds") -- this form never invents that default client-side, it simply
 * omits the field when the operator leaves it blank
 * (use-capability-form.ts's own header comment on the react-hook-form
 * registration this schema's optional field pairs with).
 */

import { z } from "zod";

/** domain/integration/capability-nature's own two values, this app's own copy of the vocabulary the backend's CAPABILITY_NATURES states (capability.ts). */
export const CAPABILITY_NATURES = ["read-only", "mutating"] as const;

export const capabilityFormSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  nature: z.enum(CAPABILITY_NATURES),
  timeout: z.number().int().positive().optional(),
  connector: z.string().min(1),
  concept: z.string().min(1),
});

export type CapabilityFormValues = z.infer<typeof capabilityFormSchema>;
