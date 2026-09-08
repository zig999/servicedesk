import { type JSX, type ReactNode, useContext } from "react";
import { createPortal } from "react-dom";
import { FooterSlotContext } from "./footer-slot-context";

export type ButtonFooterProps = {
  readonly children: ReactNode;
};

export function ButtonFooter({ children }: ButtonFooterProps): JSX.Element {
  const footerSlotNode = useContext(FooterSlotContext);

  const group = (
    <div
      role="group"
      aria-label="Actions"
      className="flex flex-wrap items-center justify-end gap-4 border-t border-border bg-surface px-4 py-4"
    >
      {children}
    </div>
  );

  if (footerSlotNode === null) {
    return group;
  }

  return createPortal(group, footerSlotNode);
}
