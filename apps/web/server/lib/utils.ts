export function stripEtag(etag: string) {
  return etag.replace(/^"|"$/g, "");
}

export function parseXmlTag(xml: string, tagName: string): string | undefined {
  const startTag = `<${tagName}>`;
  const endTag = `</${tagName}>`;
  const startIndex = xml.indexOf(startTag);
  if (startIndex === -1) {
    return undefined;
  }
  const endIndex = xml.indexOf(endTag, startIndex + startTag.length);
  if (endIndex === -1) {
    return undefined;
  }
  return xml.substring(startIndex + startTag.length, endIndex);
}

export function parseXmlParts(
  xml: string,
): { ETag: string; PartNumber: number }[] {
  const parts: { ETag: string; PartNumber: number }[] = [];
  const partRegex =
    /<Part><PartNumber>(\d+)<\/PartNumber><ETag>"?([^"]+)"?<\/ETag><\/Part>/g;
  let match: RegExpExecArray | null;
  match = partRegex.exec(xml);
  while (match !== null) {
    parts.push({
      PartNumber: Number.parseInt(match[1], 10),
      ETag: match[2],
    });
    match = partRegex.exec(xml);
  }
  return parts;
}

export const getS3Key = (filename: string, prefix?: string) => {
  const effectivePrefix = prefix || "";
  const formattedPrefix =
    effectivePrefix && !effectivePrefix.endsWith("/")
      ? `${effectivePrefix}/`
      : effectivePrefix;
  const formattedFilename = filename.startsWith("/")
    ? filename.substring(1)
    : filename;
  return `${formattedPrefix}${formattedFilename}`;
};
