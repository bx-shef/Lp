import { describe, expect, it } from 'vitest'
import {
  CONTRIB_LEVEL_MAP,
  groupIntoWeeks,
  levelFromGraphql,
  monthLabelsForWeeks,
  type ContribDay
} from '#shared/github-contrib'

function day(date: string, count = 0, level: ContribDay['level'] = 0): ContribDay {
  return { date, count, level }
}

describe('levelFromGraphql', () => {
  it('маппит все пять известных квартилей GitHub', () => {
    expect(levelFromGraphql('NONE')).toBe(0)
    expect(levelFromGraphql('FIRST_QUARTILE')).toBe(1)
    expect(levelFromGraphql('SECOND_QUARTILE')).toBe(2)
    expect(levelFromGraphql('THIRD_QUARTILE')).toBe(3)
    expect(levelFromGraphql('FOURTH_QUARTILE')).toBe(4)
  })

  it('неизвестное значение → 0 (защита от смены enum)', () => {
    expect(levelFromGraphql('SOMETHING_NEW')).toBe(0)
    expect(levelFromGraphql('')).toBe(0)
  })

  it('CONTRIB_LEVEL_MAP покрывает все пять уровней', () => {
    // числовая сортировка: дефолтная у Array.sort лексикографическая
    expect(Object.values(CONTRIB_LEVEL_MAP).sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4])
  })
})

describe('groupIntoWeeks', () => {
  it('пустой ввод → пустой результат', () => {
    expect(groupIntoWeeks([])).toEqual([])
  })

  it('каждая неделя — ровно 7 ячеек', () => {
    // 2024-01-07 — воскресенье; берём двухнедельный диапазон
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(Date.UTC(2024, 0, 7 + i))
      return day(d.toISOString().slice(0, 10), i)
    })
    const weeks = groupIntoWeeks(days)
    expect(weeks).toHaveLength(2)
    for (const w of weeks) expect(w).toHaveLength(7)
  })

  it('выравнивает первую неделю на воскресенье, добивая null до первого дня', () => {
    // 2024-01-10 — среда (UTC day 3): перед ней должно быть 3 null (Вс/Пн/Вт)
    const weeks = groupIntoWeeks([day('2024-01-10', 5, 2)])
    expect(weeks).toHaveLength(1)
    const first = weeks[0]!
    expect(first.slice(0, 3).every(c => c === null)).toBe(true)
    expect(first[3]?.date).toBe('2024-01-10')
    expect(first.slice(4).every(c => c === null)).toBe(true)
  })

  it('старт ровно с воскресенья — без ведущих null', () => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.UTC(2024, 5, 2 + i)) // 2024-06-02 — воскресенье
      return day(d.toISOString().slice(0, 10))
    })
    const weeks = groupIntoWeeks(days)
    expect(weeks[0]![0]?.date).toBe('2024-06-02')
    expect(weeks[0]!.every(c => c !== null)).toBe(true)
  })

  it('хвост последней недели добивается null, если данные кончаются не в субботу', () => {
    // 2024-06-02 (Вс) .. 2024-06-05 (Ср) — 4 дня, хвост Чт/Пт/Сб → null
    const days = Array.from({ length: 4 }, (_, i) => {
      const d = new Date(Date.UTC(2024, 5, 2 + i))
      return day(d.toISOString().slice(0, 10))
    })
    const weeks = groupIntoWeeks(days)
    expect(weeks).toHaveLength(1)
    expect(weeks[0]!.slice(0, 4).every(c => c !== null)).toBe(true)
    expect(weeks[0]!.slice(4).every(c => c === null)).toBe(true)
  })

  it('полный год (~53 колонки), все недели по 7 ячеек', () => {
    const days = Array.from({ length: 365 }, (_, i) => {
      const d = new Date(Date.UTC(2024, 5, 2 + i)) // год от воскресенья
      return day(d.toISOString().slice(0, 10), i)
    })
    const weeks = groupIntoWeeks(days)
    expect(weeks.length).toBeGreaterThanOrEqual(52)
    expect(weeks.length).toBeLessThanOrEqual(54)
    expect(weeks.every(w => w.length === 7)).toBe(true)
  })

  it('корректно обрабатывает стык года', () => {
    // 2023-12-31 (Вс) → 2024-01-06 (Сб): одна полная неделя через границу года.
    // Date.UTC сам нормализует переполнение дня: 31 + 6 → 2024-01-06.
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.UTC(2023, 11, 31 + i))
      return day(d.toISOString().slice(0, 10), i)
    })
    const weeks = groupIntoWeeks(days)
    expect(weeks).toHaveLength(1)
    expect(weeks[0]![0]?.date).toBe('2023-12-31')
    expect(weeks[0]![6]?.date).toBe('2024-01-06')
  })
})

describe('monthLabelsForWeeks', () => {
  it('первая колонка всегда подписана', () => {
    const weeks = groupIntoWeeks([day('2024-03-10', 1, 1)])
    const labels = monthLabelsForWeeks(weeks)
    expect(labels[0]).toBe('Мар')
  })

  it('подпись появляется только при смене месяца', () => {
    // 4 недели внутри одного месяца (июнь 2024) → только первая подписана
    const days: ContribDay[] = []
    for (let i = 0; i < 28; i++) {
      const d = new Date(Date.UTC(2024, 5, 2 + i)) // c воскресенья 2024-06-02
      days.push(day(d.toISOString().slice(0, 10)))
    }
    const labels = monthLabelsForWeeks(groupIntoWeeks(days))
    expect(labels[0]).toBe('Июн')
    // внутри того же месяца последующие недели не подписаны
    expect(labels.slice(1, 4).every(l => l === null)).toBe(true)
  })

  it('подписывает новый месяц на переходной неделе', () => {
    // диапазон, пересекающий границу июнь→июль 2024
    const days: ContribDay[] = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(Date.UTC(2024, 5, 2 + i))
      days.push(day(d.toISOString().slice(0, 10)))
    }
    const labels = monthLabelsForWeeks(groupIntoWeeks(days))
    expect(labels).toContain('Июл')
  })

  it('пустой ввод → пустой список меток', () => {
    expect(monthLabelsForWeeks([])).toEqual([])
  })

  it('неделя целиком из null → метка null (ветка отсутствия реального дня)', () => {
    const emptyWeek = Array<ContribDay | null>(7).fill(null)
    expect(monthLabelsForWeeks([emptyWeek])).toEqual([null])
  })

  it('предыдущая неделя целиком из null → текущая метка подавляется (защитная ветка)', () => {
    const emptyWeek = Array<ContribDay | null>(7).fill(null)
    const realWeek: (ContribDay | null)[] = [day('2024-06-02', 1, 1), ...Array<ContribDay | null>(6).fill(null)]
    // idx=0 пустой → null; idx=1 реальный, но prevReal не найден → тоже null.
    // Документируем фактическое поведение: на реальных (непрерывных) данных GitHub
    // полностью пустой недели в середине не бывает, поэтому квирк недостижим.
    expect(monthLabelsForWeeks([emptyWeek, realWeek])).toEqual([null, null])
  })
})
