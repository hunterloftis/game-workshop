export default class View {
    constructor(canvas) {
        this.ctx = canvas.getContext('2d')
    }
    render(game) {
        this.ctx.save()
            this.ctx.clearRect(0, 0, 1920, 1080)
            this.ctx.translate(game.flappy.x + 200, 0)
            this.drawEntity(game.flappy)
        this.ctx.restore()
    }
    drawEntity(e) {
        this.ctx.fillStyle = '#f00'
        this.ctx.fillRect(e.x - e.size * 0.5, e.y - e.size * 0.5, e.size, e.size)
    }
}