//import ytdl from 'ytdl-core';
import stream from 'stream';
import fs from 'fs';
import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import ytdl from 'ytdl-core';

import { AppConfig, VideoQualityLabel, AudioQualityLabel, Messages } from '../types/types.js';
import defaultConfig from './defaultConfig.js';
import defaultConfigText from './defaultConfigText.js';

const tempDir = './temp/';
const configFile = './config.cfg'

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
    const title: string = (info.videoDetails.title).replace(/[<>:"/\\/|?*]/g, '_');
    let audioFileName = '';

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
    let videoFileName = '';
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
    const title: string = (info.videoDetails.title).replace(/[<>:"/\\/|?*]/g, '_');
    ffmpeg.setFfmpegPath(config.ffmpegPath);
    await fs.promises.mkdir(config.outputDir, { recursive: true });

    let query: FfmpegCommand = ffmpeg();
    
    if (videoFormat) {
        //if video is present
        query = query.input(tempDir + videoFileName).videoCodec('libx264');
        let outputOptions = ['-metadata:s:v:0 language='];
        if (audioFormat) {
            let audioBitrate = '128k';
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
        query.output(config.outputDir + title + '.' + selectedFormat).outputOptions(outputOptions);
    } else if (audioFormat) {
        //audio only
        query = query.input(tempDir + audioFileName).noVideo();
        let audioBitrate = '128k';
        let audioQuality = '-q:a 1';
        if (audioFormat.audioBitrate) {
            if (audioFormat.audioBitrate <= 64) {
                audioQuality = '-q:a 8';
                audioBitrate = '64k';
            } else if (audioFormat.audioBitrate <= 128) {
                audioQuality = '-q:a 5';
                audioBitrate = '128k';
            } else if (audioFormat.audioBitrate <= 160) {
                audioQuality = '-q:a 2';
                audioBitrate = '160k';
            } else if (audioFormat.audioBitrate <= 256) {
                audioQuality = '-q:a 0';
                audioBitrate = '256k';
            }
        }
        if (selectedFormat === 'aac')
            query.audioCodec('aac').audioBitrate(audioBitrate).output(config.outputDir + title + '.' + selectedFormat).outputOptions(['-profile:v high', '-level:v 4.0', '-metadata:s:a:0 language=']);
        else (selectedFormat === 'mp3')
            query.audioCodec('libmp3lame').output(config.outputDir + title + '.' + selectedFormat).outputOptions([audioQuality]);
    }

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
    try {
        await fs.promises.access(configFile);
    } catch (_) {
        fs.promises.writeFile(configFile, defaultConfigText);
        return defaultConfig;
    }
    const data = await fs.promises.readFile(configFile);
    const config: AppConfig = { ...defaultConfig };
    const lines: string[] = data.toString().split('\n');
    for (const line of lines) {
        if (line[0] === '#')
            continue;
        const pair: string[] = line.split(':').map(param => param.replace(/ /g, ''));
        if ((pair.length === 1) && (pair[0] === ''))
            continue;
        if (pair.length !== 2) {
            msg.sendErrorMessage('Bad config file!');
            return defaultConfig;
        }
        if (pair[0] in defaultConfig) {
            if (pair[0] === 'ffmpegPath')
                config[pair[0]] = pair[1];
            else if (pair[0] === 'outputDir')
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
            else if (pair[0] === 'audioQuality') {
                if (pair[1].length !== 0) {
                    const audioQualityLabelCandidates: string[] = pair[1].split(',');
                    const audioQualityLabels: AudioQualityLabel[] = [];
                    audioQualityLabelCandidates.forEach(label => {
                        switch (label) {
                            case '256kbps':
                            case '160kbps':
                            case '128kbps':
                            case '64kbps':
                            case '48kbps':
                                if (!audioQualityLabels.includes(label))
                                    audioQualityLabels.push(label);
                                else
                                    msg.sendErrorMessage('Bad config file (audio quality labels duplicate)!');
                                break;
                            default:
                                msg.sendErrorMessage('Bad config file (audio quality labels)!');
                        }
                    });
                    config.audioQuality = audioQualityLabels;
                } else
                    config.audioQuality = [];
            } else if (pair[0] === 'videoQuality') {
                if (pair[1].length !== 0) {
                    const possibleLables: string[] = ['144p', '144p 15fps', '144p60 HDR', '240p', '240p60 HDR', '270p', '360p', '360p60 HDR',
                        '480p', '480p60 HDR', '720p', '720p60', '720p60 HDR', '1080p', '1080p60', '1080p60 HDR', '1440p',
                        '1440p60', '1440p60 HDR', '2160p', '2160p60', '2160p60 HDR', '4320p', '4320p60'];
                    const labelsWithoutSpaces: string[] = possibleLables.map(label => label.replace(/ /g, ''));
                    const videoQualityLabelCandidates: string[] = pair[1].split(',');
                    const videoQualityLabels: VideoQualityLabel[] = [];
                    videoQualityLabelCandidates.forEach(label => {
                        const labelIndex: number = labelsWithoutSpaces.indexOf(label);
                        if (labelIndex !== -1) {
                            if (!videoQualityLabels.includes(possibleLables[labelIndex] as VideoQualityLabel))
                                videoQualityLabels.push(possibleLables[labelIndex] as VideoQualityLabel);
                            else
                                msg.sendErrorMessage('Bad config file (video quality labels duplicate)!');
                        } else
                            msg.sendErrorMessage('Bad config file (video quality labels)!');
                    });
                    config.videoQuality = videoQualityLabels;
                } else config.videoQuality = [];
            } else {
                msg.sendErrorMessage('Bad config file!');
                return defaultConfig;
            }
        }
    }
    return config;
}

export default { getInfo, download, convert, cleanUp, loadConfig, detectFfmpeg };