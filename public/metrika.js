;(function () {
  var meta = document.querySelector('meta[name="ym-id"]')
  if (!meta || !/^\d+$/.test(meta.content)) return
  var id = meta.content
  ;(function (m, e, t, r, i, k, a) {
    m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments) }
    m[i].l = 1 * new Date()
    for (var j = 0; j < document.scripts.length; j++) {
      if (document.scripts[j].src === r) { return }
    }
    k = e.createElement(t)
    a = e.getElementsByTagName(t)[0]
    k.async = 1
    k.src = r
    a.parentNode.insertBefore(k, a)
  })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=' + id, 'ym')
  window.ym(id, 'init', { ssr: true, webvisor: true, clickmap: true, accurateTrackBounce: true, trackLinks: true })
})()
