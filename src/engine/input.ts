const keys = new Set<string>()

window.addEventListener("keydown", (e) => keys.add(e.key))
window.addEventListener("keyup", (e) => keys.delete(e.key))

export const Input = {
  left: () => keys.has("ArrowLeft") || keys.has("a"),
  right: () => keys.has("ArrowRight") || keys.has("d"),
}