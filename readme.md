# ffmpeg-audiobuffer-stream
Decode an audio file (using fluent-ffmpeg) to make an object stream where each chunk is an AudioBuffer.

## Install
You may first need to install ffmpeg https://ffmpeg.org.

Then run,
`npm i ffmpeg-audiobuffer-stream`

## Usage
```
import {decode} from 'ffmpeg-audiobuffer-stream'

const sampleRate = 44100 // Hz
const numberOfChannels = 2 // stereo

let audioStream = decode('path/to/my/audio/file.mp3', sampleRate, numberOfChannels)

audioStream.on('data', chunk => {
  // Chunk is a WebAudioAPI AudioBuffer object containing a small frame of audio.
})

// Alternatively, pipe to a writable AudioBuffer object-stream.
audioStream.pipe(myAudioWritableStream)
```