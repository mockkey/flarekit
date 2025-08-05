import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/docs/layout.tsx", [
    index("routes/docs/home.tsx"),
    route("*", "routes/docs/[...slug].tsx"),
  ]),
] satisfies RouteConfig;
