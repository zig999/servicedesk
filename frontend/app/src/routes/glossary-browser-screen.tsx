import type { JSX } from "react";
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
import { ConceptsPanel } from "./glossary-concepts-panel";

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
 * The Concepts tab's own body -- listing, create/edit
 * (task/concept-authoring/concept-create-edit-form) and, per concept, its
 * own description with the empty-description marker
 * (task/glossary-concept-description/browser-description-and-legacy-marker,
 * rules/glossary/a-concept-with-an-empty-description-is-read-as-awaiting-one)
 * -- lives in its own glossary-concepts-panel.tsx rather than inline here:
 * extracted once the description column and its marker would otherwise have
 * pushed this file past MNT-01's own three-hundred-line cap, this task's own
 * inference disclosed in its delivery record. The five term-vocabulary tabs
 * stay exactly as read-only as this screen's own original delivery left
 * them, and inline here, since none of those tasks touches any of them.
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

const VOCABULARY_COLUMNS: StatusTableColumn[] = [{ key: "name", header: "Name" }];

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
