"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var fs_1 = require("fs");
var fluent_ffmpeg_1 = require("fluent-ffmpeg");
var ytdl = require("ytdl-core");
var outputDir = './output/';
var tempDir = './temp/';
var getInfo = function (link) { return __awaiter(void 0, void 0, void 0, function () {
    var valid;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // validating video url
                console.log(ytdl);
                valid = ytdl.validateURL(link);
                if (!valid) {
                    console.log('Invalid youtube URL');
                    return [2 /*return*/, null];
                }
                return [4 /*yield*/, ytdl.getInfo(link)];
            case 1: 
            // get video info
            return [2 /*return*/, (_a.sent())];
        }
    });
}); };
var downloadStream = function (stream, fileName) {
    return new Promise(function (resolve) {
        stream.on('end', function () {
            resolve();
        });
        stream.pipe(fs_1["default"].createWriteStream(fileName));
    });
};
var download = function (info, audioFormat, videoFormat) { return __awaiter(void 0, void 0, void 0, function () {
    var title, audioFileName, audioStream, videoFileName, videoStream;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                title = (info.videoDetails.title).replace(/[\<\>\:\"\/\\\/\|\?\*]/g, '_');
                audioFileName = '';
                if (!audioFormat) return [3 /*break*/, 2];
                audioFileName = 'audio_' + title + '.' + audioFormat.container;
                console.log('Audio file name: ');
                console.log(audioFileName);
                audioStream = ytdl.downloadFromInfo(info, { format: audioFormat });
                audioStream.on('progress', function (_, segmentsDownloaded, segments) {
                    //progressBar.redrawProgressBar((segmentsDownloaded / segments) * 100, 'Audio download');
                    console.log('Current progress: ' + (segmentsDownloaded / segments) * 100 + '%');
                });
                console.log();
                //progressBar.drawProgressBar(0, 'Audio download');
                return [4 /*yield*/, downloadStream(audioStream, tempDir + audioFileName)];
            case 1:
                //progressBar.drawProgressBar(0, 'Audio download');
                _a.sent();
                console.log('Audio downloaded');
                _a.label = 2;
            case 2:
                videoFileName = '';
                if (!videoFormat) return [3 /*break*/, 4];
                videoFileName = 'video_' + title + '.' + videoFormat.container;
                videoStream = ytdl.downloadFromInfo(info, { format: videoFormat });
                videoStream.on('progress', function (_, segmentsDownloaded, segments) {
                    //progressBar.redrawProgressBar((segmentsDownloaded / segments) * 100, 'Video download');
                    console.log('Current progress: ' + (segmentsDownloaded / segments) * 100 + '%');
                });
                console.log();
                //progressBar.drawProgressBar(0, 'Video download');
                return [4 /*yield*/, downloadStream(videoStream, tempDir + videoFileName)];
            case 3:
                //progressBar.drawProgressBar(0, 'Video download');
                _a.sent();
                console.log('Video downloaded');
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); };
var convertFiles = function (query) {
    return new Promise(function (resolve) {
        query.on('end', function () {
            //progressBar.redrawProgressBar(100, 'Converting file');
            resolve();
        });
        query.run();
    });
};
var convert = function (info, audioFormat, videoFormat, audioFileName, videoFileName, selectedFormat) { return __awaiter(void 0, void 0, void 0, function () {
    var title, query, outputOptions, audioBitrate, query, audioBitrate;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                title = (info.videoDetails.title).replace(/[\<\>\:\"\/\\\/\|\?\*]/g, '_');
                if (!videoFormat) return [3 /*break*/, 2];
                query = fluent_ffmpeg_1["default"]().input(tempDir + videoFileName).videoCodec('libx264');
                outputOptions = ['-metadata:s:v:0 language='];
                if (audioFormat) {
                    audioBitrate = '128k';
                    if (audioFormat.audioBitrate) {
                        if (audioFormat.audioBitrate <= 64)
                            audioBitrate = '64k';
                        else if (audioFormat.audioBitrate <= 128)
                            audioBitrate = '128k';
                        else if (audioFormat.audioBitrate <= 160)
                            audioBitrate = '160k';
                        else if (audioFormat.audioBitrate <= 256)
                            audioBitrate = '256k';
                    }
                    query.input(tempDir + audioFileName).audioCodec('aac').audioBitrate(audioBitrate);
                    outputOptions = __spreadArrays(outputOptions, ['-profile:v high', '-level:v 4.0', '-metadata:s:a:0 language=']);
                }
                query.output(outputDir + title + '.' + selectedFormat).outputOptions(outputOptions);
                query.on('error', function (err) {
                    console.log('An error occurred: ' + err.message);
                });
                query.on('start', function () {
                    console.log();
                    console.log('Processing started!');
                    //progressBar.drawProgressBar(0, 'Converting file');
                });
                query.on('progress', function (progress) {
                    //progressBar.redrawProgressBar(progress.percent, 'Converting file');
                    console.log('Current progress: ' + progress.percent + '%');
                });
                return [4 /*yield*/, convertFiles(query)];
            case 1:
                _a.sent();
                console.log('Processing complete');
                return [3 /*break*/, 4];
            case 2:
                if (!audioFormat) return [3 /*break*/, 4];
                query = fluent_ffmpeg_1["default"]().input(tempDir + audioFileName).noVideo();
                audioBitrate = '128k';
                if (audioFormat.audioBitrate) {
                    if (audioFormat.audioBitrate <= 64)
                        audioBitrate = '64k';
                    else if (audioFormat.audioBitrate <= 128)
                        audioBitrate = '128k';
                    else if (audioFormat.audioBitrate <= 160)
                        audioBitrate = '160k';
                    else if (audioFormat.audioBitrate <= 256)
                        audioBitrate = '256k';
                }
                if (selectedFormat === 'aac')
                    query.audioCodec('aac').audioBitrate(audioBitrate).output(outputDir + title + '.' + selectedFormat).outputOptions(['-profile:v high', '-level:v 4.0', '-metadata:s:a:0 language=']);
                else
                    (selectedFormat === 'mp3');
                query.audioBitrate(audioBitrate).output(outputDir + title + '.' + selectedFormat);
                query.on('error', function (err) {
                    console.log('An error occurred: ' + err.message);
                });
                query.on('start', function () {
                    console.log();
                    console.log('Processing started!');
                    //progressBar.drawProgressBar(0, 'Converting file');
                });
                query.on('progress', function (progress) {
                    console.log('Current progress: ' + progress.percent + '%');
                    //progressBar.redrawProgressBar(progress.percent, 'Converting file');
                });
                return [4 /*yield*/, convertFiles(query)];
            case 3:
                _a.sent();
                console.log();
                console.log('Processing complete');
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports["default"] = { getInfo: getInfo, download: download, convert: convert };
