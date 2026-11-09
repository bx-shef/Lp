export type FormGate = 'load' | 'ask' | 'ask-framed'

export interface ConsentApi {
  granted: () => boolean
}

// Загрузчик формы Б24 пишет метки b24_crm_guest_*: без согласия на cookie аналитики форму не грузим.
// Нет баннера (BxConsent не подключён) — решать нечем, форма грузится как раньше.
export function formGate(consent: ConsentApi | undefined, framed: boolean): FormGate {
  if (!consent) return 'load'
  if (consent.granted()) return 'load'
  return framed ? 'ask-framed' : 'ask'
}
