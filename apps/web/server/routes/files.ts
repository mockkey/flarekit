import { zValidator } from "@hono/zod-validator";
import { and, asc, count, desc, eq, isNull, like, ne } from "drizzle-orm";
import { Hono } from "hono";
import type { HonoEnv } from "load-context";
import { z } from "zod";
import { db } from "~/db/db.server";
import { file, userFiles } from "~/db/schema";

export const filesServer = new Hono<HonoEnv>();

// Validation schema for query parameters
const querySchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("10"),
  sort: z.enum(["name", "size", "createdAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
  parentId: z.string().nullable().optional(),
});

filesServer.get("/", zValidator("query", querySchema), async (c) => {
  try {
    const query = c.req.valid("query");
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Calculate offset based on page and limit
    const offset = (query.page - 1) * query.limit;

    // Base query conditions
    const conditions = [eq(userFiles.userId, user.id)];

    // Add parent directory condition
    if (query.parentId) {
      conditions.push(eq(userFiles.parentId, query.parentId));
    } else {
      conditions.push(isNull(userFiles.parentId)); // Root level items
    }

    // Add search condition if provided
    if (query.search) {
      conditions.push(like(userFiles.name, `%${query.search}%`));
    }

    // Get total count for pagination
    const totalQuery = await db
      .select({ count: count() })
      .from(userFiles)
      .where(and(...conditions));

    const total = Number(totalQuery[0].count);

    const sortField =
      query.sort === "name"
        ? userFiles.name
        : query.sort === "size"
          ? file.size
          : userFiles.createdAt;

    // Get files with pagination, sorting and filtering
    const files = await db
      .select({
        id: userFiles.id,
        name: userFiles.name,
        type: userFiles.isDir,
        parentId: userFiles.parentId,
        size: file.size,
        mimeType: file.mime,
        createdAt: userFiles.createdAt,
        storagePath: file.storagePath,
      })
      .from(userFiles)
      .leftJoin(file, eq(userFiles.fileId, file.id))
      .where(and(...conditions))
      .orderBy(query.order === "desc" ? desc(sortField) : asc(sortField))
      .offset(offset)
      .limit(query.limit);

    return c.json({
      items: files.map((file) => ({
        ...file,
        type: file.type ? "folder" : "file",
      })),
      total,
      page: query.page,
      totalPages: Math.ceil(total / query.limit),
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    return c.json({ error: "Failed to fetch files" }, 500);
  }
});

filesServer.post("/createFolder", async (c) => {
  console.log("c", c);
});

filesServer.get("/upload/check", async (c) => {
  console.log("c", c);

  return c.json({
    message: "Upload check endpoint",
  });
});

const createFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  parentId: z.string().nullable().optional(),
});

filesServer.post(
  "/folder/create",
  zValidator("json", createFolderSchema),
  async (c) => {
    try {
      const user = c.get("user");
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { name, parentId } = c.req.valid("json");

      if (parentId) {
        const parentFolder = await db
          .select()
          .from(userFiles)
          .where(
            and(
              eq(userFiles.id, parentId),
              eq(userFiles.userId, user.id),
              eq(userFiles.isDir, true),
            ),
          )
          .get();

        if (!parentFolder) {
          return c.json(
            { error: "Parent folder not found or not owned by user" },
            404,
          );
        }
      }

      const existingFolder = await db
        .select()
        .from(userFiles)
        .where(
          and(
            eq(userFiles.name, name),
            eq(userFiles.userId, user.id),
            eq(userFiles.isDir, true),
            parentId
              ? eq(userFiles.parentId, parentId)
              : isNull(userFiles.parentId),
          ),
        )
        .get();

      if (existingFolder) {
        return c.json({ error: "Folder already exists" }, 409);
      }

      const timestamp = new Date();

      const fileRecord = await db
        .insert(file)
        .values({
          id: crypto.randomUUID(),
          name,
          size: 0,
          mime: "folder",
          storageProvider: "local",
          createdAt: timestamp,
        })
        .returning()
        .get();

      const newFolder = await db
        .insert(userFiles)
        .values({
          id: crypto.randomUUID(),
          name,
          userId: user.id,
          parentId,
          isDir: true,
          fileId: fileRecord.id,
          createdAt: timestamp,
        })
        .returning()
        .get();

      return c.json({
        success: true,
        folder: newFolder,
      });
    } catch (error) {
      console.error("Error creating folder:", error);
      return c.json({ error: "Failed to create folder" }, 500);
    }
  },
);

