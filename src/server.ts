import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http'

type RouteCallback = (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
) => void

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface Route {
  method: Method
  path: string
  handler: RouteCallback
}

export const leticia = () => {
  const routes: Route[] = []

  const get = (path: string, callback: RouteCallback) => {
    routes.push({
      method: 'GET',
      path: path,
      handler: callback,
    })
    return app
  }

  const handleRequest = (
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage>,
  ) => {
    const path = req.url // this is the path, i.e. /fruits
    const route = routes.find((r) => r.method === req.method && r.path === path)

    if (!route) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Not Found' }))
      return
    }

    route.handler(req, res)
  }

  const server = createServer(handleRequest)

  const listen = (port: number, callback: () => void) => {
    server.listen(port, callback)
    return app
  }

  const app = { get, listen }
  return app
}
