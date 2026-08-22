import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import "./design-system/tokens.css";
import { router } from "./routes/route-tree";
import { queryClient } from "./services/query-client";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root was not found in index.html.");
}

// QueryClientProvider wraps RouterProvider so every routed screen -- present
// and future -- shares the one module-level queryClient instance
// (task/frontend-console-foundation/query-client-and-toaster) rather than
// each reaching for its own client.
createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
