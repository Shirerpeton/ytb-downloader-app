export interface AppConfig {
    [string]: any,
    audioFormats: string[],
    videoFormats: string[],
    defaultAudioFormat: string,
    defaultVideoFormat: string,
    noVideo: boolean,
    noAudio: boolean,
    highestQuality: boolean
}

export interface Messages {
    sendProgressMessage: (progress: number) => void,
    sendStatusMessage: (status: string) => void,
    sendErrorMessage: (error: string) => void,
    sendProgressToggle: (toggle: boolean) => void
}