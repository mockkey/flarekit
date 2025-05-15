import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { serverAuth } from "~/features/auth/server/auth.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = serverAuth(context.cloudflare.env);
  return auth.handler(request);
}

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = serverAuth(context.cloudflare.env);
  return auth.handler(request);
}
