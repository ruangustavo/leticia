const toSegments = (path: string) => {
  const leadingOrTrailingSlashes = /(^\/+|\/+$)/g
  return path.replace(leadingOrTrailingSlashes, '').split('/').filter(Boolean)
}

export const matchRoute = (
  pattern: string,
  pathname: string,
): { matched: boolean; params: Record<string, string> } => {
  const patternSegments = toSegments(pattern)
  const pathSegments = toSegments(pathname)

  const params: Record<string, string> = {}

  let pathIndex = 0

  for (
    let patternIndex = 0;
    patternIndex < patternSegments.length;
    patternIndex++
  ) {
    const segment = patternSegments[patternIndex]
    const isParam = segment.startsWith(':')
    const isOptional = isParam && segment.endsWith('?')
    const name = isParam ? segment.slice(1, isOptional ? -1 : undefined) : ''

    if (!isParam) {
      if (pathSegments[pathIndex] !== segment) {
        return { matched: false, params: {} }
      }
      pathIndex++
      continue
    }

    if (isOptional) {
      if (pathSegments[pathIndex] != null) {
        params[name] = pathSegments[pathIndex]
        pathIndex++
      }
      continue
    }

    if (pathSegments[pathIndex] == null) {
      return { matched: false, params: {} }
    }
    params[name] = pathSegments[pathIndex]
    pathIndex++
  }

  if (pathIndex !== pathSegments.length) {
    return { matched: false, params: {} }
  }

  return { matched: true, params }
}
