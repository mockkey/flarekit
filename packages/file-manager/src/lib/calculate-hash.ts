import UploadWroker from "./upload-worker?worker";

export async function calculateFileHash(file: File): Promise<string> {
  const worker = new UploadWroker();
  worker.postMessage({ file });
  return new Promise((resolve) => {
    worker.onmessage = (e: MessageEvent) => {
      if (e.data) {
        resolve(e.data.md5);
      }
    };
  });
}
