// Единый источник данных о продавце и юридических документов.
// Используется страницами /legal и /privacy, футером и визиткой.
// Тексты для ИИ-агентов (public/legal.md, llms.txt, index.md) ведутся вручную — менять вместе.

export const SELLER = {
  name: 'ООО «БэИксШефБай»',
  unp: 'XXXXXXX', // заглушка до регистрации
  zip: '220045',
  country: 'Республика Беларусь',
  city: 'г. Минск',
  address: '220045, Республика Беларусь, г. Минск, пр-т Дзержинского, 127-488',
  phone: '+375 29 736-01-26',
  phoneTel: '+375297360126',
  email: 'offer@bx-shef.by',
  partner: 'ООО «БэИксШефБай» — партнёр «Битрикс24»; программы — разработка партнёра, не продукты компании «1С‑Битрикс»'
} as const

// Банковские реквизиты — заглушки (решение владельца, bx-shef/toolsai#653).
export const BANK = {
  bank: 'XXXXXXX',
  account: 'BYXX XXXX XXXX XXXX XXXX XXXX XXXX',
  bic: 'XXXXXXXX'
} as const

const DOCS_BASE = 'https://license.bx-shef.by'

export const POLICY_URL = `${DOCS_BASE}/privacy`
export const COOKIES_URL = `${DOCS_BASE}/cookies`

export interface ProductDocs {
  code: string
  title: string
  offer: string
  eula: string
}

export const PRODUCT_DOCS: ProductDocs[] = [
  {
    code: 'shef.cowork',
    title: 'shef.cowork — AI‑агент для вашего бизнеса',
    // Код приложения в сертификатах и на сервере лицензий — shef.toolsai-mcp.
    offer: `${DOCS_BASE}/offer/shef.toolsai-mcp`,
    eula: `${DOCS_BASE}/eula/shef.toolsai-mcp`
  },
  {
    code: 'shef.toolsai',
    title: 'shef.toolsai — ИИ для CRM',
    offer: `${DOCS_BASE}/offer/shef.toolsai`,
    eula: `${DOCS_BASE}/eula/shef.toolsai`
  }
]
