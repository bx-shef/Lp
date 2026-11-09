export type FormGate = 'load' | 'ask' | 'ask-framed'

export interface ConsentApi {
  granted: () => boolean
}

// Загрузчик формы Б24 пишет метки b24_crm_guest_*: без согласия на cookie аналитики форму не грузим.
// Нет BxConsent (скрипт баннера не загрузился) — согласия нет: это отказ.
export function formGate(consent: ConsentApi | undefined, framed: boolean): FormGate {
  if (consent?.granted()) return 'load'
  return framed ? 'ask-framed' : 'ask'
}
