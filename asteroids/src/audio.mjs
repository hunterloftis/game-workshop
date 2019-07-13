export default class Audio {
    constructor() {
        const music = document.createElement('audio')
        music.autoplay = true
        music.src = 'assets/audio/music.mp3'
        music.loop = true

        this.ctx = new AudioContext()
        this.largeExplosion = this.ctx.createBuffer(2, this.ctx.sampleRate, this.ctx.sampleRate)
        this.smallExplosion = this.ctx.createBuffer(2, this.ctx.sampleRate, this.ctx.sampleRate)
        this.load()

        document.addEventListener('click', () => music.play(), false)
        document.addEventListener('keydown', () => music.play(), false)
    }
    async load() {
        const res = await fetch('assets/audio/asteroid-explosion.mp3')
        const arrayBuf = await res.arrayBuffer()
        this.largeExplosion = await this.ctx.decodeAudioData(arrayBuf)
        
        const res2 = await fetch('assets/audio/chunk-explosion.mp3')
        const arrayBuf2 = await res2.arrayBuffer()
        this.smallExplosion = await this.ctx.decodeAudioData(arrayBuf2)
    }
    play(buffer) {
        const src = this.ctx.createBufferSource()
        src.buffer = buffer
        src.connect(this.ctx.destination)
        src.start(0)
    }
    accompany(events) {
        events.forEach(e => {
            if ('explodeAsteroid' === e.name) {
                this.play(this.largeExplosion)
            }
            else if ('explodeChunk' === e.name) {
                this.play(this.smallExplosion)
            }
            else if ('explodeShip' === e.name) {
                this.play(this.largeExplosion)
            }
        })
    }
}
