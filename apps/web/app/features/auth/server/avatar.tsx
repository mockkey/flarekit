import { env } from "cloudflare:workers";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "react-router";
import { serverAuth } from "~/features/auth/server/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const auth = serverAuth();
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    return redirect("/auth/sign-in");
  }
  const formData = await request.formData();
  const file = formData.get("file") as File;

  const MAX_SIZE = 2 * 1024 * 1024; // 2MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/gif"];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return new Response(
      JSON.stringify({
        message: "Invalid file type. Only images (JPEG, PNG, GIF) are allowed.",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  if (file.size > MAX_SIZE) {
    return new Response(
      JSON.stringify({
        message: "File size exceeds the maximum limit of 2MB.",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
  const userId = session.user.id;
  const key = `avatar/${userId}/${file.name}`;
  try {
    const contentType = file.type;
    const blob = new Blob([file], { type: contentType });
    await env.MY_BUCKET.put(key, blob, {
      httpMetadata: {
        contentType: contentType,
      },
    });

    const imageURL = `${env.IMAGE_URL}/${key}`;

    return new Response(
      JSON.stringify({
        avatar: imageURL,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (_e) {
    return new Response(
      JSON.stringify({
        message: "Failed to update avatar.",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const auth = serverAuth();
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return redirect("/auth/sign-in");
  }

  const image = session?.user.image;
  return {
    data: {
      image,
    },
  };
}
