import type { OpenApiDocumentFetchFailure } from "../hooks/use-draft-connector-configuration-from-openapi";

export const CONFIGURATION_HELPER_HEADING = "Assistente de Configuração";
export const CONFIGURATION_HELPER_LINK_LABEL = "Link do documento OpenAPI";
export const CONFIGURATION_HELPER_OPERATION_LABEL = "Operação";
export const CONFIGURATION_HELPER_OPERATION_PLACEHOLDER = "Selecione uma operação";
export const CONFIGURATION_HELPER_WAITING_ON_CONNECTOR_NAME_MESSAGE =
  "A solicitação aguarda um nome de conector.";
export const CONFIGURATION_HELPER_WAITING_ON_OPERATION_MESSAGE =
  "A solicitação aguarda uma operação escolhida.";
export const CONFIGURATION_HELPER_REQUEST_DRAFT_BUTTON = "Solicitar rascunho";
export const CONFIGURATION_HELPER_DRAFTING_PENDING_MESSAGE =
  "Rascunhando a configuração do conector…";

export const OPERATIONS_READ_PENDING_MESSAGE = "As operações do link informado estão sendo lidas…";
export const OPERATIONS_READ_EMPTY_MESSAGE = "O documento obtido não declara nenhuma operação.";

export const DRAFT_DISCLOSURE_CONFIGURATION_LABEL = "Configuração rascunhada";
export const DRAFT_DISCLOSURE_APPLY_BUTTON = "Aplicar";
export const DRAFT_DISCLOSURE_STALE_MESSAGE =
  "Este rascunho está desatualizado: o link, a operação ou o nome do conector mudou desde que " +
  "este rascunho foi solicitado.";
export const DRAFT_DISCLOSURE_UNRESOLVED_LABEL = "Não resolvidos";
export const DRAFT_DISCLOSURE_GENERATED_CREDENTIALS_LABEL = "Credenciais geradas";
export const DRAFT_DISCLOSURE_METHOD_MISMATCH_LABEL = "Divergência de método";
export const DRAFT_DISCLOSURE_STATUS_READINGS_LABEL = "Leituras de status";
export const DRAFT_DISCLOSURE_RESPONSE_FIELDS_LABEL = "Campos de resposta";
export const DRAFT_DISCLOSURE_READING_NOTES_LABEL = "Notas de leitura";
export const DRAFT_DISCLOSURE_SUBJECT_KIND_SEPARATOR = " — ";

export function methodMismatchText(registered: string, operation: string): string {
  return `Registrado: ${registered} · Rascunhado: ${operation}`;
}

export function statusReadingStatusText(status: string): string {
  return `Status ${status}`;
}

export function statusReadingEndingText(ending: string): string {
  return `— desfecho: ${ending}`;
}

export function declaredAsText(declaredAs: string): string {
  return `(declarado como: ${declaredAs})`;
}

export function responseFieldPathStatusText(path: string, status: string): string {
  return `— caminho: ${path}, status: ${status}`;
}

export function declaredTypeText(declaredType: string): string {
  return `(tipo declarado: ${declaredType})`;
}

export function declaredRequiredText(declaredRequired: boolean): string {
  return `(obrigatório declarado: ${declaredRequired ? "sim" : "não"})`;
}

export function envelopeText(envelope: string): string {
  return `(envelope: ${envelope})`;
}

export function readingNoteDetailText(detail: string): string {
  return `(detalhe: ${detail})`;
}

const UNRESOLVED_REASON_MESSAGES: Readonly<Record<string, string>> = {
  "no-capability-registered": "Nenhuma capacidade está atualmente registrada para este conector.",
  "security-scheme-not-reducible-to-a-credential":
    "Este esquema de segurança não pode ser reduzido a um único valor de credencial.",
  "drafted-key-occupied-by-another-security-scheme":
    "Esta chave rascunhada já está ocupada por outro esquema de segurança.",
};

export function unresolvedReasonMessage(reason: string): string {
  return UNRESOLVED_REASON_MESSAGES[reason] ?? reason;
}

const READING_NOTE_KIND_MESSAGES: Readonly<Record<string, string>> = {
  "default-response-not-drafted": "Resposta padrão, não rascunhada no mapa de status",
  "status-range-not-drafted": "Faixa de status, não rascunhada no mapa de status",
  "non-json-success-content-not-read": "Conteúdo de sucesso não JSON, não lido",
  "envelope-read-through": "Envelope de propriedade única, atravessado na leitura",
  "variants-united": "Variantes oneOf/anyOf, unidas em um único conjunto de campos",
  "repeated-field-name-path-not-taken": "Nome de campo repetido; este caminho não foi seguido",
  "no-responses-declared": "Nenhum objeto de respostas declarado",
  "no-success-response-schema": "Nenhum esquema de resposta de sucesso sob application/json",
  "success-schema-declares-no-properties": "Nenhuma propriedade declarada; nenhum campo lido",
};

