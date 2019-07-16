const DEBUG = false
const SCROLL_SPEED = 0.25

function Sprite(...paths) {
    return paths.map(p => {
        const im = new Image()
        im.src = p
        return im
    })
}

export default class View {
    constructor() {
        this.bg = Sprite('assets/background.png')
        this.bird = Sprite('assets/flap1.png', 'assets/flap2.png', 'assets/flap3.png', 'assets/flap4.png')
        this.spike = Sprite('assets/spike.png')
    }
    render(ctx, game) {
        const scroll = (game.flappy.x * SCROLL_SPEED) % 1920
        const frame = game.started
            ? Math.floor(performance.now() / 100) % this.bird.length
            : 0
        const bird = this.bird[frame]
        const spike = this.spike[0]
        const score = game.score()

        ctx.save()
            if (game.flappy.death && performance.now() < game.flappy.death + 100) {
                ctx.translate(Math.random() * 10, Math.random() * 10)
            }
            ctx.drawImage(this.bg[0], -scroll, 0)
            ctx.drawImage(this.bg[0], -scroll + 1920, 0)
            ctx.save()
                ctx.translate(250 - game.flappy.x, 0)
                ctx.drawImage(bird, game.flappy.x - bird.width * 0.6, game.flappy.y - bird.height * 0.5)
                game.spikes.forEach(s => {
                    if (s.x < game.flappy.x - 300 || s.x > game.flappy.x + 2000) return
                    ctx.drawImage(spike, s.x - spike.width * 0.5, s.y - spike.height * 0.55)
                })
                if (DEBUG) this.drawEntities(ctx, game.flappy, ...game.spikes)
            ctx.restore()
            ctx.fillStyle = '#f99'
            ctx.font = '92px bold verdana'
            ctx.textBaseline = 'top'
            ctx.fillText(score, 10, 10)
        ctx.restore()
    }
    drawEntities(ctx, ...entities) {
        ctx.save()
            ctx.lineWidth = 4
            ctx.strokeStyle = '#ff0'
            ctx.beginPath()
            entities.forEach(e => {
                ctx.moveTo(e.x, e.y)
                ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2)
            })
            ctx.stroke()
        ctx.restore()
    }
}