import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { useRef } from "react";

interface DashboardWrapperProps {
  children: React.ReactNode;
}

function DashboardWrapper({ children }: DashboardWrapperProps) {
  const queryClientRef = useRef<QueryClient | null>(null);
  let parentQueryClient: QueryClient | undefined;
  try {
    parentQueryClient = useQueryClient();
  } catch (_error) {
    console.warn(
      "DashboardWrapper: No parent QueryClientProvider detected. This wrapper will provide one internally.",
    );
  }
  if (!parentQueryClient) {
    if (!queryClientRef.current) {
      queryClientRef.current = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // Default configuration for fallback QueryClient
            refetchOnWindowFocus: true,
            retry: 3,
          },
        },
      });
    }
    return (
      <QueryClientProvider client={queryClientRef.current}>
        {children}
      </QueryClientProvider>
    );
  }
  return <>{children}</>;
}

export default DashboardWrapper;
