import { useEffect, useState, type JSX } from "react";
import { Button } from "@tui/ui/button";
import { Input } from "@tui/ui/input";
import { Label } from "@tui/ui/label";
import { Select, type SelectOption } from "@tui/ui/select";
import { useManifestRowRevisions } from "../hooks/use-manifest-row-revisions";
import type { ManifestCandidate, PlaceExistingError } from "../hooks/use-manifest-builder";

const NO_FURTHER_HYPOTHESES_MESSAGE =
  "This case holds no further composed hypothesis to place in this version's manifest.";
const LOADING_CANDIDATES_MESSAGE = "Loading this case's hypotheses…";
const POSITION_ERROR_ID = "place-existing-hypothesis-position-error";

type RevisionPickerProps = {
  readonly slug: string;
  readonly hypothesisName: string;
  readonly value: number | null;
  readonly onChange: (revision: number) => void;
  readonly disabled: boolean;
};

function RevisionPicker({
  slug,
  hypothesisName,
  value,
  onChange,
  disabled,
}: RevisionPickerProps): JSX.Element {
  const { revisions, highestRevision, isLoading } = useManifestRowRevisions(slug, hypothesisName);

  useEffect(() => {
    if (value === null && highestRevision !== undefined) {
      onChange(highestRevision);
    }
  }, [value, highestRevision, onChange]);

  const options: SelectOption[] = revisions.map((item) => ({
    value: String(item.revision),
    label: String(item.revision),
  }));

  return (
    <Select
      value={value !== null ? String(value) : null}
      onChange={(next) => onChange(Number(next))}
      options={options}
      disabled={disabled || isLoading}
      placeholder="Select a revision"
    />
  );
}

export type PlaceExistingHypothesisControlProps = {
  readonly slug: string;
  readonly candidates: readonly ManifestCandidate[];
  readonly candidatesAnswered: boolean;
  readonly placeError: PlaceExistingError | null;
  readonly disabled: boolean;
  readonly onPlace: (hypothesisName: string, revision: number, position: number) => void;
};

export function PlaceExistingHypothesisControl({
  slug,
  candidates,
  candidatesAnswered,
  placeError,
  disabled,
  onPlace,
}: PlaceExistingHypothesisControlProps): JSX.Element {
  const [hypothesisName, setHypothesisName] = useState<string | null>(null);
  const [revision, setRevision] = useState<number | null>(null);
  const [positionText, setPositionText] = useState("");

  if (!candidatesAnswered) {
    return <p className="text-sm text-muted-foreground">{LOADING_CANDIDATES_MESSAGE}</p>;
  }
  if (candidates.length === 0) {
    return <p>{NO_FURTHER_HYPOTHESES_MESSAGE}</p>;
  }

  const position = Number(positionText);
  const positionIsValid = positionText.trim() !== "" && Number.isInteger(position);
  const canConfirm = !disabled && hypothesisName !== null && revision !== null && positionIsValid;
  const errorMessage =
    placeError !== null && placeError.hypothesisName === hypothesisName ? placeError.message : null;

  const candidateOptions: SelectOption[] = candidates.map((candidate) => ({
    value: candidate.name,
    label: candidate.name,
  }));

  function handleHypothesisChange(value: string): void {
    setHypothesisName(value);
    setRevision(null);
  }

  function handleConfirm(): void {
    if (!canConfirm || hypothesisName === null || revision === null) {
      return;
    }
    onPlace(hypothesisName, revision, position);
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-end gap-2">
        <Label className="flex min-w-0 flex-1 flex-col gap-1">
          Hypothesis to place
          <Select
            value={hypothesisName}
            onChange={handleHypothesisChange}
            options={candidateOptions}
            disabled={disabled}
            placeholder="Select a hypothesis"
          />
        </Label>
        {hypothesisName !== null && (
          <Label className="flex w-28 flex-col gap-1">
            Revision
            <RevisionPicker
              slug={slug}
              hypothesisName={hypothesisName}
              value={revision}
              onChange={setRevision}
              disabled={disabled}
            />
          </Label>
        )}
        <Label className="flex w-24 flex-col gap-1">
          Position
          <Input
            type="number"
            value={positionText}
            onChange={(event) => setPositionText(event.target.value)}
            disabled={disabled}
            aria-invalid={errorMessage !== null}
            aria-describedby={errorMessage !== null ? POSITION_ERROR_ID : undefined}
          />
        </Label>
        <Button type="button" onClick={handleConfirm} disabled={!canConfirm}>
          Place hypothesis
        </Button>
      </div>
      {errorMessage !== null && (
        <p id={POSITION_ERROR_ID} role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
