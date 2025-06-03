import { TableCell, TableRow } from "@flarekit/ui/components/ui/table";

export function FileListSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i.toString()} className="animate-pulse">
          <TableCell className="w-[50px]">
            <div className="size-5 bg-muted rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-[180px] bg-muted rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-[60px] bg-muted rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-[120px] bg-muted rounded" />
          </TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <div className="size-8 bg-muted rounded" />
              <div className="size-8 bg-muted rounded" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
