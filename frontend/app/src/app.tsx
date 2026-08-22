import type { JSX } from "react";
import { Divider } from "@tui/ui/divider";

/**
 * The minimal shell this task's own criteria call for. Rendering a real TUI
 * catalog component through the @tui/ui/* alias is what makes "the alias
 * resolves" and "the tokens import chain resolves" falsifiable by an actual
 * build rather than merely configured -- see vite.config.ts's alias entries
 * and src/design-system/tokens.css's own @import chain, both exercised by
 * this component reaching the bundle.
 */
export function App(): JSX.Element {
  return (
    <main>
      <h1>Case Authoring Console</h1>
      <Divider label="Substrate" />
    </main>
  );
}
