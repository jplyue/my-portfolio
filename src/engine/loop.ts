// src/engine/loop.ts
export function startLoop(update: (dt: number) => void) {
  let last = performance.now()

  function frame(now: number) {
    const dt = now - last
    last = now

    update(dt)
    requestAnimationFrame(frame)
  }

  requestAnimationFrame(frame)
}