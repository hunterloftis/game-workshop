function Sprite(...paths) {
    return paths.map(p => {
        const im = new Image()
        im.src = p
        return im
    })
}

export default class View {
    constructor(canvas) {
        this.ctx = canvas.getContext('2d', { alpha: false })
        this.bg = Sprite('assets/background.png')
        this.bird = Sprite('assets/flap1.png', 'assets/flap2.png', 'assets/flap3.png', 'assets/flap4.png')
        this.spike = Sprite('assets/spike.png')
    }
    render(game) {
        const ctx = this.ctx
        const scroll = (game.flappy.x * 0.2) % 1920
        const frame = Math.floor(performance.now() / 100) % this.bird.length
        const bird = this.bird[frame]
        const spike = this.spike[0]

        ctx.save()
            ctx.drawImage(this.bg[0], -scroll, 0)
            ctx.drawImage(this.bg[0], -scroll + 1920, 0)
            ctx.translate(250 - game.flappy.x, 0)

            ctx.drawImage(bird, game.flappy.x - bird.width * 0.5, game.flappy.y - bird.height * 0.5)
            game.spikes.forEach(s => {
                ctx.drawImage(spike, s.x - spike.width * 0.5, s.y - spike.height * 0.5)
            })
        ctx.restore()
    }
}