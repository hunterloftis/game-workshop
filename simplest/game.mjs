const MOMENTUM = 0.99
const GRAVITY = 0.1
const FLAP = 10
const SPEED = 3
const GRID = 200
const DENSITY = 0.2

class Flappy {
    constructor(x, y) {
        this.x = x
        this.y = this.prevY = y
        this.size = 50
        this.death = 0
    }
    update(flapping) {
        const yVel = this.y - this.prevY
        this.prevY = this.y
        this.y += yVel * MOMENTUM + GRAVITY
        if (this.death) return

        this.x += SPEED
        if (flapping) this.y -= FLAP
        if (this.y < 40) this.y = 40
        if (this.y > 1055) this.die()
    }
    die() {
        this.death = this.death || performance.now()
    }
}

function hits(a, b) {
    const dx = a.x - b.x
    const dy = a.y - b.y
    const range = a.size + b.size
    return Math.sqrt(dx * dx + dy * dy) < range
}

export default class Game {
    constructor() {
        this.flappy = new Flappy(0, 540)
        this.spikes = []
        this.started = false

        // TODO: better level generation
        for (let x = 0; x < 800; x++) {
            for (let y = 0; y < 5; y++) {
                const chance = 0.1 + x / 800 * DENSITY
                if (Math.random() < chance) {
                    this.spikes.push({
                        x: 960 + x * GRID,
                        y: 200 + y * GRID,
                        size: 50
                    })
                }
            }
        }
    }
    update(flapping) {
        if (!this.started) {
            if (!flapping) return false
            this.started = true
        }

        this.flappy.update(flapping)
        this.spikes.forEach(s => {
            if (hits(this.flappy, s)) this.flappy.die()
        })
        return this.flappy.death && performance.now() > this.flappy.death + 2000
    }
}
