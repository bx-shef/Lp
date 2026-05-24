/**
 * Прокидывает координаты курсора в CSS-переменные --glow-x/--glow-y
 * для всех элементов с [data-glow-card]. Используется hero-карточками
 * и кейсами — даёт «следящий» glow за мышью, как на vibecode.
 */
export function useCardGlow() {
  if (import.meta.server) return

  onMounted(() => {
    const handler = (e: MouseEvent) => {
      const target = (e.target as Element | null)?.closest('[data-glow-card]') as HTMLElement | null
      if (!target) return
      const r = target.getBoundingClientRect()
      target.style.setProperty('--glow-x', `${e.clientX - r.left}px`)
      target.style.setProperty('--glow-y', `${e.clientY - r.top}px`)
    }
    document.addEventListener('mousemove', handler, { passive: true })
    onUnmounted(() => document.removeEventListener('mousemove', handler))
  })
}
