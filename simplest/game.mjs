const MOMENTUM = 0.99
const GRAVITY = 0.1
const FLAP_POWER = 10
const FLY_SPEED = 3
const COIN_POINTS = 100
const DEATH_DELAY = 3000

const GRID_LEFT = 960
const GRID_TOP = 200
const GRID_SIZE = 200
const GRID_COLUMNS = 800
const GRID_ROWS = 5
const GRID_DENSITY = 0.06

const FLAPPY_SIZE = 55
const SPIKE_SIZE = 50
const COIN_SIZE = 60
const CEILING = 40
const FLOOR = 2000

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
        super(x, y, FLAPPY_SIZE)
        this.prevY = this.y
        this.death = 0
    }
    update(flapping) {
        const yVel = this.y - this.prevY
        this.prevY = this.y
        this.y += yVel * MOMENTUM + GRAVITY
        if (this.death) return

        this.x += FLY_SPEED
        if (flapping) this.y -= FLAP_POWER
        if (this.y < CEILING) this.y = CEILING
        if (this.y > FLOOR) this.die()
    }
    die() {
        this.death = this.death || performance.now()
    }
}

class Spike extends Entity {
    constructor(x, y) {
        super(x, y, SPIKE_SIZE)
    }
}

class Coin extends Entity {
    constructor(x, y) {
        super(x, y, COIN_SIZE)
        this.collected = false
    }
    collect() {
        this.collected = true
    }
}

export default class Game {
    constructor() {
        this.flappy = new Flappy(0, 540)
        this.spikes = []
        this.coins = []
        this.started = false

        for (let c = 0; c < GRID_COLUMNS; c++) {
            for (let r = 0; r < GRID_ROWS; r++) {
                const x = GRID_LEFT + c * GRID_SIZE
                const y = GRID_TOP + r * GRID_SIZE
                if (Math.random() < GRID_DENSITY) {
                    this.spikes.push(new Spike(x, y))
                }
                else if (Math.random() < GRID_DENSITY) {
                    this.coins.push(new Coin(x, y))
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
        
        if (!this.flappy.death) {
            this.coins.forEach(c => {
                if (c.hits(this.flappy)) c.collect()
            })
            this.spikes.forEach(s => {
                if (s.hits(this.flappy)) this.flappy.die()
            })
        }

        const complete = this.flappy.death && performance.now() > this.flappy.death + DEATH_DELAY
        return complete
    }
    score() {
        return this.coins.reduce((sum, c) => {
            return c.collected ? sum + COIN_POINTS : sum
        }, 0)
    }
}
