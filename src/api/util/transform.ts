export const toSnake = (obj: any) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`),
      v
    ])
  )

export const toCamel = (obj: any) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k.replace(/_([a-z])/g, (_, m) => m.toUpperCase()),
      v
    ])
  )
