<script setup lang="ts">
import type { Component } from 'vue'
import ArrowRightLIcon from '@bitrix24/b24icons-vue/outline/ArrowRightLIcon'
import CheckLIcon from '@bitrix24/b24icons-vue/outline/CheckLIcon'
import CircleMinusIcon from '@bitrix24/b24icons-vue/outline/CircleMinusIcon'
import CopilotAi1Icon from '@bitrix24/b24icons-vue/main/CopilotAi1Icon'
import MagicImageIcon from '@bitrix24/b24icons-vue/main/MagicImageIcon'
import CloudTransferDataIcon from '@bitrix24/b24icons-vue/main/CloudTransferDataIcon'
import CodeIcon from '@bitrix24/b24icons-vue/common-service/CodeIcon'
import RocketIcon from '@bitrix24/b24icons-vue/main/RocketIcon'

useCardGlow()

interface ServiceItem {
  icon: Component
  title: string
  text: string
}

interface DifferentiatorItem {
  /** Иконка ИЛИ фото — одно из двух обязательно */
  icon?: Component
  photo?: string
  caption?: string
  title: string
  text: string
}

interface ProcessStep {
  step: string
  title: string
  text: string
  /** Опциональный список деталей (используется в Discovery) */
  list?: readonly string[]
}

const services: ServiceItem[] = [
  {
    icon: CopilotAi1Icon,
    title: 'AI-помощник в Битрикс24',
    text: 'Чат к базе знаний, подсказки в задачах и сделках, помощь продажникам со скриптами и возражениями. На ваших данных из Б24 — не наружу.'
  },
  {
    icon: MagicImageIcon,
    title: 'Генерация и сборка контента',
    text: 'Каталог Б24 + AI-генератор изображений → готовые комплекты и hero-картинки для публикации. Подходит, если у вас 500+ SKU.'
  },
  {
    icon: CloudTransferDataIcon,
    title: 'Интеграции и обмен данными',
    text: 'Клиент-банк, поставщики, маркетплейсы, любой SaaS через REST/MCP ↔ Б24. Один раз настроили — забыли про экспорт-импорт.'
  }
]

const differentiators: DifferentiatorItem[] = [
  {
    icon: CodeIcon,
    title: 'Контрибьютор в SDK Битрикс24',
    text: 'Мой код используется в официальных библиотеках b24jssdk и b24ui. Баги Б24, на которые другие тратят дни, нахожу за часы — потому что писал эту часть сам.'
  },
  {
    icon: RocketIcon,
    title: 'Специализация на AI и интеграциях',
    text: 'Не комплексное внедрение Б24 «с нуля». Захожу туда, где базовый интегратор уже сказал «это не делается».'
  },
  {
    photo: '/igor.jpg',
    title: 'Один разработчик — но не bus factor',
    text: 'Код остаётся в вашем Битрикс24 и в вашем git. Захотите передать другому — это займёт час, а не месяц аудита.',
    caption: 'Игорь Шевчик, Минск'
  }
]

const takeIf = [
  'У вас уже работает Битрикс24, и не хватает одной конкретной вещи',
  'Маркетплейс пробовали — не подошло или не покрывает',
  'Готовы вкладываться в discovery: задача нестандартная, нужны изыскания'
]

const skipIf = [
  'Сейчас перегружен и нет свободного слота — честно скажу на discovery',
  'Задача за пределами моего стека и компетенции — лучше передам коллеге',
  'Нет готовности вкладываться в исследование: нужен готовый коробочный продукт'
]

