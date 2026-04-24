export function extractFilename(disposition: string | null, fallback: string): string {
  if (!disposition) return fallback
  // RFC 5987 — filename*=UTF-8''url-encoded-name
  const rfcMatch = disposition.match(/filename\*=(?:UTF-8'')?([^;]+)/i)
  if (rfcMatch) return decodeURIComponent(rfcMatch[1].trim().replace(/"/g, ''))
  // Simple — filename="name.pdf" o filename=name.pdf
  const simpleMatch = disposition.match(/filename="?([^";\n]+)"?/i)
  if (simpleMatch) return simpleMatch[1].trim()
  return fallback
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
