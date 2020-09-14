//import ytdl from 'ytdl-core';
import stream from 'stream';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ytdl from 'ytdl-core';

import { AppConfig, Messages } from '../../renderer/types/types.js';

const outputDir = './output/';
const tempDir = './temp/';
const configFile = './config.cfg'
//const ffmpegPath = './ffmpeg/bin/ffmpeg.exe'

const getInfo = async (link: string): Promise<ytdl.videoInfo | null> => {
    // validating video url
    const valid: boolean = ytdl.validateURL(link);
    if (!valid) {
        return null;
    }
    // get video info
    let result: ytdl.videoInfo;
    try {
        result = await ytdl.getInfo(link);
    } catch (err) {
        return null;
    }
    return result;
}

const downloadStream = (stream: stream.Readable, fileName: string): Promise<void> => {
    return new Promise(resolve => {
        stream.on('end', () => {
            resolve();
        });
        stream.pipe(fs.createWriteStream(fileName));
    })
}

interface fileNames {
    audioFileName: string,
    videoFileName: string
}

interface downloadFunc {
    (
        info: ytdl.videoInfo,
        audioFormat: ytdl.videoFormat | null,
        videoFormat: ytdl.videoFormat | null,
        msg: Messages
    ): Promise<fileNames>
}

const download: downloadFunc = async (info, audioFormat, videoFormat, msg) => {
    const title: string = (info.videoDetails.title).replace(/[\<\>\:\"\/\\\/\|\?\*]/g, '_');
    let audioFileName: string = '';

    await fs.promises.mkdir(tempDir, { recursive: true });

    //audio downlaod
    if (audioFormat) {
        audioFileName = 'audio_' + title + '.' + audioFormat.container;
        const audioStream = ytdl.downloadFromInfo(info, { format: audioFormat });
        audioStream.on('progress', (_, segmentsDownloaded: number, segments: number) => {
            const progress: number = Math.floor((segmentsDownloaded / segments) * 100);
            msg.sendProgressMessage(progress);
        })
        msg.sendStatusMessage('Downloading audio');
        msg.sendProgressMessage(0);
        await downloadStream(audioStream, tempDir + audioFileName);
        msg.sendProgressMessage(100);
    }

    //video download
    let videoFileName: string = '';
    if (videoFormat) {
        videoFileName = 'video_' + title + '.' + videoFormat.container;
        const videoStream = ytdl.downloadFromInfo(info, { format: videoFormat });
        videoStream.on('progress', (_, segmentsDownloaded: number, segments: number) => {
            const progress: number = Math.floor((segmentsDownloaded / segments) * 100);
            msg.sendProgressMessage(progress);
        });
        msg.sendStatusMessage('Downloading video');
        msg.sendProgressMessage(0);
        await downloadStream(videoStream, tempDir + videoFileName);
        msg.sendProgressMessage(100);
    }
    return { audioFileName, videoFileName };
}

const convertFiles = (query: ffmpeg.FfmpegCommand): Promise<void> => {
    return new Promise(resolve => {
        query.on('end', () => {
            resolve();
        });
        query.run();
    })
}

interface ConvertFunc {
    (
        info: ytdl.videoInfo,
        audioFormat: ytdl.videoFormat | null,
        videoFormat: ytdl.videoFormat | null, audioFileName: string,
        videoFileName: string,
        selectedFormat: string,
        msg: Messages,
        config: AppConfig
    ): Promise<void>
}

const convert: ConvertFunc = async (info, audioFormat, videoFormat, audioFileName, videoFileName, selectedFormat, msg, config) => {
    const title: string = (info.videoDetails.title).replace(/[\<\>\:\"\/\\\/\|\?\*]/g, '_');
    ffmpeg.setFfmpegPath(config.ffmpegPath);
    await fs.promises.mkdir(outputDir, { recursive: true });

    if (videoFormat) {
        //if video is present
        const query = ffmpeg().input(tempDir + videoFileName).videoCodec('libx264');
        let outputOptions = ['-metadata:s:v:0 language='];
        if (audioFormat) {
            let audioBitrate: string = '128k';
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
            outputOptions = [...outputOptions, '-profile:v high', '-level:v 4.0', '-metadata:s:a:0 language='];
        }
        query.output(outputDir + title + '.' + selectedFormat).outputOptions(outputOptions);
        query.on('error', err => {
            console.log('An error occurred: ' + err.message)
        });
        query.on('start', () => {
            msg.sendProgressMessage(0);
        });
        query.on('progress', progress => {
            msg.sendProgressMessage(Math.floor(progress.percent));
        });
        await convertFiles(query);
        msg.sendProgressMessage(100);
    } else if (audioFormat) {
        //audio only
        const query = ffmpeg().input(tempDir + audioFileName).noVideo();
        let audioBitrate: string = '128k';
        let audioQuality: string = '-q:a 1';
        if (audioFormat.audioBitrate) {
            if (audioFormat.audioBitrate <= 64)
                audioQuality = '-q:a 8';
            else if (audioFormat.audioBitrate <= 128)
                audioQuality = '-q:a 5';
            else if (audioFormat.audioBitrate <= 160)
                audioQuality = '-q:a 2';
            else if (audioFormat.audioBitrate <= 256)
                audioQuality = '-q:a 0';
        }
        if (selectedFormat === 'aac')
            query.audioCodec('aac').audioBitrate(audioBitrate).output(outputDir + title + '.' + selectedFormat).outputOptions(['-profile:v high', '-level:v 4.0', '-metadata:s:a:0 language=']);
        else (selectedFormat === 'mp3')
        query.audioCodec('libmp3lame').output(outputDir + title + '.' + selectedFormat).outputOptions([audioQuality]);
        query.on('error', err => {
            console.log('An error occurred: ' + err.message)
        });
        query.on('start', () => {
            msg.sendProgressMessage(0);
        });
        query.on('progress', progress => {
            msg.sendProgressMessage(Math.floor(progress.percent));
        });
        await convertFiles(query);
        msg.sendProgressMessage(100);
    }
}

const cleanUp = async (audioFileName: string, videoFileName: string): Promise<void> => {
    if (audioFileName !== '')
        await fs.promises.unlink(tempDir + audioFileName);
    if (videoFileName !== '')
        await fs.promises.unlink(tempDir + videoFileName);
}

const detectFfmpeg = async (msg: Messages, path: string): Promise<boolean> => {
    try {
        await fs.promises.access(path);
        return true;
    } catch (_) {
        msg.sendErrorMessage('ffmpeg is not detected!');
        return false;
    }
}

const loadConfig = async (msg: Messages): Promise<AppConfig> => {
    const defaultConfig: AppConfig = {
        ffmpegPath: './ffmpeg/bin/ffmpeg.exe',
        defaultAudioFormat: 'mp3',
        defaultVideoFormat: 'mkv',
        videoFormats: ['mkv', 'mp4'],
        audioFormats: ['mp3', 'aac'],
        noVideo: false,
        noAudio: false,
        highestQuality: false
    }
    try {
        await fs.promises.access(configFile);
    } catch (_) {
        let data: string = '';
        for (const [key, value] of Object.entries(defaultConfig)) {
            if ((key !== 'audioFormats') && (key !== 'videoFormats'))
                data += `${key}: ${value}\n`
        }
        fs.promises.writeFile(configFile, data);
        return defaultConfig;
    }
    const data = await fs.promises.readFile(configFile);
    let config: AppConfig = { ...defaultConfig };
    const lines: string[] = data.toString().split('\n');
    for (let line of lines) {
        if (line[0] === '#')
            continue;
        const pair: string[] = line.split(':').map(param => param.replace(' ', ''));
        if ((pair.length === 1) && (pair[0] === ''))
            continue;
        if (pair.length !== 2) {
            msg.sendErrorMessage('Bad config file!');
            return defaultConfig;
        }
        if (defaultConfig.hasOwnProperty(pair[0])) {
            if (pair[0] === 'ffmpegPath')
                config[pair[0]] = pair[1];
            else if ((pair[0] === 'defaultAudioFormat') && (defaultConfig.audioFormats.includes(pair[1])))
                config[pair[0]] = pair[1];
            else if ((pair[0] === 'defaultVideoFormat') && (defaultConfig.videoFormats.includes(pair[1])))
                config[pair[0]] = pair[1];
            else if ((pair[0] === 'highestQuality') && ((pair[1] === 'true') || (pair[1] === 'false')))
                config[pair[0]] = pair[1] === 'true' ? true : false;
            else if ((pair[0] === 'noVideo') && ((pair[1] === 'true') || (pair[1] === 'false')))
                config[pair[0]] = pair[1] === 'true' ? true : false;
            else if ((pair[0] === 'noAudio') && ((pair[1] === 'true') || (pair[1] === 'false')))
                config[pair[0]] = pair[1] === 'true' ? true : false;
            else {
                msg.sendErrorMessage('Bad config file!');
                return defaultConfig;
            }
        }
    }
    return config;
}

export default { getInfo, download, convert, cleanUp, loadConfig, detectFfmpeg};