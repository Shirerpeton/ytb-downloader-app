import React, { useState, useEffect } from 'react';
import ytdl from 'ytdl-core';
import { IpcRenderer } from 'electron';
//import { IpcRendererEvent } from 'electron/main';
import styled from 'styled-components';

import utils from './utils'

import LinkForm from './components/LinkForm'
import ProgressBar from './components/ProgressBar'
import StatusLine from './components/StatusLine'
import ErrorMessage from './components/ErrorMessage'

import AppConfig from './types';

const electron = window.require('electron');  // require electron like this in all the files. Don't Use import from 'electron' syntax for importing IpcRender from electron.

const AppContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: ${props => props.theme.colors.primary};
    background-color: ${props => props.theme.colors.background};
`

const Container = styled.div`
  width: 95vw;
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.5rem;
`

const SectionTitle = styled.h2`
  text-align: center;
  margin: 0;
  margin-bottom: 1rem;
`

const Section = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 1rem;
`

const Br = styled.div`
  margin: 1rem;
  border-top: 1px solid ${props => props.theme.colors.border};
`

const SmallLabel = styled.span`
  font-weight: bold;
  margin-right: 0.5rem;
`

const Selector = styled.select`
  margin: 0;
  width: 80%;
  padding: 0.25rem;
  background-color: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.5rem;
  &:focus {
    outline: none;
  }
`

const SelectRow = styled.div`
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const Start = styled.button`
  display: inline-block;
  background-color: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.primary};
  font-size: 1.25rem;
  border-radius: 0.25rem;
  padding: 0.5rem;
  &:focus {
    outline: none;
    border: 1px solid ${props => props.theme.colors.borderSecondary};
  }
