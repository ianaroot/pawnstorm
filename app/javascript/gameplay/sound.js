class Sound {

    static playSound(sound){
        if( sound != '' ){
            var url = this.getSoundUrl(sound)
            if( !url ){ return }
            var a = new Audio(url);
            a.play();
        }
    }

    static playSoundForNotation(notation){
        if( !notation ){ return }
        if( notation.includes('+') || notation.includes('#') ){
            this.playSound('check')
        } else if( notation.includes('x') ){
            this.playSound('capture')
        } else {
            this.playSound('move')
        }
    }

    static getSoundUrl(sound){
        var url = ""
        switch(sound) {
            case "move":
                url = "https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3"
                break;
            case "check":
                url = "https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-check.mp3"
                break;
            case "castle":
                url = "https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/castle.mp3"
                break;
            case "promote":
                url = "https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/promote.mp3"
                break;
            case "capture":
                url = "https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3"
                break;
            default:
              // code block
          }
        return url
    }

}

export default Sound
