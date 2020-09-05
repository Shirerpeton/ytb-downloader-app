interface AppConfig {
    [string]: any,
    audioFormats: string[],
    videoFormats: string[],
    defaultAudioFormat: string,
    defaultVideoFormat: string,
    onlyAudio: boolean,
    highestQuality: boolean
}

export default AppConfig;