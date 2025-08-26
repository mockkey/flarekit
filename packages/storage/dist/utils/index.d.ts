export declare function stripEtag(etag: string): string;
export declare function parseXmlTag(xml: string, tagName: string): string | undefined;
export declare function parseXmlParts(xml: string): {
    ETag: string;
    PartNumber: number;
}[];
export declare const getS3Key: (filename: string, prefix?: string) => string;
export declare function safeJSONParse<T>(data: string): T | null;
//# sourceMappingURL=index.d.ts.map