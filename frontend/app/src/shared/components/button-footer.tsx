import type { JSX, ReactNode } from "react";

export type ButtonFooterProps = {
  readonly children: ReactNode;
};

export function ButtonFooter({ children }: ButtonFooterProps): JSX.Element {
  return (
    <div
      role="group"
      aria-label="Actions"
      className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-4 border-t border-border bg-surface px-4 py-4"
    >
      {children}
    </div>
  );
}
