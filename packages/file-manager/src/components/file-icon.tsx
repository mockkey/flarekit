import type { FileItem } from "@/types";
import {
  RiFileCodeFill,
  RiFileExcelFill,
  RiFileFill,
  RiFileImageFill,
  RiFilePdfFill,
  RiFilePptFill,
  RiFileTextFill,
  RiFileVideoFill,
  RiFileWordFill,
  RiFileZipFill,
  RiFolderFill,
} from "@remixicon/react";

const imgSvg =
  "data:image/svg+xml;utf8,<svg width='20' height='20' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='4' fill='%23e5e7eb'/><text x='10' y='15' font-size='10' text-anchor='middle' fill='%23999'>IMG</text></svg>";

export const getFileIcon = (file: FileItem, size = "size-10") => {
  if (file.type === "folder") {
    return <RiFolderFill className={`${size} text-amber-500`} />;
  }
  if (file.url && file.mime?.startsWith("image/")) {
    return (
      <img
        src={file.thumbnail || imgSvg}
        alt={file.name}
        className={`${size} object-scale-down rounded`}
        onError={(e) => {
          e.currentTarget.src = imgSvg;
        }}
      />
    );
  }

  const mime = file.mime?.toLowerCase() || "";
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  if (
    mime.startsWith("image/") ||
    ["jpg", "jpeg", "png", "gif", "webp"].includes(extension)
  ) {
    return <RiFileImageFill className={`${size} text-blue-500`} />;
  }

  if (
    mime.startsWith("video/") ||
    ["mp4", "mov", "avi", "mkv"].includes(extension)
  ) {
    return <RiFileVideoFill className={`${size} text-purple-500`} />;
  }

  if (mime === "application/pdf" || extension === "pdf") {
    return <RiFilePdfFill className={`${size} text-red-500`} />;
  }

  if (["doc", "docx"].includes(extension) || mime.includes("word")) {
    return <RiFileWordFill className={`${size} text-blue-600`} />;
  }

  if (["xls", "xlsx"].includes(extension) || mime.includes("excel")) {
    return <RiFileExcelFill className={`${size} text-green-600`} />;
  }

  if (["ppt", "pptx"].includes(extension) || mime.includes("powerpoint")) {
    return <RiFilePptFill className={`${size} text-orange-600`} />;
  }

  if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
    return <RiFileZipFill className={`${size} text-yellow-600`} />;
  }

  if (
    [
      "js",
      "ts",
      "jsx",
      "tsx",
      "css",
      "html",
      "json",
      "py",
      "java",
      "cpp",
    ].includes(extension)
  ) {
    return <RiFileCodeFill className={`${size} text-emerald-500`} />;
  }

  if (mime.startsWith("text/") || ["txt", "md", "log"].includes(extension)) {
    return <RiFileTextFill className={`${size} text-gray-500`} />;
  }

  return <RiFileFill className={`${size} text-blue-500`} />;
};
