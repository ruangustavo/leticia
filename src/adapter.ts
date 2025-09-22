import type { IncomingMessage, ServerResponse } from 'node:http'
import type { HTTPHeaders } from './types/headers.ts'
import type { ParamsFromPath } from './types/path.ts'

export interface LeticiaRequest<
  TBody = unknown,
  TPattern extends string = string,
  TParams = ParamsFromPath<TPattern>,
> {
  body: TBody
  params: TParams
  querystring: Record<string, string | string[]>
  headers: HTTPHeaders
}

export interface LeticiaResponse {
  code: (code: number) => LeticiaResponse
  send: (body: unknown) => LeticiaResponse
}

export const hasRequestBody = (req: IncomingMessage) => {
  const contentLength = req.headers['content-length']
  if (contentLength) {
    return parseInt(contentLength, 10) > 0
  }

  const methodsWithoutBody: IncomingMessage['method'][] = [
    'GET',
    'HEAD',
    'OPTIONS',
  ]

  if (methodsWithoutBody.includes(req.method)) {
    return false
  }

  return req.headers['content-type'] && req.headers['content-type'] !== ''
}

export const adapter = {
  request: (req: IncomingMessage): Promise<LeticiaRequest> => {
    return new Promise((resolve, reject) => {
      if (!hasRequestBody(req)) {
        resolve({ body: null, params: {}, querystring: {}, headers: {} })
        return
      }

      let requestBody = ''

      req.on('data', (chunk) => {
        requestBody += chunk
      })

      req.on('end', () => {
        try {
          const body = JSON.parse(requestBody)
          resolve({ body, params: {}, querystring: {}, headers: {} })
        } catch (error) {
          reject(error)
        }
      })

      req.on('error', (error) => {
        reject(error)
      })
    })
  },
  response: (res: ServerResponse<IncomingMessage>) => {
    const responseAdapter = {
      code: (statusCode = 200) => {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' })
        return responseAdapter
      },
      send: (responseBody: unknown) => {
        res.end(JSON.stringify(responseBody))
        return responseAdapter
      },
    }
    return responseAdapter
  },
}
