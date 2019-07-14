import { Draw } from '../../wee.mjs'

export class Graphics {
    constructor() {

    }
    paint(ctx, level) {
        ctx.save()
            Draw.style(ctx, { fillStyle: '#fff' })            
            ctx.fillRect(0, 0, 720, 1280)
        ctx.restore()
    }
}