import { Button } from "@flarekit/ui/components/ui/button";
import { RiAlertLine, RiArrowLeftLine, RiBug2Line } from "@remixicon/react";
import {
  Link,
  type UNSAFE_RemixErrorBoundary,
  isRouteErrorResponse,
} from "react-router";

interface ErrorBoundaryProps {
  error: UNSAFE_RemixErrorBoundary | unknown;
}

export function Boundary({ error }: ErrorBoundaryProps) {
  const getErrorMessage = (error: Error) => {
    if (process.env.NODE_ENV === "production") {
      return "An unexpected error occurred. Please try again later.";
    }
    return error.message;
  };

  const getContent = () => {
    if (isRouteErrorResponse(error)) {
      return {
        icon: <RiAlertLine className="size-8 text-red-600 dark:text-red-400" />,
        title: `${error.status} ${error.statusText}`,
        message: error.data,
      };
    }
    if (error instanceof Error) {
      return {
        icon: <RiBug2Line className="size-8 text-red-600 dark:text-red-400" />,
        title: "Something went wrong",
        message: getErrorMessage(error),
        stack: process.env.NODE_ENV === "development" ? error.stack : null,
      };
    }
    return {
      icon: <RiAlertLine className="size-8 text-red-600 dark:text-red-400" />,
      title: "Unknown Error",
      message: "An unexpected error occurred. Please try again later.",
    };
  };

  const { icon, title, message, stack } = getContent();

  return (
    <main className="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
            {icon}
          </div>
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-4 text-base text-muted-foreground">{message}</p>

        {stack && (
          <div className="mt-8 text-left">
            <details className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <summary className="cursor-pointer text-sm font-medium">
                Stack Trace
              </summary>
              <pre className="mt-4 text-xs overflow-auto p-4 bg-slate-100 dark:bg-slate-800 rounded">
                {stack}
              </pre>
            </details>
          </div>
        )}

        <div className="mt-10">
          <Button asChild variant="outline" size="lg">
            <Link to="/" className="flex items-center gap-2">
              <RiArrowLeftLine className="size-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
