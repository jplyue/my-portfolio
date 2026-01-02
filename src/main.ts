// src/main.ts
// === STABLE BASELINE: auto-scrolling world, no collision ===
import { startLoop } from "./engine/loop"

import levels from "./text.ts"

// ===== Education Scene Data =====
import { educationScene, workScene, skillsScene } from "./info.ts"

import "./style.css"

const carImage = new Image()
carImage.src = "/car.png" // put in public/car.png

const floorImage = new Image()
floorImage.src = "/floor.png" // put in public/floor.png

const foregroundImage = new Image()
foregroundImage.src = "/foreground.png" // put in public/foreground.png

const cursorImage = new Image()
cursorImage.src = "/cursor.png" // 放在 public/cursor.png

const keys: Record<string, boolean> = {}

const CAR_WIDTH = 882
const CAR_HEIGHT = 702
const CAR_GROUND_OFFSET = 50
const CAR_SCALE = 2 / 3
const CAR_DRAW_WIDTH = CAR_WIDTH * CAR_SCALE
const CAR_DRAW_HEIGHT = CAR_HEIGHT * CAR_SCALE

window.addEventListener("keydown", (e) => {
  // prevent page scroll / jump
  if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault()
  }
  keys[e.key] = true
})

window.addEventListener("keyup", (e) => {
  keys[e.key] = false
})

const canvas = document.createElement("canvas")
const ctx = canvas.getContext("2d")!
ctx.font = "20px monospace"
ctx.textBaseline = "top"
document.body.style.margin = "0"
document.body.appendChild(canvas)
// hide system cursor
// document.body.style.cursor = "none"

function resize() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}
window.addEventListener("resize", resize)
resize()

const SHOW_TEXT = false

// scene system
type SceneMode = "road" | "scene"
let sceneMode: SceneMode = "road"
let sceneIndex = 1 // Scene1 已经是 opening，现在准备进 Scene2

let currentLevel = 0
let gameStarted = false
let pausedByNote = false
let activeNoteObstacle: { x: number; width: number; chapterIndex?: number; triggered?: boolean } | null = null
let playerY = 0
let velocityY = 0
let gravity = 0.9
let groundY = 0

let obstacles: {
  x: number
  width: number
  chapterIndex?: number
  triggered?: boolean
}[] = []
let obstacleTimer = 0

let chapterCursor = 0

let sparks: {
  x: number
  y: number
  vx: number
  vy: number
  life: number
}[] = []

let sparkCooldown = 0

let worldOffsetX = 0
const WORLD_SPEED = 4.5
let speedBoost = 0

// custom cursor (Dot Cursor)
let mouseX = canvas.width / 2
let mouseY = canvas.height / 2

let downloadButtonRect: {
  x: number
  y: number
  w: number
  h: number
} | null = null
// custom cursor mousemove
window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX
  mouseY = e.clientY
})

function drawHero() {
  const centerX = canvas.width / 2
  groundY = canvas.height - 120

  // ground (image, repeat-x)
  if (floorImage.complete) {
    const floorHeight = 120
    const tileWidth = floorImage.width || 400

    // loop start based on worldOffsetX
    const startX = -((worldOffsetX - canvas.width / 2 - 120) % tileWidth) - tileWidth

    for (let x = startX; x < canvas.width + tileWidth; x += tileWidth) {
      ctx.drawImage(floorImage, x, groundY, tileWidth, floorHeight)
    }
  }

  // player (car image)
  const playerX = centerX - CAR_DRAW_WIDTH / 2
  const playerDrawY = groundY - CAR_DRAW_HEIGHT + CAR_GROUND_OFFSET + playerY

  if (carImage.complete) {
    ctx.drawImage(carImage, playerX, playerDrawY, CAR_DRAW_WIDTH, CAR_DRAW_HEIGHT)
  } else {
    // fallback: draw a square until the image is ready
    ctx.fillRect(playerX, playerDrawY, CAR_DRAW_WIDTH, CAR_DRAW_HEIGHT)
  }

  // hint
  if (!gameStarted) {
    ctx.font = "16px monospace"
    ctx.fillText("PRESS ANY KEY TO START", centerX - 110, groundY + 60)
    ctx.font = "20px monospace"
  }

  // ===== Scene 1 Title =====
  if (sceneIndex === 1) {
    ctx.save()
    ctx.fillStyle = "#000"
    ctx.globalAlpha = 0.85

    const titleY = canvas.height * 0.22

    // main title
    ctx.font = "36px monospace"
    ctx.fillText(
      "Resume of",
      centerX - ctx.measureText("Resume of").width / 2,
      titleY
    )

    // subtitle name
    ctx.font = "28px monospace"
    ctx.fillText(
      "Yifei Gao",
      centerX - ctx.measureText("Yifei Gao").width / 2,
      titleY + 44
    )

    ctx.restore()
    ctx.font = "20px monospace"
  }
}

