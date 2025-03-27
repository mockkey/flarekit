import { Links, LinksFunction, Outlet, Scripts } from 'react-router'

import stylesheet from "./styles/app.css?url";


export const links:LinksFunction = () => {
  return [
    { rel: "stylesheet", href: stylesheet },
  ];
}


export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Links />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