const process: ProcessStep[] = [
  {
    step: '01',
    title: 'Discovery',
    text: '30 минут, бесплатно. Заранее пришлю 5 вопросов:',
    list: [
      'Что должно работать после внедрения?',
      'Какие системы интегрируем — Б24, банк, сайт, маркетплейс?',
      'Кто принимает результат — один человек или комитет?',
      'Дедлайн есть и почему именно такой?',
      'Что уже пробовали и почему не сработало?'
    ]
  },
  {
    step: '02',
    title: 'Оценка',
    text: 'Фиксированная цена за этап или почасовая ставка. По итогам discovery — конкретные цифры и план этапов.'
  },
  {
    step: '03',
    title: 'Разработка',
    text: 'Демо каждые 1–2 недели. Закрытый этап оплачивается полностью, текущий — по часам из публичного трекера. Остановите проект — платите только за сделанное.'
  },
  {
    step: '04',
    title: 'Поддержка',
    text: 'После релиза обсуждаем отдельно: почасовая или подписка с SLA. Без обязательств подписать сразу — берём только если нужно.'
  }
]
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="hero-fade-in px-[22px] lg:px-8 pt-[80px] sm:pt-[120px] pb-[64px] sm:pb-[96px]">
      <div class="max-w-[1080px] mx-auto flex flex-col items-start sm:items-center gap-6">
        <PartnerBadge />

        <h1 class="sm:text-center text-5xl sm:text-7xl font-bold leading-[1.05] tracking-tight text-white">
          Кастомная разработка<br>под <span class="text-[rgb(var(--color-accent-primary-ch))]">Битрикс24</span>
        </h1>

        <p class="sm:text-center text-lg sm:text-2xl max-w-[820px] text-white/70 leading-relaxed">
          AI, интеграции, MCP. <span class="text-white">То, чего нет в маркетплейсе — собираю под вас.</span>
        </p>

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <B24Button
            label="Описать задачу за 5 минут"
            to="#brief"
            color="air-primary"
            size="xl"
          >
            <template #trailing>
              <ArrowRightLIcon class="size-5" />
            </template>
          </B24Button>
          <B24Button
            label="Посмотреть, что делаю"
            to="#services"
            color="air-secondary-no-accent"
            size="xl"
          />
        </div>

        <!-- Tech-стек -->
        <div class="mt-12 sm:mt-16 flex flex-col items-start sm:items-center gap-3">
          <div class="text-xs uppercase tracking-[0.18em] text-white/40 font-mono">
            Работает с моделями
          </div>
          <div class="flex flex-wrap items-center justify-start sm:justify-center gap-x-6 sm:gap-x-10 gap-y-2 text-white/60">
            <span class="font-mono text-sm tracking-tight">Claude</span>
            <span class="size-1 rounded-full bg-white/20" />
            <span class="font-mono text-sm tracking-tight">OpenAI</span>
            <span class="size-1 rounded-full bg-white/20" />
            <span class="font-mono text-sm tracking-tight">Gemini</span>
            <span class="size-1 rounded-full bg-white/20" />
            <span class="font-mono text-sm tracking-tight">DeepSeek</span>
          </div>
        </div>
      </div>
    </section>

    <!-- НАПРАВЛЕНИЯ УСЛУГ -->
    <section
      id="services"
      class="px-[22px] lg:px-8 py-[64px] sm:py-[108px]"
    >
      <div class="max-w-[1200px] mx-auto">
        <div class="max-w-[720px] mb-12 sm:mb-16">
          <h2 class="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Что я делаю
          </h2>
          <p class="text-lg text-white/65">
            Три направления. Один разработчик, фиксированная цена за этап,
            демо каждые 1–2 недели.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            v-for="(s, i) in services"
            :key="i"
            data-glow-card
            class="rounded-2xl border border-white/10 bg-white/[0.03] p-7 flex flex-col gap-4 hover:border-white/25 transition-colors"
          >
            <div class="inline-flex items-center justify-center size-12 rounded-xl bg-[rgb(var(--color-accent-primary-ch)/0.15)] text-[rgb(var(--color-accent-primary-ch))]">
              <component
                :is="s.icon"
                class="size-6"
              />
            </div>
            <h3 class="text-xl font-bold text-white leading-tight">
              {{ s.title }}
            </h3>
            <p class="text-sm sm:text-base text-white/65 leading-relaxed">
              {{ s.text }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ЧЕМ ОТЛИЧАЮСЬ -->
    <section class="px-[22px] lg:px-8 py-[64px] sm:py-[108px]">
      <div class="max-w-[1200px] mx-auto">
        <div class="max-w-[720px] mb-12 sm:mb-16">
          <h2 class="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Чем отличаюсь от типового интегратора
          </h2>
          <p class="text-lg text-white/65">
            Не делаю комплексное внедрение Битрикс24. Делаю нестандартные задачи поверх него.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div
            v-for="(d, i) in differentiators"
            :key="i"
            data-glow-card
            class="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col"
          >
            <img
              v-if="d.photo"
              :src="d.photo"
              :alt="d.caption || d.title"
              class="size-16 rounded-full object-cover mb-4 border-2 border-[rgb(var(--color-accent-primary-ch)/0.5)] shadow-[0_0_24px_rgba(0,212,255,0.18)]"
              loading="lazy"
            >
            <div
              v-else
              class="inline-flex items-center justify-center size-11 rounded-xl bg-[rgb(var(--color-accent-partner-ch)/0.18)] text-[rgb(var(--color-accent-partner-ch))] mb-4"
            >
              <component
                :is="d.icon"
                class="size-5"
              />
            </div>
            <div class="font-bold text-white mb-2 text-lg">
              {{ d.title }}
            </div>
            <div class="text-sm text-white/60 leading-relaxed">
              {{ d.text }}
            </div>
            <div
              v-if="d.caption"
              class="mt-auto pt-4 text-xs text-white/45 font-mono"
            >
              — {{ d.caption }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- NEGATIVE QUALIFICATION -->
    <section class="px-[22px] lg:px-8 py-[64px] sm:py-[108px]">
      <div class="max-w-[1200px] mx-auto">
        <div class="max-w-[720px] mb-12 sm:mb-16">
          <h2 class="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Возьмусь — не за всё
          </h2>
          <p class="text-lg text-white/65">
            Чтобы не тратить ваше и моё время на discovery,
            который точно закончится отказом — лучше сразу.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="rounded-2xl border border-[rgb(var(--color-accent-success-ch)/0.3)] bg-[rgb(var(--color-accent-success-ch)/0.05)] p-7">
            <div class="text-xs uppercase tracking-[0.14em] font-mono text-[rgb(var(--color-accent-success-ch))] mb-4">
              Возьмусь, если
            </div>
            <ul class="flex flex-col gap-3">
              <li
                v-for="(t, i) in takeIf"
                :key="i"
                class="flex items-start gap-3 text-white/85 text-sm sm:text-base leading-relaxed"
              >
                <CheckLIcon class="size-4 mt-1 shrink-0 text-[rgb(var(--color-accent-success-ch))]" />
                <span>{{ t }}</span>
              </li>
            </ul>
          </div>

          <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
            <div class="text-xs uppercase tracking-[0.14em] font-mono text-white/50 mb-4">
              Не возьмусь, если
            </div>
            <ul class="flex flex-col gap-3">
              <li
                v-for="(t, i) in skipIf"
                :key="i"
                class="flex items-start gap-3 text-white/65 text-sm sm:text-base leading-relaxed"
              >
                <CircleMinusIcon class="size-4 mt-1 shrink-0 text-white/40" />
                <span>{{ t }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ПРОЦЕСС ЗАКАЗА -->
    <section class="px-[22px] lg:px-8 py-[64px] sm:py-[108px]">
      <div class="max-w-[1200px] mx-auto">
        <div class="max-w-[720px] mb-12 sm:mb-16">
          <h2 class="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Процесс заказа разработки
          </h2>
          <p class="text-lg text-white/65">
            Четыре этапа. Каждый закрывается актом — следующий не стартует,
            пока вы не приняли предыдущий.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="(p, i) in process"
            :key="i"
            class="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >
            <div class="text-3xl font-bold font-mono text-[rgb(var(--color-accent-primary-ch))] mb-3 leading-none">
              {{ p.step }}
            </div>
            <div class="font-bold text-lg text-white mb-2">
              {{ p.title }}
            </div>
            <div class="text-sm text-white/60 leading-relaxed">
              {{ p.text }}
            </div>
            <ul
              v-if="p.list"
              class="mt-3 flex flex-col gap-1.5"
            >
              <li
                v-for="(q, j) in p.list"
                :key="j"
                class="flex items-start gap-2 text-xs text-white/55 leading-relaxed"
              >
                <span class="font-mono text-[rgb(var(--color-accent-primary-ch))]/70 shrink-0">{{ j + 1 }}.</span>
                <span>{{ q }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ФОРМА -->
    <section
      id="brief"
      class="px-[22px] lg:px-8 py-[64px] sm:py-[108px]"
    >
      <div class="max-w-[900px] mx-auto">
        <div class="rounded-3xl border border-white/10 bg-gradient-to-br from-[rgb(var(--color-accent-partner-ch)/0.15)] to-[rgb(var(--color-accent-special-ch)/0.08)] p-8 sm:p-12">
          <h2 class="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Опишите задачу — скажу честно, берусь или нет
          </h2>
          <p class="text-lg text-white/70 mb-8">
            Прочитаю и отвечу в течение рабочего дня. На discovery за 30 минут
            разберёмся, можно ли это сделать вообще, и если да — за сколько и в какие сроки.
          </p>
          <BriefForm />
        </div>
      </div>
    </section>
  </div>
</template>
