import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";



export default [
    
    layout('routes/marketing/layout.tsx',[
      index('routes/marketing/landing.tsx')
    ]),

    layout('routes/dashboard/layout.tsx',[
      route('dashboard','routes/dashboard/dashboard.tsx'),
    ]), 

    layout('routes/auth/layout.tsx',[
      route('auth/sign-in','routes/auth/sign-in.tsx'),
      route('auth/sign-up','routes/auth/sign-up.tsx'),
      route('auth/sign-up/success','routes/auth/sign-up.success.tsx')
    ]),

   

    // actions
    route('action/set-theme','routes/action.set-theme.tsx'),

] satisfies RouteConfig;