export function readingNoteKindMessage(kind: string): string {
  return READING_NOTE_KIND_MESSAGES[kind] ?? kind;
}

export function openApiFetchFailureText(failure: OpenApiDocumentFetchFailure): string {
  switch (failure.kind) {
    case "network-failure":
      return "uma falha de rede";
    case "timeout":
      return "um tempo limite excedido";
    case "status-outside-2xx":
      return `uma resposta fora da faixa 2xx (status ${failure.status})`;
  }
}

export function draftNotGeneratedFetchFailureMessage(failureText: string): string {
  return (
    "Nenhum rascunho de configuração foi gerado: não foi possível obter o link do documento " +
    `OpenAPI informado (${failureText}).`
  );
}

export const DRAFT_NOT_GENERATED_NOT_READABLE_MESSAGE =
  "Nenhum rascunho de configuração foi gerado: o documento obtido não pôde ser lido como um " +
  "documento OpenAPI 3.x.";

export function draftNotGeneratedOperationNotFoundMessage(method: string, path: string): string {
  return (
    "Nenhum rascunho de configuração foi gerado: o documento não declara nenhuma operação para " +
    `o método ${method} no caminho ${path}.`
  );
}

export const DRAFT_NOT_GENERATED_UNRECOGNIZED_FAILURE_MESSAGE =
  "Nenhum rascunho de configuração foi gerado: a solicitação falhou por um motivo que este " +
  "assistente não reconhece.";

export function operationsNotListedFetchFailureMessage(failureText: string): string {
  return (
    "Nenhuma operação foi listada: não foi possível obter o link do documento OpenAPI " +
    `informado (${failureText}).`
  );
}

export const OPERATIONS_NOT_LISTED_NOT_READABLE_MESSAGE =
  "Nenhuma operação foi listada: o documento obtido não pôde ser lido como um documento " +
  "OpenAPI 3.x.";

export const OPERATIONS_NOT_LISTED_UNRECOGNIZED_FAILURE_MESSAGE =
  "Nenhuma operação foi listada: a solicitação falhou por um motivo que este assistente não " +
  "reconhece.";

export const FORM_CONNECTOR_FIELD_LABEL = "Conector";
export const FORM_CONFIGURATION_FIELD_LABEL = "Configuração";
export const FORM_SAVE_BUTTON = "Salvar";

export const APPLY_OVER_UNSAVED_EDIT_DESCRIPTION =
  "Aplicar esta configuração rascunhada substituirá a edição não salva no campo Configuração. " +
  "Isso não pode ser desfeito.";
export const APPLY_CONFIRMATION_DIALOG_TITLE = "Aplicar configuração rascunhada?";
export const APPLY_CONFIRMATION_KEEP_EDITING_BUTTON = "Continuar editando";
export const APPLY_CONFIRMATION_CONFIRM_BUTTON = "Aplicar";

export const KEY_CHANGE_LIST_TOP_LEVEL_LABEL = "Chaves de nível superior";
export const KEY_CHANGE_ADDED_PREFIX = "Adicionado: ";
export const KEY_CHANGE_REMOVED_PREFIX = "Removido: ";
export const KEY_CHANGE_CHANGED_PREFIX = "Alterado: ";

export const APPLY_DIFF_NOT_ITEMISABLE_MESSAGE =
  "O que a aplicação deste rascunho mudaria não pode ser detalhado por itens: o campo " +
  "Configuração não contém um texto de objeto JSON bem formado.";
export const APPLY_DIFF_EMPTY_MESSAGE = "Aplicar este rascunho não mudaria nada.";

export const CONFIGURATION_NOT_A_JSON_OBJECT_MESSAGE =
  "O texto é JSON válido, mas não é um objeto: um objeto JSON é exigido aqui.";

export const CONFIGURATION_ENTRY_GUIDANCE_IS_JSON_OBJECT_MESSAGE =
  "O que é digitado aqui é um objeto JSON.";
export const CONFIGURATION_ENTRY_GUIDANCE_READS_KEYS_MESSAGE =
  "O conector HTTP lê o method, address, statusMap e responseMap da configuração.";
export const CONFIGURATION_ENTRY_GUIDANCE_READS_CALL_PARTS_MESSAGE =
  "O conector HTTP lê uma query, headers e um body onde a configuração os declarar.";
