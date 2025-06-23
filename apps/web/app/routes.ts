import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/marketing/layout.tsx", [
    index("routes/marketing/landing.tsx"),
  ]),

  layout("routes/docs/layout.tsx", [
    route("/docs/*", "routes/docs/[...slug].tsx"),
  ]),

  layout("routes/dashboard/layout.tsx", [
    route("dashboard", "routes/dashboard/dashboard.tsx"),
    route("/resources", "routes/dashboard/resources/home.tsx"),
    route("/recycle-bin", "routes/dashboard/resources/recycle-bin.tsx"),
    route("/resources/floder/:floder", "routes/dashboard/resources/floder.tsx"),
    ...prefix("settings", [index("routes/dashboard/settings/profile.tsx")]),
    route("/billing", "routes/dashboard/billing/billing.tsx"),
    route("/token", "routes/dashboard/token/token.tsx"),
  ]),

  layout("routes/auth/layout.tsx", [
    route("auth/sign-in", "routes/auth/sign-in.tsx"),
    route("auth/sign-up", "routes/auth/sign-up.tsx"),
    route("auth/forget-password", "routes/auth/forget-password.tsx"),
    route("auth/reset-password", "routes/auth/reset-password.tsx"),
    route("auth/sign-up/success", "routes/auth/sign-up.success.tsx"),
  ]),

  // actions
  route("action/set-theme", "routes/action.set-theme.tsx"),
  route("api/auth/avatar", "features/auth/server/avatar.tsx"),
  route("api/auth/*", "features/auth/server/better.tsx"),
] satisfies RouteConfig;
