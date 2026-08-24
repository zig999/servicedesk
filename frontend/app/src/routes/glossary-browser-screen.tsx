import { useState, type JSX } from "react";
import { Button } from "@tui/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tui/ui/tabs";
import {
  StatusTable,
  type StatusTableColumn,
  type StatusTableRow,
} from "../shared/components/status-table";
import {
  useGlossaryVocabularyOptions,
  type GlossaryVocabulary,
} from "../hooks/use-glossary-vocabulary";
import { useGlossaryConcepts, type GlossaryConcept } from "../hooks/use-glossary-concepts";
import type { ConceptFormTarget } from "../hooks/use-concept-form";
import { ConceptFormDialog } from "./concept-form-dialog";

/**
 * The Glossary Browser screen (task/glossary-and-capabilities-browser/
 * glossary-browser-screen, the scope's own section 2.8): six tabs over the
 * published language -- Concepts (domain/glossary/concept, GET
 * /v1/glossary/concepts) and one tab per term vocabulary
 * (domain/glossary/subject-type, domain/glossary/subject-attribute,
 * domain/glossary/outcome, domain/glossary/action,
 * domain/glossary/recipient, each GET /v1/glossary/{vocabulary}) --
 * contracts/glossary/glossary-query's own list-vocabulary-terms and
 * list-concepts operations, and no tab renders a pagination control (this
 * task's own criteria; both hooks below already read only a page's `data`,
 * per this app's own inventory).
 *
 * task/concept-authoring/concept-create-edit-form widens the Concepts tab
 * alone from read-only to one that also creates and edits a concept
 * (contracts/glossary/glossary-authoring's own register-concept operation,
 * PUT /v1/glossary/concepts/{name}) -- the five term-vocabulary tabs stay
 * exactly as read-only as this screen's own original delivery left them; no
 * criterion of that task touches any of them.
 *
 * Built with @tui/ui/tabs the same way case-detail-screen.tsx already
 * composes it (this app's one existing precedent): each TabsContent's own
 * child is a function component that owns its own query, and TabsContent's
 * null-render-when-inactive is what makes switching tabs the thing that
 * actually fires each tab's own fetch, never all six firing on first mount
 * (PRF-04).
 *
 * Wired in as route-tree.tsx's "/glossary" route's own `component`,
 * replacing GlossaryPlaceholder (left in place, unused, in
 * route-placeholders.tsx -- that file's own established precedent for this
 * exact kind of change).
 */

const CONCEPTS_COLUMNS: StatusTableColumn[] = [
  { key: "name", header: "Name" },
  { key: "accepts", header: "Accepts" },
  { key: "ttl", header: "TTL" },
  { key: "actions", header: "" },
];

const VOCABULARY_COLUMNS: StatusTableColumn[] = [{ key: "name", header: "Name" }];

/**
 * domain/glossary/concept's own ttl is "the strictest freshness tolerance
 * among the cases that use it, in seconds" -- formatted with its declared
 * unit here since no criterion states a display format and the raw number
 * alone would leave a reader guessing the unit; this screen's own
 * inference, disclosed in its delivery record (the same kind of call
 * capabilities-browser-screen.tsx's own formatTimeout already made for
 * domain/integration/capability's own timeout).
 */
function formatTtl(ttlSeconds: number): string {
  return `${ttlSeconds}s`;
}

/**
 * A concept's own `accepts` (domain/glossary/concept: which subject types
 * it accepts) is a list; rendered as a comma-joined string here since no
 * criterion states a display format for a list-valued cell and StatusTable
 * itself renders a plain value as text -- this screen's own inference,
 * disclosed in its delivery record.
 *
 * `onEdit` renders as this row's own "Edit" action cell (criterion 2, "Each
 * concept in the Concepts tab offers an edit action") -- a plain Button
 * element, which StatusTable's own renderCellContent already renders as
 * given (status-table.tsx's own header comment: "a value that is itself a
 * React element... renders exactly as given"), the one precedent this app
 * already has for a cell holding a caller-composed action rather than plain
 * text.
 */
function toConceptRow(concept: GlossaryConcept, onEdit: (concept: GlossaryConcept) => void): StatusTableRow {
  return {
    id: concept.name,
    name: concept.name,
    accepts: concept.accepts.join(", "),
    ttl: formatTtl(concept.ttl),
    actions: (
      <Button type="button" variant="secondary" onClick={() => onEdit(concept)}>
        Edit
      </Button>
    ),
  };
}

/**
 * The "Concepts" tab's own body: every concept GET /v1/glossary/concepts
 * currently holds, plus (task/concept-authoring/concept-create-edit-form)
 * the "New concept" action (criterion 1) and, per row, the "Edit" action
 * (criterion 2) -- both open the same ConceptFormDialog, parametrized by
 * `formTarget`'s own nullable-identity shape (ConceptFormTarget: `null`
 * closed, `{ mode: "create" }`, or `{ mode: "edit", concept }`). The Dialog
 * is entirely controlled by this local state rather than a DialogTrigger per
 * action, since two distinct actions (the button below, and every row's own
 * Edit button) open the one shared Dialog rather than each owning its own.
 *
 * "New concept" renders unconditionally, ahead of the loading/error/empty
 * branches below, so criterion 1 holds regardless of whichever of those
 * three states the concept list itself is currently in -- this screen's own
 * inference, disclosed in its delivery record: no criterion of this task
 * states whether the action should be hidden while the list is loading or
 * failed to load, and hiding a create action behind an unrelated read
 * failure would block authoring a concept for a reason that has nothing to
 * do with it.
 */
