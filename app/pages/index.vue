<script setup lang="ts">
import ArrowRightLIcon from '@bitrix24/b24icons-vue/outline/ArrowRightLIcon'
import FileIcon from '@bitrix24/b24icons-vue/outline/FileIcon'
import RobotIcon from '@bitrix24/b24icons-vue/main/RobotIcon'
import CircleCheckIcon from '@bitrix24/b24icons-vue/outline/CircleCheckIcon'
import ChatsIcon from '@bitrix24/b24icons-vue/outline/ChatsIcon'
import AiStarsIcon from '@bitrix24/b24icons-vue/outline/AiStarsIcon'
import IdeaLampIcon from '@bitrix24/b24icons-vue/outline/IdeaLampIcon'
import RocketIcon from '@bitrix24/b24icons-vue/main/RocketIcon'
import CodeIcon from '@bitrix24/b24icons-vue/common-service/CodeIcon'
import ShieldCheckedIcon from '@bitrix24/b24icons-vue/outline/ShieldCheckedIcon'

useCardGlow()

const processSteps = [
  { icon: FileIcon, title: '1. Вход', text: 'Письмо от поставщика, скан документа, идея кампании, вопрос сотрудника. Любой неструктурированный поток.' },
  { icon: RobotIcon, title: '2. AI-агент разбирает', text: 'Читает файл, ищет товары в каталоге, сверяет цены, помечает проблемы. На вашем стеке: Битрикс24 + MCP.' },
  { icon: ChatsIcon, title: '3. Готовая карточка в Битрикс24', text: 'Менеджер открывает Smart-процесс, видит черновик решения и список проблем — каждая с пояснением.' },
  { icon: CircleCheckIcon, title: '4. Согласовал — исполнилось', text: 'Сделка создана, товар опубликован, ответ отправлен. Без копипаста и переноса вручную.' }
]

const cases = [
  {
    title: 'Входящие КП от поставщиков',
    text: 'Поставщик прислал Excel или PDF. Агент находит товары в вашем каталоге, сверяет цены с историей, отмечает новые позиции и аномалии. Менеджер открывает готовую сделку.',
    goal: 'Цель пилота: < 10 минут на КП вместо часа. Замеряем на ваших данных.',
    status: 'проработан, готов к пилоту',
    statusKey: 'success',
    icon: CircleCheckIcon
  },
  {
    title: 'Сборка комплектов в каталоге',
    text: 'Тренд или сезонная идея → агент собирает образ из товаров каталога, генерирует hero-картинку через Gemini, готовит карточку «комплект» для публикации.',
    goal: 'Рабочий прототип на каталоге fashion-ритейлера. Пилот в стадии согласования.',
    status: 'прототип, идёт пилот',
    statusKey: 'warning',
    icon: IdeaLampIcon
  },
  {
    title: 'Чат с корпоративными данными',
    text: 'Сотрудник спрашивает в Битрикс24 «какие условия по поставщику X?» — агент ищет в документах, регламентах, прошлых сделках и отвечает со ссылкой на источник.',
    goal: 'Архитектура продумана. Реализация — после первого клиента, который запросит.',
    status: 'в очереди',
    statusKey: 'neutral',
    icon: AiStarsIcon
  }
]

const stages = [
  { week: 'Этап 1', title: 'Discovery', text: '5 ключевых вопросов: объём, форматы, доступы, кто оператор, можно ли в облачную LLM' },
  { week: 'Этап 2', title: 'Парсинг и матчинг', text: 'Скрипт на реальных данных вашей задачи. Точность — на размеченных примерах' },
  { week: 'Этап 3', title: 'Карточка в Б24', text: 'Smart-процесс, две корзины «принять/посмотреть», триггеры на исполнение' },
  { week: 'Этап 4', title: 'Прогон с оператором', text: 'Метрики на реальных задачах. Решение: production, коррекция или стоп' }
]

const author = [
  { icon: CodeIcon, title: 'Контрибьютор в SDK Битрикс24', text: 'Открытые библиотеки b24jssdk и b24ui — это код, который я знаю изнутри, а не по документации.' },
  { icon: RocketIcon, title: 'MCP-шаблон под Битрикс24', text: 'Делаю собственный фундамент для AI-агентов, работающих с Битрикс24. На нём строится этот подход.' },
  { icon: ShieldCheckedIcon, title: 'Партнёр Битрикс24', text: 'Работаю по правилам брендбука и в рамках партнёрской программы. Все цены и сроки — прозрачно.' }
]

