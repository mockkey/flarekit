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

] satisfies RouteConfig;