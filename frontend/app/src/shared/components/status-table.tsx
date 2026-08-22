import { isValidElement, type JSX, type KeyboardEvent, type ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tui/ui/table";
import { cn } from "@tui/lib/cn";

/** One column of a StatusTable: which key of a row it reads, and the label its header shows. */
export type StatusTableColumn = {
  key: string;
  header: string;
};

/** One row's data, keyed the same way `columns[].key` names it -- generic and data-driven. */
export type StatusTableRow = Record<string, unknown>;

export type StatusTableProps = {
  columns: StatusTableColumn[];
  rows: StatusTableRow[];
  /** Called with the clicked row's data; when absent, a row renders inert. */
  onRowClick?: (row: StatusTableRow) => void;
};

/** The shape a cell's value takes when it names a status: a color and the word for it. */
type StatusCellValue = {
  color: string;
  label: string;
};

function isStatusCellValue(value: unknown): value is StatusCellValue {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- guarded by the typeof/null check above; narrows rather than asserts past a check
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.color === "string" && typeof candidate.label === "string"
  );
}

/** Renders a value that is not a status cell -- a primitive as itself, anything else as text. */
function renderPlainValue(value: unknown): ReactNode {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }
  return String(value);
}

/**
 * A status-shaped value always renders its color and its word together --
 * `value.color` is composed as a class on the dot through `cn()` (this
 * catalog's own class-merge helper) rather than an inline style, so the
 * color and the word can never be shown one without the other.
 *
 * A value that is itself a React element (e.g. a caller-composed action
 * such as a router `Link`) renders exactly as given, ahead of the plain-value
 * fallback below -- that fallback stringifies anything that is not a
 * primitive, which would turn an element into unreadable text instead of
 * rendering it. This is additive: a value that already satisfied the status
 * cell or the primitive branch never reaches this check.
 */
function renderCellContent(value: unknown): ReactNode {
  if (isStatusCellValue(value)) {
    return (
      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden="true"
          className={cn("inline-block h-2 w-2 rounded-full", value.color)}
        />
        <span>{value.label}</span>
      </span>
    );
  }
  if (typeof value === "object" && isValidElement(value)) {
    return value;
  }
  return renderPlainValue(value);
}

/** Prefers a row's own `id`; falls back to its serialized content so no key is index-derived. */
function getRowKey(row: StatusTableRow): string {
  const candidate = row.id;
  if (typeof candidate === "string" || typeof candidate === "number") {
    return String(candidate);
  }
  return JSON.stringify(row);
}

/**
 * A reusable, data-driven table composed entirely over TUI's compound Table
 * primitives (@tui/ui/table): columns and rows come from the caller, never
 * hard-coded. Clicking a row calls `onRowClick` with that row's data instead
 * of rendering a hand-rolled anchor per row; a row without `onRowClick`
 * renders inert. Any cell value shaped like `{ color, label }` always shows
 * both together, never one alone.
 */
export function StatusTable({
  columns,
  rows,
  onRowClick,
}: StatusTableProps): JSX.Element {
  function handleRowKeyDown(
    row: StatusTableRow,
    event: KeyboardEvent<HTMLTableRowElement>,
  ): void {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    onRowClick?.(row);
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={getRowKey(row)}
            className={cn(onRowClick && "cursor-pointer")}
            role={onRowClick ? "button" : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            onKeyDown={onRowClick ? (event) => handleRowKeyDown(row, event) : undefined}
          >
            {columns.map((column) => (
              <TableCell key={column.key}>
                {renderCellContent(row[column.key])}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
