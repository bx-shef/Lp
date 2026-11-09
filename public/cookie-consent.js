/*!
 * cookie-consent.js — баннер согласия на cookie для посадочных bx-shef (политика cookie: пп. 4.2, 4.4, 5.1).
 * Источник: bx-shef/Lp, public/cookie-consent.js. В другие репозитории — копия без правок;
 * при правке — поднять VERSION и разнести копии.
 *
 * Подключение (до кода аналитики, без async/defer):
 *   <script src="/cookie-consent.js" data-policy="https://offer.bx-shef.by/privacy"
 *           data-services="Яндекс Метрику (статистика и запись действий на странице) и метки формы Битрикс24"></script>
 *   <script>BxConsent.onAnalytics(function () { ...код Яндекс Метрики... })</script>
 * Баннер: «Принять все», «Отказаться от всех» (только обязательные), «Настроить» — окно выбора по типам:
 * обязательные (всегда включены), аналитические (переключатель); функциональных и рекламных cookie нет.
 * Ссылка «Настроить cookie»: любой элемент с атрибутом data-cookie-settings — открывает окно настроек.
 * Внутри фрейма (приложение в портале Битрикс24) баннера нет и аналитика не запускается.
 * data-exclude — регулярное выражение пути, где баннера нет (служебные страницы).
 *
 * Выбор хранится в cookie `cookie_consent` (granted — аналитика включена, denied — только обязательные)
 * на 1 год; на *.bx-shef.by — общий для всех поддоменов. До согласия аналитика не загружается.
 * Категория выбора одна (аналитика), поэтому формат значения не менялся с 1.2.0.
 */
