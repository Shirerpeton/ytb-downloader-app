import { videoInfo } from 'ytdl-core'

export interface AppConfig {
    [string]: any,
    audioFormats: string[],
    videoFormats: string[],
    defaultAudioFormat: string,
    defaultVideoFormat: string,
    onlyAudio: boolean,
    highestQuality: boolean
}

export interface YtbVideoInfo {
    info: ytdl.videoInfo,
    audioFormats: ytdl.videoFormat[],
    videoFormats: ytdl.videoFormat[]
}

export interface Messages {
    sendProgressMessage: (progress: number) => void,
    sendStatusMessage: (status: string) => void,
    sendErrorMessage: (error: string) => void
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
    extension: string
}