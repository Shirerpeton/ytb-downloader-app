import ytdl from 'ytdl-core'

import { AppConfig, AudioQualityLabel, VideoQualityLabel, YtbVideoInfo } from "../types/types.js";

const audioQualityText = (quality: string): string => {
  switch (quality) {
    case ('AUDIO_QUALITY_HIGH'):
      return 'high';
    case ('AUDIO_QUALITY_MEDIUM'):
      return 'medium';
    case ('AUDIO_QUALITY_LOW'):
      return 'low';
    default:
      return 'unknown';
  }
}

const lengthIntoText = (totalSecondsString: string): string => {
  const secondsNumber: number = Number(totalSecondsString);
  const hours: number = Math.floor(secondsNumber / 3600);
  const hoursString: string = ((hours < 10) ? '0' : '') + String(hours);
  const minutes: number = Math.floor((secondsNumber - (hours * 3600)) / 60);
  const minutesString: string = ((minutes < 10) ? '0' : '') + String(minutes);
  const seconds: number = Math.floor(secondsNumber % 60);
  const secondsString: string = ((seconds < 10) ? '0' : '') + String(seconds);
  return `${hoursString}:${minutesString}:${secondsString}`;
}

const stringOrUndefined = (str: string | undefined): string => {
  return str ? str : 'unknown';
}

const numberOrUndefined = (nbr: number | undefined): string => {
  return nbr ? String(nbr) : 'unknown';
}

const getAudioFormatNames = (ytbVideoInfo: YtbVideoInfo): string[] => {
  if (!ytbVideoInfo)
    return [];
  const audioFormatsNames: string[] = ['0: None', ...ytbVideoInfo.audioFormats.map((format: ytdl.videoFormat, ind: number) => `${String(ind + 1)}: audio bitrate: ${numberOrUndefined(format.audioBitrate)}; audio quality: ${audioQualityText(stringOrUndefined(format.audioQuality))}; audioChannels: ${numberOrUndefined(format.audioChannels)}; approximate size: ${Math.floor((Number(format.averageBitrate) / 1000))}mb`)];
  return audioFormatsNames;
}

const getVideoFormatNames = (ytbVideoInfo: YtbVideoInfo): string[] => {
  if (!ytbVideoInfo)
    return [];
  const videoFormatsNames: string[] = ['0: None', ...ytbVideoInfo.videoFormats.map((format: ytdl.videoFormat, ind: number) => `${String(ind + 1)}: video bitrate: ${format.bitrate}; width: ${numberOrUndefined(format.width)}; height: ${numberOrUndefined(format.height)}; fps: ${numberOrUndefined(format.fps)}; quality: ${format.quality}; approximate size: ${Math.floor((Number(format.averageBitrate) / 1000))}mb`)];
  return videoFormatsNames;
}

const getAudioFormats = (formats: ytdl.videoFormat[]) => {
  return ytdl.filterFormats(formats, 'audioonly');
}

const getVideoFormats = (formats: ytdl.videoFormat[]) => {
  return ytdl.filterFormats(formats, 'videoonly');
}

const getFromatByQuality = (formats: ytdl.videoFormat[], quality: string): number => {
  return formats.indexOf(ytdl.chooseFormat(formats, { quality }));
}

const getFormatIndex = (formats: ytdl.videoFormat[], format: ytdl.videoFormat): number => {
  return formats.indexOf(format);
}

const getDefaultFormats = (audioFormats: ytdl.videoFormat[], videoFormats: ytdl.videoFormat[], config: AppConfig): { audioFormat: number, videoFormat: number } => {
  let audioFormat: number = 0, videoFormat: number = 0;
  if (config.audioQuality.length !== 0) {
    const format: ytdl.videoFormat | null = config.audioQuality.reduce((accumulatorFormat: ytdl.videoFormat | null, label: AudioQualityLabel) => {
      let newAccumulatorFormat: ytdl.videoFormat | null = null;
      if (accumulatorFormat === null) {
        const filteredFormats: ytdl.videoFormat[] = ytdl.filterFormats(audioFormats, (format => (format.audioBitrate !== null ? (format.audioBitrate + 'kbps' === label) : false)));
        newAccumulatorFormat = filteredFormats.length !== 0 ? filteredFormats[0] : null;
      } else
        newAccumulatorFormat = accumulatorFormat
      return newAccumulatorFormat;
    }, null);
    audioFormat = format !== null ? getFormatIndex(audioFormats, format) + 1 : 0;
  }
  if (config.videoQuality.length !== 0) {
    const format: ytdl.videoFormat | null = config.videoQuality.reduce((accumulatorFormat: ytdl.videoFormat | null, label: VideoQualityLabel) => {
      let newAccumulatorFormat: ytdl.videoFormat | null = null;
      if (accumulatorFormat === null) {
        const filteredFormats: ytdl.videoFormat[] = ytdl.filterFormats(videoFormats, (format => format.qualityLabel === label));
        newAccumulatorFormat = filteredFormats.length !== 0 ? filteredFormats[0] : null;
      } else
        newAccumulatorFormat = accumulatorFormat
      return newAccumulatorFormat;
    }, null);
    videoFormat = format !== null ? getFormatIndex(videoFormats, format) + 1 : 0;
  }
  if (config.highestQuality) {
    audioFormat = getFromatByQuality(audioFormats, 'highestaudio') + 1;
    videoFormat = getFromatByQuality(videoFormats, 'highestvideo') + 1;;
  }
  if (config.noAudio)
    audioFormat = 0
  if (config.noVideo)
    videoFormat = 0;
  return { audioFormat, videoFormat };
}

export default { lengthIntoText, getAudioFormatNames, getVideoFormatNames, getAudioFormats, getVideoFormats, getFormatIndex, getDefaultFormats };