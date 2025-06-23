import { deleteData, fetchData, postData } from "@flarekit/common/fetch";
import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { FileItem, UseFilesTrashOptions } from "./use-file-manager";

const queryKey = ["trash-list"];

interface TrashListResponse {
  items: FileItem[];
  total: number;
  page: number;
  totalPages: number;
}

interface TrashResponse {
  pages: TrashListResponse[];
  pageParams: number;
}

const DEFAULT_OPTIONS: UseFilesTrashOptions = {
  page: 1,
  limit: 10,
  sort: "deletedAt",
  order: "desc",
};

export function useTrashList(options: UseFilesTrashOptions = {}) {
  const queryOptions = { ...DEFAULT_OPTIONS, ...options };
  // const queryKeys = [queryKey, queryOptions];
  return useInfiniteQuery<
    TrashListResponse,
    Error,
    TrashResponse,
    (string | number | null | undefined)[],
    number
  >({
    queryKey: [
      ...queryKey,
      options.page,
      options.limit,
      options.sort,
      options.order,
      options.search,
    ],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams();
      Object.entries(queryOptions).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "page") {
            params.append(key, String(pageParam));
          } else {
            params.append(key, String(value));
          }
        }
      });
      return fetchData<TrashListResponse>(`/rpc/files/trash?${params}`);
    },
    getNextPageParam: (
      lastPage: TrashListResponse,
      allPages: TrashListResponse[],
    ) => {
      const loaded = allPages.flatMap((p) => p.items).length;
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
    getPreviousPageParam: (firstPage: TrashListResponse) => {
      if (firstPage.page > 1) {
        return firstPage.page - 1;
      }
      return undefined;
    },
  });
}

export const useDeleteTrashFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (queryString: { id: string }) => {
      return deleteData<{ key: string }>(`/rpc/files/trash/${queryString.id}`);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previousFilesData = queryClient.getQueriesData({
        queryKey: ["file-list", ...queryKey],
      });
      previousFilesData.map((previousFilesItem) => {
        queryClient.setQueryData<InfiniteData<TrashListResponse>>(
          [...previousFilesItem[0]],
          (oldData) => {
            if (!oldData) {
              return { pages: [], pageParams: [] };
            }
            const newPages = oldData.pages.map((items) => ({
              ...items,
              items: items.items.filter((file) => file.id !== variables.id),
            }));
            return {
              ...oldData,
              pages: newPages,
            };
          },
        );
      });
      return { previousFilesData };
    },
    onError: () => {
      console.error("rename:");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["file-list", ...queryKey],
      });
      queryClient.invalidateQueries({
        queryKey: [...queryKey],
      });
      queryClient.invalidateQueries({
        queryKey: ["file-manager"],
      });
    },
  });
};

export const useRestoreFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (queryString: { id: string }) => {
      return postData<{ key: string }>(
        `/rpc/files/trash/restore/${queryString.id}`,
      );
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previousFilesData = queryClient.getQueriesData({
        queryKey: ["file-list", ...queryKey],
      });
      previousFilesData.map((previousFilesItem) => {
        queryClient.setQueryData<InfiniteData<TrashListResponse>>(
          [...previousFilesItem[0]],
          (oldData) => {
            if (!oldData) {
              return { pages: [], pageParams: [] };
            }
            const newPages = oldData.pages.map((items) => ({
              ...items,
              items: items.items.filter((file) => file.id !== variables.id),
            }));
            return {
              ...oldData,
              pages: newPages,
            };
          },
        );
      });
      return { previousFilesData };
    },
    onError: () => {
      console.error("rename:");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["file-list", ...queryKey],
      });
      queryClient.invalidateQueries({
        queryKey: [...queryKey],
      });
    },
  });
};
