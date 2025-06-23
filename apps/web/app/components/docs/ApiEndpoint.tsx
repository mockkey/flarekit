import { Badge } from "@flarekit/ui/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flarekit/ui/components/ui/card";
import { cn } from "@flarekit/ui/lib/utils";
import { ParamTable } from "./ParamTable";
import { ResponseExample } from "./ResponseExample";

interface ApiEndpointProps {
  path: string;
  method: string;
  details: {
    summary?: string;
    description?: string;
    parameters?: Array<{
      name: string;
      in: string;
      required: boolean;
      description?: string;
      schema?: {
        type: string;
        format?: string;
      };
    }>;
    requestBody?: {
      content: {
        [contentType: string]: {
          schema: unknown;
        };
      };
    };
    responses: {
      [status: string]: {
        description: string;
        content?: {
          [contentType: string]: {
            schema: unknown;
          };
        };
      };
    };
    security?: Array<{
      [resource: string]: Array<string>;
    }>;
  };
}

const MethodBadge = ({ method }: { method: string }) => {
  const colors = {
    get: "bg-blue-500/10 text-blue-500",
    post: "bg-green-500/10 text-green-500",
    put: "bg-yellow-500/10 text-yellow-500",
    delete: "bg-red-500/10 text-red-500",
  };
  const color =
    colors[method.toLowerCase() as keyof typeof colors] ||
    "bg-gray-500/10 text-gray-500";
  return (
    <Badge variant="outline" className={cn("border-0 font-mono", color)}>
      {method.toUpperCase()}
    </Badge>
  );
};

export function ApiEndpoint({ path, method, details }: ApiEndpointProps) {
  return (
    <div id={`${path}-${method}`} className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <MethodBadge method={method} />
        <code className="text-lg font-mono text-foreground">{path}</code>
      </div>

      <Card className="border-2">
        <CardHeader className="space-y-4 pb-4">
          <div>
            <CardTitle className="text-xl">{details.summary || path}</CardTitle>
            {details.description && (
              <CardDescription className="text-base mt-2">
                {details.description}
              </CardDescription>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {details.security && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-bold text-destructive tracking-wide uppercase">
                  Required Permissions
                </span>
                <svg
                  className="w-4 h-4 text-destructive"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    d="M12 9v4m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <div className="flex flex-wrap gap-2">
                {details.security.map((sec) =>
                  Object.entries(sec).map(([resource, perms]) =>
                    perms.map((perm) => (
                      <Badge
                        key={`${resource}-${perm}`}
                        variant="destructive"
                        className="font-mono text-xs"
                      >
                        {resource}:{perm}
                      </Badge>
                    )),
                  ),
                )}
              </div>
            </div>
          )}

          {/* Parameters */}
          {details.parameters && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">
                Parameters
              </h4>
              <ParamTable parameters={details.parameters} />
            </div>
          )}

          {/* Request Body */}
          {details.requestBody && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">
                Request Body
              </h4>
              <div className="space-y-4">
                {Object.entries(details.requestBody.content).map(
                  ([contentType, content]) => (
                    <div key={contentType} className="space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground">
                        Content Type: {contentType}
                      </h5>
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                        <code className="text-sm text-muted-foreground">
                          {JSON.stringify(content.schema, null, 2)}
                        </code>
                      </pre>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Responses */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Responses</h4>
            <div className="space-y-4">
              {Object.entries(details.responses).map(([status, response]) => (
                <ResponseExample
                  key={status}
                  status={status}
                  response={response}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
