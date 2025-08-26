// Types
export * from "./types";

// Providers
export * from "./providers";

// Utils
export * from "./utils";

// Error classes
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

import { createStorageProvider } from "./providers";
// Main factory function
import type { StorageConfig } from "./types";

export function createStorage(config: StorageConfig) {
  return createStorageProvider(config);
}
