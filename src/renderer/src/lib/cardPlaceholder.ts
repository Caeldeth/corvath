// Generates a placeholder "card face" as an SVG data URL: a white card with the
// card's name centered. Used as the <img> source whenever a card has no imported
// image, so the same slot works for both real and placeholder art.

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Greedily wrap a short name into lines of at most `maxLen` characters. */
function wrap(name: string, maxLen = 12): string[] {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ['']
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if (!current) current = word
    else if (`${current} ${word}`.length <= maxLen) current += ` ${word}`
    else {
      lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines
}

const W = 200
const H = 300

/** A white card face bearing the given name, as an `data:image/svg+xml` URL. */
export function cardPlaceholderDataUrl(name: string): string {
  const lines = wrap(name || 'Untitled')
  const lineHeight = 24
  const startY = H / 2 - ((lines.length - 1) * lineHeight) / 2
  const tspans = lines
    .map((line, i) => `<tspan x="${W / 2}" y="${startY + i * lineHeight}">${escapeXml(line)}</tspan>`)
    .join('')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="#fbfaf6" stroke="#c9c3b2" stroke-width="2"/>
<rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="6" fill="none" stroke="#e2dccb" stroke-width="1"/>
<text x="${W / 2}" y="${startY}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="20" fill="#2a2418">${tspans}</text>
</svg>`

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
