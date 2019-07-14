import { Verlet } from '../../wee.mjs'
import { Rand } from '../../wee.mjs'
import { Geom } from '../../wee.mjs'

const SEC = 1000
const MOMENTUM = 0.99
const ROT_MOMENTUM = 0.9
const SPEED = 40 / SEC
const TURN = 2 / SEC
const AST_SPEED = 600 / SEC
const AST_SPIN = 3 / SEC
const BULLET_SPEED = 7000 / SEC
const BULLET_LIFE = 500
const BULLET_INTERVAL = 25

class Entity {
    constructor(radius, life, x, y, vx=0, vy=0, rotation=0) {
        this.radius = radius
        this.life = life
        this.x = new Verlet(x, vx)
        this.y = new Verlet(y, vy)
        this.angle = new Verlet(0, rotation)
        this.id = Math.floor(Rand.range(0, 99999999999999))
    }
    integrate(momentum = 1, rotMomentum = 1) {
        this.x.integrate(momentum)
        this.y.integrate(momentum)
        this.angle.integrate(rotMomentum)
    }
    wrap(minX, minY, maxX, maxY) {
        this.x.wrap(minX, maxX)
        this.y.wrap(minY, maxY)
    }
    hits(entity) {
        const dx = entity.x.position() - this.x.position()
        const dy = entity.y.position() - this.y.position()
        const dist = Math.sqrt(dx * dx + dy * dy)
        return dist < this.radius + entity.radius
    }
}

class Asteroid extends Entity {
    constructor(radius, life, x, y) {
        super(radius, life, x, y, Rand.range(-AST_SPEED, AST_SPEED), Rand.range(-AST_SPEED, AST_SPEED), Rand.range(-AST_SPIN, AST_SPIN))
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
        this.angle.force(-TURN)
    }
    turnRight() {
        this.angle.force(TURN)
    }
    accelerate() {
        const { x, y } = Geom.project(SPEED, this.angle.position())
        this.x.force(x)
        this.y.force(y)
        this.burning = true
    }
    integrate() {
        super.integrate(MOMENTUM, ROT_MOMENTUM)
        this.burning = false
    }
    fire() {    // TODO: simplify
        const interval = this.fired % BULLET_INTERVAL
        this.fired++
        if (interval != 0 && interval != 4) return []
        const delta = interval === 0 ? -0.5 : 0.5
        const angle = this.angle.position() + delta
        const { x, y } = Geom.project(this.radius * 1.2, angle, this.x.position(), this.y.position())
        const { x: vx, y: vy } = Geom.project(BULLET_SPEED, this.angle.position())
        return [new Bullet(x, y, vx, vy)]
    }
}

class Bullet extends Entity {
    constructor(x, y, vx, vy) {
        super(1, BULLET_LIFE, x, y, vx, vy)
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
    update(keys) {
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
            this.ship.wrap(0, 0, 1920, 1080)
        }

        this.bullets.forEach(b => {
            b.integrate()
            this.asteroids.forEach(a => {
                if (b.life > 0 && b.hits(a)) {
                    this.event('explodeBullet', b.x.position(), b.y.position())
                    b.life = 0
                    a.life--
                }
            })
        })

        this.asteroids.forEach(a => {
            a.integrate()
            a.wrap(-100, -100, 2020, 1180)
            if (a.life <= 0) {
                if (a.radius >= 70) {
                    this.event('explodeAsteroid', a.x.position(), a.y.position())
                    this.ship.score += 100
                    for (let i = 0; i < 4; i++) {
                        this.asteroids.push(new Asteroid(30, 2, a.x.position(), a.y.position()))
                    }
                } else {
                    this.ship.score += 70
                    this.event('explodeChunk', a.x.position(), a.y.position())
                }
                return
            }
            if (this.ship.life > 0 && a.hits(this.ship)) {
                this.ship.life = 0
                this.event('explodeShip', this.ship.x.position(), this.ship.y.position())
            }
        })

        this.asteroids = this.asteroids.filter(a => a.life > 0)
        this.bullets = this.bullets.filter(b => b.life > 0)
    }
}
