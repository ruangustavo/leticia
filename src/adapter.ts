import type { IncomingMessage, ServerResponse } from 'node:http'
import { parse as parseQueryString } from 'node:querystring'
import type { HTTPHeaders } from './types/headers.ts'
import type { ParamsFromPath } from './types/path.ts'

export interface LeticiaRequest<
  TBody = unknown,
  TPattern extends string = string,
  TParams = ParamsFromPath<TPattern>,
> {
  body: TBody
  params: TParams
  query: Record<string, string | string[]>
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
        resolve({ body: null, params: {}, query: {}, headers: {} })
        return
      }

      let totalLength = 0
      const maxBytes = 1 * 1024 * 1024 // 1 Mb

      const chunks: Buffer[] = []

      req.on('data', (chunk) => {
        totalLength += chunk.length

        if (totalLength > maxBytes) {
          req.destroy(new Error('Payload too large'))
          return
        }

        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
      })

      req.on('end', () => {
        try {
          const buffer = Buffer.concat(chunks)
          const contentType = req.headers['content-type']?.toLowerCase()
          if (!contentType) return
          const mime = contentType.split(';')[0].trim()

          const text = buffer.toString('utf8')

          let body = null
          if (mime === 'application/json') {
            body = text.length ? JSON.parse(text) : null
          } else if (mime === 'application/x-www-form-urlencoded') {
            body = parseQueryString(text)
          } else {
            body = text
          }

          resolve({ body, params: {}, query: {}, headers: {} })
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
