<script setup lang="ts">
interface ContribDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

const { data } = await useFetch<{ days: ContribDay[], total: number }>('/api/github-contrib', {
  key: 'github-contrib'
})

const days = computed(() => data.value?.days ?? [])
const total = computed(() => data.value?.total ?? 0)

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

const LEVEL_BG = [
  'rgba(255,255,255,0.07)',
  'rgba(0,212,255,0.22)',
  'rgba(0,212,255,0.45)',
  'rgba(0,212,255,0.68)',
  'rgba(0,212,255,0.90)'
]

function cellBg(level: number): string {
  return LEVEL_BG[Math.min(level, 4)] ?? LEVEL_BG[0]!
}

// Build a map for quick date lookup and group into week columns
const weeks = computed((): (ContribDay | null)[][] => {
  if (days.value.length === 0) return []

  const byDate = new Map(days.value.map(d => [d.date, d]))

  // Find the Sunday on or before the first date
  const firstDate = new Date(days.value[0]!.date + 'T12:00:00Z')
  const lastDate = new Date(days.value[days.value.length - 1]!.date + 'T12:00:00Z')

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
})

// Month label to show at the top of a week column on month change
const monthLabels = computed((): (string | null)[] =>
  weeks.value.map((week, idx) => {
    const firstReal = week.find(d => d !== null)
    if (!firstReal) return null
    const m = new Date(firstReal.date + 'T12:00:00Z').getUTCMonth()
    if (idx === 0) return MONTHS[m] ?? null
    const prev = weeks.value[idx - 1]
    const prevReal = prev?.find(d => d !== null)
    if (!prevReal) return null
    const pm = new Date(prevReal.date + 'T12:00:00Z').getUTCMonth()
    return m !== pm ? (MONTHS[m] ?? null) : null
  })
)

function formatTotal(n: number): string {
  return n.toLocaleString('ru-RU')
}
</script>

<template>
  <section
    v-if="days.length > 0"
    class="px-[22px] lg:px-8 py-[48px] sm:py-[72px]"
  >
    <div class="max-w-[1200px] mx-auto flex flex-col gap-4">
      <div class="text-xs uppercase tracking-[0.18em] text-white/40 font-mono">
        GitHub активность
      </div>
      <div class="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <span class="text-2xl sm:text-3xl font-bold text-white tabular-nums">{{ formatTotal(total) }}</span>
          <span class="ml-2 text-white/55 text-base">коммитов за год</span>
        </div>
        <a
          href="https://github.com/IgorShevchik"
          target="_blank"
          rel="noopener noreferrer"
          class="font-mono text-sm text-white/40 hover:text-[rgb(var(--color-accent-primary-ch))] transition-colors"
        >github.com/IgorShevchik →</a>
      </div>

      <div class="overflow-x-auto pb-1 -mx-1 px-1">
        <div
          class="flex gap-[3px]"
          style="min-width: max-content"
        >
          <div
            v-for="(week, wIdx) in weeks"
            :key="wIdx"
            :class="['flex flex-col gap-[3px]', wIdx < weeks.length - 26 ? 'hidden sm:flex' : '']"
          >
            <div class="h-[14px] text-[10px] font-mono leading-[14px] text-white/35 whitespace-nowrap">
              {{ monthLabels[wIdx] ?? '' }}
            </div>
            <div
              v-for="(cell, dIdx) in week"
              :key="dIdx"
              class="size-[11px] rounded-[2px]"
              :style="{ background: cell ? cellBg(cell.level) : 'transparent' }"
              :title="cell ? `${cell.date}: ${cell.count}` : undefined"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
