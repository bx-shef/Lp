interface ContribDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

interface ContribResponse {
  days: ContribDay[]
  total: number
}

function parseContributions(html: string): ContribDay[] {
  const rects = html.match(/<rect[^>]+data-date[^>]*>/g) ?? []
  const days: ContribDay[] = []

  for (const rect of rects) {
    const date = rect.match(/data-date="([^"]+)"/)?.[1]
    const count = parseInt(rect.match(/data-count="([^"]+)"/)?.[1] ?? '0', 10)
    const raw = parseInt(rect.match(/data-level="([^"]+)"/)?.[1] ?? '0', 10)
    const level = Math.min(raw, 4) as 0 | 1 | 2 | 3 | 4
    if (date) days.push({ date, count, level })
  }

  return days.sort((a, b) => a.date.localeCompare(b.date))
}

export default defineEventHandler(async (): Promise<ContribResponse> => {
  try {
    const html = await $fetch<string>('https://github.com/users/IgorShevchik/contributions', {
      responseType: 'text',
      headers: {
        'Accept': 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0 (compatible; Nuxt SSG build)'
      },
      timeout: 8000
    })
    const days = parseContributions(html)
    return { days, total: days.reduce((s, d) => s + d.count, 0) }
  } catch {
    return { days: [], total: 0 }
  }
})
