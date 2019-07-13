export default class Verlet {
    constructor(val, velocity = 0) {
        this.val = val
        this.prev = val - velocity
    }
    integrate(damp = 1) {
        const v = this.velocity
        this.prev = this.val
        this.val += v * damp
    }
    constrain(min, max) {
        const v = this.velocity
        if (this.val < min) {
            this.val = max - (min - this.val)
        } else if (this.val > max) {
            this.val = min + (this.val - max)
        } else {
            return
        }
        this.prev = this.val - v
    }
    get velocity() {
        return this.val - this.prev
    }
}
