import { create } from "zustand";

export type Sort = "name" | "size" | "deletedAt" | undefined;

interface FileState {
  currentFolderId: string | null;

  isLoading: boolean;
  error: Error | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    limit: number;
  };
  sort?: Sort;
  order: "asc" | "desc";
  search: string;
  breadcrumbs: { id: string | null; name: string }[];

  // Actions
  setCurrentFolder: (folderId: string | null) => void;
  setPagination: (pagination: Partial<FileState["pagination"]>) => void;
  setSort: (sort: FileState["sort"]) => void;
  setOrder: (order: FileState["order"]) => void;
  setSearch: (search: string) => void;
  setBreadcrumbs: (breadcrumbs: { id: string | null; name: string }[]) => void;
}

export const useFileTrashStore = create<FileState>((set) => ({
  currentFolderId: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  },
  sort: "deletedAt",
  order: "desc",
  search: "",
  breadcrumbs: [{ id: null, name: "Root" }], // Helper methods
  // Actions
  setCurrentFolder: (folderId) => {
    set({ currentFolderId: folderId });
    // You might want to reset pagination when changing folders
    set((state) => ({
      pagination: { ...state.pagination, currentPage: 1 },
    }));
  },

  setPagination: (pagination) =>
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    })),

  setSort: (sort) =>
    set((state) => {
      // Reset to page 1 when sorting changes
      return {
        sort: sort,
        pagination: { ...state.pagination, currentPage: 1 },
      };
    }),
  setOrder: (order) =>
    set((state) => {
      return {
        order: order,
        pagination: { ...state.pagination, currentPage: 1 },
      };
    }),

  setSearch: (search) =>
    set((state) => {
      // Reset to page 1 when search changes
      return {
        search,
        pagination: { ...state.pagination, currentPage: 1 },
      };
    }),

  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
}));
