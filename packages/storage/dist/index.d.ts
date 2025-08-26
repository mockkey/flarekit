export * from "./types";
export * from "./providers";
export * from "./utils";
export declare class ConflictError extends Error {
    constructor(message: string);
}
import type { StorageConfig } from "./types";
export declare function createStorage(config: StorageConfig): import("./types").StorageProvider;
//# sourceMappingURL=index.d.ts.map