// ===== Scene overlay =====
function drawSceneOverlay() {
  ctx.save()

  // 每次绘制先重置按钮区域
  downloadButtonRect = null

  // background
  ctx.globalAlpha = 0.94
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.globalAlpha = 1
  ctx.fillStyle = "#000"

  const left = 80
  let y = 100

  // ===== Scene 2 : Education (ONLY) =====
  if (sceneIndex === 2) {
    ctx.font = "32px monospace"
    ctx.fillText(educationScene.title, left, y)
    y += 24

    ctx.beginPath()
    ctx.moveTo(left, y)
    ctx.lineTo(canvas.width - left, y)
    ctx.stroke()
    y += 40

    ctx.font = "18px monospace"

    educationScene.items.forEach((item) => {
      ctx.fillText(item.school, left, y)
      ctx.fillText(
        item.date,
        canvas.width - left - ctx.measureText(item.date).width,
        y
      )
      y += 28

      ctx.font = "italic 16px monospace"
      ctx.fillText(item.degree, left, y)
      y += 24

      ctx.font = "16px monospace"
      ctx.fillText(`• Core Courses: ${item.courses}`, left, y)
      y += 42
    })
  }

  // ===== Scene 3+ : Work Experience (one job per scene) =====
  // Scene 3 -> Compass, Scene 4 -> Ctrip
  if (sceneIndex >= 3 && sceneIndex < 3 + workScene.items.length) {
    const job = workScene.items[sceneIndex - 3]

    ctx.font = "32px monospace"
    ctx.fillText(workScene.title, left, y)
    y += 24

    ctx.beginPath()
    ctx.moveTo(left, y)
    ctx.lineTo(canvas.width - left, y)
    ctx.stroke()
    y += 40

    ctx.font = "18px monospace"
    ctx.fillText(job.company, left, y)
    ctx.fillText(
      job.date,
      canvas.width - left - ctx.measureText(job.date).width,
      y
    )
    y += 28

    ctx.font = "italic 16px monospace"
    ctx.fillText(job.role, left, y)
    y += 24

    ctx.font = "16px monospace"
    job.points.forEach((p: string) => {
      y = wrapText(ctx, `• ${p}`, left, y, canvas.width - left * 2, 22)
      y += 10
    })
  }

  // ===== Scene 6 : Skills =====
  if (sceneIndex === 6) {
    ctx.font = "32px monospace"
    ctx.fillText(skillsScene.title, left, y)
    y += 24

    ctx.beginPath()
    ctx.moveTo(left, y)
    ctx.lineTo(canvas.width - left, y)
    ctx.stroke()
    y += 40

    ctx.font = "18px monospace"
    skillsScene.items.forEach((item) => {
      ctx.fillText(`• ${item.label}: ${item.content}`, left, y)
      y += 32
    })
  }

  // ===== Scene 7 : Contact & CV =====
  if (sceneIndex === 7) {
    ctx.font = "32px monospace"
    ctx.fillText("Contact", left, y)
    y += 24

    ctx.beginPath()
    ctx.moveTo(left, y)
    ctx.lineTo(canvas.width - left, y)
    ctx.stroke()
    y += 48

    ctx.font = "18px monospace"
    ctx.fillText("Email", left, y)
    y += 26
    ctx.font = "16px monospace"
    ctx.fillText("→ gaoyeefei@gmail.com", left, y)
    y += 40

    ctx.font = "18px monospace"
    ctx.fillText("LinkedIn", left, y)
    y += 26
    ctx.font = "16px monospace"
    ctx.fillText("→ linkedin.com/in/yifei-gao-032343352", left, y)
    y += 40

    ctx.font = "18px monospace"
    ctx.fillText("Location", left, y)
    y += 26
    ctx.font = "16px monospace"
    ctx.fillText("→ Glasgow, UK", left, y)
    y += 60

    // Download CV button
    const btnWidth = 240
    const btnHeight = 44
    const btnX = left
    const btnY = y

    ctx.strokeRect(btnX, btnY, btnWidth, btnHeight)
    ctx.fillText("Download CV ↓", btnX + 24, btnY + 28)

    // 记录按钮区域（canvas 坐标系）
    downloadButtonRect = {
      x: btnX,
      y: btnY,
      w: btnWidth,
      h: btnHeight
    }

    y += 100

    ctx.font = "14px monospace"
    ctx.fillText("End of the journey — thank you.", left, y)
  }

  ctx.font = "14px monospace"
  ctx.fillText("Press any key to continue →", left, canvas.height - 80)

  ctx.restore()
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ")
  let line = ""

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " "
    const testWidth = ctx.measureText(testLine).width

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y)
      line = words[n] + " "
      y += lineHeight
    } else {
      line = testLine
    }
  }

  ctx.fillText(line, x, y)
  return y + lineHeight
}

