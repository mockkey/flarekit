import { TableCell, TableRow } from "@flarekit/ui/components/ui/table";

export function FileListSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i.toString()} className="animate-pulse">
          {/* Checkbox */}
          <TableCell className="w-[40px]">
            <div className="size-4 bg-muted rounded" />
          </TableCell>
          {/* File Name */}
          <TableCell>
            <div className="flex items-center gap-3">
              <div className="size-5 bg-muted rounded" />
              <div className="h-4 w-[180px] bg-muted rounded" />
            </div>
          </TableCell>
          {/* Modified Time */}
          <TableCell>
            <div className="h-4 w-[120px] bg-muted rounded" />
          </TableCell>
          {/* Type */}
          <TableCell>
            <div className="h-4 w-[60px] bg-muted rounded" />
          </TableCell>
          {/* Size */}
          <TableCell>
            <div className="h-4 w-[60px] bg-muted rounded" />
          </TableCell>
          {/* Created Time */}
          <TableCell>
            <div className="h-4 w-[120px] bg-muted rounded" />
          </TableCell>
          {/* Actions */}
          <TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <div className="size-8 bg-muted rounded" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
