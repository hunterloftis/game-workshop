const FLAPPY_X = 250
const SCROLL_SPEED = 0.25

function Sprite(path, n = 1) {
    const files = Array(n).fill(true).map((_, n) => `${path}${n}.png`)
    return files.map(f => {
        const im = new Image()
        im.src = f
        return im
    })
}

export default class View {
    constructor() {
        this.bg = Sprite('assets/background')
        this.bird = Sprite('assets/flap', 4)
        this.spike = Sprite('assets/spike')
        this.coin = Sprite('assets/coin', 10)
    }
    render(ctx, game) {
        const scroll = (game.flappy.x * SCROLL_SPEED) % 1920
        const birdFrame = game.started
            ? Math.floor(performance.now() / 100) % this.bird.length
            : 0
        const coinFrame = game.started
            ? Math.floor(performance.now() / 100) % this.coin.length
            : 0
        const bird = this.bird[birdFrame]
        const coin = this.coin[coinFrame]
        const spike = this.spike[0]
        const score = game.score()

        ctx.save()
            if (game.flappy.death && performance.now() < game.flappy.death + 100) {
                ctx.translate(Math.random() * 10, Math.random() * 10)
            }
            ctx.drawImage(this.bg[0], -scroll, 0)
            ctx.drawImage(this.bg[0], -scroll + 1920, 0)
            ctx.save()
                ctx.translate(FLAPPY_X - game.flappy.x, 0)
                ctx.drawImage(bird, game.flappy.x - bird.width * 0.6, game.flappy.y - bird.height * 0.5)
                game.spikes.forEach(s => {
                    if (s.x < game.flappy.x - 300 || s.x > game.flappy.x + 2000) return
                    ctx.drawImage(spike, s.x - spike.width * 0.5, s.y - spike.height * 0.55)
                })
                game.coins.forEach(c => {
                    if (c.collected) return
                    if (c.x < game.flappy.x - 300 || c.x > game.flappy.x + 2000) return
                    ctx.drawImage(coin, c.x - coin.width * 0.5, c.y - coin.height * 0.55)
                })
            ctx.restore()
            ctx.fillStyle = '#f99'
            ctx.font = '92px bold verdana'
            ctx.textBaseline = 'top'
            ctx.fillText(score, 10, 10)
        ctx.restore()
    }
}