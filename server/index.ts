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

  // check files
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return c.json({ message: 'Invalid file type. Only images (JPEG, PNG, GIF) are allowed.' }, 400);
  }
  if (file.size > MAX_SIZE) {
    return c.json({ message: 'File size exceeds the maximum limit of 2MB.' }, 400);
  }

  // upload file to cloudflare R2
  const userId = session.user.id
  const contentType = file.type
  const blob = new Blob([file], { type: contentType })
  const day = (Number(new Date()) / 60 / 60 / 24 / 1000).toFixed(0)
  const key = `avatar/${userId}/${day}.${contentType.split('/')[1]}`
  try{
    const cloudflareFile  = await c.env.MY_BUCKET.put(key,blob,{
      httpMetadata: {
        contentType: contentType
      }
    })
    const imageURL = c.env.IMAGE_URL+'/'+key
    await auth.api.updateUser({
      headers: c.req.header() as any,
      body:{
        image:imageURL
      }
    })
    return c.json({ message: 'Name updated successfully', data:{
      url:imageURL
    }})
  }catch(e){
    return c.json({ error: 'Failed to update avatar'})
  }
  
})


export default app
