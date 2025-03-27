import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";



export default [
    index('routes/home.tsx'),
    route('dashboard','routes/dashboard.tsx'),
    route('auth/sign-in','routes/auth/sign-in.tsx'),
] satisfies RouteConfig;