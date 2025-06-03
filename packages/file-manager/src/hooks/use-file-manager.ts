import { fetchData, postData } from "@flarekit/common/fetch";
import {
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
  createdAt: number;
  parentId: string | null;
  storagePath: string | null;
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
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.refetchQueries({ queryKey });
    },
  });
};

export const useChangeFileName = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (queryString: { id: string; name: string }) => {
      return postData<{ key: string }>("/rpc/files/change-name", queryString);
    },
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.refetchQueries({ queryKey, type: "active" });
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (queryString: { id: string }) => {
      return postData<{ key: string }>("/rpc/files/delete", queryString);
    },
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.refetchQueries({ queryKey, type: "active" });
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
