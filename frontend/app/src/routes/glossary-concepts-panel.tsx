import { useState, type JSX } from "react";
import { Button } from "@tui/ui/button";
import {
  StatusTable,
  type StatusTableColumn,
  type StatusTableRow,
} from "../shared/components/status-table";
import { useGlossaryConcepts, type GlossaryConcept } from "../hooks/use-glossary-concepts";
import type { ConceptFormTarget } from "../hooks/use-concept-form";
import { ConceptFormDialog } from "./concept-form-dialog";

/**
 * The Concepts tab's own body -- domain/glossary/concept, GET
 * /v1/glossary/concepts, one row per concept the glossary currently holds.
 * Extracted out of glossary-browser-screen.tsx into its own file (MNT-01:
 * that file's own three-hundred-line cap, which the "Description" column
 * below would otherwise push past) -- that screen's own header comment
 * names this file as where this tab's body now lives.
 *
 * Delivered across three tasks: task/glossary-and-capabilities-browser/
 * glossary-browser-screen (the original read-only listing),
 * task/concept-authoring/concept-create-edit-form (the "New concept" action,
 * criterion 1, and each row's own "Edit" action, criterion 2 -- both open
 * the same ConceptFormDialog, parametrized by `formTarget`'s own
 * nullable-identity shape: `null` closed, `{ mode: "create" }`, or
 * `{ mode: "edit", concept }`; the Dialog is entirely controlled by this
 * local state rather than a DialogTrigger per action, since two distinct
 * actions -- the button below, and every row's own Edit button -- open the
 * one shared Dialog rather than each owning its own), and
 * task/glossary-concept-description/browser-description-and-legacy-marker
 * (the "Description" column and its empty-description marker).
 */

const CONCEPTS_COLUMNS: StatusTableColumn[] = [
  { key: "name", header: "Name" },
  { key: "description", header: "Description" },
  { key: "accepts", header: "Accepts" },
  { key: "ttl", header: "TTL" },
  { key: "actions", header: "" },
];

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
 * A concept's own `description` (domain/glossary/concept's fourth
 * attribute), read verbatim off use-glossary-concepts.ts's own narrowing.
 * An empty description is a legacy concept registered before that attribute
 * existed
 * (rules/glossary/a-concept-with-an-empty-description-is-read-as-awaiting-one)
 * -- read here as a status-shaped `{ color, label }` value so
 * status-table.tsx's own renderCellContent renders it as a token-colored
 * dot plus its word (this app's own established status-dot idiom, e.g.
 * case-simulation-detail-evidence-tab.tsx's own EVIDENCE_RESULT_CELL),
 * visibly distinct from a described concept's own plain-text cell. A
 * described concept's own `description` renders as plain text in that same
 * column instead -- the two cases never share a rendering, since a plain
 * string would read as invented meaning for the empty case, and the
 * dot-plus-word marker would say a described concept's meaning is somehow
 * still in question if shown for it.
 *
 * `bg-muted-foreground` -- the same neutral-absence token
 * case-simulation-detail-evidence-tab.tsx's own EVIDENCE_RESULT_CELL keys
 * its "unavailable" result to -- is this task's own inference, disclosed in
 * its delivery record: no criterion names a color, and this reading is a
 * gap left for an operator to fill rather than a warning or a refusal, so
 * neither `bg-warning` nor `bg-destructive` fit the two colors this app's
 * own convention already reserves for those meanings. The label's own
 * wording, "Awaiting description", is this task's own inference too: no
 * criterion states exact copy.
 */
function toDescriptionCell(
  description: string,
): string | { readonly color: string; readonly label: string } {
  if (description === "") {
    return { color: "bg-muted-foreground", label: "Awaiting description" };
  }
  return description;
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
function toConceptRow(
  concept: GlossaryConcept,
  onEdit: (concept: GlossaryConcept) => void,
): StatusTableRow {
  return {
    id: concept.name,
    name: concept.name,
    description: toDescriptionCell(concept.description),
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
 * "New concept" renders unconditionally, ahead of the loading/error/empty
 * branches below, so criterion 1 holds regardless of whichever of those
 * three states the concept list itself is currently in -- this screen's own
 * inference, disclosed in its delivery record: no criterion of that task
 * states whether the action should be hidden while the list is loading or
 * failed to load, and hiding a create action behind an unrelated read
 * failure would block authoring a concept for a reason that has nothing to
 * do with it.
 */
export function ConceptsPanel(): JSX.Element {
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
