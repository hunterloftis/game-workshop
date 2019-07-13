const VIEW_DEFAULTS = {
    bgStyle: '#000',
    pixelated: false
}

export class Loop {
    constructor(updateFn, fps=60) {
        this.updateFn = updateFn
        this.tick = 1000 / fps
        this._frame = this._frame.bind(this)
        this.time = performance.now()
        requestAnimationFrame(this._frame)
    }
    _frame(time) {
        requestAnimationFrame(this._frame)

        const delta = performance.now() - this.time
        const ticks = Math.min(10, Math.floor(delta / this.tick))
        this.time += this.tick * ticks

        this.updateFn(ticks, this.tick, time)
    }
}

export class FixedView {
    constructor(canvas, options) {
        const opts = Object.assign({}, VIEW_DEFAULTS, options)
        this.canvas = canvas

        canvas.style.msInterpolationMode = 'nearest-neighbor'
        canvas.style.background = opts.bgStyle

        const styles = [
            'optimizeSpeed', 'crisp-edges', '-moz-crisp-edges',
            '-webkit-optimize-contrast', 'optimize-contrast', 'pixelated'
        ]
        styles.forEach(style => {
            canvas.style['image-rendering'] = style
        })
        
        this._ctx = canvas.getContext('2d', { alpha: false })
        this._ctx.imageSmoothingEnabled = !opts.pixelated
    }
    ctx() {
        return this._ctx
    }
    width() {
        return this.canvas.width
    }
    height() {
        return this.canvas.height
    }
}

export class Sprite {
    constructor(src, frames=1) {
        this.images = []
        this.width = 0
        this.height = 0
        this.blank = new Image()

        const im = new Image()
        im.addEventListener('load', onLoad.bind(this), false)
        im.src = src

        function onLoad() {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            canvas.width = this.width = Math.floor(im.width / frames)
            canvas.height = this.height = im.height

            for (let i = 0; i < frames; i++) {
                const sx = canvas.width * i
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                ctx.drawImage(im, sx, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height)
                this.images[i] = new Image()
                this.images[i].src = canvas.toDataURL()
            }
        }
    }
    blit(ctx, x, y, ax=0, ay=0, frame=0, scale=1) {
        if (!this.images[frame]) return

        const dx = x - this.width * ax * scale
        const dy = y - this.height * ay * scale
        const dw = this.width * scale
        const dh = this.height * scale

        ctx.drawImage(this.images[frame], 0, 0, this.width, this.height, dx, dy, dw, dh)
    }
    image(n=0) {
        return this.images[n] || this.blank
    }
    frames() {
        return this.images.length
    }
}

export function CircleCircle(x1, y1, r1, x2, y2, r2) {
    const range = r1 + r2
    const dx = x1 - x2
    const dy = y1 - y2
    if (Math.abs(dx) > range || Math.abs(dy) > range) {
        return false
    }
    
    const dist = Math.sqrt(dx * dx + dy * dy)
    return (dist <= range)
}

export class Verlet {
    constructor(val) {
        this.val = val
        this.prev = val
    }
    integrate(momentum=1, time=1) {
        const v = this.velocity()
        this.prev = this.val
        this.val += v * Math.pow(momentum, time)
    }
    force(acceleration, time=1) {
        this.val += acceleration * time * time
    }
    constrain(min, max) {
        this.val = Math.max(min, Math.min(max, this.val))
    }
    position() {
        return this.val
    }
    velocity() {
        return this.val - this.prev
    }
}

export class State {
    constructor(state, options=[]) {
        this.options = new Set(options)
        this.to(state)
    }
    to(state) {
        if (state === this.state) return
        if (this.options.size && !this.options.has(state)) {
            throw new Error(`invalid state: ${s}`)    
        }
        this.state = state
        this.transition = performance.now()
    }
    active() {
        return this.state
    }
    time() {
        return this.transition
    }
    is(...states) {
        return new Set(states).has(this.state)
    }
}

export class Text {
    constructor(font='bold 64px verdana', fill='#fff', halign='left', valign='top') {
        this.font = font
        this.fill = fill
        this.halign = halign
        this.valign = valign        
    }
    write(ctx, text, x, y) {
        ctx.save()
        ctx.font = this.font
        ctx.textBaseline = this.valign
        ctx.textAlign = this.halign
        ctx.fillStyle = this.fill
        ctx.fillText(text, x, y)
        ctx.restore()
    }
}

export class Draw {
    static line(ctx, x1, y1, x2, y2) {
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
    } 
    static lineStyle(ctx, width, style, dash=[]) {
        ctx.lineWidth = width
        ctx.strokeStyle = style
        ctx.setLineDash(dash)
    }
    static linedCircle(ctx, x, y, r) {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.stroke()
    }
    static parallax(ctx, im, width, height, x) {
        const seam = x % width
        const leftWidth = width - seam
        ctx.drawImage(im, seam, 0, leftWidth, height, 0, 0, leftWidth, height)
        ctx.drawImage(im, 0, 0, seam, height, leftWidth, 0, seam, height)
    }
    static shake(ctx, amount=10) {
        ctx.translate((Math.random() - 0.5) * amount, (Math.random() - 0.5) * amount)
    }    
}