(function (w, d) {
  'use strict'
  var VERSION = '1.3.0'
  if (w.BxConsent) return

  var NAME = 'cookie_consent'
  var YEAR = 365 * 24 * 3600
  var me = d.currentScript
  var policy = (me && me.getAttribute('data-policy')) || 'https://offer.bx-shef.by/privacy'
  var services = (me && me.getAttribute('data-services'))
    || 'Яндекс Метрику (статистика и запись действий на странице) и метки формы Битрикс24'
  var exclude = me && me.getAttribute('data-exclude')
  var queue = []
  var box = null
  var dlg = null
  var lastFocus = null

  function read() {
    var m = d.cookie.match(/(?:^|;\s*)cookie_consent=(granted|denied)/)
    return m ? m[1] : null
  }

  function domainAttr() {
    var h = w.location.hostname
    return /(^|\.)bx-shef\.by$/.test(h) ? '; domain=.bx-shef.by' : ''
  }

  function write(v) {
    d.cookie = NAME + '=' + v + '; max-age=' + YEAR + '; path=/; SameSite=Lax'
      + (w.location.protocol === 'https:' ? '; Secure' : '') + domainAttr()
  }

  // Отказ после согласия: убрать cookie Метрики первой стороны (на доменах Яндекса — не достать).
  function wipe() {
    var names = d.cookie.split(';').map(function (c) { return c.split('=')[0].trim() })
    var dom = domainAttr()
    names.forEach(function (n) {
      if (/^_ym/.test(n)) {
        d.cookie = n + '=; max-age=0; path=/'
        d.cookie = n + '=; max-age=0; path=/; domain=.' + w.location.hostname
        if (dom) d.cookie = n + '=; max-age=0; path=/' + dom
      }
    })
    try {
      Object.keys(w.localStorage).forEach(function (k) {
        if (/^_ym|^b24_crm_guest/.test(k)) w.localStorage.removeItem(k)
      })
    } catch (e) { /* хранилище недоступно */ }
  }

  function run() {
    while (queue.length) {
      try { queue.shift()() } catch (e) { if (w.console) w.console.error(e) }
    }
  }

  function choose(v) {
    var before = read()
    write(v)
    hide()
    if (v === 'granted') run()
    else if (before === 'granted') { wipe(); w.location.reload() }
    else wipe()
  }

  function css() {
    var s = d.createElement('style')
    s.textContent = '.bxcc{position:fixed;z-index:2147483000;left:16px;right:16px;bottom:16px;max-width:560px;'
      + 'margin:0 auto;padding:16px 18px;border-radius:14px;background:#1e2226;color:#e8eaec;'
      + 'font:14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;box-shadow:0 8px 32px rgba(0,0,0,.35)}'
      + '.bxcc p{margin:0 0 12px}.bxcc a{color:#5fb3ff}.bxcc__row{display:flex;gap:8px;flex-wrap:wrap}'
      + '.bxcc button{flex:1 1 auto;min-height:44px;padding:8px 14px;border-radius:10px;border:1px solid #4a5157;'
      + 'background:transparent;color:inherit;font:inherit;cursor:pointer}'
      + '@media (max-width:600px){.bxcc{left:0;right:0;bottom:0;max-width:none;border-radius:14px 14px 0 0;'
      + 'padding:14px 16px calc(14px + env(safe-area-inset-bottom));font-size:13px;max-height:60vh;overflow:auto}'
      + '.bxcc__row{flex-direction:column-reverse}.bxcc button{width:100%}}'
      + '.bxcc button.bxcc__yes{background:#2fc6f6;border-color:#2fc6f6;color:#0b1a22;font-weight:600}'
      + '.bxcc button:focus-visible{outline:2px solid #5fb3ff;outline-offset:2px}'
      + '.bxcc__row{flex-wrap:wrap}.bxcc button.bxcc__cfg{border-color:transparent;text-decoration:underline}'
      + '.bxcs{position:fixed;z-index:2147483001;inset:0;display:flex;align-items:center;justify-content:center;'
      + 'padding:16px;background:rgba(0,0,0,.55);font:14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}'
      + '.bxcs[hidden]{display:none}'
      + '.bxcs__box{position:relative;width:100%;max-width:520px;max-height:90vh;overflow:auto;padding:20px;border-radius:14px;'
      + 'background:#1e2226;color:#e8eaec;box-shadow:0 8px 32px rgba(0,0,0,.45)}'
      + '.bxcs h2{margin:0 36px 12px 0;font-size:18px;line-height:1.3}.bxcs a{color:#5fb3ff}'
      + '.bxcs__x{position:absolute;top:10px;right:10px;width:36px;height:36px;border:0;border-radius:8px;background:transparent;'
      + 'color:inherit;font-size:22px;line-height:1;cursor:pointer}'
      + '.bxcs__t{padding:12px 0;border-top:1px solid #3a4046}'
      + '.bxcs__t label{display:flex;gap:12px;align-items:flex-start;cursor:pointer}'
      + '.bxcs__t input{flex:none;width:22px;height:22px;margin:1px 0 0;accent-color:#2fc6f6}'
      + '.bxcs__t b{display:block}.bxcs__t small{display:block;color:#aeb4ba}'
      + '.bxcs__t--off{color:#aeb4ba}'
      + '.bxcs button.bxcs__save{width:100%;min-height:44px;margin-top:8px;padding:8px 14px;border-radius:10px;'
      + 'border:1px solid #2fc6f6;background:#2fc6f6;color:#0b1a22;font:inherit;font-weight:600;cursor:pointer}'
      + '.bxcs button:focus-visible,.bxcs input:focus-visible{outline:2px solid #5fb3ff;outline-offset:2px}'
      + '@media (max-width:600px){.bxcs{align-items:flex-end;padding:0}.bxcs__box{max-width:none;max-height:85vh;'
      + 'border-radius:14px 14px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom));font-size:13px}}'
    d.head.appendChild(s)
  }

  function show() {
    if (box) { box.hidden = false; return }
    css()
    box = d.createElement('div')
    box.className = 'bxcc'
    box.setAttribute('role', 'dialog')
    box.setAttribute('aria-live', 'polite')
    box.setAttribute('aria-label', 'Согласие на cookie')
    box.innerHTML = '<p>Обязательные cookie нужны для работы сайта. С вашего согласия включим '
      + '<span class="bxcc__svc"></span>. Подробнее — <a target="_blank" rel="noopener"></a>.</p>'
      + '<div class="bxcc__row"><button type="button" class="bxcc__no">Отказаться от всех</button>'
      + '<button type="button" class="bxcc__cfg">Настроить</button>'
      + '<button type="button" class="bxcc__yes">Принять все</button></div>'
    box.querySelector('.bxcc__svc').textContent = services
    var a = box.querySelector('a')
    a.href = policy
    a.textContent = 'в политике конфиденциальности'
    box.querySelector('.bxcc__yes').onclick = function () { choose('granted') }
    box.querySelector('.bxcc__no').onclick = function () { choose('denied') }
    box.querySelector('.bxcc__cfg').onclick = function () { settings() }
    d.body.appendChild(box)
  }

  function hide() { if (box) box.hidden = true }

  function focusable() {
    return Array.prototype.filter.call(dlg.querySelectorAll('button,input,a[href]'), function (el) { return !el.disabled })
  }

  function closeSettings() {
    if (!dlg || dlg.hidden) return
    dlg.hidden = true
    d.removeEventListener('keydown', onKey, true)
    var f = lastFocus
    lastFocus = null
    if (f && f.focus && d.contains(f)) f.focus()
  }

  function onKey(e) {
    if (!dlg || dlg.hidden) return
    if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); closeSettings(); return }
    if (e.key !== 'Tab') return
    var f = focusable()
    if (!f.length) return
    var first = f[0]
    var last = f[f.length - 1]
    if (e.shiftKey && (d.activeElement === first || !dlg.contains(d.activeElement))) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && (d.activeElement === last || !dlg.contains(d.activeElement))) { e.preventDefault(); first.focus() }
  }

  // Окно выбора по типам: обязательные — всегда включены; аналитические — переключатель; прочих типов нет.
  function settings() {
    css()
    lastFocus = d.activeElement
    if (!dlg) {
      dlg = d.createElement('div')
      dlg.className = 'bxcs'
      dlg.innerHTML = '<div class="bxcs__box" role="dialog" aria-modal="true" aria-labelledby="bxcs-t">'
        + '<button type="button" class="bxcs__x" aria-label="Закрыть">\u00d7</button>'
        + '<h2 id="bxcs-t">Настройки cookie</h2>'
        + '<div class="bxcs__t"><label><input type="checkbox" checked disabled>'
        + '<span><b>Обязательные</b><small>Нужны для работы сайта и хранения вашего выбора (cookie_consent). Не отключаются.</small></span></label></div>'
        + '<div class="bxcs__t"><label><input type="checkbox" class="bxcs__an">'
        + '<span><b>Аналитические</b><small class="bxcs__svc"></small></span></label></div>'
        + '<div class="bxcs__t bxcs__t--off"><b>Функциональные</b><small>Не используются.</small></div>'
        + '<div class="bxcs__t bxcs__t--off"><b>Рекламные</b><small>Не используются.</small></div>'
        + '<p><a target="_blank" rel="noopener">Политика cookie и конфиденциальности</a></p>'
        + '<button type="button" class="bxcs__save">Сохранить</button></div>'
      dlg.querySelector('.bxcs__svc').textContent = services.charAt(0).toUpperCase() + services.slice(1) + '.'
      var a = dlg.querySelector('a')
      a.href = policy
      dlg.querySelector('.bxcs__x').onclick = closeSettings
      dlg.querySelector('.bxcs__save').onclick = function () {
        var on = dlg.querySelector('.bxcs__an').checked
        closeSettings()
        choose(on ? 'granted' : 'denied')
      }
      dlg.onclick = function (e) { if (e.target === dlg) closeSettings() }
      d.body.appendChild(dlg)
    }
    dlg.querySelector('.bxcs__an').checked = read() === 'granted'
    dlg.hidden = false
    d.addEventListener('keydown', onKey, true)
    dlg.querySelector('.bxcs__an').focus()
  }

  function ready(fn) {
    if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', fn)
    else fn()
  }

  w.BxConsent = {
    version: VERSION,
    /** granted | denied | null (ещё не выбирал) */
    state: read,
    granted: function () { return read() === 'granted' },
    /** fn — сразу, если согласие уже есть, иначе — после согласия на аналитику («Принять все» или «Сохранить» с ней). */
    onAnalytics: function (fn) {
      queue.push(fn)
      if (read() === 'granted') run()
    },
    /** Окно настроек (ссылка «Настроить cookie»). */
    open: function () { ready(settings) }
  }

  d.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('[data-cookie-settings]')
    if (t) { e.preventDefault(); w.BxConsent.open() }
  })

  var framed = false
  try { framed = w.self !== w.top } catch (e) { framed = true }
  var excluded = false
  try { excluded = !!exclude && new RegExp(exclude).test(w.location.pathname) } catch (e) { /* кривое выражение — баннер показываем */ }
  if (framed || excluded) {
    // Здесь согласия не спрашиваем — значит, и аналитику не запускаем никогда.
    w.BxConsent.onAnalytics = function () {}
    return
  }
  if (!read()) ready(show)
})(window, document)
