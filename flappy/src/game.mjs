import { CircleCircle } from '../../wee.mjs'
import { Verlet } from '../../wee.mjs'
import { State } from '../../wee.mjs';
import { flappyGame } from './example.mjs';

const MOMENTUM = 0.999
const GRAVITY = 60 / 1000
const SPEED = 2500 / 1000
const FLAP = 6500 / 1000
const MAX_Y = 980
const WIN_DELAY = 4000
const LOSE_DELAY = 1000

class Collider {
    constructor(x, y, size=50) {
        this.x = x
        this.y = y
        this.size = size
    }
    collide(other) {
        return CircleCircle(this.x, this.y, this.size, other.x, other.y, other.size)
    }
}

class Flappy extends Collider {
    constructor(x, y) {
        super(x, y)
        this.height = new Verlet(this.y)
        this.died = 0
    }
    update(flapping, blocks, weightless) {
        if (this.died) {
            this.moveDead();
        }
        else {
            this.moveAlive(flapping, blocks, weightless);
        }

        this.y = this.height.position()
    }
    moveAlive(flapping, blocks, weightless) {
        if (weightless) {
            this.flyRight()
            return
        }

        this.height.integrate(MOMENTUM)
        flappyGame(flapping, this)   
        if (this.height.position() >= MAX_Y) {
            this.died = performance.now()
        }
        this.height.constrain(0, MAX_Y)
        blocks.forEach(b => {
            if (this.collide(b)) {
                this.died = performance.now()
            }
        })
    }
    moveDead() {
        this.height.integrate(MOMENTUM)
        this.height.constrain(0, MAX_Y)
    }
    flapWings() {
        this.height.force(-FLAP)
    }
    sinkDown() {
        this.height.force(GRAVITY)
    }
    flyRight() {
        this.x += SPEED
    }
}

class Coin extends Collider {
    constructor(x, y) {
        super(x, y)
        this.collected = false
    }
    update(flappy) {
        if (this.collected) {
            this.y = Math.max(-200, this.y - 20)
            return
        }
        if (!flappy.died && this.collide(flappy)) {
            this.collected = true
        }
    }
}

class Block extends Collider {
    constructor(x, y) {
        super(x, y)
    }
}

export class Level {
    constructor(dist, density=0.1, blockChance=0.2, gridSize=150) {
        this.dist = dist
        this.flappy = new Flappy(200, 540)
        this.coins = []
        this.blocks = []
        this.state = new State('ready', ['ready', 'playing', 'lost', 'won', 'reset'])
        for (let x = 960; x < dist; x += gridSize) {
            for(let y = 200; y < 880; y += gridSize) {
                if (Math.random() < density) {
                    if (Math.random() < blockChance) this.blocks.push(new Block(x, y))
                    else this.coins.push(new Coin(x, y))
                }
            }
        }    
    }
    update(input) {
        if (this.state.is('ready')) {
            if (input) this.state.to('playing')
            else return
        }
        else if (this.state.is('playing')) {
            if (this.flappy.x > this.dist) {
                this.state.to('won')
            }
            else if (this.flappy.died) {
                this.state.to('lost')
            }
        }
        else if (this.state.is('won')) {
            if (input && performance.now() > this.state.time() + WIN_DELAY) {
                this.state.to('reset')
            }
        }
        else if (this.state.is('lost')) {
            if (input && performance.now() > this.state.time() + LOSE_DELAY) {
                this.state.to('reset')
            }
        }
        else return

        this.flappy.update(input, this.blocks, this.state.is('won'))
        this.coins.forEach(c => c.update(this.flappy))
    }
    score() {
        return this.coins.reduce((sum, c) => {
            return sum + (c.collected ? 100 : 0)
        }, this.state.is('won') ? 1000 : 0)
    }
    complete() {
        return this.state.is('reset')
    }
}
