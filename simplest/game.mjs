const MOMENTUM = 0.99
const GRAVITY = 0.1
const FLAP = 10
const SPEED = 3
const GRID = 200
const DENSITY = 0.06

class Entity {
    constructor(x, y, size) {
        Object.assign(this, { x, y, size })
    }
    hits(other) {
        const dx = this.x - other.x
        const dy = this.y - other.y
        const range = this.size + other.size
        return Math.sqrt(dx * dx + dy * dy) < range
    }
}

class Flappy extends Entity {
    constructor(x, y) {
        super(x, y, 55)
        this.prevY = this.y
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
        if (this.y > 2000) this.die()
    }
    die() {
        this.death = this.death || performance.now()
    }
}

class Spike extends Entity {
    constructor(x, y) {
        super(x, y, 55)
    }
}

export default class Game {
    constructor() {
        this.flappy = new Flappy(0, 540)
        this.spikes = []
        this.started = false

        // TODO: better level generation
        for (let x = 0; x < 800; x++) {
            for (let y = 0; y < 5; y++) {
                if (Math.random() < DENSITY) {
                    this.spikes.push(new Spike(960 + x * GRID, 200 + y * GRID))
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
            if (s.hits(this.flappy)) this.flappy.die()
        })
        return this.flappy.death && performance.now() > this.flappy.death + 2000
    }
    score() {
        return this.spikes.reduce((sum, spike) => {
            if (this.flappy.x > spike.x) return sum + 100
            return sum
        }, 0)
    }
}
