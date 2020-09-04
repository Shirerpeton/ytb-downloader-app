//import ytdl from 'ytdl-core';
import * as stream from 'stream';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import * as ytdl from 'ytdl-core';

const outputDir = './output/';
const tempDir = './temp/';

const getInfo = async (link: string): Promise<ytdl.videoInfo | null> => {
    // validating video url
    console.log(ytdl);
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

const download = async (info: ytdl.videoInfo, audioFormat: ytdl.videoFormat | null, videoFormat: ytdl.videoFormat | null): Promise<void> => {
    const title: string = (info.videoDetails.title).replace(/[\<\>\:\"\/\\\/\|\?\*]/g, '_');
    let audioFileName: string = '';

    //audio downlaod
    if (audioFormat) {
        audioFileName = 'audio_' + title + '.' + audioFormat.container;
        console.log('Audio file name: ');
        console.log(audioFileName);
        const audioStream = ytdl.downloadFromInfo(info, { format: audioFormat });
        audioStream.on('progress', (_, segmentsDownloaded: number, segments: number) => {
            //progressBar.redrawProgressBar((segmentsDownloaded / segments) * 100, 'Audio download');
            console.log('Current progress: ' + (segmentsDownloaded / segments) * 100 + '%');
        })
        console.log();
        //progressBar.drawProgressBar(0, 'Audio download');
        await downloadStream(audioStream, tempDir + audioFileName);
        console.log('Audio downloaded');
    }

    //video download
    let videoFileName: string = '';
    if (videoFormat) {
        videoFileName = 'video_' + title + '.' + videoFormat.container;
        const videoStream = ytdl.downloadFromInfo(info, { format: videoFormat });
        videoStream.on('progress', (_, segmentsDownloaded: number, segments: number) => {
            //progressBar.redrawProgressBar((segmentsDownloaded / segments) * 100, 'Video download');
            console.log('Current progress: ' + (segmentsDownloaded / segments) * 100 + '%');
        });
        console.log();
        //progressBar.drawProgressBar(0, 'Video download');
        await downloadStream(videoStream, tempDir + videoFileName);
        console.log('Video downloaded');
    }
    //return { audioFileName, videoFileName };
}

const convertFiles = (query: ffmpeg.FfmpegCommand): Promise<void> => {
    return new Promise(resolve => {
        query.on('end', () => {
            //progressBar.redrawProgressBar(100, 'Converting file');
            resolve();
        });
        query.run();
    })
}

const convert = async (info: ytdl.videoInfo, audioFormat: ytdl.videoFormat | null, videoFormat: ytdl.videoFormat | null, audioFileName: string, videoFileName: string, selectedFormat: string) => {
    const title: string = (info.videoDetails.title).replace(/[\<\>\:\"\/\\\/\|\?\*]/g, '_');
    
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
            console.log();
            console.log('Processing started!');
            //progressBar.drawProgressBar(0, 'Converting file');
        });
        query.on('progress', progress => {
            //progressBar.redrawProgressBar(progress.percent, 'Converting file');
            console.log('Current progress: ' + progress.percent + '%');
        });
        await convertFiles(query);
        console.log('Processing complete');
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
            console.log();
            console.log('Processing started!');
            //progressBar.drawProgressBar(0, 'Converting file');
        });
        query.on('progress', progress => {
            console.log('Current progress: ' + progress.percent + '%');
            //progressBar.redrawProgressBar(progress.percent, 'Converting file');
        });
        await convertFiles(query);
        console.log();
        console.log('Processing complete');
    }
}

export default { getInfo, download, convert };