//delete
filesServer.post(
  "/delete",
  zValidator(
    "json",
    z.object({
      id: z.string(),
    }),
  ),
  async (c) => {
    try {
      const user = c.get("user");
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      const { id } = c.req.valid("json");
      // Check if files exists and belongs to user
      const folder = await db
        .select()
        .from(userFiles)
        .where(and(eq(userFiles.id, id), eq(userFiles.userId, user.id)))
        .get();

      if (!folder) {
        return c.json({ error: "Folder not found or not owned by user" }, 404);
      }

      if (folder.isDir) {
        // Use transaction
        // Delete files
        await db.delete(userFiles).where(eq(userFiles.parentId, id));
        // Delete floder
        await db.delete(userFiles).where(eq(userFiles.id, id));
      } else {
        // Delete file
        await db.delete(userFiles).where(eq(userFiles.id, id));
      }
      // Set user delet logs

      return c.json({ success: true });
    } catch (error) {
      console.error("Error deleting folder:", error);
      return c.json({ error: "Failed to delete folder" }, 500);
    }
  },
);

//change-name
filesServer.post(
  "/change-name",
  zValidator(
    "json",
    z.object({
      id: z.string().min(1, "ID is required"),
      name: z
        .string()
        .min(1, "Name is required")
        .max(60, "Name must be at most 60 characters long"),
    }),
  ),
  async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const { id, name } = c.req.valid("json");
    if (!id || !name) {
      return c.json({ error: "ID and name are required" }, 400);
    }
    const currentFIles = await db
      .select()
      .from(userFiles)
      .where(and(eq(userFiles.id, id), eq(userFiles.userId, user.id)))
      .get();
    if (!currentFIles) {
      return c.json(
        { error: "Current files not found or not owned by user" },
        404,
      );
    }

    // Check if a folder with the same name already exists in the same parent directory
    const existingFolder = await db
      .select()
      .from(userFiles)
      .where(
        and(
          eq(userFiles.name, name),
          eq(userFiles.userId, user.id),
          eq(userFiles.isDir, currentFIles.isDir),
          ne(userFiles.id, id), // Exclude current folder
          currentFIles.parentId
            ? eq(userFiles.parentId, currentFIles.parentId)
            : isNull(userFiles.parentId),
        ),
      )
      .get();
    if (existingFolder) {
      return c.json({ error: "Folder with this name already exists" }, 409);
    }

    // Update folder name
    await db
      .update(userFiles)
      .set({ name })
      .where(and(eq(userFiles.id, id), eq(userFiles.userId, user.id)));
    // Update file record name if it exists

    return c.json({
      message: "ok",
    });
  },
);

filesServer.get("/breadcrumbs/:parentId", async (c) => {
  try {
    const { parentId } = c.req.param();
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const breadcrumbs = [];
    let currentId = parentId;

    while (currentId) {
      const currentFolder = await db
        .select({
          id: userFiles.id,
          name: userFiles.name,
          parentId: userFiles.parentId,
        })
        .from(userFiles)
        .where(
          and(
            eq(userFiles.id, currentId),
            eq(userFiles.userId, user.id),
            eq(userFiles.isDir, true),
          ),
        )
        .get();

      if (!currentFolder) {
        break;
      }

      breadcrumbs.unshift({
        id: currentFolder.id,
        name: currentFolder.name,
        parentId: currentFolder.parentId,
      });

      currentId = currentFolder.parentId;
    }

    breadcrumbs.unshift({
      id: null,
      name: "Root",
      parentId: null,
    });

    return c.json(breadcrumbs);
  } catch (error) {
    console.error("Error fetching breadcrumbs:", error);
    return c.json({ error: "Failed to fetch breadcrumbs" }, 500);
  }
});
