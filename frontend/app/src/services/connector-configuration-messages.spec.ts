import { describe, expect, it } from "vitest";
import {
  APPLY_CONFIRMATION_CONFIRM_BUTTON,
  APPLY_CONFIRMATION_DIALOG_TITLE,
  APPLY_CONFIRMATION_KEEP_EDITING_BUTTON,
  APPLY_DIFF_EMPTY_MESSAGE,
  APPLY_DIFF_NOT_ITEMISABLE_MESSAGE,
  APPLY_OVER_UNSAVED_EDIT_DESCRIPTION,
  CONFIGURATION_HELPER_DRAFTING_PENDING_MESSAGE,
  CONFIGURATION_HELPER_HEADING,
  CONFIGURATION_HELPER_LINK_LABEL,
  CONFIGURATION_HELPER_OPERATION_LABEL,
  CONFIGURATION_HELPER_OPERATION_PLACEHOLDER,
  CONFIGURATION_HELPER_REQUEST_DRAFT_BUTTON,
  CONFIGURATION_HELPER_WAITING_ON_CONNECTOR_NAME_MESSAGE,
  CONFIGURATION_HELPER_WAITING_ON_OPERATION_MESSAGE,
  declaredAsText,
  declaredRequiredText,
  declaredTypeText,
  DRAFT_DISCLOSURE_APPLY_BUTTON,
  DRAFT_DISCLOSURE_CONFIGURATION_LABEL,
  DRAFT_DISCLOSURE_GENERATED_CREDENTIALS_LABEL,
  DRAFT_DISCLOSURE_METHOD_MISMATCH_LABEL,
  DRAFT_DISCLOSURE_READING_NOTES_LABEL,
  DRAFT_DISCLOSURE_RESPONSE_FIELDS_LABEL,
  DRAFT_DISCLOSURE_STALE_MESSAGE,
  DRAFT_DISCLOSURE_STATUS_READINGS_LABEL,
  DRAFT_DISCLOSURE_SUBJECT_KIND_SEPARATOR,
  DRAFT_DISCLOSURE_UNRESOLVED_LABEL,
  draftNotGeneratedFetchFailureMessage,
  DRAFT_NOT_GENERATED_NOT_READABLE_MESSAGE,
  draftNotGeneratedOperationNotFoundMessage,
  DRAFT_NOT_GENERATED_UNRECOGNIZED_FAILURE_MESSAGE,
  envelopeText,
  FORM_CONFIGURATION_FIELD_LABEL,
  FORM_CONNECTOR_FIELD_LABEL,
  FORM_SAVE_BUTTON,
  KEY_CHANGE_ADDED_PREFIX,
  KEY_CHANGE_CHANGED_PREFIX,
  KEY_CHANGE_LIST_TOP_LEVEL_LABEL,
  KEY_CHANGE_REMOVED_PREFIX,
  methodMismatchText,
  openApiFetchFailureText,
  OPERATIONS_NOT_LISTED_NOT_READABLE_MESSAGE,
  OPERATIONS_NOT_LISTED_UNRECOGNIZED_FAILURE_MESSAGE,
  operationsNotListedFetchFailureMessage,
  OPERATIONS_READ_EMPTY_MESSAGE,
  OPERATIONS_READ_PENDING_MESSAGE,
  readingNoteDetailText,
  readingNoteKindMessage,
  responseFieldPathStatusText,
  statusReadingEndingText,
  statusReadingStatusText,
  unresolvedReasonMessage,
} from "./connector-configuration-messages";

const NINE_READING_NOTE_KINDS = [
  "default-response-not-drafted",
  "status-range-not-drafted",
  "non-json-success-content-not-read",
  "envelope-read-through",
  "variants-united",
  "repeated-field-name-path-not-taken",
  "no-responses-declared",
  "no-success-response-schema",
  "success-schema-declares-no-properties",
] as const;

const THREE_UNRESOLVED_REASONS = [
  "no-capability-registered",
  "security-scheme-not-reducible-to-a-credential",
  "drafted-key-occupied-by-another-security-scheme",
] as const;

