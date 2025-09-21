import { leticia } from './server.ts'

export const fruits = ['banana', 'pear', 'grape'] as const

const app = leticia()

app.get('/fruits', (_req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(fruits))
})

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
