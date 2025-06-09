import { fetchData, postData } from "@flarekit/common/fetch";
import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const queryKey = ["file-manager"];

export interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size: number;
  mime: string | null;
  createdAt: number | string;
  parentId: string | null;
  storagePath: string | null;
  url: string | null;
}

interface FilesResponse {
  items: FileItem[];
  total: number;
  page: number;
  totalPages: number;
}

interface TFilesResponse {
  pages: FilesResponse[];
  pageParams: number;
}

export interface UseFilesOptions {
  page?: number;
  limit?: number;
  sort?: "name" | "size" | "createdAt";
  order?: "asc" | "desc";
  search?: string;
  parentId?: string | null;
}

export const DEFAULT_OPTIONS: UseFilesOptions = {
  page: 1,
  limit: 10,
  sort: "createdAt",
  order: "desc",
  parentId: null,
};

export function useFiles(options: UseFilesOptions = {}) {
  const queryOptions = { ...DEFAULT_OPTIONS, ...options };
  // const queryKeys = [queryKey, queryOptions];
  return useInfiniteQuery<
    FilesResponse,
    Error,
    TFilesResponse,
    (string | number | null | undefined)[],
    number
  >({
    queryKey: [
      "file-list",
      ...queryKey,
      options.page,
      options.limit,
      options.sort,
      options.order,
      options.search,
      options.parentId,
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
      return fetchData<FilesResponse>(`/rpc/files?${params}`);
    },
    getNextPageParam: (lastPage: FilesResponse, allPages: FilesResponse[]) => {
      const loaded = allPages.flatMap((p) => p.items).length;
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
    getPreviousPageParam: (firstPage: FilesResponse) => {
      if (firstPage.page > 1) {
        return firstPage.page - 1;
      }
      return undefined;
    },
  });
}

interface createFileParams {
  name: string;
  parentId: string | null;
}

export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (queryString: createFileParams) => {
      return postData<{ key: string }>("/rpc/files/folder/create", queryString);
    },
    onMutate: async (variables: { name: string; parentId: string | null }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousFilesData = queryClient.getQueriesData({
        queryKey: ["file-list", ...queryKey],
      });
      previousFilesData.map((previousFilesItem) => {
        queryClient.setQueryData<InfiniteData<FilesResponse>>(
          [...previousFilesItem[0]],
          (oldData) => {
            if (!oldData) {
              return { pages: [], pageParams: [] };
            }

            const newPages = oldData.pages.map((items) => ({
              ...items,
              items: [
                {
                  id: crypto.randomUUID(),
                  name: variables.name,
                  type: "folder" as const,
                  parentId: variables.parentId,
                  size: 0,
                  mime: null,
                  storagePath: null,
                  url: null,
                  createdAt: new Date().toISOString(),
                },
                ...items.items,
              ],
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
    onError(_error, _variables, context) {
      context?.previousFilesData.map((previousFilesData) => {
        const queryKey = previousFilesData[0];
        const preData = previousFilesData[1];
        queryClient.setQueryData(queryKey, preData);
      });
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

export const useChangeFileName = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (queryString: { id: string; name: string }) => {
      console.log("mutationFn");
      return postData<{ key: string }>("/rpc/files/change-name", queryString);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previousFilesData = queryClient.getQueriesData({
        queryKey: ["file-list", ...queryKey],
      });
      previousFilesData.map((previousFilesItem) => {
        queryClient.setQueryData<InfiniteData<FilesResponse>>(
          [...previousFilesItem[0]],
          (oldData) => {
            if (!oldData) {
              return { pages: [], pageParams: [] };
            }
            const newPages = oldData.pages.map((items) => ({
              ...items,
              items: items.items.map((file) =>
                file.id === variables.id
                  ? { ...file, name: variables.name }
                  : file,
              ),
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
    onError(_error, _variables, context) {
      context?.previousFilesData.map((previousFilesData) => {
        const queryKey = previousFilesData[0];
        const preData = previousFilesData[1];
        queryClient.setQueryData(queryKey, preData);
      });
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

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (queryString: { id: string }) => {
      return postData<{ key: string }>("/rpc/files/delete", queryString);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previousFilesData = queryClient.getQueriesData({
        queryKey: ["file-list", ...queryKey],
      });
      previousFilesData.map((previousFilesItem) => {
        queryClient.setQueryData<InfiniteData<FilesResponse>>(
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

export function useStorage() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch("/rpc/files/storage");
      if (!res.ok) {
        throw new Error("Failed to fetch storage info");
      }
      return res.json();
    },
  });
}

export const useGetDownloadUrl = () => {
  return useMutation({
    mutationFn: async (fileId: string) => {
      const response = await fetchData<{ url: string }>(
        `/rpc/files/download/${fileId}`,
      );
      return response.url;
    },
  });
};
