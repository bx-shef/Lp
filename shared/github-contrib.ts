/**
 * Общие типы и чистая логика GitHub-графа контрибуций.
 * Лежит в `shared/`, чтобы переиспользоваться и server-частью
 * (`server/api/github-contrib.get.ts`), и клиентским компонентом
 * (`app/components/GithubContrib.vue`) — без дублирования.
 * Чистые функции (без Vue/DOM) — покрыты unit-тестами.
 */

export interface ContribDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export interface ContribResponse {
  days: ContribDay[]
  total: number
}

/** Маппинг GitHub `contributionLevel` (enum строкой) в числовой уровень 0–4. */
export const CONTRIB_LEVEL_MAP: Record<string, 0 | 1 | 2 | 3 | 4> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4
}

/**
 * Переводит строковый `contributionLevel` из GraphQL в число 0–4.
 * Неизвестное значение → 0: страховка на случай, если GitHub расширит enum.
 */
export function levelFromGraphql(contributionLevel: string): 0 | 1 | 2 | 3 | 4 {
  return CONTRIB_LEVEL_MAP[contributionLevel] ?? 0
}

/**
 * Полдень UTC выбран намеренно: убирает риск «уехать» на соседний день
 * при парсинге чистой даты (YYYY-MM-DD) в любых таймзонах.
 */
function dateAtNoonUTC(isoDate: string): Date {
  return new Date(isoDate + 'T12:00:00Z')
}

/**
 * Раскладывает плоский список дней в колонки-недели (воскресенье — первый день).
 * Ведущие/хвостовые дни, которых нет в данных, заполняются `null`, чтобы
 * сетка всегда была выровнена по столбцам из 7 ячеек.
 *
 * Ожидает дни в хронологическом порядке (как их отдаёт GitHub API): диапазон
 * определяется по первому и последнему элементу. Неотсортированный вход даст
 * неверные границы — сортировка не делается намеренно (лишняя работа на
 * заведомо упорядоченных данных).
 */
export function groupIntoWeeks(days: ContribDay[]): (ContribDay | null)[][] {
  if (days.length === 0) return []

  const byDate = new Map(days.map(d => [d.date, d]))
  const firstDate = dateAtNoonUTC(days[0]!.date)
  const lastDate = dateAtNoonUTC(days[days.length - 1]!.date)

  // Откатываемся к воскресенью на/до первой даты.
  const cursor = new Date(firstDate)
  cursor.setUTCDate(cursor.getUTCDate() - cursor.getUTCDay())

  const result: (ContribDay | null)[][] = []
  while (cursor <= lastDate) {
    const week: (ContribDay | null)[] = []
    for (let i = 0; i < 7; i++) {
      const key = cursor.toISOString().slice(0, 10)
      week.push(byDate.get(key) ?? null)
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
    result.push(week)
  }
  return result
}

const MONTHS_RU = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'] as const

/**
 * Подпись месяца над колонкой недели — показывается только когда месяц
 * сменился относительно предыдущей колонки (и над самой первой).
 */
export function monthLabelsForWeeks(weeks: (ContribDay | null)[][]): (string | null)[] {
  return weeks.map((week, idx) => {
    const firstReal = week.find(d => d !== null)
    if (!firstReal) return null
    const m = dateAtNoonUTC(firstReal.date).getUTCMonth()
    if (idx === 0) return MONTHS_RU[m] ?? null
    const prevReal = weeks[idx - 1]?.find(d => d !== null)
    if (!prevReal) return null
    const pm = dateAtNoonUTC(prevReal.date).getUTCMonth()
    return m !== pm ? (MONTHS_RU[m] ?? null) : null
  })
}