// Every exported constant and function this module holds, each paired with a fragment of
// pt-BR wording only that entry's own actual text carries -- proving criterion 3 ("every
// message the module holds is written in pt-BR") over the module's whole, finite inventory,
// not a sample of it.
const INVENTORY: ReadonlyArray<readonly [string, string, string]> = [
  ["CONFIGURATION_HELPER_HEADING", CONFIGURATION_HELPER_HEADING, "Configuração"],
  ["CONFIGURATION_HELPER_LINK_LABEL", CONFIGURATION_HELPER_LINK_LABEL, "documento"],
  ["CONFIGURATION_HELPER_OPERATION_LABEL", CONFIGURATION_HELPER_OPERATION_LABEL, "Operação"],
  ["CONFIGURATION_HELPER_OPERATION_PLACEHOLDER", CONFIGURATION_HELPER_OPERATION_PLACEHOLDER, "operação"],
  [
    "CONFIGURATION_HELPER_WAITING_ON_CONNECTOR_NAME_MESSAGE",
    CONFIGURATION_HELPER_WAITING_ON_CONNECTOR_NAME_MESSAGE,
    "conector",
  ],
  [
    "CONFIGURATION_HELPER_WAITING_ON_OPERATION_MESSAGE",
    CONFIGURATION_HELPER_WAITING_ON_OPERATION_MESSAGE,
    "operação escolhida",
  ],
  ["CONFIGURATION_HELPER_REQUEST_DRAFT_BUTTON", CONFIGURATION_HELPER_REQUEST_DRAFT_BUTTON, "rascunho"],
  ["CONFIGURATION_HELPER_DRAFTING_PENDING_MESSAGE", CONFIGURATION_HELPER_DRAFTING_PENDING_MESSAGE, "Rascunhando"],
  ["OPERATIONS_READ_PENDING_MESSAGE", OPERATIONS_READ_PENDING_MESSAGE, "sendo lidas"],
  ["OPERATIONS_READ_EMPTY_MESSAGE", OPERATIONS_READ_EMPTY_MESSAGE, "não declara"],
  ["DRAFT_DISCLOSURE_CONFIGURATION_LABEL", DRAFT_DISCLOSURE_CONFIGURATION_LABEL, "rascunhada"],
  ["DRAFT_DISCLOSURE_APPLY_BUTTON", DRAFT_DISCLOSURE_APPLY_BUTTON, "Aplicar"],
  ["DRAFT_DISCLOSURE_STALE_MESSAGE", DRAFT_DISCLOSURE_STALE_MESSAGE, "desatualizado"],
  ["DRAFT_DISCLOSURE_UNRESOLVED_LABEL", DRAFT_DISCLOSURE_UNRESOLVED_LABEL, "Não resolvidos"],
  ["DRAFT_DISCLOSURE_GENERATED_CREDENTIALS_LABEL", DRAFT_DISCLOSURE_GENERATED_CREDENTIALS_LABEL, "Credenciais"],
  ["DRAFT_DISCLOSURE_METHOD_MISMATCH_LABEL", DRAFT_DISCLOSURE_METHOD_MISMATCH_LABEL, "Divergência"],
  ["DRAFT_DISCLOSURE_STATUS_READINGS_LABEL", DRAFT_DISCLOSURE_STATUS_READINGS_LABEL, "Leituras"],
  ["DRAFT_DISCLOSURE_RESPONSE_FIELDS_LABEL", DRAFT_DISCLOSURE_RESPONSE_FIELDS_LABEL, "resposta"],
  ["DRAFT_DISCLOSURE_READING_NOTES_LABEL", DRAFT_DISCLOSURE_READING_NOTES_LABEL, "leitura"],
  ["DRAFT_DISCLOSURE_SUBJECT_KIND_SEPARATOR", DRAFT_DISCLOSURE_SUBJECT_KIND_SEPARATOR, "—"],
  ["methodMismatchText", methodMismatchText("GET", "POST"), "Registrado"],
  ["statusReadingStatusText", statusReadingStatusText("200"), "Status 200"],
  ["statusReadingEndingText", statusReadingEndingText("x"), "desfecho"],
  ["declaredAsText", declaredAsText("x"), "declarado como"],
  ["responseFieldPathStatusText", responseFieldPathStatusText("p", "s"), "caminho"],
  ["declaredTypeText", declaredTypeText("x"), "tipo declarado"],
  ["declaredRequiredText(true)", declaredRequiredText(true), "sim"],
  ["declaredRequiredText(false)", declaredRequiredText(false), "não"],
  ["envelopeText", envelopeText("x"), "envelope"],
  ["readingNoteDetailText", readingNoteDetailText("x"), "detalhe"],
  [
    "unresolvedReasonMessage(no-capability-registered)",
    unresolvedReasonMessage("no-capability-registered"),
    "capacidade",
  ],
  [
    "unresolvedReasonMessage(security-scheme-not-reducible-to-a-credential)",
    unresolvedReasonMessage("security-scheme-not-reducible-to-a-credential"),
    "esquema de segurança",
  ],
  [
    "unresolvedReasonMessage(drafted-key-occupied-by-another-security-scheme)",
    unresolvedReasonMessage("drafted-key-occupied-by-another-security-scheme"),
    "chave rascunhada",
  ],
  [
    "readingNoteKindMessage(default-response-not-drafted)",
    readingNoteKindMessage("default-response-not-drafted"),
    "Resposta padrão",
  ],
  [
    "readingNoteKindMessage(status-range-not-drafted)",
    readingNoteKindMessage("status-range-not-drafted"),
    "Faixa de status",
  ],
  [
    "readingNoteKindMessage(non-json-success-content-not-read)",
    readingNoteKindMessage("non-json-success-content-not-read"),
    "não JSON",
  ],
  [
    "readingNoteKindMessage(envelope-read-through)",
    readingNoteKindMessage("envelope-read-through"),
    "propriedade única",
  ],
  ["readingNoteKindMessage(variants-united)", readingNoteKindMessage("variants-united"), "oneOf/anyOf"],
  [
    "readingNoteKindMessage(repeated-field-name-path-not-taken)",
    readingNoteKindMessage("repeated-field-name-path-not-taken"),
    "campo repetido",
  ],
  [
    "readingNoteKindMessage(no-responses-declared)",
    readingNoteKindMessage("no-responses-declared"),
    "Nenhum objeto de respostas",
  ],
  [
    "readingNoteKindMessage(no-success-response-schema)",
    readingNoteKindMessage("no-success-response-schema"),
    "esquema de resposta de sucesso",
  ],
  [
    "readingNoteKindMessage(success-schema-declares-no-properties)",
    readingNoteKindMessage("success-schema-declares-no-properties"),
    "Nenhuma propriedade declarada",
  ],
  ["openApiFetchFailureText(network-failure)", openApiFetchFailureText({ kind: "network-failure" }), "falha de rede"],
  ["openApiFetchFailureText(timeout)", openApiFetchFailureText({ kind: "timeout" }), "tempo limite"],
  [
    "openApiFetchFailureText(status-outside-2xx)",
    openApiFetchFailureText({ kind: "status-outside-2xx", status: 503 }),
    "503",
  ],
  [
    "draftNotGeneratedFetchFailureMessage",
    draftNotGeneratedFetchFailureMessage("uma falha de rede"),
    "Nenhum rascunho de configuração foi gerado",
  ],
  ["DRAFT_NOT_GENERATED_NOT_READABLE_MESSAGE", DRAFT_NOT_GENERATED_NOT_READABLE_MESSAGE, "não pôde ser lido"],
  [
    "draftNotGeneratedOperationNotFoundMessage",
    draftNotGeneratedOperationNotFoundMessage("GET", "/x"),
    "não declara nenhuma operação",
  ],
  [
    "DRAFT_NOT_GENERATED_UNRECOGNIZED_FAILURE_MESSAGE",
    DRAFT_NOT_GENERATED_UNRECOGNIZED_FAILURE_MESSAGE,
    "não reconhece",
  ],
  [
    "operationsNotListedFetchFailureMessage",
    operationsNotListedFetchFailureMessage("uma falha de rede"),
    "Nenhuma operação foi listada",
  ],
  [
    "OPERATIONS_NOT_LISTED_NOT_READABLE_MESSAGE",
    OPERATIONS_NOT_LISTED_NOT_READABLE_MESSAGE,
    "não pôde ser lido",
  ],
  [
    "OPERATIONS_NOT_LISTED_UNRECOGNIZED_FAILURE_MESSAGE",
    OPERATIONS_NOT_LISTED_UNRECOGNIZED_FAILURE_MESSAGE,
    "não reconhece",
  ],
  ["FORM_CONNECTOR_FIELD_LABEL", FORM_CONNECTOR_FIELD_LABEL, "Conector"],
  ["FORM_CONFIGURATION_FIELD_LABEL", FORM_CONFIGURATION_FIELD_LABEL, "Configuração"],
  ["FORM_SAVE_BUTTON", FORM_SAVE_BUTTON, "Salvar"],
  ["APPLY_OVER_UNSAVED_EDIT_DESCRIPTION", APPLY_OVER_UNSAVED_EDIT_DESCRIPTION, "substituirá"],
  ["APPLY_CONFIRMATION_DIALOG_TITLE", APPLY_CONFIRMATION_DIALOG_TITLE, "rascunhada"],
  ["APPLY_CONFIRMATION_KEEP_EDITING_BUTTON", APPLY_CONFIRMATION_KEEP_EDITING_BUTTON, "Continuar editando"],
  ["APPLY_CONFIRMATION_CONFIRM_BUTTON", APPLY_CONFIRMATION_CONFIRM_BUTTON, "Aplicar"],
  ["KEY_CHANGE_LIST_TOP_LEVEL_LABEL", KEY_CHANGE_LIST_TOP_LEVEL_LABEL, "nível superior"],
  ["KEY_CHANGE_ADDED_PREFIX", KEY_CHANGE_ADDED_PREFIX, "Adicionado"],
  ["KEY_CHANGE_REMOVED_PREFIX", KEY_CHANGE_REMOVED_PREFIX, "Removido"],
  ["KEY_CHANGE_CHANGED_PREFIX", KEY_CHANGE_CHANGED_PREFIX, "Alterado"],
  ["APPLY_DIFF_NOT_ITEMISABLE_MESSAGE", APPLY_DIFF_NOT_ITEMISABLE_MESSAGE, "detalhado por itens"],
  ["APPLY_DIFF_EMPTY_MESSAGE", APPLY_DIFF_EMPTY_MESSAGE, "não mudaria nada"],
];

