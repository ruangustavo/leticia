import type { LeticiaRequest } from './adapter.ts'
import { leticia } from './index.ts'

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

app.get('/fruits/:fruitId/:fooId?', (req, res) => {
  res.send({ fruits, fruitId: req.params.fruitId })
})

interface Fruit {
  name: string
}

app.post('/fruits', (req: LeticiaRequest<Fruit>, res) => {
  res.send({ message: 'Fruit added', body: req.body })
})

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
