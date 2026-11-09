import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BANK, COOKIES_URL, POLICY_URL, PRODUCT_DOCS, SELLER } from '../shared/legal'

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

describe('продавец и документы', () => {
  it('продавец — ООО, реквизиты решения владельца', () => {
    expect(SELLER.name).toBe('ООО «БэИксШефБай»')
    expect(SELLER.address).toBe('220045, Республика Беларусь, г. Минск, пр-т Дзержинского, 127-488')
    expect(SELLER.phone).toBe('+375 29 736-01-26')
    expect(SELLER.email).toBe('offer@bx-shef.by')
    expect(SELLER.partner).toBe('ООО «БэИксШефБай» — партнёр «Битрикс24»; программы — разработка партнёра, не продукты компании «1С‑Битрикс»')
    expect(BANK.account).toBe('BYXX XXXX XXXX XXXX XXXX XXXX XXXX')
  })

  it('документы — прямые https-ссылки на license.bx-shef.by', () => {
    const urls = [POLICY_URL, COOKIES_URL, ...PRODUCT_DOCS.flatMap(p => [p.offer, p.eula])]
    expect(urls).toHaveLength(2 + 4)
    for (const u of urls) expect(u).toMatch(/^https:\/\/license\.bx-shef\.by\/(privacy|cookies|offer\/[\w.-]+|eula\/[\w.-]+)$/)
    expect(PRODUCT_DOCS.map(p => p.offer.split('/').pop())).toEqual(['shef.toolsai-mcp', 'shef.toolsai'])
  })

  it('в исходниках сайта нет «ИП Шевчик» как продавца', () => {
    const files = [
      ...walk('app'), ...walk('shared'),
      'public/llms.txt', 'public/index.md', 'public/legal.md'
    ].filter(f => /\.(vue|ts|md|txt)$/.test(f))
    for (const f of files) {
      expect(readFileSync(f, 'utf8'), f).not.toMatch(/ИП\s+Шевчик/)
    }
  })
})
