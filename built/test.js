"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var decodeStream_1 = require("./decodeStream");
var stream = decodeStream_1.decode('/Users/joel/Music/youtube bootlegs/Princess Vitarah - I Own Three Goats.mp3');
stream.on('data', console.log);
