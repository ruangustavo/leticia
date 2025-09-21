import type { IncomingMessage, ServerResponse } from 'node:http'

export const adaptResponse = (res: ServerResponse<IncomingMessage>) => {
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
}
