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

class Asteroid extends Entity {
    constructor(radius, life, x, y) {
        super(radius, life, x, y, rand(-AST_SPEED, AST_SPEED), rand(-AST_SPEED, AST_SPEED), rand(-AST_SPIN, AST_SPIN))
    }
}

class Ship extends Entity {
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

export class Level {
    constructor() {
        this.ship = new Ship(960, 540)
        this.asteroids = []
        this.bullets = []
        this.start = performance.now()
        this.events = []
    }
    event(name, x, y) {
        this.events.push({ name, x, y })
    }
    flush() {
        const e = this.events
        this.events = []
        return e
    }
    update(ms, keys) {
        const seconds = (performance.now() - this.start) / 1000
        const difficulty = Math.min(Math.ceil(seconds / 5 + 3), 30)

        while (this.asteroids.length < difficulty) {
            this.asteroids.push(new Asteroid(70, 5, Math.random() * 1920, -90))
        }
        
        if (this.ship.life > 0) {
            this.ship.integrate()
            if (keys.ArrowLeft) this.ship.turnLeft()
            if (keys.ArrowRight) this.ship.turnRight()
            if (keys.ArrowUp) this.ship.accelerate()
            if (keys.Shift) this.bullets.push(...this.ship.fire())
            this.ship.constrain(0, 0, 1920, 1080)
        }

        this.bullets.forEach(b => {
            b.integrate()
            this.asteroids.forEach(a => {
                if (b.life > 0 && b.hits(a)) {
                    this.event('explodeBullet', b.x.val, b.y.val)
                    b.life = 0
                    a.life--
                }
            })
        })

        this.asteroids.forEach(a => {
            a.integrate()
            a.constrain(-100, -100, 2020, 1180)
            if (a.life <= 0) {
                if (a.radius >= 70) {
                    this.event('explodeAsteroid', a.x.val, a.y.val)
                    this.ship.score += 100
                    for (let i = 0; i < 4; i++) {
                        this.asteroids.push(new Asteroid(30, 2, a.x.val, a.y.val))
                    }
                } else {
                    this.ship.score += 70
                    this.event('explodeChunk', a.x.val, a.y.val)
                }
                return
            }
            if (this.ship.life > 0 && a.hits(this.ship)) {
                this.ship.life = 0
                this.event('explodeShip', this.ship.x.val, this.ship.y.val)
            }
        })

        this.asteroids = this.asteroids.filter(a => a.life > 0)
        this.bullets = this.bullets.filter(b => b.life > 0)
    }
}
