<script setup lang="ts">
import { groupIntoWeeks, monthLabelsForWeeks, type ContribDay, type ContribResponse } from '#shared/github-contrib'

// Сколько последних недель показывать на узких экранах (~полгода).
// Остальные колонки скрыты на мобильном и появляются с брейкпоинта sm.
const MOBILE_WEEKS = 26

const { data } = await useFetch<ContribResponse>('/api/github-contrib', {
  key: 'github-contrib'
})

const days = computed(() => data.value?.days ?? [])
const total = computed(() => data.value?.total ?? 0)

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

const weeks = computed(() => groupIntoWeeks(days.value))
const monthLabels = computed(() => monthLabelsForWeeks(weeks.value))

// Стабильный ключ недели по дате её первого реального дня (а не по индексу).
function weekKey(week: (ContribDay | null)[], idx: number): string {
  return week.find(d => d !== null)?.date ?? `empty-${idx}`
}

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
            :key="weekKey(week, wIdx)"
            :class="['flex flex-col gap-[3px]', wIdx < weeks.length - MOBILE_WEEKS ? 'hidden sm:flex' : '']"
          >
            <div class="h-[14px] text-[10px] font-mono leading-[14px] text-white/35 whitespace-nowrap">
              {{ monthLabels[wIdx] ?? '' }}
            </div>
            <div
              v-for="(cell, dIdx) in week"
              :key="cell?.date ?? `${weekKey(week, wIdx)}-${dIdx}`"
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