function ConceptsPanel(): JSX.Element {
  const { concepts, isLoading, isError, refetch } = useGlossaryConcepts();
  const [formTarget, setFormTarget] = useState<ConceptFormTarget | null>(null);

  function renderBody(): JSX.Element {
    if (isLoading) {
      return <p>Loading concepts…</p>;
    }
    if (isError) {
      // EDG-02: a load failure degrades to a typed error state with an
      // explicit retry, rather than an indefinite loading state or a blank
      // screen. GET /v1/glossary/concepts throws no domain error
      // error-ui-state.ts names (this app's own inventory), so this generic
      // fallback is what the failure resolves to.
      return (
        <section>
          <p>Unable to load the glossary&apos;s concepts.</p>
          <Button type="button" onClick={refetch}>
            Retry
          </Button>
        </section>
      );
    }
    if (concepts.length === 0) {
      // API-04: an empty response renders its own explicit empty state,
      // never treated as still loading or as a failure.
      return <p>The glossary currently holds no concepts.</p>;
    }

    return (
      <StatusTable
        columns={CONCEPTS_COLUMNS}
        rows={concepts.map((concept) =>
          toConceptRow(concept, (target) => setFormTarget({ mode: "edit", concept: target })),
        )}
      />
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setFormTarget({ mode: "create" })}>
          New concept
        </Button>
      </div>
      {renderBody()}
      {formTarget !== null && (
        <ConceptFormDialog target={formTarget} onClose={() => setFormTarget(null)} />
      )}
    </section>
  );
}

export type VocabularyPanelProps = {
  readonly vocabulary: GlossaryVocabulary;
  readonly emptyMessage: string;
  readonly loadErrorMessage: string;
};

/**
 * The shared body for each of the five term-vocabulary tabs (Subject
 * types, Subject attributes, Outcomes, Actions, Recipients): every term the
 * given vocabulary currently holds, by name -- one row each. Parametrized
 * by `vocabulary` rather than five hand-written near-duplicates, since the
 * five tabs differ only in which vocabulary they read and which words their
 * empty/error states use; each TabsContent below still instantiates its own
 * VocabularyPanel; the parametrization changes how the five bodies are
 * written, never how many queries fire or when (each instance still owns
 * its own call to useGlossaryVocabularyOptions).
 */
function VocabularyPanel({
  vocabulary,
  emptyMessage,
  loadErrorMessage,
}: VocabularyPanelProps): JSX.Element {
  const { options, isLoading, isError, refetch } = useGlossaryVocabularyOptions(vocabulary);

  if (isLoading) {
    return <p>Loading…</p>;
  }
  if (isError) {
    // EDG-02, the same convention ConceptsPanel keeps above: none of these
    // five reads throws a domain error error-ui-state.ts names either, so
    // each falls through to its own generic fallback plus an explicit
    // retry.
    return (
      <section>
        <p>{loadErrorMessage}</p>
        <Button type="button" onClick={refetch}>
          Retry
        </Button>
      </section>
    );
  }
  if (options.length === 0) {
    // API-04, the same convention as ConceptsPanel above.
    return <p>{emptyMessage}</p>;
  }

  const rows: StatusTableRow[] = options.map((option) => ({
    id: option.value,
    name: option.label,
  }));

  return <StatusTable columns={VOCABULARY_COLUMNS} rows={rows} />;
}

export function GlossaryBrowserScreen(): JSX.Element {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">Glossary</h1>
      <Tabs defaultValue="concepts">
        <TabsList>
          <TabsTrigger value="concepts">Concepts</TabsTrigger>
          <TabsTrigger value="subject-type">Subject types</TabsTrigger>
          <TabsTrigger value="subject-attribute">Subject attributes</TabsTrigger>
          <TabsTrigger value="outcome">Outcomes</TabsTrigger>
          <TabsTrigger value="action">Actions</TabsTrigger>
          <TabsTrigger value="recipient">Recipients</TabsTrigger>
        </TabsList>
        <TabsContent value="concepts">
          <ConceptsPanel />
        </TabsContent>
        <TabsContent value="subject-type">
          <VocabularyPanel
            vocabulary="subject-type"
            emptyMessage="The glossary currently holds no subject types."
            loadErrorMessage="Unable to load subject types."
          />
        </TabsContent>
        <TabsContent value="subject-attribute">
          <VocabularyPanel
            vocabulary="subject-attribute"
            emptyMessage="The glossary currently holds no subject attributes."
            loadErrorMessage="Unable to load subject attributes."
          />
        </TabsContent>
        <TabsContent value="outcome">
          <VocabularyPanel
            vocabulary="outcome"
            emptyMessage="The glossary currently holds no outcomes."
            loadErrorMessage="Unable to load outcomes."
          />
        </TabsContent>
        <TabsContent value="action">
          <VocabularyPanel
            vocabulary="action"
            emptyMessage="The glossary currently holds no actions."
            loadErrorMessage="Unable to load actions."
          />
        </TabsContent>
        <TabsContent value="recipient">
          <VocabularyPanel
            vocabulary="recipient"
            emptyMessage="The glossary currently holds no recipients."
            loadErrorMessage="Unable to load recipients."
          />
        </TabsContent>
      </Tabs>
    </section>
  );
}
