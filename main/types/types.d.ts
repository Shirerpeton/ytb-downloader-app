import { videoInfo } from 'ytdl-core'

export type AudioQualityLabel = '256kbps' | '160kbps' | '128kbps' | '64kbps' | '48kbps';
export type VideoQualityLabel =  '2160p60' | '2160p' | '1440p60' | '1440p' | '1080p60' | '1080p' | '720p60' | '720p' | '480p60' | '480p' | '360p60' | '360p' | '240p60' | '240p' | '144p60' | '144p';

export interface AppConfig {
    [string]: any,
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
    videoQuality: VideoQualityLabel[]
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
    status: 'wait' | 'processing' | 'done'
}