import handle from 'hono-react-router-adapter/cloudflare-workers'
import * as build from './build/server'
import { getLoadContext } from './front/load-context'
import app from './server'

export default handle(build, app, { getLoadContext })
