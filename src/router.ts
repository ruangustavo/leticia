import type { LeticiaRequest, LeticiaResponse } from './adapter.ts'
import { matchRoute } from './matcher.ts'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type Handler<TPath extends string = string, TBody = unknown> = (
  req: LeticiaRequest<TBody, TPath>,
  res: LeticiaResponse,
) => void

interface Route {
  method: Method
  pattern: string
  handler: Handler<any, any>
}

type DispatchOutcome =
  | {
      type: 'route'
      handler: Handler<any, any>
      params: Record<string, string>
    }
  | { type: 'notFound' }
  | { type: 'methodNotAllowed'; allowed: Method[] }

export const createRouter = () => {
  const routes: Route[] = []

  const add = (method: Method, pattern: string, handler: Handler<any, any>) => {
    routes.push({ method, pattern, handler })
  }

  const dispatch = (input: {
    method: string | undefined
    pathname: string
  }): DispatchOutcome => {
    const method = (input.method || '').toUpperCase() as Method
    const pathname = input.pathname

    const patternMatches = routes
      .map((route) => {
        const result = matchRoute(route.pattern, pathname)
        return { route, matched: result.matched, params: result.params }
      })
      .filter((x) => x.matched)

    if (patternMatches.length === 0) {
      return { type: 'notFound' }
    }

    const withSameMethod = patternMatches.filter(
      (x) => x.route.method === method,
    )
    if (withSameMethod.length === 0) {
      const allowed = Array.from(
        new Set(patternMatches.map((x) => x.route.method)),
      )
      return { type: 'methodNotAllowed', allowed }
    }

    const { route, params } = withSameMethod[0]
    return { type: 'route', handler: route.handler, params }
  }

  return { add, dispatch }
}
