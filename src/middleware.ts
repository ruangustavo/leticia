import type { IncomingMessage, ServerResponse } from 'node:http'

export type Middleware = (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
  next: () => void,
) => void

export const createMiddlewareStack = () => {
  const middlewares: Middleware[] = []

  const use = (middleware: Middleware) => {
    middlewares.push(middleware)
  }

  const execute = (
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage>,
    onComplete: () => void,
  ) => {
    let index = 0

    const next = () => {
      if (index < middlewares.length) {
        const middleware = middlewares[index++]
        middleware(req, res, next)
      } else {
        onComplete()
      }
    }

    next()
  }

  return { use, execute }
}
