import { Sprite } from '../../wee.mjs'
import { Draw } from '../../wee.mjs'
import { Text } from '../../wee.mjs'
import { Animation } from '../../wee.mjs'

const BLUR = 0.5
const RENDER = true
const DEBUG = true

export default class Graphics {
    constructor() {
        this.bg = new Sprite('assets/backgrounds/b.png')
        this.ship = new Sprite('assets/ship.png')
        this.asteroids = [
            new Sprite('assets/asteroid-a-2.png', 2),
            new Sprite('assets/asteroid-b-2.png', 2)
        ]
        this.blueExplosion = new Sprite('assets/explosion-blue-15.png', 15)
        this.redExplosion = new Sprite('assets/explosion-red-15.png', 15)
        this.scoreText = new Text({ font: '48px impact', lineWidth: 3 })
        this.animations = []
    }
    paint(ctx, ship, asteroids, bullets) {
        this.paintBackground(ctx)
        if (RENDER) {
            this.paintAsteroids(ctx, asteroids)
            this.paintShip(ctx, ship)
            this.paintBullets(ctx, bullets)
            this.paintAnimations(ctx)
        }
        if (DEBUG) {
            this.paintEntities(ctx, ship, ...asteroids, ...bullets)
        }
        this.paintScore(ctx, ship.score)
    }
    paintEntities(ctx, ...entities) {
        ctx.save()
            Draw.style(ctx, { strokeStyle: '#ff0', lineWidth: 3 })
            entities.forEach(e => Draw.orientedCircle(ctx, e.x.val, e.y.val, e.radius, e.angle.val))
        ctx.restore()
    }
    paintBackground(ctx) {
        ctx.save()
            ctx.globalAlpha = BLUR
            this.bg.blit(ctx, 0, 0)
        ctx.restore()
    }
    paintAsteroids(ctx, asteroids) {
        asteroids.forEach(a => {
            const im = this.asteroids[a.id % this.asteroids.length]
            const frame = a.radius >= 70 ? 0 : 1
            ctx.save()
            ctx.translate(a.x.val, a.y.val)
            ctx.rotate(a.angle.val)
            im.blit(ctx, 0, 0, 0.5, 0.5, frame)
            ctx.restore()
        })
    }
    paintShip(ctx, ship) {
        if (ship.life <= 0) return
        
        const im = this.ship.image(0)
        ctx.save()
            ctx.translate(ship.x.val, ship.y.val)
            ctx.rotate(ship.angle.val)
            this.ship.blit(ctx, 0, 0, 0.35, 0.5)

            if (ship.burning) {
                Draw.style(ctx, { lineWidth: 4, lineCap: 'round', strokeStyle: '#9cf' })
                Draw.line(ctx, -im.width * 0.3, -im.height * 0.15, -im.width * 0.35, -im.height * 0.15)
                Draw.line(ctx, -im.width * 0.3, im.height * 0.15, -im.width * 0.35, im.height * 0.15)
            }
        ctx.restore()
    }
    paintBullets(ctx, bullets) {
        ctx.save()
            Draw.style(ctx, { strokeStyle: '#fff', lineWidth: 2 })
            bullets.forEach(b => {
                Draw.line(ctx, b.x.val, b.y.val, b.x.val - b.x.velocity, b.y.val - b.y.velocity)
            })
        ctx.restore()
    }
    paintAnimations(ctx) {
        this.animations = this.animations.filter(a => a.blit(ctx))
    }
    paintScore(ctx, score) {
        const text = `⭐ ${score}`
        this.scoreText.stroke(ctx, text, 10, 10)
        this.scoreText.fill(ctx, text, 10, 10)
    }
    explodeShip(x, y) {
        this.animations.push(new Animation(this.blueExplosion, x, y, 0.5, 0.5, 1))
    }
    explodeBullet(x, y) {
        this.animations.push(new Animation(this.blueExplosion, x, y, 0.5, 0.5, 0.5))
    }
    explodeAsteroid(x, y) {
        this.animations.push(new Animation(this.redExplosion, x, y, 0.5, 0.5, 1))
    }
    explodeChunk(x, y) {
        this.animations.push(new Animation(this.redExplosion, x, y, 0.5, 0.5, 0.5))
    }
}
