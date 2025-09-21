import type { IncomingMessage, ServerResponse } from 'node:http'

export interface Request<TBody = unknown> {
  body: TBody
}

export interface Response {
  code: (code: number) => Response
  send: (body: unknown) => Response
}

export const adapter = {
  request: (req: IncomingMessage): Promise<Request> => {
    return new Promise((resolve, reject) => {
      let requestBody = ''

      req.on('data', (chunk) => {
        requestBody += chunk
      })

      req.on('end', () => {
        try {
          const body = JSON.parse(requestBody)
          resolve({ body })
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
