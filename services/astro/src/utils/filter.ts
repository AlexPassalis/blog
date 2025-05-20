const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
])

export function filterHopByHopHeaders(
  headers: Headers,
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of headers) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      out[key] = value
    }
  }
  return out
}
