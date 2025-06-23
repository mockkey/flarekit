import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flarekit/ui/components/ui/card";

import { memo } from "react";
import { TrashList } from "./components/trash-list";
import { useTrashList } from "./hooks/use-trash";
import { type Sort, useFileTrashStore } from "./store/use-file-trash-store";

const RecycleBinDashboard = () => {
  const { search, setSort, pagination, sort, order, setOrder } =
    useFileTrashStore();

  const { data, isLoading, error, fetchNextPage, hasNextPage } = useTrashList({
    page: pagination.currentPage,
    search,
    sort,
    order,
  });
  const files = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="space-y-6">
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Recycle Bin</CardTitle>
              <CardDescription>
                Manage deleted files and folders.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <TrashList
            files={files}
            isLoading={isLoading}
            error={error}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            onSortChange={(field, order) => {
              setOrder(order);
              setSort(field as Sort);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default memo(RecycleBinDashboard);
