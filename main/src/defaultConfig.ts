import { AppConfig } from "../types/types";

const defaultConfig: AppConfig = {
  ffmpegPath: "./ffmpeg/bin/ffmpeg.exe",
  outputDir: './output/',
  defaultAudioFormat: 'mp3',
  defaultVideoFormat: 'mkv',
  videoFormats: ['mkv', 'mp4'],
  audioFormats: ['mp3', 'aac'],
  noVideo: false,
  noAudio: false,
  highestQuality: false,
  audioQuality: [],
  videoQuality: [],
  reencode: true
}

export default defaultConfig;