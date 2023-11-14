export type MarkPropertiesRequired<T, TKeys extends keyof T> = T & Required<Pick<T, TKeys>>
