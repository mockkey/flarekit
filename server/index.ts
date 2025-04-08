// server/index.ts
import { Hono } from 'hono'
import { serverAuth } from '~/features/auth/server/auth';
import { EnvType } from 'load-context';

const app = new Hono<{
  Bindings: EnvType ,
  Variables: {
    MY_VAR_IN_VARIABLES: string
  }
}>()

app.use(async (c, next) => {
  c.set('MY_VAR_IN_VARIABLES', 'My variable set in c.set')
  await next()
  c.header('X-Powered-By', 'React Router and Hono')
})

app.get('/api', (c) => {
  return c.json({
    message: 'Hello',
    var: c.env.MY_VAR,
  })
})

app.get('/api/ping',(c)=>{
  return c.json({ message: 'pong' })
})

app.post('/api/upload/avatar', async (c) => {
  const formData =  await c.req.formData()
  const file = formData.get("file") as File
  const auth = serverAuth(c.env)
  const session = await auth.api.getSession({
    headers: c.req.header() as any,
  })
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  const userId = session.user.id
  // upload file to cloudflare R2
  const cloudflareFile  = await c.env.MY_BUCKET.put(`avatar/${userId}`, file.stream())
  console.log('body', cloudflareFile)
  
  return c.json({ message: 'pong'})
})


export default app
