import type { Request } from './adapter.ts'
import { leticia } from './server.ts'

export const fruits = ['banana', 'pear', 'grape'] as const

const app = leticia()

app.use((_req, _res, next) => {
  console.log('Middleware 1')
  next()
})

app.use((_req, _res, next) => {
  console.log('Middleware 2')
  next()
})

app.get('/fruits', (_req, res) => {
  res.send(fruits)
})

interface Fruit {
  name: string
}

app.post('/fruits', (req: Request<Fruit>, res) => {
  res.send({ message: 'Fruit added', body: req.body })
})

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
