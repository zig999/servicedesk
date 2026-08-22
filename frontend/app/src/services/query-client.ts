/**
 * The one module-level @tanstack/react-query QueryClient this app's whole
 * routed tree shares (task/frontend-console-foundation/query-client-and-
 * toaster). TUI's own shared/lib/query-client.ts is not importable across
 * this app's alias -- it sits inside the vendored, read-only submodule and
 * is reached only through @tui/ui/* and @tui/lib/*, neither of which
 * exposes it -- so this module replicates its documented shape instead of
 * inventing a different retry/error policy, per the substrate inventory's
 * own convention ("The global QueryClient is a single module-level instance
 * with retry:1 and a QueryCache-level onError that fires a sonner toast;
 * staleTime is set per query ..., never on the client.").
 *
 * Errors are handled centrally here, at the QueryCache level, rather than
 * per query: v5 removed the per-useQuery onError callback, and a single
 * cache-level handler is the one place every background query failure can
 * surface without every call site wiring its own toast.
 */
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong while loading data.");
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      // staleTime is left unset here on purpose: it is a per-query
      // concern (stable vs. volatile data), never a client-wide default.
    },
  },
});
