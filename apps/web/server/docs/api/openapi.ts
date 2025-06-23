import { OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import {
  breadcrumbsFileRoute,
  deleteFileRoute,
  deleteTrashItemRoute,
  downloadFileRoute,
  folderCreateRoute,
  getFileRoute,
  listFilesRoute,
  listTrashRoute,
  permanentDeleteFileRoute,
  renameFileRoute,
  restoreFileRoute,
  storageQuotaRoute,
  uploadFileRoute,
} from "./schema";

const api = new OpenAPIHono();

// Register routes
api.openapi(listFilesRoute, (c: Context) => {
  return c.json(
    {
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
    200,
  );
});

api.openapi(getFileRoute, (c: Context) => {
  return c.json(
    {
      id: "file_123",
      name: "example.jpg",
      type: "file" as const,
      size: 1024,
      mime: "image/jpeg",
      createdAt: "2024-03-20T12:00:00Z",
      updatedAt: "2024-03-20T12:00:00Z",
    },
    200,
  );
});

api.openapi(uploadFileRoute, (c: Context) => {
  return c.json(
    {
      name: "example.jpg",
      fileId: "hmmtce6c06vbhlmmwpu3niuh",
      type: "file",
      size: 1024,
      mime: "image/jpeg",
      url: "/viewer/htssliqr7h762w8zxh7siq5t",
    },
    200,
  );
});

api.openapi(folderCreateRoute, (c: Context) => {
  return c.json(
    {
      id: "folder_123",
      name: "New Folder",
      isDir: true as const,
      createdAt: "2024-03-20T12:00:00Z",
    },
    201,
  );
});

api.openapi(downloadFileRoute, (c) => {
  return c.redirect("https://example.com/presigned-download-url", 302);
});

api.openapi(deleteFileRoute, (c: Context) => {
  return c.json({ success: true }, 200);
});

api.openapi(permanentDeleteFileRoute, (c: Context) => {
  return c.json({ success: true }, 200);
});

api.openapi(listTrashRoute, (c: Context) => {
  return c.json(
    {
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
    200,
  );
});

api.openapi(restoreFileRoute, (c: Context) => {
  return c.json(
    {
      id: "file_123",
      name: "example.jpg",
      type: "file" as const,
      size: 1024,
      mime: "image/jpeg",
      createdAt: "2024-03-20T12:00:00Z",
      updatedAt: "2024-03-20T12:00:00Z",
    },
    200,
  );
});

api.openapi(deleteTrashItemRoute, (c: Context) => {
  return c.json(
    {
      success: true,
    },
    200,
  );
});

api.openapi(renameFileRoute, (c: Context) => {
  return c.json(
    {
      message: "ok",
      data: {
        id: "file_123",
        name: "newname.txt",
        type: "file" as const,
        size: 1024,
        mime: "text/plain",
        createdAt: "2024-03-20T12:00:00Z",
        updatedAt: "2024-03-20T12:00:00Z",
        parentId: "folder_456",
      },
    },
    200,
  );
});

api.openapi(breadcrumbsFileRoute, (c: Context) => {
  return c.json(
    [
      { id: null, name: "Root", parentId: null },
      { id: "folder_1", name: "name2", parentId: null },
      { id: "folder_2", name: "name3", parentId: "folder_1" },
      { id: "folder_3", name: "name4", parentId: "folder_2" },
    ],
    200,
  );
});

api.openapi(storageQuotaRoute, (c: Context) => {
  return c.json({ usedStorage: 1024, totalStorage: 10240, isPro: false }, 200);
});

api.doc31("/api-docs", {
  openapi: "3.0.0",
  info: {
    title: "FlareKit API",
    version: "1.0.0",
    description:
      "API documentation for FlareKit - A modern file management system",
  },
  servers: [
    {
      url: "/api/v1",
      description: "Production server",
    },
  ],
  tags: [
    {
      name: "Files",
      description: "File management operations",
    },
    {
      name: "Upload",
      description: "File upload operations",
    },
    {
      name: "Trash",
      description: "Trash management operations",
    },
    {
      name: "Storage",
      description: "Storage management operations",
    },
  ],
  security: [
    {
      BearerAuth: [],
    },
  ],
});

api.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});

export default api;
