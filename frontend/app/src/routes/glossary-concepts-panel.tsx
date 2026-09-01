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

const CONCEPTS_COLUMNS: StatusTableColumn[] = [
  { key: "name", header: "Name" },
  { key: "description", header: "Description" },
  { key: "accepts", header: "Accepts" },
  { key: "ttl", header: "TTL" },
  { key: "actions", header: "" },
];

function formatTtl(ttlSeconds: number): string {
  return `${ttlSeconds}s`;
}

function toDescriptionCell(
  description: string,
): string | { readonly color: string; readonly label: string } {
  if (description === "") {
    return { color: "bg-muted-foreground", label: "Awaiting description" };
  }
  return description;
}

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

export function ConceptsPanel(): JSX.Element {
  const { concepts, isLoading, isError, refetch } = useGlossaryConcepts();
  const [formTarget, setFormTarget] = useState<ConceptFormTarget | null>(null);

  function renderBody(): JSX.Element {
    if (isLoading) {
      return <p>Loading concepts…</p>;
    }
    if (isError) {

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
