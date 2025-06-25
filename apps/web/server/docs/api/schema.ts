import { createRoute, z } from "@hono/zod-openapi";
import { createFolderSchema, fileListquerySchema } from "server/types/file";
import { MAX_FILE_SIZE } from "server/types/upload";
// import { z } from "zod";

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

const FileSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["file", "folder"]),
  size: z.number().optional(),
  mime: z.string().optional(),
  parentId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().optional(),
  url: z.string().optional(),
  thumbnail: z.string().optional(),
});

const FileListSchema = z.object({
  items: z.array(FileSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// Files API Routes
export const listFilesRoute = createRoute({
  method: "get",
  path: "/files",
  tags: ["Files"],
  summary: "List files and folders",
  description: "Get a list of files and folders in the current directory",
  security: [{ Bearer: [] }],
  request: {
    query: fileListquerySchema,
  },
  responses: {
    200: {
      description: "List of files and folders",
      content: {
        "application/json": {
          schema: FileListSchema,
        },
      },
    },
  },
});

export const floderListRoute = createRoute({
  method: "get",
  path: "/files/folder-tree",
  tags: ["Files"],
  summary: "List folders",
  description: "Get a list of folders in the current directory",
  security: [{ Bearer: [] }],
  request: {
    query: fileListquerySchema,
  },
  responses: {
    200: {
      description: "List of folders",
      content: {
        "application/json": {
          schema: FileListSchema,
        },
      },
    },
  },
});

export const getFileRoute = createRoute({
  method: "get",
  path: "/files/{id}",
  tags: ["Files"],
  summary: "Get file details",
  description: "Get details of a specific file or folder",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: "File details",
      content: {
        "application/json": {
          schema: FileSchema,
        },
      },
    },
    404: {
      description: "File not found",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const downloadFileRoute = createRoute({
  method: "get",
  path: "/files/{id}/download",
  tags: ["Files"],
  summary: "Download a file",
  description: "Download the raw file content as a binary stream.",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    302: {
      description: "Redirect to the file download URL",
      headers: {
        Location: {
          schema: { type: "string", format: "uri" },
        },
      },
    },
    404: {
      description: "File not found",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const folderCreateRoute = createRoute({
  method: "post",
  path: "/files/folder/create",
  tags: ["Files"],
  summary: "Create a new folder",
  description: "Create a new folder in the specified parent directory.",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createFolderSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Folder created successfully",
      content: {
        "application/json": {
          schema: z.object({
            id: z.string(),
            name: z.string(),
            isDir: z.literal(true),
            parentId: z.string().nullable().optional(),
            createdAt: z.string(),
          }),
        },
      },
    },
    400: {
      description: "Invalid input",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const deleteFileRoute = createRoute({
  method: "delete",
  path: "/files/delete",
  tags: ["Files"],
  summary: "Move files to trash",
  description:
    "Soft delete files or folders by moving them to trash. The files can be restored later.",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            ids: z
              .array(z.string())
              .min(1)
              .describe("Array of file IDs to delete"),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Files moved to trash successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
          }),
        },
      },
    },
    404: {
      description: "One or more files not found",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const permanentDeleteFileRoute = createRoute({
  method: "delete",
  path: "/files/permanent-delete",
  tags: ["Files"],
  summary: "Permanently delete files",
  description:
    "Permanently delete files or folders. This action cannot be undone.",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            ids: z
              .array(z.string())
              .min(1)
              .describe("Array of file IDs to permanently delete"),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Files deleted permanently",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
          }),
        },
      },
    },
    404: {
      description: "One or more files not found",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const renameFileRoute = createRoute({
  method: "post",
  path: "/files/rename",
  tags: ["Files"],
  summary: "Rename a file or folder",
  description: "Rename a file or folder. Name must be 1-60 characters.",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            id: z.string().min(1, "ID is required"),
            name: z.string().min(1).max(60),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "File or folder renamed",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            data: FileSchema,
          }),
        },
      },
    },
    404: {
      description: "File or folder not found",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const breadcrumbsFileRoute = createRoute({
  method: "get",
  path: "/files/breadcrumbs/{parentId}",
  tags: ["Files"],
  summary: "Get breadcrumbs",
  description: "Get breadcrumb navigation for a folder.",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      parentId: z.string().nullable().describe("The folder id, null for root"),
    }),
  },
  responses: {
    200: {
      description: "Breadcrumbs list",
      content: {
        "application/json": {
          schema: z.array(
            z.object({
              id: z.string().nullable(),
              name: z.string(),
              parentId: z.string().nullable(),
            }),
          ),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

// Upload API Routes
export const uploadFileRoute = createRoute({
  method: "put",
  path: "/file/upload",
  tags: ["Upload"],
  summary: "Upload a file",
  description:
    "Upload a file using multipart/form-data. Returns the uploaded file's metadata.",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            parentId: z.string().optional(),
            hash: z.string(),
            file: z
              .instanceof(File)
              .openapi({
                type: "string",
                format: "binary",
                description:
                  "The actual file to upload (e.g., image, document).,",
              })
              .refine((file) => file.size <= MAX_FILE_SIZE, {
                message: "File size must be less than 10MB",
              }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "File uploaded successfully",
      content: {
        "application/json": {
          schema: z.object({
            fileId: z.string(),
            name: z.string(),
            size: z.number(),
            mime: z.string(),
            url: z.string(),
            parentId: z.string().optional(),
          }),
        },
      },
    },
  },
});

// Trash API Routes
export const listTrashRoute = createRoute({
  method: "get",
  path: "/files/trash",
  tags: ["Trash"],
  summary: "List items in trash",
  description: "Retrieve a list of files and folders in the trash",
  security: [{ Bearer: [] }],
  request: {
    query: z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: "List of items in trash",
      content: {
        "application/json": {
          schema: FileListSchema,
        },
      },
    },
  },
});

export const restoreFileRoute = createRoute({
  method: "post",
  path: "/files/trash/restore/{id}",
  tags: ["Trash"],
  summary: "Restore a file from trash",
  description: "Move a file or folder from trash back to its original location",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: "File restored successfully",
      content: {
        "application/json": {
          schema: FileSchema,
        },
      },
    },
    404: {
      description: "File not found",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const deleteTrashItemRoute = createRoute({
  method: "delete",
  path: "/files/trash/{id}",
  tags: ["Trash"],
  summary: "Permanently delete a file",
  description: "Permanently delete a file or folder from trash",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: "File permanently deleted",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
          }),
        },
      },
    },
    404: {
      description: "File not found",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const storageQuotaRoute = createRoute({
  method: "get",
  path: "/storage/remaining",
  tags: ["Storage"],
  summary: "Get storage quota",
  description: "Get the used and total storage quota for the current user.",
  security: [{ Bearer: [] }],
  responses: {
    200: {
      description: "Storage quota info",
      content: {
        "application/json": {
          schema: z.object({
            usedStorage: z.number().describe("Used storage size"),
            totalStorage: z.number().describe("Total storage size"),
            isPro: z.boolean().describe("Whether the user is a Pro user"),
          }),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});
