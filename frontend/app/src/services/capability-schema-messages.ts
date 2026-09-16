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

export const CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_NOT_FETCHED_MESSAGE =
  "Nenhum rascunho de esquema foi gerado: não foi possível obter o link do documento OpenAPI " +
  "informado.";

export const CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_NOT_READABLE_MESSAGE =
  "Nenhum rascunho de esquema foi gerado: o documento obtido não pôde ser lido como um " +
  "documento OpenAPI 3.x.";

export function capabilitySchemaDraftNotGeneratedOperationNotFoundMessage(
  method: string,
  path: string,
): string {
  return (
    "Nenhum rascunho de esquema foi gerado: o documento não declara nenhuma operação para " +
    `o método ${method} no caminho ${path}.`
  );
}

export const CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_UNRECOGNIZED_FAILURE_MESSAGE =
  "Nenhum rascunho de esquema foi gerado: a solicitação falhou por um motivo que este " +
  "assistente não reconhece.";
