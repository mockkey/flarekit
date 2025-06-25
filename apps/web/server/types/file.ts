import { z } from "zod";

export interface fileMeta {
  name: string;
  hash: string;
  type: string;
  size: number;
  parentId: null | string;
}

export const fileListquerySchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.enum(["10", "20", "30", "50"]).transform(Number).default("10"),
  sort: z.enum(["name", "size", "createdAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
  parentId: z.string().nullable().optional(),
});

export const trashFileListquerySchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("10"),
  sort: z.enum(["name", "size", "deletedAt"]).default("deletedAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const createFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  parentId: z.string().nullable().optional(),
});

export const fileIdSchema = z.object({
  id: z.string(),
});

export const changeNameSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(60, "Name must be at most 60 characters long"),
});
