import type { IncomingMessage, ServerResponse } from 'node:http'
import type { ParamsFromPath } from './types.ts'

export interface LeticiaRequest<
  TBody = unknown,
  TPattern extends string = string,
  TParams = ParamsFromPath<TPattern>,
> {
  body: TBody
  params: TParams
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
        resolve({ body: null, params: {} })
        return
      }

      let requestBody = ''

      req.on('data', (chunk) => {
        requestBody += chunk
      })

      req.on('end', () => {
        try {
          const body = JSON.parse(requestBody)
          resolve({ body, params: {} })
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
