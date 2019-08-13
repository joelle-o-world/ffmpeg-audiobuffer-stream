// Decode an audio file using ffmpeg, produces an AudioBuffer object stream.

import * as ffmpeg from 'fluent-ffmpeg'
import {Transform} from 'stream'
import * as AudioBuffer from 'audiobuffer'
import collect from './collect';
//import * as Promise from 'bluebird';

type WavFormat = {
  sampleRate: number
  channels: number
}

/** Decode an audio file using ffmpeg. @returns An AudioBuffer object stream. */
function decode(file:string, sampleRate:number=44100, numberOfChannels=1) {
  // Decode audio file with ffmpeg.
  let ffmpegCommand = ffmpeg(file)
    .format("f32le")
    .audioCodec("pcm_f32le")
    .audioChannels(numberOfChannels)
    .audioFrequency(sampleRate)
    .noVideo()
    
    .on('error', (e) => {
      console.error(e)
    })
    

  /** Start time of the current audio chunk. */
  let time:number = 0

  // Convert to AudioBuffer object stream
  let trimmedBit:Buffer | null = null
  let objectify = new Transform({
    readableObjectMode: true,
    transform(chunk:Buffer, encoding, callback) {
      // Handle non-multiples of 4 length buffers
      if(trimmedBit) {
        chunk = Buffer.concat([trimmedBit, chunk])
        trimmedBit = null
      }
      if(chunk.length % 4) {
        console.warn(
          'AudioBuffer wrapping stream recieved an incomplete binary word.\n',
          'Buffer size =', chunk.length, 'bytes (should be four-multiple.)\n',
          'Prepending remainder of', chunk.length%4, 
          'bytes to the next chunk.\n',
          'File:', file, '\n',
          'At', time, 'seconds.', time * sampleRate+'smp'
        )
        let i = chunk.length - chunk.length%4
        trimmedBit = chunk.slice(i)
        chunk = chunk.slice(0, i)
      }

      // Interpret buffer as 32-bit float array.
      let byteArray = chunk.buffer.byteLength == chunk.length
        ? chunk.buffer 
        : chunk.buffer.slice(0, chunk.length)
      let typedArray = new Float32Array(byteArray)

      // De-interleave the buffer
      let channelData:number[][] = []
      for(let c=0; c<numberOfChannels; c++) {
        channelData[c] = []
        for(let i=c; i<typedArray.length; i+=numberOfChannels)
          channelData[c].push(typedArray[i])
      }

      // Create AudioBuffer of audio chunk.
      let audio = AudioBuffer.fromArray(
        channelData,
        sampleRate,
      )
      audio.time = time

      // Increment time.
      time += audio.length

      callback(null, audio)
    }
  })

  // Add promise of sample rate and duration.
  // @ts-ignore
  objectify.sampleRate = sampleRate
  
  
  
  ffmpegCommand.on('codecData', e => {
    let durationStr = e.duration // as a string in the form hh:mm:ss.ss
    let [hours, minutes, seconds] = durationStr.split(':').map(parseFloat)
    let duration = (hours * 60 + minutes) * 60 + seconds
    objectify.emit('duration', duration)
  })

  // Pipe streams together.
  ffmpegCommand
    .pipe(objectify, {end: true})

  return objectify
}
export default decode

/**
 * Decode an audio file using ffmpeg, returns a long AudioBuffer.
 * @param filePath 
 * @param sampleRate 
 */
async function decodeBuffer(filePath:string, sampleRate:number=44100) {
  // Collect audio chunks from decode stream
  let stream = decode(filePath, sampleRate)
  let chunks:AudioBuffer[] = await collect(stream)

  if(!chunks.length)
    throw 'No audio found'

  // calculate length in samples
  let lengthInSamples:number = 0
  for(let chunk of chunks)
    lengthInSamples += chunk.length

  let numberOfChannels = chunks[0].numberOfChannels

  let channelData = []
  for(let c=0; c<numberOfChannels; c++)
    channelData[c] = new Float32Array(lengthInSamples)

  let t:number = 0
  for(let chunk of chunks) {
    for(let c=0; c<numberOfChannels; c++) {
      let signal = chunk.getChannelData(c)
      for(let u=0; u<signal.length; u++)
        channelData[c][t+u] = signal[u]
    }

    t += chunk.length
  }

  return AudioBuffer.fromArray(channelData, sampleRate)
}

export {decodeBuffer}