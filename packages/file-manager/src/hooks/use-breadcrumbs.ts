import { fetchData } from "@flarekit/common/fetch";
import { useQuery } from "@tanstack/react-query";
import { useFileStore } from "../store/use-file-store";

interface Breadcrumb {
  id: string | null;
  name: string;
}

export function useBreadcrumbs(folderId: string | null) {
  const { setBreadcrumbs } = useFileStore();
  return useQuery({
    queryKey: ["breadcrumbs", folderId],
    queryFn: async () => {
      if (!folderId) {
        return [{ id: null, name: "Root" }];
      }
      const res = await fetchData<Breadcrumb[]>(
        `/rpc/files/breadcrumbs/${folderId}`,
      );
      setBreadcrumbs(res);
      return res;
    },
  });
}
