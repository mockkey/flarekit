// server/index.ts
import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1';
import { User } from '~/db/schema';

const app = new Hono<{
  Bindings: {
    MY_VAR: string,
    DB:D1Database, 
  },
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

app.get('/ping',(c)=>{
  return c.json({ message: 'pong' })
})

app.get('/users', async (c) => {
  console.log('result',c.env.DB)
  const db = drizzle(c.env.DB, { logger: true });
   const result = await db.select().from(User).all()
  return c.json({
    data:result
  })
})

export default app
