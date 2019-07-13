import { Sprite } from '../../wee.mjs'
import { Text } from '../../wee.mjs'
import { Draw } from '../../wee.mjs'

const FLAPPY_X = 250
const DEBUG = false

export default class Graphics {
    constructor() {
        this.bg = [
            new Sprite('assets/background/0.png'),
            new Sprite('assets/background/1.png'),
            new Sprite('assets/background/2.png'),
            new Sprite('assets/background/3.png'),
            new Sprite('assets/background/4.png'),
        ]
        this.flappy = new Sprite('assets/monster-flying-5.png', 5)
        this.coin = new Sprite('assets/gold-coin-10.png', 10)
        this.block = new Sprite('assets/block.png')
        this.rope = new Sprite('assets/rope.png')
        this.winText = new Text('bold 128px Verdana', '#fff', 'center', 'middle')
        this.scoreText = new Text('bold 64px verdana', '#fff', 'left', 'top')
        this.frames = 0
    }
    paint(level, ctx) {
        const { flappy, coins, blocks, dist, state } = level
        const scroll = Math.min(dist, flappy.x)
        ctx.save()
            if (flappy.died && performance.now() - flappy.died < 300) {
               Draw.shake(ctx, 10) 
            }
            this.bg[0].blit(ctx, 0, 0)
            Draw.parallax(ctx, this.bg[1].image(), 1920, 1080, scroll / 4)
            Draw.parallax(ctx, this.bg[2].image(), 1920, 1080, scroll / 3)
            Draw.parallax(ctx, this.bg[3].image(), 1920, 1080, scroll / 2)
            ctx.save()
                ctx.translate(-scroll + FLAPPY_X, 0)
                this.paintFinish(ctx, dist)
                this.paintFlappy(ctx, flappy)
                this.paintBlocks(ctx, blocks, flappy.x - 300, flappy.x + 2000)
                this.paintCoins(ctx, coins, flappy.x - 300, flappy.x + 2000)
                if (DEBUG) {
                    this.paintColliders(ctx, flappy.x - 300, flappy.x + 2000, flappy, ...blocks, ...coins)
                }
            ctx.restore()
            Draw.parallax(ctx, this.bg[4].image(), 1920, 1080, scroll / 1)
            this.paintScore(ctx, state, level.score())
        ctx.restore()
        if (!state.is('ready')) {
            this.frames++
        }
    }
    paintFinish(ctx, x) {
        ctx.save()
        Draw.lineStyle(ctx, 4, '#fff', [16, 8])
        Draw.line(ctx, x, 0, x, 1080)
        ctx.restore()
    }
    paintFlappy(ctx, flappy) {
        const frame = flappy.died ? 4 : Math.floor(this.frames / 10) % 4
        this.flappy.blit(ctx, flappy.x, flappy.y, 0.65, 0.55, frame)
    }
    paintCoins(ctx, coins, min, max) {
        const frame = Math.floor(this.frames / 4) % this.coin.frames()
        coins.forEach((c, i) => {
            if (c.x < min || c.x > max) return
            this.coin.blit(ctx, c.x, c.y, 0.5, 0.5, frame)
        })
    }
    paintBlocks(ctx, blocks, min, max) {
        blocks.forEach((b, i) => {
            if (b.x < min || b.x > max) return
            this.rope.blit(ctx, b.x, b.y, 0.5, 1.08)
            this.block.blit(ctx, b.x, b.y, 0.5, 0.6)
        })
    }
    paintColliders(ctx, min, max, ...colliders) {
        ctx.save()
        Draw.lineStyle(ctx, 4, '#f0f')
        colliders.forEach(c => {
            if (c.x < min || c.x > max) return
            Draw.linedCircle(ctx, c.x, c.y, c.size)
        })
        ctx.restore()
    }
    paintScore(ctx, state, score) {
        if (state.is('won')) {
            const dy = Math.sin(this.frames / 8.5) * 20
            this.winText.write(ctx, `You Win! ⭐${score}`, 960, 540 + dy)
        }
        else if (state.is('playing', 'lost')) {
            this.scoreText.write(ctx, `⭐${score}`, 10, 10)
        }
    }
}