export const CONFIGURATION_ENTRY_GUIDANCE_PLACEHOLDER_FORMS_MESSAGE =
  "Um placeholder é escrito como ${subject:<attribute-name>}, ${requester} ou ${credential:<name>}.";

export const HTTP_CONNECTOR_DEPARTURES_HEADING =
  "O que o conector HTTP recusaria nesta configuração";

export const HTTP_CONNECTOR_STATUS_MAP_NOT_AN_OBJECT_MESSAGE =
  "O statusMap está ausente ou não é um objeto.";
export const HTTP_CONNECTOR_RESPONSE_MAP_DEPARTURE_MESSAGE =
  "O responseMap está ausente, não é um objeto, ou contém um valor que não é texto.";
export const HTTP_CONNECTOR_ADDRESS_DEPARTURE_MESSAGE =
  "O address está ausente ou não contém texto.";

function formatHttpConnectorDepartureValueText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function httpConnectorMethodDepartureText(
  value: unknown,
  admittedMethods: readonly string[],
): string {
  return (
    `O method declarado (${formatHttpConnectorDepartureValueText(value)}) está fora do ` +
    `vocabulário admitido: ${admittedMethods.join(", ")}.`
  );
}

export function httpConnectorStatusMapEndingDepartureText(
  statusMapKey: string,
  value: unknown,
  admittedEndings: readonly string[],
): string {
  return (
    `O statusMap para ${statusMapKey} declara um desfecho ` +
    `(${formatHttpConnectorDepartureValueText(value)}) fora do vocabulário admitido: ` +
    `${admittedEndings.join(", ")}.`
  );
}

export function httpConnectorQueryOrHeadersDepartureText(key: "query" | "headers"): string {
  return `O ${key} declarado não é um objeto de valores em texto.`;
}

export function httpConnectorPlaceholderDepartureText(placeholder: string): string {
  return (
    `O placeholder ${placeholder} não está escrito em nenhuma das três formas admitidas: ` +
    "${subject:<attribute-name>}, ${requester} ou ${credential:<name>}."
  );
}

export const SUBJECT_PLACEHOLDER_STATEMENTS_HEADING =
  "O que os placeholders de assunto desta configuração declaram";

export const SUBJECT_PLACEHOLDER_CANNOT_BE_CHECKED_MESSAGE =
  "Nenhuma capacidade está registrada para este conector: os placeholders de assunto desta " +
  "configuração não podem ser verificados.";

export function subjectPlaceholderDeclaredText(attributeName: string): string {
  return (
    `O placeholder \${subject:${attributeName}} é declarado no esquema de entrada de todas as ` +
    "capacidades registradas para este conector."
  );
}

export function subjectPlaceholderUndeclaredText(
  attributeName: string,
  nonDeclaringCapabilityLabels: readonly string[],
): string {
  return (
    `O placeholder \${subject:${attributeName}} não é declarado no esquema de entrada de: ` +
    `${nonDeclaringCapabilityLabels.join(", ")}.`
  );
}

export const CREDENTIAL_PLACEHOLDER_STATEMENTS_HEADING =
  "O que os placeholders de credencial desta configuração declaram";

export function credentialPlaceholderStatementText(name: string): string {
  return (
    `A credencial \${credential:${name}} é resolvida a partir da configuração do próprio ` +
    "servidor no momento de um teste ou de uma observação; nada nesta superfície a verifica."
  );
}

export const RESPONSE_MAP_COVERAGE_HEADING = "O que as chaves do responseMap desta configuração leem";

export const RESPONSE_MAP_COVERAGE_CANNOT_BE_READ_MESSAGE =
  "Nenhuma capacidade está registrada para este conector: quais campos uma observação traria " +
  "não pode ser lido.";

export function responseMapKeyReadText(key: string, capabilityLabels: readonly string[]): string {
  return `A chave ${key} do responseMap é lida por: ${capabilityLabels.join(", ")}.`;
}

export function responseMapKeyReadByNoneText(key: string): string {
  return (
    `A chave ${key} do responseMap não é lida por nenhuma capacidade registrada para este ` +
    "conector."
  );
}

export const RESPONSE_MAP_EXPECTED_FIELDS_HEADING =
  "Quais campos esperados nenhuma chave do responseMap nomeia";

export function responseMapExpectedFieldText(capabilityLabel: string, fieldName: string): string {
  return `${capabilityLabel} espera o campo ${fieldName}, que nenhuma chave do responseMap nomeia.`;
}
