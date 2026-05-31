<script setup lang="ts">
const canvas = ref<HTMLCanvasElement | null>(null)
let animId = 0
let resizeRaf = 0
let ctx: CanvasRenderingContext2D
let w = 0
let h = 0
let nextPerturb = 0
let ro: ResizeObserver
let prefersReduced = false
let isRunning = false
let motionMql: MediaQueryList | null = null

interface Node {
  id: string
  label: string
  x: number
  y: number
  vx: number
  vy: number
  r: number
  primary: boolean
}

// Force simulation tuning knobs — change here, not inline
const GRAVITY_K = 0.0014 // attraction strength toward gravity center
const REPULSION = 4800 // node-to-node repulsion constant
const SPRING_K = 0.018 // edge spring stiffness
const SPRING_LEN = 145 // edge rest length in px
const DAMPING = 0.855 // velocity decay per tick (0 = instant stop)
const NOISE = 0.045 // random walk noise added each tick
const BOUNDARY_PAD = 55 // how far nodes stay from canvas edges
const PHOTO_REPEL_R = 165 // repulsion radius around photo zone in px
// Horizontal offset of photo center inside max-w-[1080px] container:
// px-8(32) + text max-w-[620px](620) + lg:gap-12(48) + half-photo(120) = 820
const PHOTO_CONTAINER_OFFSET_X = 820
const PHOTO_RELATIVE_Y = 0.40 // photo vertical center as fraction of canvas height
const PERTURB_IMPULSE = 4 // velocity kick magnitude during periodic shake
const PERTURB_MIN_MS = 3500 // min ms between shakes
const PERTURB_JITTER_MS = 2500 // random extra ms added on top

const NODES_SRC = [
  { id: 'b24', label: 'Битрикс24', primary: true },
  { id: 'ai', label: 'AI', primary: false },
  { id: 'mcp', label: 'MCP', primary: false },
  { id: 'rest', label: 'REST API', primary: false },
  { id: 'crm', label: 'CRM', primary: false },
  { id: 'claude', label: 'Claude', primary: false },
  { id: 'openai', label: 'OpenAI', primary: false },
  { id: 'tasks', label: 'Задачи', primary: false },
  { id: 'catalog', label: 'Каталог', primary: false },
  { id: 'webhook', label: 'Webhooks', primary: false },
  { id: 'sdk', label: 'b24jssdk', primary: false },
  { id: 'b24ui', label: 'b24ui', primary: false },
  { id: 'integration', label: 'Интеграции', primary: false }
]

const EDGES: [string, string][] = [
  ['b24', 'crm'], ['b24', 'tasks'], ['b24', 'catalog'],
  ['b24', 'sdk'], ['b24', 'rest'], ['b24', 'webhook'],
  ['b24', 'b24ui'], ['b24', 'integration'],
  ['ai', 'claude'], ['ai', 'openai'], ['ai', 'b24'],
  ['mcp', 'ai'], ['mcp', 'b24'], ['mcp', 'rest'],
  ['rest', 'integration'], ['sdk', 'b24ui'], ['sdk', 'ai']
]

let nodes: Node[] = []
let nodeMap = new Map<string, Node>()

function init() {
  if (!canvas.value) return
  resize()

  nodes = NODES_SRC.map(n => ({
    ...n,
    x: w * 0.5 + (Math.random() - 0.5) * w * 0.70,
    y: h * 0.5 + (Math.random() - 0.5) * h * 0.65,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    r: n.primary ? 5 : 3.5
  }))
  nodeMap = new Map(nodes.map(n => [n.id, n]))
  nextPerturb = Date.now() + 2500
}

function resize() {
  if (!canvas.value) return
  // RAF debounce: coalesces burst resize events into a single update
  cancelAnimationFrame(resizeRaf)
  resizeRaf = requestAnimationFrame(() => {
    if (!canvas.value) return
    w = canvas.value.width = canvas.value.offsetWidth
    h = canvas.value.height = canvas.value.offsetHeight
    // Resize сбрасывает содержимое canvas — при reduced-motion перерисуем кадр.
    if (prefersReduced && ctx) draw()
  })
}

