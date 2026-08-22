import type { JSX } from "react";
import { Banner } from "@tui/ui/banner";

/**
 * A reusable conflict message, composed over TUI's Banner at its default
 * frame ("none"). An earlier revision passed `frame="notched"` to make
 * Banner's `accent="danger"` render at all -- frame="none" ignores `accent`
 * by Banner's own design -- but Panel's notched frame intentionally
 * double-renders the title as two headings and replaces Banner's implicit
 * "banner" landmark with a plain "region" (frontend/tui's own
 * banner.tsx: "double-render is intentional per spec §3.1"). Losing that
 * landmark and duplicating the heading cost more than a colored accent is
 * worth: the conflict is already conveyed through the title text and the
 * message, never through color alone, matching this app's own rule that a
 * status is never color-only (see status-table.tsx's color+label pairing).
 */
export type ConflictBannerProps = {
  title: string;
  message: string;
};

export function ConflictBanner({ title, message }: ConflictBannerProps): JSX.Element {
  return <Banner title={title} subtitle={message} />;
}
