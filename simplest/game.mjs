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
    }
    update(flapping) {
        const yVel = this.y - this.prevY
        this.prevY = this.y
        this.y += yVel * MOMENTUM + GRAVITY
        if (flapping) this.y -= FLAP
        this.x += SPEED
    }
}

class Spike {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.size = 50
    }
}

export default class Game {
    constructor() {
        this.flappy = new Flappy(0, 540)
        this.spikes = []

        for (let x = 0; x < 800; x++) {
            for (let y = 0; y < 5; y++) {
                const chance = 0.1 + x / 800 * DENSITY
                if (Math.random() < chance) {
                    this.spikes.push(new Spike(960 + x * GRID, 200 + y * GRID))
                }
            }
        }
    }
    update(flapping) {
        this.flappy.update(flapping)
    }
}
