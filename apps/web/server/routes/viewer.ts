import { PhotonImage, SamplingFilter, resize } from "@cf-wasm/photon";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import type { HonoEnv } from "load-context";
import { aws } from "server/lib/aws";
import { db } from "~/db/db.server";
import { file } from "~/db/schema";

export const viewerServer = new Hono<HonoEnv>();

viewerServer.get("/:key", async (c) => {
  const { key } = c.req.param();
  const existingFile = await db.query.file.findFirst({
    where: eq(file.id, key),
  });

  if (existingFile?.storagePath) {
    const signed = await aws.sign(
      new Request(existingFile?.storagePath, {
        method: "GET",
      }),
      {
        aws: { signQuery: true },
      },
    );
    const res = await fetch(signed.url, signed);
    if (!res.ok) {
      return c.json({ error: "Not found" }, 404);
    }

    const contentType =
      res.headers.get("Content-Type") || "application/octet-stream";

    const body = await res.arrayBuffer();

    c.header("Content-Type", contentType);
    c.header("Cache-Control", "public, max-age=31536000");

    return c.body(body);
  }

  return c.json({ error: "Not found" }, 404);
});

viewerServer.get("/resize/:key", async (c) => {
  const { key } = c.req.param();
  const existingFile = await db.query.file.findFirst({
    where: eq(file.id, key),
  });
  if (existingFile?.storagePath) {
    const signed = await aws.sign(
      new Request(existingFile?.storagePath, {
        method: "GET",
      }),
      {
        aws: { signQuery: true },
      },
    );
    const inputBytes = await fetch(signed.url, signed)
      .then((res) => res.arrayBuffer())
      .then((buffer) => new Uint8Array(buffer));

    const inputImage = PhotonImage.new_from_byteslice(inputBytes);
    const maxDimension = 300;
    const width = inputImage.get_width();
    const height = inputImage.get_height();
    const factor = maxDimension / Math.max(width, height);
    // resize image using photon
    const outputImage = resize(
      inputImage,
      inputImage.get_width() * factor,
      inputImage.get_height() * factor,
      SamplingFilter.Nearest,
    );

    // get webp bytes
    const outputBytes = outputImage.get_bytes_webp();

    inputImage.free();
    outputImage.free();

    // return the Response instance
    return new Response(outputBytes, {
      headers: {
        "Content-Type": "image/webp",
      },
    });
  }
});
