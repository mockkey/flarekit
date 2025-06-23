import { Badge } from "@flarekit/ui/components/ui/badge";
import { cn } from "@flarekit/ui/lib/utils";

interface Response {
  description: string;
  content?: {
    [contentType: string]: {
      schema: unknown;
    };
  };
}

interface ResponseExampleProps {
  status: string;
  response: Response;
}

const StatusBadge = ({ status }: { status: string }) => {
  const colors = {
    "2": "bg-green-500/10 text-green-500",
    "4": "bg-red-500/10 text-red-500",
    "5": "bg-red-500/10 text-red-500",
  };
  const color =
    colors[status[0] as keyof typeof colors] || "bg-gray-500/10 text-gray-500";
  return (
    <Badge variant="outline" className={cn("border-0 font-mono", color)}>
      {status}
    </Badge>
  );
};

export function ResponseExample({ status, response }: ResponseExampleProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <StatusBadge status={status} />
        <span className="text-sm font-medium text-foreground">
          {response.description}
        </span>
      </div>
      {response.content && (
        <div className="space-y-3">
          {Object.entries(response.content).map(([contentType, content]) => (
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
          ))}
        </div>
      )}
    </div>
  );
}
