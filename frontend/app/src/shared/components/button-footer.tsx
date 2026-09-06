import type { JSX, ReactNode } from "react";

export type ButtonFooterProps = {
  readonly children: ReactNode;
};

export function ButtonFooter({ children }: ButtonFooterProps): JSX.Element {
  return (
    <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-4 border-t border-border bg-surface py-4">
      {children}
    </div>
  );
}
