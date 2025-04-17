import { Links, LinksFunction, LoaderFunctionArgs, Meta, Outlet, Scripts, useLoaderData } from 'react-router'
import stylesheet from "@flarekit/ui/app.css?url";
import { ThemeProvider, useTheme } from 'remix-themes';
import { themeSessionResolver } from './server.session';
import { ProgressBar } from '~/components/progress-bar';
import { Toaster } from 'sonner';
import { Route } from './+types/root';
import { Boundary } from '~/components/boundary';



export const links:LinksFunction = () => {
  return [
    { rel: "stylesheet", href: stylesheet },
  ];
}


export async function loader({ request }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request)
  return {
    theme: getTheme()
  }
}



export function App() {
  const data = useLoaderData()
  const [theme] = useTheme()
  return (
    <html lang='en'  data-theme={theme ?? ""} suppressHydrationWarning>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body className='h-[100vh]' suppressHydrationWarning>
        <ProgressBar />
        <Toaster 
          position="top-right"
          theme={theme as "light" | "dark"}
          closeButton
          richColors
          expand={false}
        />
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}


export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <title>Error - FlareKit</title>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Boundary error={error} />
        <Scripts />
      </body>
    </html>
  );
}


export default function AppWithProviders() {
  const data = useLoaderData();
  return (
    <ThemeProvider
      specifiedTheme={data.theme}
      themeAction="/action/set-theme"
      disableTransitionOnThemeChange={true}
    >
      <App />
    </ThemeProvider>
  );
}