function statusClass(k: string) {
  if (k === 'success') return 'bg-[rgb(var(--color-accent-success-ch)/0.15)] text-[rgb(var(--color-accent-success-ch))] border-[rgb(var(--color-accent-success-ch)/0.3)]'
  if (k === 'warning') return 'bg-[rgb(var(--color-accent-warning-ch)/0.15)] text-[rgb(var(--color-accent-warning-ch))] border-[rgb(var(--color-accent-warning-ch)/0.3)]'
  return 'bg-white/5 text-white/60 border-white/15'
}
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="hero-fade-in px-[22px] lg:px-8 pt-[80px] sm:pt-[120px] pb-[64px] sm:pb-[96px]">
      <div class="max-w-[1080px] mx-auto flex flex-col items-start sm:items-center gap-6">
        <PartnerBadge />

        <h1 class="sm:text-center text-5xl sm:text-7xl font-bold leading-[1.05] tracking-tight text-white">
          AI-агент внутри<br>вашего <span class="text-[rgb(var(--color-accent-primary-ch))]">Битрикс24</span>
        </h1>

        <p class="sm:text-center text-lg sm:text-2xl max-w-[760px] text-white/70 leading-relaxed">
          Поставщик прислал Excel — менеджер открывает в Битрикс24 готовую сделку
          с подсвеченными проблемами. <span class="text-white">Без копипаста и переноса вручную.</span>
        </p>

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <B24Button
            label="Получить оценку задачи"
            to="#brief"
            color="air-primary"
            size="xl"
          >
            <template #trailing>
              <ArrowRightLIcon class="size-5" />
            </template>
          </B24Button>
          <B24Button
            label="Как это работает"
            to="#how"
            color="air-secondary-no-accent"
            size="xl"
          />
        </div>

        <!-- Tech-партнёры. Положите /public/logos/claude.svg и openai.svg чтобы заменить текст. -->
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

    <!-- ПРОЦЕСС -->
    <section id="how" class="px-[22px] lg:px-8 py-[64px] sm:py-[108px]">
      <div class="max-w-[1200px] mx-auto">
        <div class="max-w-[680px] mb-12">
          <h2 class="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Как это работает
          </h2>
          <p class="text-lg text-white/65">
            Один маршрут на разные входы. Финальное «да» всегда остаётся за человеком —
            в той же карточке Битрикс24, где он уже работает каждый день.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="(s, i) in processSteps"
            :key="i"
            data-glow-card
            class="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-white/20 transition-colors"
          >
            <div class="inline-flex items-center justify-center size-11 rounded-xl bg-[rgb(var(--color-accent-primary-ch)/0.15)] text-[rgb(var(--color-accent-primary-ch))] mb-4">
              <component :is="s.icon" class="size-5" />
            </div>
            <div class="font-bold text-white text-lg mb-2">
              {{ s.title }}
            </div>
            <div class="text-sm text-white/60 leading-relaxed">
              {{ s.text }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- КЕЙСЫ -->
    <section class="px-[22px] lg:px-8 py-[64px] sm:py-[108px]">
      <div class="max-w-[1200px] mx-auto">
        <div class="max-w-[680px] mb-12">
          <h2 class="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Три задачи, под которые сделан подход
          </h2>
          <p class="text-lg text-white/65">
            Один метод, три применения. Прямо сейчас глубоко проработан первый,
            второй — рабочий прототип, третий — следующий в очереди. Без вранья.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            v-for="(c, i) in cases"
            :key="i"
            data-glow-card
            class="rounded-2xl border border-white/10 bg-white/[0.03] p-7 flex flex-col gap-4 hover:border-white/25 transition-colors"
          >
            <div class="inline-flex items-center justify-center size-11 rounded-xl bg-[rgb(var(--color-accent-primary-ch)/0.15)] text-[rgb(var(--color-accent-primary-ch))]">
              <component :is="c.icon" class="size-5" />
            </div>
            <h3 class="text-xl font-bold text-white">
              {{ c.title }}
            </h3>
            <p class="text-sm text-white/65 leading-relaxed flex-1">
              {{ c.text }}
            </p>
            <div class="border-t border-white/10 pt-4 flex flex-col gap-3">
              <span class="text-sm text-white/60">{{ c.goal }}</span>
              <span
                class="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                :class="statusClass(c.statusKey)"
              >
                {{ c.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ОБ АВТОРЕ -->
    <section class="px-[22px] lg:px-8 py-[64px] sm:py-[108px]">
      <div class="max-w-[1200px] mx-auto">
        <div class="max-w-[680px] mb-12">
          <h2 class="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Кто это делает
          </h2>
          <p class="text-lg text-white/65">
            Игорь Шевчик — разработчик из Амстердама. Делаю инструменты для платформы
            Битрикс24 и для бизнесов, которые на ней работают.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div
            v-for="(a, i) in author"
            :key="i"
            data-glow-card
            class="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >
            <div class="inline-flex items-center justify-center size-11 rounded-xl bg-[rgb(var(--color-accent-partner-ch)/0.18)] text-[rgb(var(--color-accent-partner-ch))] mb-4">
              <component :is="a.icon" class="size-5" />
            </div>
            <div class="font-bold text-white mb-2">
              {{ a.title }}
            </div>
            <div class="text-sm text-white/60 leading-relaxed">
              {{ a.text }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ФОРМАТ РАБОТЫ -->
    <section class="px-[22px] lg:px-8 py-[64px] sm:py-[108px]">
      <div class="max-w-[1200px] mx-auto">
        <div class="max-w-[680px] mb-12">
          <h2 class="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Формат работы
          </h2>
          <p class="text-lg text-white/65">
            4–8 недель до работающего пилота — в зависимости от объёма данных и
            согласований доступов. После каждого этапа — точка решения.
            <span class="text-white">Без предоплаты, которую невозможно отбить.</span>
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="(s, i) in stages"
            :key="i"
            class="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >
            <div class="text-xs font-mono font-semibold uppercase tracking-[0.14em] text-[rgb(var(--color-accent-primary-ch))] mb-2">
              {{ s.week }}
            </div>
            <div class="font-bold text-lg text-white mb-2">
              {{ s.title }}
            </div>
            <div class="text-sm text-white/60 leading-relaxed">
              {{ s.text }}
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
            Расскажите о задаче
          </h2>
          <p class="text-lg text-white/70 mb-8">
            Прочитаю и отвечу в течение рабочего дня. Бюджет и сроки обсудим в созвоне —
            заранее в форму их не вгоняю, чтобы не якорить разговор раньше времени.
          </p>
          <BriefForm />
        </div>
      </div>
    </section>
  </div>
</template>
