import type { CapabilitySchemaDraft } from "../hooks/use-draft-capability-schema-from-openapi";
import { capabilitySchemaDraftUnresolvedReasonMessage } from "./capability-schema-messages";

export type CapabilitySchemaDraftUnresolvedItemDisclosure = {
  readonly name: string;
  readonly reason: string;
  readonly reasonLabel: string;
};

export type CapabilitySchemaDraftDisclosure = {
  readonly inputSchema: string;
  readonly outputSchema: string;
  readonly unresolved: readonly CapabilitySchemaDraftUnresolvedItemDisclosure[];
};

export function capabilitySchemaDraftDisclosureFrom(
  draft: CapabilitySchemaDraft,
): CapabilitySchemaDraftDisclosure {
  return {
    inputSchema: draft.input_schema,
    outputSchema: draft.output_schema,
    unresolved: draft.unresolved.map((item) => ({
      name: item.name,
      reason: item.reason,
      reasonLabel: capabilitySchemaDraftUnresolvedReasonMessage(item.reason),
    })),
  };
}
