type SetContentType =
  | 'application/json'
  | 'application/x-www-form-urlencoded'
  | 'multipart/form-data'
  | 'text/plain'
  | 'text/html'
  | 'application/xml'
  | 'application/octet-stream'

export type HTTPHeaders = Record<
  string,
  string | number | string[] | undefined
> & {
  'www-authenticate'?: string
  authorization?: string
  'proxy-authenticate'?: string
  'proxy-authorization'?: string
  age?: string
  'cache-control'?: string
  'clear-site-data'?: string
  expires?: string
  'no-vary-search'?: string
  pragma?: string
  'last-modified'?: string
  etag?: string
  'if-match'?: string
  'if-none-match'?: string
  'if-modified-since'?: string
  'if-unmodified-since'?: string
  vary?: string
  connection?: string
  'keep-alive'?: string
  accept?: string
  'accept-encoding'?: string
  'accept-language'?: string
  expect?: string
  'max-forwards'?: string
  cookie?: string
  'set-cookie'?: string | string[]
  'access-control-allow-origin'?: string
  'access-control-allow-credentials'?: string
  'access-control-allow-headers'?: string
  'access-control-allow-methods'?: string
  'access-control-expose-headers'?: string
  'access-control-max-age'?: string
  'access-control-request-headers'?: string
  'access-control-request-method'?: string
  origin?: string
  'timing-allow-origin'?: string
  'content-disposition'?: string
  'content-length'?: string | number
  'content-type'?: SetContentType | (string & {})
  'content-encoding'?: string
  'content-language'?: string
  'content-location'?: string
  forwarded?: string
  via?: string
  location?: string
  refresh?: string
  allow?: string
  server?: string
  'accept-ranges'?: string
  range?: string
  'if-range'?: string
  'content-range'?: string
  'content-security-policy'?: string
  'content-security-policy-report-only'?: string
  'cross-origin-embedder-policy'?: string
  'cross-origin-opener-policy'?: string
  'cross-origin-resource-policy'?: string
  'expect-ct'?: string
  'permission-policy'?: string
  'strict-transport-security'?: string
  'upgrade-insecure-requests'?: string
  'x-content-type-options'?: string
  'x-frame-options'?: string
  'x-xss-protection'?: string
  'last-event-id'?: string
  'ping-from'?: string
  'ping-to'?: string
  'report-to'?: string
  te?: string
  trailer?: string
  'transfer-encoding'?: string
  'alt-svg'?: string
  'alt-used'?: string
  date?: string
  dnt?: string
  'early-data'?: string
  'large-allocation'?: string
  link?: string
  'retry-after'?: string
  'service-worker-allowed'?: string
  'source-map'?: string
  upgrade?: string
  'x-dns-prefetch-control'?: string
  'x-forwarded-for'?: string
  'x-forwarded-host'?: string
  'x-forwarded-proto'?: string
  'x-powered-by'?: string
  'x-request-id'?: string
  'x-requested-with'?: string
  'x-robots-tag'?: string
  'x-ua-compatible'?: string
}
