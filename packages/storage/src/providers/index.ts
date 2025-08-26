import type { StorageConfig, StorageProvider } from "../types";
import { S3StorageProvider } from "./s3";

export function createStorageProvider(config: StorageConfig): StorageProvider {
  switch (config.provider) {
    case "s3":
    case "r2":
      return new S3StorageProvider(config);
    default:
      throw new Error(`Unsupported storage provider: ${config.provider}`);
  }
}

export { S3StorageProvider };
export * from "../types";
