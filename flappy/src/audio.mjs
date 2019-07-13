export default class Audio {
    constructor() {
        this.music = document.createElement('audio')
        this.music.src = 'assets/audio/music.mp3'
        this.state = ''

        const enableAudio = async () => {
            document.removeEventListener('touchstart', enableAudio)
            await this.music.load()
            await this.music.play()
        }

        document.addEventListener('touchstart', enableAudio, false)
    }
    accompany(state) {
        if (state.is(this.state)) return
        this.state = state.active()

        if (state.is('ready', 'reset')) {
            this.music.pause()
        }
        else if (state.is('playing')) {
            this.music.currentTime = 0.5
            this.music.play()    
        }
        else if (state.is('lost')) {
            this.music.currentTime = 173    
        }
    }
}