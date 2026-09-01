import type { JSX } from "react";
import { Divider } from "@tui/ui/divider";

export function App(): JSX.Element {
  return (
    <main>
      <h1>Case Authoring Console</h1>
      <Divider label="Substrate" />
    </main>
  );
}
