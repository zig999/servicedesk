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

const VOCABULARY_COLUMNS: StatusTableColumn[] = [{ key: "name", header: "Name" }];

export type VocabularyPanelProps = {
  readonly vocabulary: GlossaryVocabulary;
  readonly emptyMessage: string;
  readonly loadErrorMessage: string;
};

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
