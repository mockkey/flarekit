import { z } from "zod";

export interface Permission {
  id: string;
  label: string;
  description?: string;
}

export interface PermissionGroup {
  name: string;
  description?: string;
  permissions: Permission[];
}

export const permissionGroups: Record<string, PermissionGroup> = {
  files: {
    name: "Files",
    description: "Manage file operations",
    permissions: [
      {
        id: "read",
        label: "Read files",
        description: "View and download files",
      },
      {
        id: "write",
        label: "Create and modify files",
        description: "Upload and edit files",
      },
      {
        id: "delete",
        label: "Delete files",
        description: "Permanently remove files",
      },
    ],
  },
  users: {
    name: "Users",
    description: "Manage user operations",
    permissions: [
      {
        id: "read",
        label: "View user information",
        description: "Access user profiles and settings",
      },
      {
        id: "write",
        label: "Modify user settings",
        description: "Update user information and preferences",
      },
    ],
  },
};

export type PermissionType = keyof typeof permissionGroups;
export type ResourcePermissions = Record<PermissionType, string[]>;

export const permissionsSchema = z
  .record(
    z.enum(Object.keys(permissionGroups) as [string, ...string[]]),
    z.array(z.string()),
  )
  .refine((permissions) => {
    return Object.entries(permissions).every(([resource, perms]) => {
      if (perms.length === 0) return true;

      const validPermissions =
        permissionGroups[resource]?.permissions.map((p) => p.id) || [];
      return perms.every((perm) => validPermissions.includes(perm));
    });
  }, "Invalid permissions format or values");

export const defaultPermissions: ResourcePermissions = {
  files: ["read"],
  users: ["read"],
};

export function hasPermission(
  userPermissions: Partial<ResourcePermissions>,
  resource: PermissionType,
  permission: string,
): boolean {
  return userPermissions[resource]?.includes(permission) ?? false;
}

export function validatePermissions(permissions: Record<string, string[]>) {
  try {
    const normalizedPermissions = Object.entries(permissionGroups).reduce(
      (acc, [resource]) => {
        const perms = permissions[resource] || [];
        if (perms.length > 0) {
          acc[resource] = perms;
        }
        return acc;
      },
      {} as Record<string, string[]>,
    );

    if (Object.keys(normalizedPermissions).length === 0) {
      return { valid: true, permissions: {} };
    }

    const result = permissionsSchema.safeParse(normalizedPermissions);

    if (!result.success) {
      return {
        valid: false,
        error: "Invalid permissions format",
        details: result.error.issues,
      };
    }

    const invalidPermissions: Array<{ resource: string; permission: string }> =
      [];

    Object.entries(normalizedPermissions).forEach(([resource, perms]) => {
      if (!permissionGroups[resource]) {
        invalidPermissions.push({ resource, permission: "*" });
        return;
      }

      const validPermissions = permissionGroups[resource].permissions.map(
        (p) => p.id,
      );
      perms.forEach((perm) => {
        if (!validPermissions.includes(perm)) {
          invalidPermissions.push({ resource, permission: perm });
        }
      });
    });

    if (invalidPermissions.length > 0) {
      return {
        valid: false,
        error: "Invalid permissions found",
        invalidPermissions,
      };
    }

    return { valid: true, permissions: normalizedPermissions };
  } catch (error) {
    return {
      valid: false,
      error: "Permission validation failed",
      details: error,
    };
  }
}
