import { useState, useEffect } from 'react'

type ResolveFn = (id: number) => Promise<string>

// Module-level caches survive re-renders and page navigation within the session
const caches = new Map<string, Map<number, string>>()

function getNamespace(ns: string): Map<number, string> {
  if (!caches.has(ns)) caches.set(ns, new Map())
  return caches.get(ns)!
}

/**
 * Resolves a list of numeric IDs to display names using a per-namespace cache.
 * Already-resolved IDs are never re-fetched. Returns a lookup function.
 *
 * @param namespace  - e.g. 'clients' or 'users'
 * @param ids        - numeric IDs to resolve (may change as data loads)
 * @param resolve    - async function that fetches the display name for one ID
 */
export function useNameResolver(
  namespace: string,
  ids: number[],
  resolve: ResolveFn
): (id: number) => string {
  const cache = getNamespace(namespace)
  const [, forceUpdate] = useState(0)

  const key = [...new Set(ids)].sort().join(',')

  useEffect(() => {
    if (!key) return
    const missing = [...new Set(ids)].filter((id) => !cache.has(id))
    if (!missing.length) return

    Promise.allSettled(
      missing.map((id) =>
        resolve(id)
          .then((name) => cache.set(id, name))
          .catch(() => cache.set(id, `#${id}`))
      )
    ).then(() => forceUpdate((n) => n + 1))
    // resolve is intentionally excluded — it's always a stable inline arrow
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return (id: number) => cache.get(id) ?? '…'
}
