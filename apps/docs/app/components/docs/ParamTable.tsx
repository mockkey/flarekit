import { Badge } from "@flarekit/ui/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@flarekit/ui/components/ui/table";

interface Parameter {
  name: string;
  in: string;
  required: boolean;
  description?: string;
  schema?: {
    type: string;
    format?: string;
  };
}

interface ParamTableProps {
  parameters: Parameter[];
}

export function ParamTable({ parameters }: ParamTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Required</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {parameters.map((param) => (
          <TableRow key={param.name}>
            <TableCell className="font-mono">{param.name}</TableCell>
            <TableCell className="font-mono">
              {param.schema?.type}
              {param.schema?.format && (
                <span className="text-muted-foreground">
                  {" "}
                  ({param.schema.format})
                </span>
              )}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="text-xs">
                {param.in}
              </Badge>
            </TableCell>
            <TableCell>
              {param.required && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {param.description}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
