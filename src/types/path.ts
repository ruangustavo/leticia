type ParamObjectFromSegment<T extends string> = T extends `:${infer Name}?`
  ? { [K in Name]?: string }
  : T extends `:${infer Name}`
    ? { [K in Name]: string }
    : {}

export type ParamsFromPath<TPath extends string> =
  TPath extends `/${infer Rest}`
    ? ParamsFromPath<Rest>
    : TPath extends `${infer Head}/${infer Tail}`
      ? ParamObjectFromSegment<Head> & ParamsFromPath<Tail>
      : ParamObjectFromSegment<TPath>
