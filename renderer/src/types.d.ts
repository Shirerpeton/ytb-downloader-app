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
