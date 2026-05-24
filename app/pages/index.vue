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

const processSteps = [
  {
    icon: FileIcon,
    title: '1. Вход',
    description: 'Письмо от поставщика, скан документа, идея кампании, вопрос сотрудника. Любой неструктурированный поток.'
  },
  {
    icon: RobotIcon,
    title: '2. AI-агент разбирает',
    description: 'Читает файл, ищет товары в каталоге, сверяет цены, помечает проблемы. На вашем стеке: Битрикс24 + MCP.'
  },
  {
    icon: ChatsIcon,
    title: '3. Готовая карточка в Битрикс24',
    description: 'Менеджер открывает Smart-процесс, видит черновик решения и список проблем — каждая с пояснением.'
  },
  {
    icon: CircleCheckIcon,
    title: '4. Согласовал — исполнилось',
    description: 'Сделка создана, товар опубликован, ответ отправлен. Без копипаста и переноса вручную.'
  }
]

const stages = [
  { week: 'Этап 1', title: 'Discovery', text: '5 ключевых вопросов: объём, форматы, доступы, кто оператор, можно ли в облачную LLM' },
  { week: 'Этап 2', title: 'Парсинг и матчинг', text: 'Скрипт на реальных данных вашей задачи. Точность измеряем на размеченных примерах' },
  { week: 'Этап 3', title: 'Карточка в Б24', text: 'Smart-процесс, две корзины «принять/посмотреть», триггеры на исполнение' },
  { week: 'Этап 4', title: 'Прогон с оператором', text: 'Метрики на реальных задачах. Решение: production, коррекция или стоп' }
]
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="px-[22px] lg:px-8 pt-[64px] sm:pt-[96px] pb-[64px] sm:pb-[96px]">
      <div class="max-w-[1000px] mx-auto flex flex-col items-start sm:items-center gap-6">
        <PartnerBadge />

        <ProseH1 class="sm:text-center text-5xl sm:text-7xl font-bold mb-0 leading-[1.05]">
          AI-агент внутри<br>вашего <span class="text-[#0066a1]">Битрикс24</span>
        </ProseH1>

        <ProseP class="sm:text-center text-xl sm:text-2xl max-w-[720px] !mt-2">
          Поставщик прислал Excel — менеджер открывает в Битрикс24 готовую сделку
          с подсвеченными проблемами. Без копипаста и переноса вручную.
        </ProseP>

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
      </div>
    </section>

    <!-- ПРОЦЕСС: 4 шага -->
    <B24PageSection
      id="how"
      title="Как это работает"
      description="Один маршрут на разные входы. Финальное «да» всегда остаётся за человеком — в той же карточке Битрикс24, где он уже работает каждый день."
      :features="processSteps"
    />

    <!-- ТРИ КЕЙСА -->
    <B24PageSection
      title="Три задачи, под которые сделан подход"
      description="Один метод, три применения. Прямо сейчас глубоко проработан первый, второй — рабочий прототип, третий — следующий в очереди. Без вранья."
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <B24PageCard
          title="Входящие КП от поставщиков"
          description="Поставщик прислал Excel или PDF. Агент находит товары в вашем каталоге, сверяет цены с историей, отмечает новые позиции и аномалии. Менеджер открывает готовую сделку."
          variant="tinted"
        >
          <template #footer>
            <div class="flex flex-col gap-2 mt-2">
              <span class="text-sm text-(--air-base-50)">Цель пилота: <strong class="text-(--air-base)">&lt; 10 минут на КП</strong> вместо часа. Замеряем на ваших данных.</span>
              <span class="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#eaf7ec] text-[#2e5a3e]">
                <CircleCheckIcon class="size-3.5" /> проработан, готов к пилоту
              </span>
            </div>
          </template>
        </B24PageCard>

        <B24PageCard
          title="Сборка комплектов в каталоге"
          description="Тренд или сезонная идея → агент собирает образ из товаров каталога, генерирует hero-картинку через Gemini, готовит карточку «комплект» для публикации."
          variant="tinted"
        >
          <template #footer>
            <div class="flex flex-col gap-2 mt-2">
              <span class="text-sm text-(--air-base-50)">Рабочий прототип на каталоге fashion-ритейлера. Пилот в стадии согласования.</span>
              <span class="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fff3e6] text-[#c97b3e]">
                <IdeaLampIcon class="size-3.5" /> прототип, идёт пилот
              </span>
            </div>
          </template>
        </B24PageCard>

        <B24PageCard
          title="Чат с корпоративными данными"
          description="Сотрудник спрашивает в Битрикс24 «какие условия по поставщику X?» — агент ищет в документах, регламентах, прошлых сделках и отвечает со ссылкой на источник."
          variant="tinted"
        >
          <template #footer>
            <div class="flex flex-col gap-2 mt-2">
              <span class="text-sm text-(--air-base-50)">Архитектура продумана. Реализация — после первого клиента, который запросит.</span>
              <span class="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-(--air-tinted) text-(--air-base-50)">
                <AiStarsIcon class="size-3.5" /> в очереди
              </span>
            </div>
          </template>
        </B24PageCard>
      </div>
    </B24PageSection>

    <!-- КТО ДЕЛАЕТ -->
    <B24PageSection
      title="Кто это делает"
      description="Игорь Шевчик — разработчик из Амстердама. Делаю инструменты для платформы Битрикс24 и для бизнесов, которые на ней работают."
      :features="[
        {
          icon: CodeIcon,
          title: 'Контрибьютор в SDK Битрикс24',
          description: 'Открытые библиотеки b24jssdk и b24ui — это код, который я знаю изнутри, а не по документации.'
        },
        {
          icon: RocketIcon,
          title: 'MCP-шаблон под Битрикс24',
          description: 'Делаю собственный фундамент для AI-агентов, работающих с Битрикс24. На нём строится этот подход.'
        },
        {
          icon: ShieldCheckedIcon,
          title: 'Партнёр Битрикс24',
          description: 'Работаю по правилам брендбука и в рамках партнёрской программы. Все цены и сроки — прозрачно.'
        }
      ]"
    />

    <!-- ФОРМАТ РАБОТЫ -->
    <B24PageSection
      title="Формат работы"
      description="4–8 недель до работающего пилота — в зависимости от объёма данных и согласований доступов. После каждого этапа — точка решения. Без предоплаты, которую невозможно отбить."
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="(s, i) in stages"
          :key="i"
          class="rounded-xl border border-(--air-border) p-5 bg-(--air-theme-bg-color)"
        >
          <div class="text-xs font-semibold uppercase tracking-wider text-[#0066a1] mb-2">
            {{ s.week }}
          </div>
          <div class="font-bold text-lg mb-2">
            {{ s.title }}
          </div>
          <div class="text-sm text-(--air-base-50)">
            {{ s.text }}
          </div>
        </div>
      </div>
    </B24PageSection>

    <!-- ФОРМА -->
    <B24PageSection id="brief">
      <B24PageCard
        title="Расскажите о задаче"
        description="Прочитаю и отвечу в течение рабочего дня. Бюджет и сроки обсудим в созвоне — заранее в форму их не вгоняю, чтобы не якорить разговор раньше времени."
        variant="tinted-alt"
        :b24ui="{
          title: 'sm:text-4xl',
          description: 'sm:text-xl'
        }"
      >
        <template #footer>
          <div class="mt-6">
            <BriefForm />
          </div>
        </template>
      </B24PageCard>
    </B24PageSection>
  </div>
</template>
