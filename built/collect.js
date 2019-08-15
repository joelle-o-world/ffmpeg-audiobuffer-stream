"use strict";
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
var AudioBuffer = require("audiobuffer");
/**
 * Collect the chunks of a readable stream into an array. Returns a promise for
 * that array.
 */
function collect(stream, property) {
    if (property === void 0) { property = null; }
    var list = [];
    if (property == null)
        stream.on('data', function (data) { return list.push(data); });
    else
        stream.on('data', function (data) { return list.push(data[property]); });
    return new Promise(function (fulfil, reject) {
        stream.on('finish', function () { return fulfil(list); });
    });
}
exports.collect = collect;
exports.default = collect;
function collectAudio(audioStream) {
    return __awaiter(this, void 0, void 0, function () {
        var chunks, lengthInSamples, chunks_1, chunks_1_1, chunk, numberOfChannels, sampleRate, channelData, c, t, chunks_2, chunks_2_1, chunk, c, signal, u;
        var e_1, _a, e_2, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, collect(audioStream)];
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
                    sampleRate = chunks[0].sampleRate;
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
exports.collectAudio = collectAudio;
