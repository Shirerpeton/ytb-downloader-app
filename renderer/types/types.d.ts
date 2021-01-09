import ytdl from 'ytdl-core';

export type AudioQualityLabel = '256kbps' | '160kbps' | '128kbps' | '64kbps' | '48kbps';
export type VideoQualityLabel = '144p' | '144p 15fps' | '144p60 HDR' | '240p' | '240p60 HDR' | '270p' | '360p' | '360p60 HDR'
| '480p' | '480p60 HDR' | '720p' | '720p60' | '720p60 HDR' | '1080p' | '1080p60' | '1080p60 HDR' | '1440p'
| '1440p60' | '1440p60 HDR' | '2160p' | '2160p60' | '2160p60 HDR' | '4320p' | '4320p60';

export interface AppConfig {
    [string]: any, /* eslint-disable-line @typescript-eslint/no-explicit-any*/
    ffmpegPath: string,
    outputDir: string,
    audioFormats: string[],
    videoFormats: string[],
    defaultAudioFormat: string,
    defaultVideoFormat: string,
    noVideo: boolean,
    noAudio: boolean,
    highestQuality: boolean,
    audioQuality: AudioQualityLabel[],
    videoQuality: VideoQualityLabel[],
    reencode: boolean
}

export interface YtbVideoInfo {
    info: ytdl.videoInfo,
    audioFormats: ytdl.videoFormat[],
    videoFormats: ytdl.videoFormat[]
}

export interface Messages {
    sendProgressMessage: (progress: number) => void,
    sendStatusMessage: (status: string) => void,
    sendErrorMessage: (error: string) => void,
    sendProgressToggle: (toggle: boolean) => void
}

export interface FileType {
    extension: string,
    type: 'video' | 'audio'
}

export interface Video {
    info: videoInfo,
    audioFormats: ytdl.videoFormat[],
    videoFormats: ytdl.videoFormat[],
    audioFormat: number,
    videoFormat: number,
    extension: string,
    status: 'wait' | 'processing' | 'done',
    reencode: boolean
}