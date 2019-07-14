class Player {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

export class Level {
    constructor() {
        this.player = new Player(360, 0)
    }
    update() {

    }
    complete() {
        return false
    }
}