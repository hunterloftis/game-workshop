const MOMENTUM = 0.99
const GRAVITY = 0.1
const FLAP = 10

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
    }
}

export default class Game {
    constructor() {
        this.flappy = new Flappy(0, 540)
    }
    update(flapping) {
        this.flappy.update(flapping)
    }
}
