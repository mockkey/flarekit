import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";



export default [
    
    layout('routes/layout.tsx',[
      index('routes/landing.tsx')
    ]),

    layout('routes/dashboard/layout.tsx',[
      route('dashboard','routes/dashboard.tsx'),
    ]), 
    route('auth/sign-in','routes/auth/sign-in.tsx'),

] satisfies RouteConfig;