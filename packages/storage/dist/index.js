// Types
export * from "./types";
// Providers
export * from "./providers";
// Utils
export * from "./utils";
// Error classes
export class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = "ConflictError";
    }
}
import { createStorageProvider } from "./providers";
export function createStorage(config) {
    return createStorageProvider(config);
}
//# sourceMappingURL=index.js.map