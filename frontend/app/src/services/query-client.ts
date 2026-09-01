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
