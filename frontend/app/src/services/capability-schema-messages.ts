export const CAPABILITY_SCHEMA_DRAFT_INPUT_SCHEMA_LABEL = "Esquema de entrada rascunhado";
export const CAPABILITY_SCHEMA_DRAFT_OUTPUT_SCHEMA_LABEL = "Esquema de saída rascunhado";
export const CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_LABEL = "Não resolvidos";

const CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASON_MESSAGES: Readonly<Record<string, string>> = {
  "schema-not-reducible-to-a-type":
    "O esquema declarado não se reduz a um único tipo do JSON Schema.",
  "name-claimed-by-another-parameter":
    "O nome já é ocupado por outro parâmetro ou campo desta operação.",
};

export function capabilitySchemaDraftUnresolvedReasonMessage(reason: string): string {
  return CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASON_MESSAGES[reason] ?? reason;
}
