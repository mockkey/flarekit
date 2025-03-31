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
      route('dashboard','routes/dashboard/dashboard.tsx'),
    ]), 

    layout('routes/auth/layout.tsx',[
      route('auth/sign-in','routes/auth/sign-in.tsx'),
    ]),

   

    // actions
    route('action/set-theme','routes/action.set-theme.tsx'),

] satisfies RouteConfig;