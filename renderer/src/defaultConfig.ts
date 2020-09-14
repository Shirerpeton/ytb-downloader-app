import { AppConfig } from "../types/types";

const defaultConfig: AppConfig = {
  ffmpegPath: "./ffmpeg/bin/ffmpeg.exe",
  outputDir: './output/',
  defaultAudioFormat: 'mp3',
  defaultVideoFormat: 'mkv',
  videoFormats: ['mkv', 'mp4'],
  audioFormats: ['mp3', 'aac'],
  highestQuality: false,
  noVideo: false,
  noAudio: false
}

export default defaultConfig;