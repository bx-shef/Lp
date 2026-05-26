<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)
let animId = 0
let ctx: CanvasRenderingContext2D
let w = 0
let h = 0
let nextPerturb = 0
let ro: ResizeObserver

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
  w = canvas.value.width = canvas.value.offsetWidth
  h = canvas.value.height = canvas.value.offsetHeight
}

function tick() {
  const now = Date.now()

  if (now > nextPerturb) {
    for (const n of nodes) {
      n.vx += (Math.random() - 0.5) * 4
      n.vy += (Math.random() - 0.5) * 4
    }
    nextPerturb = now + 3500 + Math.random() * 2500
  }

  // Gravity center — right of center, slightly below axis
  const cx = w > 900 ? w * 0.70 : w * 0.5
  const cy = h * 0.58

  // Approximate photo center in canvas coords (desktop only)
  const photoX = w > 900 ? Math.max(0, (w - 1080) / 2) + 820 : -9999
  const photoY = h * 0.40
  const PHOTO_R = 165

  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i]!
    a.vx += (cx - a.x) * 0.0014
    a.vy += (cy - a.y) * 0.0014
    a.vx += (Math.random() - 0.5) * 0.045
    a.vy += (Math.random() - 0.5) * 0.045

    // Repel from photo zone
    const pdx = a.x - photoX
    const pdy = a.y - photoY
    const pdist = Math.sqrt(pdx * pdx + pdy * pdy) + 0.01
    if (pdist < PHOTO_R) {
      const pf = Math.pow((PHOTO_R - pdist) / PHOTO_R, 2) * 5
      a.vx += (pdx / pdist) * pf
      a.vy += (pdy / pdist) * pf
    }

    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j]!
      const dx = b.x - a.x
      const dy = b.y - a.y
      const d2 = dx * dx + dy * dy + 0.01
      const d = Math.sqrt(d2)
      const f = 4800 / d2
      const fx = (dx / d) * f
      const fy = (dy / d) * f
      a.vx -= fx
      a.vy -= fy
      b.vx += fx
      b.vy += fy
    }
  }

  const K = 0.018
  const L = 145
  for (const [sId, tId] of EDGES) {
    const s = nodeMap.get(sId)
    const t = nodeMap.get(tId)
    if (!s || !t) continue
    const dx = t.x - s.x
    const dy = t.y - s.y
    const d = Math.sqrt(dx * dx + dy * dy) || 1
    const f = (d - L) * K
    const fx = (dx / d) * f
    const fy = (dy / d) * f
    s.vx += fx
    s.vy += fy
    t.vx -= fx
    t.vy -= fy
  }

  const PAD = 55
  for (const n of nodes) {
    n.vx *= 0.855
    n.vy *= 0.855
    n.x += n.vx
    n.y += n.vy
    if (n.x < PAD) n.vx += (PAD - n.x) * 0.12
    if (n.x > w - PAD) n.vx -= (n.x - (w - PAD)) * 0.12
    if (n.y < PAD) n.vy += (PAD - n.y) * 0.12
    if (n.y > h - PAD) n.vy -= (n.y - (h - PAD)) * 0.12
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

onMounted(() => {
  if (!canvas.value) return
  ctx = canvas.value.getContext('2d')!
  init()
  loop()
  ro = new ResizeObserver(resize)
  ro.observe(canvas.value)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  ro?.disconnect()
})
</script>

<template>
  <canvas
    ref="canvas"
    class="absolute inset-0 w-full h-full pointer-events-none select-none"
    aria-hidden="true"
  />
</template>