describe("connector-configuration-messages -- every exported constant and function yields non-empty pt-BR text (criterion 3)", () => {
  it.each(INVENTORY)("%s is non-empty and carries its expected pt-BR wording", (_label, value, expectedFragment) => {
    expect(value.length).toBeGreaterThan(0);
    expect(value).toContain(expectedFragment);
  });
});

describe("connector-configuration-messages -- the three unresolved-reason messages are pairwise distinct (UNDERDETERMINED entry over rules/integration/an-answered-draft-request-states-its-draft-to-the-operator)", () => {
  it("gives the three closed-set reasons three different texts, none collapsed into a shared message", () => {
    const labels = THREE_UNRESOLVED_REASONS.map((reason) => unresolvedReasonMessage(reason));

    expect(new Set(labels).size).toBe(THREE_UNRESOLVED_REASONS.length);
  });
});

describe("connector-configuration-messages -- the nine reading-note-kind messages are pairwise distinct (UNDERDETERMINED entry over rules/integration/an-answered-draft-request-states-its-draft-to-the-operator)", () => {
  it("gives the nine closed-set kinds nine different texts, none collapsed into a shared message", () => {
    const labels = NINE_READING_NOTE_KINDS.map((kind) => readingNoteKindMessage(kind));

    expect(new Set(labels).size).toBe(NINE_READING_NOTE_KINDS.length);
  });
});

describe("connector-configuration-messages -- the outstanding-read message and the no-operations-declared message are distinct from one another (UNDERDETERMINED entry over rules/integration/the-configuration-helper-states-an-operations-read-outstanding-and-a-document-declaring-no-operation)", () => {
  it("gives the two operations-read states two different texts, neither collapsed into the other", () => {
    expect(OPERATIONS_READ_PENDING_MESSAGE).not.toBe(OPERATIONS_READ_EMPTY_MESSAGE);
  });
});
