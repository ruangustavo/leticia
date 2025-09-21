import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http'
import { createMiddlewareStack, type Middleware } from './middleware.ts'
import { adaptResponse } from './response.ts'

export type Response = {
  code: (code: number) => Response
  send: (body: unknown) => Response
}

export type RouteCallback = (req: IncomingMessage, res: Response) => void

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface Route {
  method: Method
  path: string
  handler: RouteCallback
}

export const leticia = () => {
  const routes: Route[] = []

  const middlewares = createMiddlewareStack()

  const addRoute = (method: Method, path: string, callback: RouteCallback) =>
    routes.push({
      method: method,
      path: path,
      handler: callback,
    })

  const get = (path: string, callback: RouteCallback) => {
    addRoute('GET', path, callback)
    return app
  }

  const post = (path: string, callback: RouteCallback) => {
    addRoute('POST', path, callback)
    return app
  }

  const put = (path: string, callback: RouteCallback) => {
    addRoute('PUT', path, callback)
    return app
  }

  const deleteHandler = (path: string, callback: RouteCallback) => {
    addRoute('DELETE', path, callback)
    return app
  }

  const use = (middleware: Middleware) => {
    middlewares.use(middleware)
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

    const responseAdapter = adaptResponse(res)

    middlewares.execute(req, res, () => {
      route.handler(req, responseAdapter)
    })
  }

  const server = createServer(handleRequest)

  const listen = (port: number, callback: () => void) => {
    server.listen(port, callback)
    return app
  }

  const app = { get, post, put, delete: deleteHandler, use, listen }
  return app
}
