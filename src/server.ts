import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http'
import {
  adapter,
  type LeticiaRequest,
  type LeticiaResponse,
} from './adapter.ts'
import { matchRoute } from './matcher.ts'
import { createMiddlewareStack, type Middleware } from './middleware.ts'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

type Handler<TPath extends string, TBody = unknown> = (
  req: LeticiaRequest<TBody, TPath>,
  res: LeticiaResponse,
) => void

interface Route<TPath extends string = string, TBody = unknown> {
  method: Method
  path: TPath
  handler: Handler<TPath, TBody>
}

export const leticia = () => {
  const routes: Route<any, any>[] = []

  const middlewares = createMiddlewareStack()

  const addRoute = <TPath extends string, TBody = unknown>(
    method: Method,
    path: TPath,
    callback: Handler<TPath, TBody>,
  ) =>
    routes.push({
      method: method,
      path: path,
      handler: callback,
    })

  const get = <TPath extends string, TBody = unknown>(
    path: TPath,
    callback: Handler<TPath, TBody>,
  ) => {
    addRoute('GET', path, callback)
    return app
  }

  const post = <TPath extends string, TBody = unknown>(
    path: TPath,
    callback: Handler<TPath, TBody>,
  ) => {
    addRoute('POST', path, callback)
    return app
  }

  const put = <TPath extends string, TBody = unknown>(
    path: TPath,
    callback: Handler<TPath, TBody>,
  ) => {
    addRoute('PUT', path, callback)
    return app
  }

  const deleteHandler = <TPath extends string, TBody = unknown>(
    path: TPath,
    callback: Handler<TPath, TBody>,
  ) => {
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
    if (!req.url) {
      return
    }
    const url = new URL(req.url, 'http://localhost')
    const pathname = url.pathname

    let foundRoute: { route: Route; params: Record<string, string> } | undefined

    for (const route of routes) {
      if (route.method !== req.method) {
        res.writeHead(405, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Method Not Allowed' }))
        return
      }

      const matchedRoute = matchRoute(route.path, pathname)
      if (matchedRoute.matched) {
        foundRoute = { route, params: matchedRoute.params }
        break
      }
    }

    if (!foundRoute) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Not Found' }))
      return
    }

    middlewares.execute(req, res, async () => {
      const request = await adapter.request(req)
      const response = adapter.response(res)
      request.params = foundRoute.params
      request.query = Object.fromEntries(url.searchParams)
      request.headers = req.headers
      foundRoute.route.handler(request, response)
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