`

const ipcRenderer: IpcRenderer = electron.ipcRenderer;

interface ytbVideoInfo {
  info: ytdl.videoInfo,
  audioFormats: ytdl.videoFormat[],
  videoFormats: ytdl.videoFormat[]
}

interface fileType {
  extension: string,
  type: 'video' | 'audio'
}

const defaultConfig = {
  defaultAudioFormat: 'mp3',
  defaultVideoFormat: 'mkv',
  videoFormats: ['mkv', 'mp4'],
  audioFormats: ['mp3', 'aac'],
  highestQuality: false,
  onlyAudio: false
}

const App: React.FC = () => {
  const [link, setLink] = useState<string>('');
  const [audioFormat, setAudioFormat] = useState<number>(0);
  const [videoFormat, setVideoFormat] = useState<number>(0);
  const [gettingInfo, setGettingInfo] = useState<boolean>(false);
  const [fileType, setFileType] = useState<fileType | null>(null);
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [ytbVideoInfo, setYtbVideoInfo] = useState<ytbVideoInfo | null>(null);

  useEffect(() => {
    const detectFfmpeg = async (): Promise<boolean> => {
      return await ipcRenderer.invoke('detectFfmpeg');
    }
    const getConfig = async (): Promise<void> => {
      const newConfig: AppConfig = await ipcRenderer.invoke('getConfig');
      setConfig(newConfig);
    }
    getConfig();
    detectFfmpeg();
  }, []);

  const handleSubmitInfo = async (event: React.SyntheticEvent): Promise<void> => {
    event.preventDefault();
    setGettingInfo(true);
    const infoOrNull: ytdl.videoInfo | null = await ipcRenderer.invoke('getInfo', link);
    if (infoOrNull === null)
      console.log('Invalid url for youtube video');
    else {
      setYtbVideoInfo({ info: infoOrNull, audioFormats: ytdl.filterFormats(infoOrNull.formats, 'audioonly'), videoFormats: ytdl.filterFormats(infoOrNull.formats, 'videoonly') });
      if (config.highestQuality && config.onlyAudio)
        selectTrack('audio')(1);
      else {
        if (config.highestQuality) {
          selectTrack('audio')(1);
          selectTrack('video')(1);
        }
      }

    }
    setGettingInfo(false);
  }

  const getAudioFormatNames = (): string[] => {
    if (!ytbVideoInfo)
      return [];
    const audioFormatsNames: string[] = ['0: None', ...ytbVideoInfo.audioFormats.map((format, ind) => `${String(ind + 1)}: audio bitrate: ${utils.numberOrUndefined(format.audioBitrate)}; audio quality: ${utils.audioQualityText(utils.stringOrUndefined(format.audioQuality))}; audioChannels: ${utils.numberOrUndefined(format.audioChannels)}; approximate size: ${Math.floor((Number(format.averageBitrate) / 1000))}mb`)];
    return audioFormatsNames;
  }

  const getVideoFormatNames = (): string[] => {
    if (!ytbVideoInfo)
      return [];
    const videoFormatsNames: string[] = ['0: None', ...ytbVideoInfo.videoFormats.map((format, ind) => `${String(ind + 1)}: video bitrate: ${format.bitrate}; width: ${utils.numberOrUndefined(format.width)}; height: ${utils.numberOrUndefined(format.height)}; fps: ${utils.numberOrUndefined(format.fps)}; quality: ${format.quality}; approximate size: ${Math.floor((Number(format.averageBitrate) / 1000))}mb`)];
    return videoFormatsNames;
  }

  const selectTrack = (formatType: 'audio' | 'video'): ((newFormat: number) => void) => {
    const selectAudioTrack = (newAudioFormat: number) => {
      if (newAudioFormat === audioFormat) return;
      if (newAudioFormat === 0) {
        if (videoFormat === 0)
          setFileType(null);
      } else {
        if ((audioFormat === 0) && (videoFormat === 0))
          setFileType({ type: 'audio', extension: config.defaultAudioFormat });
      }
      setAudioFormat(newAudioFormat);
    };
    const selectVideoTrack = (newVideoFormat: number): void => {
      if (newVideoFormat === videoFormat) return;
      if (newVideoFormat === 0) {
        if (audioFormat === 0)
          setFileType(null);
        else
          setFileType({ type: 'audio', extension: config.defaultAudioFormat });
      } else {
        if (videoFormat === 0)
          setFileType({ type: 'video', extension: config.defaultVideoFormat });
      }
      setVideoFormat(newVideoFormat);
    };
    return formatType === 'audio' ? selectAudioTrack : selectVideoTrack;
  };

  const startProcessing = async (): Promise<void> => {
    if (ytbVideoInfo === null)
      return;
    const actualAudioFormat = (audioFormat === 0) ? null : ytbVideoInfo.audioFormats[audioFormat - 1];
    const actualVideoFormat = (videoFormat === 0) ? null : ytbVideoInfo.videoFormats[videoFormat - 1];
    if (fileType !== null)
      await ipcRenderer.invoke('process', ytbVideoInfo.info, actualAudioFormat, actualVideoFormat, fileType.extension);
  }

  return (
    <AppContainer className="App">
      <ErrorMessage ipcRenderer={ipcRenderer}/>
      <Container>
        <LinkForm handleSubmitInfo={handleSubmitInfo} link={link} setLink={setLink} gettingInfo={gettingInfo} />
        <Br />
        <Section>
          <SectionTitle>Video Info</SectionTitle>
          <div><SmallLabel>Title:</SmallLabel> {ytbVideoInfo !== null ? ytbVideoInfo.info.videoDetails.title : ''}</div>
          <div><SmallLabel>Author:</SmallLabel> {ytbVideoInfo !== null ? ytbVideoInfo.info.videoDetails.author.name : ''}</div>
          <div><SmallLabel>Duration:</SmallLabel> {ytbVideoInfo !== null ? utils.lengthIntoText(ytbVideoInfo.info.videoDetails.lengthSeconds) : ''}</div>
        </Section>
        <Br />
        <Section>
          <SectionTitle>Track Selection</SectionTitle>
          <SelectRow>
            <SmallLabel>Audio Track:</SmallLabel>
            <Selector value={audioFormat} onChange={event => selectTrack('audio')(Number(event.target.value))}>
              {ytbVideoInfo ? getAudioFormatNames().map((format: string, index: number) => <option value={index} key={index}>{format}</option>) : null}
            </Selector>
          </SelectRow>
          <SelectRow>
            <SmallLabel>Video Track:</SmallLabel>
            <Selector value={videoFormat} onChange={event => selectTrack('video')(Number(event.target.value))}>
              {ytbVideoInfo ? getVideoFormatNames().map((format: string, index: number) => <option value={index} key={index}>{format}</option>) : null}
            </Selector>
          </SelectRow>
        </Section>
        <Br />
        <Section>
          <SectionTitle>Convert</SectionTitle>
          <SelectRow>
            <SmallLabel>Format: </SmallLabel>
            <Selector value={fileType ? fileType.extension : ''} onChange={({ target: { value } }) => { setFileType(oldFileType => oldFileType ? { type: oldFileType.type, extension: value } : null) }}>
              {ytbVideoInfo && fileType ?
                (fileType.type === 'video' ?
                  config.videoFormats.map((format: string, index: number) => <option value={format} key={index}>{format}</option>) :
                  config.audioFormats.map((format: string, index: number) => <option value={format} key={index}>{format}</option>))
                : null}
            </Selector>
          </SelectRow>
          <ProgressBar ipcRenderer={ipcRenderer} />
          <StatusLine ipcRenderer={ipcRenderer} />
          <Start onClick={startProcessing}>Start</Start>
        </Section>
      </Container>
    </AppContainer>
  );
}

export default App;
