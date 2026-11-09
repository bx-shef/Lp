import { describe, expect, it } from 'vitest'
import { formGate } from '../shared/form-gate'

describe('formGate', () => {
  it('нет баннера — форма грузится', () => {
    expect(formGate(undefined, false)).toBe('load')
  })
  it('согласие есть — форма грузится', () => {
    expect(formGate({ granted: () => true }, false)).toBe('load')
  })
  it('нет согласия (denied или не выбирал) — форма не грузится, просим принять cookie', () => {
    expect(formGate({ granted: () => false }, false)).toBe('ask')
  })
  it('во фрейме — тот же отказ, но без ссылки на окно согласия', () => {
    expect(formGate({ granted: () => false }, true)).toBe('ask-framed')
  })
})
