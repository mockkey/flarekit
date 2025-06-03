import SparkMD5 from "spark-md5";

const ctx: DedicatedWorkerGlobalScope = self as DedicatedWorkerGlobalScope;

ctx.onmessage = async (event: MessageEvent) => {
  const { file } = event.data;

  if (!file) {
    ctx.postMessage({ error: "No file provided" });
    return;
  }

  try {
    const md5 = await calculateMD5(file);
    ctx.postMessage({ md5 });
  } catch (error) {
    ctx.postMessage({ error: (error as Error).message });
  }
};

function calculateMD5(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunkSize = 2097152; // 2MB chunks
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();
    let currentChunk = 0;
    const chunks = Math.ceil(file.size / chunkSize);

    fileReader.onload = (e) => {
      if (e.target?.result) {
        spark.append(e.target.result as ArrayBuffer);
        currentChunk++;

        if (currentChunk < chunks) {
          loadNext();
        } else {
          const md5 = spark.end();
          resolve(md5);
        }
      }
    };

    fileReader.onerror = (error) => {
      reject(error);
    };

    function loadNext() {
      const start = currentChunk * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      fileReader.readAsArrayBuffer(chunk);
    }

    loadNext();
  });
}