function tick() {
  const now = Date.now()

  if (now > nextPerturb) {
    for (const n of nodes) {
      n.vx += (Math.random() - 0.5) * PERTURB_IMPULSE
      n.vy += (Math.random() - 0.5) * PERTURB_IMPULSE
    }
    nextPerturb = now + PERTURB_MIN_MS + Math.random() * PERTURB_JITTER_MS
  }

  // Gravity center — right of center on desktop, top-right on mobile
  const cx = w > 900 ? w * 0.70 : w * 0.75
  const cy = w > 900 ? h * 0.58 : h * 0.22

  // Photo zone repulsion (desktop only — off-screen sentinel on mobile)
  const photoX = w > 900 ? Math.max(0, (w - 1080) / 2) + PHOTO_CONTAINER_OFFSET_X : -9999
  const photoY = h * PHOTO_RELATIVE_Y

  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i]!
    a.vx += (cx - a.x) * GRAVITY_K
    a.vy += (cy - a.y) * GRAVITY_K
    a.vx += (Math.random() - 0.5) * NOISE
    a.vy += (Math.random() - 0.5) * NOISE

    // Repel from photo zone
    const pdx = a.x - photoX
    const pdy = a.y - photoY
    const pdist = Math.sqrt(pdx * pdx + pdy * pdy) + 0.01
    if (pdist < PHOTO_REPEL_R) {
      const pf = Math.pow((PHOTO_REPEL_R - pdist) / PHOTO_REPEL_R, 2) * 5
      a.vx += (pdx / pdist) * pf
      a.vy += (pdy / pdist) * pf
    }

    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j]!
      const dx = b.x - a.x
      const dy = b.y - a.y
      const d2 = dx * dx + dy * dy + 0.01
      const d = Math.sqrt(d2)
      const f = REPULSION / d2
      const fx = (dx / d) * f
      const fy = (dy / d) * f
      a.vx -= fx
      a.vy -= fy
      b.vx += fx
      b.vy += fy
    }
  }

  for (const [sId, tId] of EDGES) {
    const s = nodeMap.get(sId)
    const t = nodeMap.get(tId)
    if (!s || !t) continue
    const dx = t.x - s.x
    const dy = t.y - s.y
    const d = Math.sqrt(dx * dx + dy * dy) || 1
    const f = (d - SPRING_LEN) * SPRING_K
    const fx = (dx / d) * f
    const fy = (dy / d) * f
    s.vx += fx
    s.vy += fy
    t.vx -= fx
    t.vy -= fy
  }

  for (const n of nodes) {
    n.vx *= DAMPING
    n.vy *= DAMPING
    n.x += n.vx
    n.y += n.vy
    if (n.x < BOUNDARY_PAD) n.vx += (BOUNDARY_PAD - n.x) * 0.12
    if (n.x > w - BOUNDARY_PAD) n.vx -= (n.x - (w - BOUNDARY_PAD)) * 0.12
    if (n.y < BOUNDARY_PAD) n.vy += (BOUNDARY_PAD - n.y) * 0.12
    if (n.y > h - BOUNDARY_PAD) n.vy -= (n.y - (h - BOUNDARY_PAD)) * 0.12
  }
}

function draw() {
  ctx.clearRect(0, 0, w, h)
  const CH = '0, 212, 255'

  // Edges
  ctx.lineWidth = 1
  for (const [sId, tId] of EDGES) {
    const s = nodeMap.get(sId)
    const t = nodeMap.get(tId)
    if (!s || !t) continue
    ctx.beginPath()
    ctx.moveTo(s.x, s.y)
    ctx.lineTo(t.x, t.y)
    ctx.strokeStyle = `rgba(${CH}, 0.10)`
    ctx.stroke()
  }

  // Nodes
  for (const n of nodes) {
    const glowR = n.primary ? 24 : 15
    const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR)
    grd.addColorStop(0, `rgba(${CH}, ${n.primary ? 0.20 : 0.11})`)
    grd.addColorStop(1, `rgba(${CH}, 0)`)
    ctx.beginPath()
    ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2)
    ctx.fillStyle = grd
    ctx.fill()

    ctx.beginPath()
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${CH}, ${n.primary ? 0.88 : 0.50})`
    ctx.fill()

    ctx.font = `${n.primary ? 'bold ' : ''}10px "Roboto Mono", monospace`
    ctx.fillStyle = n.primary
      ? `rgba(${CH}, 0.80)`
      : 'rgba(255,255,255,0.35)'
    ctx.textAlign = 'center'
    ctx.fillText(n.label, n.x, n.y + (n.primary ? 21 : 17))
  }
}

function loop() {
  tick()
  draw()
  animId = requestAnimationFrame(loop)
}

// Один владелец цикла: isRunning защищает от двойного RAF при быстрых
// hidden→visible переходах (иначе два параллельных loop ускорили бы анимацию).
function start() {
  if (isRunning || prefersReduced) return
  isRunning = true
  animId = requestAnimationFrame(loop)
}

function stop() {
  cancelAnimationFrame(animId)
  isRunning = false
}

// Пауза анимации, когда вкладка не видна — экономит батарею/CPU на мобильных.
function onVisibility() {
  if (document.hidden) stop()
  else start()
}

// Реакция на смену системной настройки «уменьшить движение» без перезагрузки.
function onMotionChange(e: MediaQueryListEvent) {
  prefersReduced = e.matches
  if (prefersReduced) {
    stop()
    draw() // оставляем один статичный кадр
  } else {
    start()
  }
}

onMounted(() => {
  if (!canvas.value) return
  const c = canvas.value.getContext('2d')
  if (!c) return // 2D-контекст недоступен — тихо пропускаем фон
  ctx = c
  motionMql = window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null
  prefersReduced = motionMql?.matches ?? false
  init()
  if (prefersReduced) {
    draw() // один статичный кадр — без непрерывной анимации
  } else {
    start()
  }
  document.addEventListener('visibilitychange', onVisibility)
  motionMql?.addEventListener('change', onMotionChange)
  ro = new ResizeObserver(resize)
  ro.observe(canvas.value)
})

onUnmounted(() => {
  stop()
  cancelAnimationFrame(resizeRaf)
  ro?.disconnect()
  document.removeEventListener('visibilitychange', onVisibility)
  motionMql?.removeEventListener('change', onMotionChange)
})
</script>

<template>
  <canvas
    ref="canvas"
    class="absolute inset-0 w-full h-full pointer-events-none select-none"
    aria-hidden="true"
  />
</template>
