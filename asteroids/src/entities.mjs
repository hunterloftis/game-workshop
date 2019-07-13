import Verlet from './verlet.mjs'

const ROT_DAMP = 0.4
const DAMP = 0.99
const SPEED = 0.4
const TURN = 0.05
const AST_SPEED = 4
const AST_SPIN = 0.03

function rand(min, max) {
    return min + Math.random() * (max - min)
}

class Entity {
    constructor(radius, life, x, y, vx=0, vy=0, rotation=0) {
        this.radius = radius
        this.life = life
        this.x = new Verlet(x, vx)
        this.y = new Verlet(y, vy)
        this.angle = new Verlet(0, rotation)
        this.id = Math.floor(rand(0, 99999999999999))
    }
    integrate(damp = 1, rotDamp = 1) {
        this.x.integrate(damp)
        this.y.integrate(damp)
        this.angle.integrate(rotDamp)
    }
    constrain(minX, minY, maxX, maxY) {
        this.x.constrain(minX, maxX)
        this.y.constrain(minY, maxY)
    }
    hits(entity) {
        const dx = entity.x.val - this.x.val
        const dy = entity.y.val - this.y.val
        const dist = Math.sqrt(dx * dx + dy * dy)
        return dist < this.radius + entity.radius
    }
}

export class Asteroid extends Entity {
    constructor(radius, life, x, y) {
        super(radius, life, x, y, rand(-AST_SPEED, AST_SPEED), rand(-AST_SPEED, AST_SPEED), rand(-AST_SPIN, AST_SPIN))
    }
}

export class Ship extends Entity {
    constructor(x, y) {
        super(30, 1, x, y)
        this.burning = false
        this.fired = 0
        this.score = 0
    }
    turnLeft() {
        this.angle.val -= TURN
    }
    turnRight() {
        this.angle.val += TURN
    }
    accelerate() {
        this.x.val += Math.cos(this.angle.val) * SPEED
        this.y.val += Math.sin(this.angle.val) * SPEED
        this.burning = true
    }
    integrate() {
        super.integrate(DAMP, ROT_DAMP)
        this.burning = false
    }
    fire() {    // TODO: simplify
        const interval = this.fired % 9
        this.fired++
        if (interval != 0 && interval != 4) return []
        const delta = interval === 0 ? -0.5 : 0.5
        const angle = this.angle.val + delta
        const x = this.x.val + Math.cos(angle) * this.radius
        const y = this.y.val + Math.sin(angle) * this.radius
        const vx = Math.cos(this.angle.val) * 20
        const vy = Math.sin(this.angle.val) * 20
        return [new Bullet(x, y, vx, vy)]
    }
}

class Bullet extends Entity {
    constructor(x, y, vx, vy) {
        super(1, 100, x, y, vx, vy)
    }
    integrate() {
        if (this.life-- <= 0) return false
        super.integrate()
        return true
    }
}
