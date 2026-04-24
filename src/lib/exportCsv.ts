/** Separador de columnas para Excel en entorno español */
const SEP = ';'

/** BOM UTF-8 — necesario para que Excel abra correctamente tildes y ñ */
const BOM = '\uFEFF'

/** Escapa un valor para celdas CSV: envuelve en comillas si contiene SEP, comillas o saltos */
function escapeCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(SEP) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

/**
 * Formatea un número con coma decimal para Excel español.
 * Con separador ; el decimal debe ser ,  para que Excel lo reconozca como número.
 * Ej: 1234.56 → "1234,56"
 */
export function numEs(value: number): string {
  return value.toFixed(2).replace('.', ',')
}

/** Construye el contenido CSV completo (con BOM) a partir de cabeceras y filas. */
export function buildCsv(
  headers: string[],
  rows: (string | number | null | undefined)[][]
): string {
  const lines = [
    headers.map(escapeCell).join(SEP),
    ...rows.map((row) => row.map(escapeCell).join(SEP)),
  ]
  return BOM + lines.join('\r\n')
}

/** Descarga una cadena CSV como fichero en el navegador. */
export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
