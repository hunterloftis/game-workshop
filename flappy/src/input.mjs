export class Input {
    constructor() {
        this.queue = []
        const press = () => this.queue.push(true)
        const stopZoom = e => e.preventDefault()

        document.addEventListener('touchstart', press, false)
        document.addEventListener('keydown', press, false)
        
        document.addEventListener('touchmove', stopZoom, { passive: false })
        document.addEventListener('touchend', stopZoom, { passive: false })
        document.addEventListener('gesturestart', stopZoom, { passive: false })
        document.addEventListener('gesturechange', stopZoom, { passive: false })
        document.addEventListener('gestureend', stopZoom, { passive: false })
    }
    next() {
        return this.queue.shift()
    }
}