function drawHeroTitle() {
  ctx.save()
  ctx.fillStyle = "#000"

  // background plate for readability
  ctx.globalAlpha = 0.08
  ctx.fillRect(20, 20, 520, 120)

  ctx.globalAlpha = 1
  ctx.font = "28px monospace"
  ctx.fillText("Yifei Gao", 40, 40)

  ctx.font = "16px monospace"
  ctx.fillText("Frontend Developer × Communication Designer", 40, 80)

  ctx.restore()

  // reset default font
  ctx.font = "20px monospace"
}

startLoop(() => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const level = levels[currentLevel]

  if (SHOW_TEXT) {
    drawHeroTitle()
    ctx.fillText(level.title, 40, 140)
  }

  drawHero()

  // ===== Scene overlay =====
  if (sceneMode === "scene") {
    drawSceneOverlay()
  }

  // foreground layer (只在 road 模式显示，scene2+ 隐藏)
  if (sceneMode === "road" && foregroundImage.complete) {
    const fgWidth = canvas.width * 0.6
    const fgHeight = canvas.height * 0.6

    const fgX = (canvas.width - fgWidth) / 2
    const TOP_MARGIN = canvas.height * 0.08 // 顶部留白比例，可微调
    const fgY = TOP_MARGIN

    ctx.drawImage(foregroundImage, fgX, fgY, fgWidth, fgHeight)
  }

  // gameplay start
  if (!gameStarted && Object.values(keys).some(Boolean)) {
    gameStarted = true
  }

  // leave scene
  if (sceneMode === "scene" && Object.values(keys).some(Boolean)) {
    sceneMode = "road"
  }

  if (gameStarted) {
    // resume after note pause
    if (pausedByNote && Object.values(keys).some(Boolean)) {
      pausedByNote = false
      activeNoteObstacle = null
    }

    // jump
    if ((keys["ArrowUp"] || keys[" "]) && playerY === 0) {
      velocityY = -14
    }

    // physics
    velocityY += gravity
    playerY += velocityY
    if (playerY > 0) {
      playerY = 0
      velocityY = 0
    }

    if (sceneMode === "road") {
      speedBoost = Math.min(speedBoost + 0.002, 1.2)
      worldOffsetX += WORLD_SPEED + speedBoost
    }

    // obstacles (distance-based spacing)
    const OBSTACLE_SPACING = 900
    if (
      sceneIndex < 7 &&
      chapterCursor < levels.length &&
      (obstacles.length === 0 || worldOffsetX - obstacles[obstacles.length - 1].x > OBSTACLE_SPACING)
    ) {
      obstacles.push({
        x: worldOffsetX + canvas.width,
        width: 26,
        chapterIndex: chapterCursor
      })
      chapterCursor++
    }

    ctx.save()
    ctx.globalAlpha = 0.9
    obstacles.forEach((o) => {
      const screenX = o.x - worldOffsetX

      // draw obstacle block
      ctx.fillRect(screenX, groundY, o.width, 30)

      // distance to player (screen space)
      const playerXCenter = canvas.width / 2
      const distance = Math.abs(screenX - playerXCenter)

      if (distance < 90 && o.chapterIndex !== undefined && !o.triggered) {
        o.triggered = true

        // 进入 scene（Scene 2, 3, 4...）
        sceneMode = "scene"
        sceneIndex = o.chapterIndex + 2 // Scene2 起步（Scene1 是 opening）
      }
    })
    ctx.restore()

    // spark collision detection (visual only)
    const playerRect = {
      x: canvas.width / 2 - CAR_DRAW_WIDTH / 2,
      y: groundY - CAR_DRAW_HEIGHT + CAR_GROUND_OFFSET + playerY,
      w: CAR_DRAW_WIDTH,
      h: CAR_DRAW_HEIGHT
    }

    obstacles.forEach((o) => {
      const obstacleRect = {
        x: o.x - worldOffsetX,
        y: groundY,
        w: o.width,
        h: 30
      }

      const hit =
        playerRect.x < obstacleRect.x + obstacleRect.w &&
        playerRect.x + playerRect.w > obstacleRect.x &&
        Math.abs(playerRect.y + playerRect.h - obstacleRect.y) < 18

      if (hit && sparkCooldown === 0) {
        sparkCooldown = 8
        for (let i = 0; i < 10; i++) {
          sparks.push({
            x: playerRect.x + playerRect.w + 8,
            y: playerRect.y + playerRect.h - 8,
            vx: 3 + Math.random() * 4,
            vy: -3 - Math.random() * 4,
            life: 22
          })
        }
      }
    })

    obstacles = obstacles.filter((o) => o.x - worldOffsetX + o.width > 0)

    sparkCooldown = Math.max(0, sparkCooldown - 1)

    if (sparkCooldown === 0 && Math.random() < 0.005) {
      sparkCooldown = 20
      sparks.push({
        x: canvas.width / 2,
        y: groundY - 20,
        vx: 4,
        vy: -6,
        life: 24
      })
    }
  }

  if (SHOW_TEXT) {
    // ===== draw CV text (hard reset canvas text state) =====
    ctx.save()
    ctx.fillStyle = "#000"
    ctx.font = "20px monospace"
    ctx.textBaseline = "top"
    ctx.globalAlpha = 1

    ctx.fillText("DEBUG: TEXT RENDER OK", 40, 170)

    level.lines.forEach((line, i) => {
      ctx.fillText(line, 40, 190 + i * 28)
    })

    ctx.restore()
  }

  if (SHOW_TEXT && pausedByNote) {
    const chapter = levels[currentLevel]

    const padding = 12
    const boxX = 40
    const boxY = 160
    const lineHeight = 24

    ctx.save()
    ctx.font = "16px monospace"

    const maxWidth = Math.max(
      ctx.measureText(chapter.title).width,
      ...chapter.lines.map((l) => ctx.measureText(l).width)
    )

    const boxWidth = maxWidth + padding * 2
    const boxHeight = (chapter.lines.length + 1) * lineHeight + padding * 2 + 10

    ctx.globalAlpha = 0.95
    ctx.fillStyle = "#fff"
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight)

    ctx.globalAlpha = 1
    ctx.strokeStyle = "#000"
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)

    ctx.fillStyle = "#000"
    ctx.fillText(chapter.title, boxX + padding, boxY + padding)

    chapter.lines.forEach((line, i) => {
      ctx.fillText(line, boxX + padding, boxY + padding + 28 + i * lineHeight)
    })

    ctx.font = "14px monospace"
    ctx.fillText("Press any key to continue →", boxX + padding, boxY + boxHeight - 18)

    ctx.restore()
  }

  // draw custom cursor — Star Cursor (image based)
  if (cursorImage.complete) {
    const CURSOR_SIZE = 96 // 放大 3 倍（32 × 3）
    ctx.save()
    ctx.globalAlpha = 0.9
    ctx.translate(mouseX, mouseY)

    // 轻微旋转，让它更“漂浮”
    const t = performance.now() * 0.0005
    ctx.rotate(Math.sin(t) * 0.15)

    ctx.drawImage(
      cursorImage,
      -CURSOR_SIZE / 2,
      -CURSOR_SIZE / 2,
      CURSOR_SIZE,
      CURSOR_SIZE
    )
    ctx.restore()
  }
})


// 统一 click 监听：转换为 canvas 坐标
window.addEventListener("click", (e) => {
  if (
    sceneMode !== "scene" ||
    sceneIndex !== 7 ||
    !downloadButtonRect
  ) return

  // 将浏览器坐标 → canvas 坐标
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height

  const mx = (e.clientX - rect.left) * scaleX
  const my = (e.clientY - rect.top) * scaleY

  const { x, y, w, h } = downloadButtonRect

  if (
    mx >= x &&
    mx <= x + w &&
    my >= y &&
    my <= y + h
  ) {
    const link = document.createElement("a")
    link.href = "/Yifei Gao - Resume.pdf"
    link.download = "Yifei_Gao_CV.pdf"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
})