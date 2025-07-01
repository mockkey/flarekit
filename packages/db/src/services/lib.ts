import { type SQL, asc, desc } from "drizzle-orm";
import * as schema from "../schema";

export function getOrderByClause(
  sort: "name" | "size" | "deletedAt",
  order: "asc" | "desc",
): SQL {
  if (sort === "name") {
    return order === "asc"
      ? asc(schema.userFiles.name)
      : desc(schema.userFiles.name);
  }
  if (sort === "size") {
    return order === "asc" ? asc(schema.file.size) : desc(schema.file.size);
  }
  return order === "asc"
    ? asc(schema.userFiles.deletedAt)
    : desc(schema.userFiles.deletedAt);
}
