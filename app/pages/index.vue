<script setup lang="ts">
import ArrowRightLIcon from '@bitrix24/b24icons-vue/outline/ArrowRightLIcon'
import CopilotAi1Icon from '@bitrix24/b24icons-vue/main/CopilotAi1Icon'
import MagicImageIcon from '@bitrix24/b24icons-vue/main/MagicImageIcon'
import CloudTransferDataIcon from '@bitrix24/b24icons-vue/main/CloudTransferDataIcon'
import FunnelIcon from '@bitrix24/b24icons-vue/main/FunnelIcon'
import CodeIcon from '@bitrix24/b24icons-vue/common-service/CodeIcon'
import RocketIcon from '@bitrix24/b24icons-vue/main/RocketIcon'
import ShieldCheckedIcon from '@bitrix24/b24icons-vue/outline/ShieldCheckedIcon'

useCardGlow()

const services = [
  {
    icon: CopilotAi1Icon,
    title: 'AI-помощник в Битрикс24',
    text: 'Чат к базе знаний, ответы сотрудникам, подсказки в задачах и сделках. Видит ваши данные прямо в Б24.'
  },
  {
    icon: FunnelIcon,
    title: 'AI для продажников',
    text: 'В карточке сделки: следующий шаг, ответ на возражение, скрипт звонка, краткое саммари переписки.'
  },
  {
    icon: MagicImageIcon,
    title: 'Генерация и сборка контента',
    text: 'Каталог Б24 + AI-генератор изображений → готовые комплекты и hero-картинки для публикации.'
  },
  {
    icon: CloudTransferDataIcon,
    title: 'Интеграции и обмен данными',
    text: 'Клиент-банк, поставщики, маркетплейсы, любой SaaS через REST/MCP ↔ Б24. Без копипаста и Excel.'
  }
]

const differentiators = [
  {
    icon: CodeIcon,
    title: 'Контрибьютор в SDK Битрикс24',
    text: 'b24jssdk и b24ui — это код, который я знаю изнутри, а не по документации. Меньше времени на «разобраться», больше на «сделать».'
  },
  {
    icon: RocketIcon,
    title: 'Специализация на AI и интеграциях',
    text: 'Не комплексное внедрение Б24 «с нуля». Захожу туда, где базовый интегратор уже сказал «это не делается».'
  },
  {
    icon: ShieldCheckedIcon,
    title: 'Работаю один — отвечаю за результат',
    text: 'Между вами и разработчиком нет менеджеров, проектировщиков и «команды на стороне». Что обсудили — то и получите.'
  }
]

const process = [
  { step: '01', title: 'Discovery', text: '30-минутный созвон + 5 ключевых вопросов. Бесплатно. По итогу — оценка и решение, идём или нет.' },
  { step: '02', title: 'Оценка', text: 'Фиксированная цена за этап или почасовая ставка. Никаких «уточним по ходу».' },
  { step: '03', title: 'Разработка', text: 'Каждые 1–2 недели демо. Право остановить в любой момент — оплачиваете только сделанное.' },
  { step: '04', title: 'Поддержка', text: 'После запуска — почасовая или фиксированная подписка. По вашему выбору, без обязательств.' }
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
          AI-помощники, интеграции, MCP —
          <span class="text-white">там, где коробки и маркетплейса уже не хватает.</span>
        </p>

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <B24Button
            label="Обсудить задачу"
            to="#brief"
            color="air-primary"
            size="xl"
          >
            <template #trailing>
              <ArrowRightLIcon class="size-5" />
            </template>
          </B24Button>
          <B24Button
            label="Что я делаю"
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
          <div class="flex items-center gap-6 sm:gap-10 text-white/60">
            <span class="font-mono text-sm tracking-tight">Claude</span>
            <span class="size-1 rounded-full bg-white/20" />
            <span class="font-mono text-sm tracking-tight">OpenAI</span>
            <span class="size-1 rounded-full bg-white/20" />
            <span class="font-mono text-sm tracking-tight">Gemini</span>
          </div>
        </div>
      </div>
    </section>

    <!-- НАПРАВЛЕНИЯ УСЛУГ -->
    <section id="services" class="px-[22px] lg:px-8 py-[64px] sm:py-[108px]">
      <div class="max-w-[1200px] mx-auto">
        <div class="max-w-[720px] mb-12 sm:mb-16">
          <h2 class="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Что я делаю
          </h2>
          <p class="text-lg text-white/65">
            Три направления разработки. Один разработчик, прозрачные сроки, опыт работы с открытыми библиотеками Битрикс24.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="(s, i) in services"
            :key="i"
            data-glow-card
            class="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-4 hover:border-white/25 transition-colors"
          >
            <div class="inline-flex items-center justify-center size-11 rounded-xl bg-[rgb(var(--color-accent-primary-ch)/0.15)] text-[rgb(var(--color-accent-primary-ch))]">
              <component :is="s.icon" class="size-5" />
            </div>
            <h3 class="text-lg font-bold text-white leading-tight">
              {{ s.title }}
            </h3>
            <p class="text-sm text-white/65 leading-relaxed">
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
            class="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >
            <div class="inline-flex items-center justify-center size-11 rounded-xl bg-[rgb(var(--color-accent-partner-ch)/0.18)] text-[rgb(var(--color-accent-partner-ch))] mb-4">
              <component :is="d.icon" class="size-5" />
            </div>
            <div class="font-bold text-white mb-2 text-lg">
              {{ d.title }}
            </div>
            <div class="text-sm text-white/60 leading-relaxed">
              {{ d.text }}
            </div>
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
            Прозрачные этапы. Без предоплаты, которую невозможно отбить, и без «уточним по ходу» в смете.
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
          </div>
        </div>
      </div>
    </section>

    <!-- ФОРМА -->
    <section id="brief" class="px-[22px] lg:px-8 py-[64px] sm:py-[108px]">
      <div class="max-w-[900px] mx-auto">
        <div class="rounded-3xl border border-white/10 bg-gradient-to-br from-[rgb(var(--color-accent-partner-ch)/0.15)] to-[rgb(var(--color-accent-special-ch)/0.08)] p-8 sm:p-12">
          <h2 class="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Обсудим вашу задачу
          </h2>
          <p class="text-lg text-white/70 mb-8">
            Прочитаю и отвечу в течение рабочего дня. На созвоне за 30 минут разберёмся,
            можно ли это сделать вообще, и если да — за сколько и в какие сроки.
          </p>
          <BriefForm />
        </div>
      </div>
    </section>
  </div>
</template>
