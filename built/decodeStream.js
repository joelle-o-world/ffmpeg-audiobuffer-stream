"use strict";
// Decode an audio file using ffmpeg, produces an AudioBuffer object stream.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ffmpeg = require("fluent-ffmpeg");
var stream_1 = require("stream");
var AudioBuffer = require("audiobuffer");
var collect_1 = require("./collect");
/** Decode an audio file using ffmpeg. @returns An AudioBuffer object stream. */
function decode(file, sampleRate, numberOfChannels) {
    if (sampleRate === void 0) { sampleRate = 44100; }
    if (numberOfChannels === void 0) { numberOfChannels = 1; }
    // Decode audio file with ffmpeg.
    var ffmpegCommand = ffmpeg(file)
        .format("f32le")
        .audioCodec("pcm_f32le")
        .audioChannels(numberOfChannels)
        .audioFrequency(sampleRate)
        .noVideo()
        .on('error', function (e) {
        console.error(e);
    });
    /** Start time of the current audio chunk. */
    var time = 0;
    // Convert to AudioBuffer object stream
    var trimmedBit = null;
    var objectify = new stream_1.Transform({
        readableObjectMode: true,
        transform: function (chunk, encoding, callback) {
            // Handle non-multiples of 4 length buffers
            if (trimmedBit) {
                chunk = Buffer.concat([trimmedBit, chunk]);
                trimmedBit = null;
            }
            if (chunk.length % 4) {
                console.warn('AudioBuffer wrapping stream recieved an incomplete binary word.\n', 'Buffer size =', chunk.length, 'bytes (should be four-multiple.)\n', 'Prepending remainder of', chunk.length % 4, 'bytes to the next chunk.\n', 'File:', file, '\n', 'At', time, 'seconds.', time * sampleRate + 'smp');
                var i = chunk.length - chunk.length % 4;
                trimmedBit = chunk.slice(i);
                chunk = chunk.slice(0, i);
            }
            // Interpret buffer as 32-bit float array.
            var byteArray = chunk.buffer.byteLength == chunk.length
                ? chunk.buffer
                : chunk.buffer.slice(0, chunk.length);
            var typedArray = new Float32Array(byteArray);
            // De-interleave the buffer
            var channelData = [];
            for (var c = 0; c < numberOfChannels; c++) {
                channelData[c] = [];
                for (var i = c; i < typedArray.length; i += numberOfChannels)
                    channelData[c].push(typedArray[i]);
            }
            // Create AudioBuffer of audio chunk.
            var audio = AudioBuffer.fromArray(channelData, sampleRate);
            audio.time = time;
            // Increment time.
            time += audio.length;
            callback(null, audio);
        }
    });
    // Add promise of sample rate and duration.
    // @ts-ignore
    objectify.sampleRate = sampleRate;
    ffmpegCommand.on('codecData', function (e) {
        var durationStr = e.duration; // as a string in the form hh:mm:ss.ss
        var _a = __read(durationStr.split(':').map(parseFloat), 3), hours = _a[0], minutes = _a[1], seconds = _a[2];
        var duration = (hours * 60 + minutes) * 60 + seconds;
        objectify.emit('duration', duration);
    });
    // Pipe streams together.
    ffmpegCommand
        .pipe(objectify, { end: true });
    return objectify;
}
exports.decode = decode;
exports.default = decode;
/**
 * Decode an audio file using ffmpeg, returns a long AudioBuffer.
 * @param filePath
 * @param sampleRate
 */
function decodeBuffer(filePath, sampleRate) {
    if (sampleRate === void 0) { sampleRate = 44100; }
    return __awaiter(this, void 0, void 0, function () {
        var stream, chunks, lengthInSamples, chunks_1, chunks_1_1, chunk, numberOfChannels, channelData, c, t, chunks_2, chunks_2_1, chunk, c, signal, u;
        var e_1, _a, e_2, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    stream = decode(filePath, sampleRate);
                    return [4 /*yield*/, collect_1.default(stream)];
                case 1:
                    chunks = _c.sent();
                    if (!chunks.length)
                        throw 'No audio found';
                    lengthInSamples = 0;
                    try {
                        for (chunks_1 = __values(chunks), chunks_1_1 = chunks_1.next(); !chunks_1_1.done; chunks_1_1 = chunks_1.next()) {
                            chunk = chunks_1_1.value;
                            lengthInSamples += chunk.length;
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (chunks_1_1 && !chunks_1_1.done && (_a = chunks_1.return)) _a.call(chunks_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    numberOfChannels = chunks[0].numberOfChannels;
                    channelData = [];
                    for (c = 0; c < numberOfChannels; c++)
                        channelData[c] = new Float32Array(lengthInSamples);
                    t = 0;
                    try {
                        for (chunks_2 = __values(chunks), chunks_2_1 = chunks_2.next(); !chunks_2_1.done; chunks_2_1 = chunks_2.next()) {
                            chunk = chunks_2_1.value;
                            for (c = 0; c < numberOfChannels; c++) {
                                signal = chunk.getChannelData(c);
                                for (u = 0; u < signal.length; u++)
                                    channelData[c][t + u] = signal[u];
                            }
                            t += chunk.length;
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (chunks_2_1 && !chunks_2_1.done && (_b = chunks_2.return)) _b.call(chunks_2);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    return [2 /*return*/, AudioBuffer.fromArray(channelData, sampleRate)];
            }
        });
    });
}
exports.decodeBuffer = decodeBuffer;
