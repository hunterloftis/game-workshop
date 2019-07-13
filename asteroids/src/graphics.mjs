import Verlet from './verlet.mjs'

const BLUR = 0.5
const RENDER = true
const DEBUG = false

function Sprite(dir, ...files) {
    return files.map(file => {
        const im = new Image()
        im.src = `${dir}/${file}`
        return im
    })
}

class Animation {
    constructor(sprite, x, y, scale=1) {
        this.sprite = sprite
        this.x = x
        this.y = y
        this.scale = scale
        this.frame = 0
    }
    next() {
        const n = Math.floor(this.frame / 2)
        if (n >= this.sprite.length) return { frame: undefined, scale: 1 } 
        this.frame++
        return { frame: this.sprite[n], scale: this.scale }
    }
}

export default class Graphics {
    constructor() {
        this.bg = Sprite('assets/backgrounds', 'b.png')
        this.ship = Sprite('assets', 'ship.png')
        this.asteroids = [
            Sprite('assets/asteroids', 'asteroid-0-0.png'),
            Sprite('assets/asteroids', 'asteroid-1-0.png')
        ]
        this.chunks = [
            Sprite('assets/asteroids', 'asteroid-0-1.png'),
            Sprite('assets/asteroids', 'asteroid-1-1.png')
        ]
        this.blueExplosion = Sprite('assets/ship-explosion',
            '0.png', '1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png',
            '8.png', '9.png', '10.png', '11.png', '12.png', '13.png', '14.png'
        )
        this.redExplosion = Sprite('assets/asteroid-explosion',
            '0.png', '1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png',
            '8.png', '9.png', '10.png', '11.png', '12.png', '13.png', '14.png'
        )
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
        ctx.strokeStyle = '#ff0'
        ctx.lineWidth = 3
        ctx.beginPath()
        entities.forEach(e => {
            ctx.save()
            ctx.translate(e.x.val, e.y.val)
            ctx.rotate(e.angle.val)
            ctx.moveTo(0, 0)
            ctx.arc(0, 0, e.radius, 0, Math.PI * 2)
            ctx.restore()
        })
        ctx.stroke()
        ctx.restore()
    }
    paintBackground(ctx) {
        ctx.save()
        ctx.globalAlpha = BLUR
        ctx.drawImage(this.bg[0], 0, 0)
        ctx.restore()
    }
    paintAsteroids(ctx, asteroids) {
        asteroids.forEach(a => {
            const im = a.radius >= 70
                ? this.asteroids[a.id % this.asteroids.length][0]
                : this.chunks[a.id % this.asteroids.length][0]
            ctx.save()
            ctx.translate(a.x.val, a.y.val)
            ctx.rotate(a.angle.val)
            ctx.drawImage(im, -im.width * 0.5, -im.height * 0.5)
            ctx.restore()
        })
    }
    paintShip(ctx, ship) {
        if (ship.life <= 0) return
        
        const im = this.ship[0]
        ctx.save()
        ctx.translate(ship.x.val, ship.y.val)
        ctx.rotate(ship.angle.val)
        ctx.drawImage(im, -im.width * 0.35, -im.height * 0.5)

        if (ship.burning) {
            ctx.beginPath()
            ctx.lineWidth = 4
            ctx.lineCap = 'round'
            ctx.strokeStyle = '#9cf'
            ctx.moveTo(-im.width * 0.3, -im.height * 0.15)
            ctx.lineTo(-im.width * 0.35, -im.height * 0.15)
            ctx.moveTo(-im.width * 0.3, im.height * 0.15)
            ctx.lineTo(-im.width * 0.35, im.height * 0.15)
            ctx.stroke()
        }
        ctx.restore()
    }
    paintBullets(ctx, bullets) {
        ctx.save()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.beginPath()
        bullets.forEach(b => {
            ctx.moveTo(b.x.val, b.y.val)
            ctx.lineTo(b.x.val - b.x.velocity, b.y.val - b.y.velocity)
        })
        ctx.stroke()
        ctx.restore()
    }
    paintAnimations(ctx) {
        this.animations = this.animations.filter(a => {
            const { frame, scale } = a.next()
            if (!frame) return false
            ctx.drawImage(frame, a.x - frame.width * 0.5 * scale, a.y - frame.height * 0.5 * scale, frame.width * scale, frame.height * scale)
            return true
        })
    }
    paintScore(ctx, score) {
        const text = `⭐ ${score}`
        ctx.save()
        ctx.fillStyle = '#fff'
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 3
        ctx.font = '48px Impact'
        ctx.textBaseline = 'top'
        ctx.strokeText(text, 10, 10)
        ctx.fillText(text, 10, 10)
        ctx.restore()
    }
    explodeShip(x, y) {
        this.animations.push(new Animation(this.blueExplosion, x, y, 1))
    }
    explodeBullet(x, y) {
        this.animations.push(new Animation(this.blueExplosion, x, y, 0.5))
    }
    explodeAsteroid(x, y) {
        this.animations.push(new Animation(this.redExplosion, x, y, 1))
    }
    explodeChunk(x, y) {
        this.animations.push(new Animation(this.redExplosion, x, y, 0.5))
    }
}
