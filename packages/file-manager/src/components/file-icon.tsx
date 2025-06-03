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

export const getFileIcon = (file: FileItem) => {
  if (file.type === "folder") {
    return <RiFolderFill className="size-5 text-amber-500" />;
  }
  if (file.url && file.mime?.startsWith("image/")) {
    return (
      <img
        src={file.url}
        alt={file.name}
        className="size-5 object-cover rounded"
      />
    );
  }

  const mime = file.mime?.toLowerCase() || "";
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  if (
    mime.startsWith("image/") ||
    ["jpg", "jpeg", "png", "gif", "webp"].includes(extension)
  ) {
    return <RiFileImageFill className="size-5 text-blue-500" />;
  }

  if (
    mime.startsWith("video/") ||
    ["mp4", "mov", "avi", "mkv"].includes(extension)
  ) {
    return <RiFileVideoFill className="size-5 text-purple-500" />;
  }

  if (mime === "application/pdf" || extension === "pdf") {
    return <RiFilePdfFill className="size-5 text-red-500" />;
  }

  if (["doc", "docx"].includes(extension) || mime.includes("word")) {
    return <RiFileWordFill className="size-5 text-blue-600" />;
  }

  if (["xls", "xlsx"].includes(extension) || mime.includes("excel")) {
    return <RiFileExcelFill className="size-5 text-green-600" />;
  }

  if (["ppt", "pptx"].includes(extension) || mime.includes("powerpoint")) {
    return <RiFilePptFill className="size-5 text-orange-600" />;
  }

  if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
    return <RiFileZipFill className="size-5 text-yellow-600" />;
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
    return <RiFileCodeFill className="size-5 text-emerald-500" />;
  }

  if (mime.startsWith("text/") || ["txt", "md", "log"].includes(extension)) {
    return <RiFileTextFill className="size-5 text-gray-500" />;
  }

  return <RiFileFill className="size-5 text-blue-500" />;
};
