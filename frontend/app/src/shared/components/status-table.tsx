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

export type StatusTableColumn = {
  key: string;
  header: string;
};

export type StatusTableRow = Record<string, unknown>;

export type StatusTableProps = {
  columns: StatusTableColumn[];
  rows: StatusTableRow[];

  onRowClick?: (row: StatusTableRow) => void;
};

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

function renderPlainValue(value: unknown): ReactNode {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }
  return String(value);
}

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

function getRowKey(row: StatusTableRow): string {
  const candidate = row.id;
  if (typeof candidate === "string" || typeof candidate === "number") {
    return String(candidate);
  }
  return JSON.stringify(row);
}

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
