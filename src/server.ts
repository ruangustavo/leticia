import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http'
import { adapter, type LeticiaRequest } from './adapter.ts'
import { PayloadTooLargeError } from './errors.ts'
import { createMiddlewareStack, type Middleware } from './middleware.ts'
import { createRouter, type Handler } from './router.ts'

export const leticia = () => {
  const router = createRouter()

  const middlewares = createMiddlewareStack()

  const get = <TPath extends string, TBody = unknown>(
    path: TPath,
    callback: Handler<TPath, TBody>,
  ) => {
    router.add('GET', path, callback)
    return app
  }

  const post = <TPath extends string, TBody = unknown>(
    path: TPath,
    callback: Handler<TPath, TBody>,
  ) => {
    router.add('POST', path, callback)
    return app
  }

  const put = <TPath extends string, TBody = unknown>(
    path: TPath,
    callback: Handler<TPath, TBody>,
  ) => {
    router.add('PUT', path, callback)
    return app
  }

  const deleteHandler = <TPath extends string, TBody = unknown>(
    path: TPath,
    callback: Handler<TPath, TBody>,
  ) => {
    router.add('DELETE', path, callback)
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

    const dispatchResult = router.dispatch({
      method: req.method,
      pathname,
    })

    if (dispatchResult.type === 'notFound') {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Not Found' }))
      return
    }

    if (dispatchResult.type === 'methodNotAllowed') {
      res.writeHead(405, {
        'Content-Type': 'application/json',
        Allow: dispatchResult.allowed.join(', '),
      })
      res.end(JSON.stringify({ error: 'Method Not Allowed' }))
      return
    }

    middlewares.execute(req, res, async () => {
      let request: LeticiaRequest | undefined

      try {
        request = await adapter.request(req)
      } catch (error) {
        if (error instanceof PayloadTooLargeError) {
          res.writeHead(413, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Payload too large' }))
          return
        }
      }

      if (!request) return

      const response = adapter.response(res)
      request.params = dispatchResult.params
      request.query = Object.fromEntries(url.searchParams)
      request.headers = req.headers
      dispatchResult.handler(request, response)
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
