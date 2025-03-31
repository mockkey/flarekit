
import { Outlet } from 'react-router'
import { Route } from '../auth/+types/layout';



export default function Layout() {
  return (
    <div>
        <Outlet />
    </div>
  )
}
