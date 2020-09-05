//import ytdl from 'ytdl-core';
import stream from 'stream';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ytdl from 'ytdl-core';

const ffmpegPath = require('@ffmpeg-installer/ffmpeg');

const outputDir = './output/';
const tempDir = './temp/';

const getInfo = async (link: string): Promise<ytdl.videoInfo | null> => {
    // validating video url
    const valid: boolean = ytdl.validateURL(link);
    if (!valid) {
        console.log('Invalid youtube URL');
        return null;
    }

    // get video info
    return (await ytdl.getInfo(link));
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
        sendProgressMessage: (progress: number) => void,
        sendStatusMessage: (status: string) => void
    ): Promise<fileNames>
}

const download: downloadFunc = async (info, audioFormat, videoFormat, sendProgressMessage, sendStatusMessage) => {
    const title: string = (info.videoDetails.title).replace(/[\<\>\:\"\/\\\/\|\?\*]/g, '_');
    let audioFileName: string = '';

    await fs.promises.mkdir(tempDir, { recursive: true });

    //audio downlaod
    if (audioFormat) {
        audioFileName = 'audio_' + title + '.' + audioFormat.container;
        const audioStream = ytdl.downloadFromInfo(info, { format: audioFormat });
        audioStream.on('progress', (_, segmentsDownloaded: number, segments: number) => {
            const progress: number = Math.floor((segmentsDownloaded / segments) * 100);
            sendProgressMessage(progress);
        })
        sendStatusMessage('Downloading audio');
        sendProgressMessage(0);
        await downloadStream(audioStream, tempDir + audioFileName);
        sendProgressMessage(100);
    }

    //video download
    let videoFileName: string = '';
    if (videoFormat) {
        videoFileName = 'video_' + title + '.' + videoFormat.container;
        const videoStream = ytdl.downloadFromInfo(info, { format: videoFormat });
        videoStream.on('progress', (_, segmentsDownloaded: number, segments: number) => {
            const progress: number = Math.floor((segmentsDownloaded / segments) * 100);
            sendProgressMessage(progress);
        });
        sendStatusMessage('Downloading video');
        sendProgressMessage(0);
        await downloadStream(videoStream, tempDir + videoFileName);
        sendProgressMessage(100);
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
        sendProgressMessage: (progress: number) => void
    ): Promise<void>
}

const convert: ConvertFunc = async (info, audioFormat, videoFormat, audioFileName, videoFileName, selectedFormat, sendProgressMessage) => {
    const title: string = (info.videoDetails.title).replace(/[\<\>\:\"\/\\\/\|\?\*]/g, '_');
    const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);

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
            sendProgressMessage(0);
        });
        query.on('progress', progress => {
            sendProgressMessage(Math.floor(progress.percent));
        });
        await convertFiles(query);
        sendProgressMessage(100);
    } else if (audioFormat) {
        //audio only
        const query = ffmpeg().input(tempDir + audioFileName).noVideo();
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
        if (selectedFormat === 'aac')
            query.audioCodec('aac').audioBitrate(audioBitrate).output(outputDir + title + '.' + selectedFormat).outputOptions(['-profile:v high', '-level:v 4.0', '-metadata:s:a:0 language=']);
        else (selectedFormat === 'mp3')
        query.audioBitrate(audioBitrate).output(outputDir + title + '.' + selectedFormat);
        query.on('error', err => {
            console.log('An error occurred: ' + err.message)
        });
        query.on('start', () => {
            sendProgressMessage(0);
        });
        query.on('progress', progress => {
            sendProgressMessage(Math.floor(progress.percent));
        });
        await convertFiles(query);
        sendProgressMessage(100);
    }
}

const cleanUp = async (audioFileName: string, videoFileName: string): Promise<void> => {
    if (audioFileName !== '')
        await fs.promises.unlink(tempDir + audioFileName);
    if (videoFileName !== '')
        await fs.promises.unlink(tempDir + videoFileName);
}

export default { getInfo, download, convert, cleanUp };