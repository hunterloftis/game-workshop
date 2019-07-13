export default class Keyboard {
    constructor(keys) {
        this.keys = keys
        document.addEventListener('keydown', this.onKey.bind(this, true))
        document.addEventListener('keyup', this.onKey.bind(this, false))
    }
    onKey(down, event) {
        if (this.keys[event.key] === undefined) return
        this.keys[event.key] = down
    }
}