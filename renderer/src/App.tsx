import React, {useState} from 'react';
import ytdl from 'ytdl-core';
import { IpcRenderer } from 'electron';
//import { IpcRendererEvent } from 'electron/main';
import styled, { createGlobalStyle, ThemeProvider, DefaultTheme } from 'styled-components'
const electron = window.require('electron');  // require electron like this in all the files. Don't Use import from 'electron' syntax for importing IpcRender from electron.

const GlobalStyle = createGlobalStyle`
  html,
  body {
    padding: 0;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
      Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    background-color: ${props => props.theme.colors.background};
    font-size: 1.1rem;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  * {
    box-sizing: border-box;
  }
`

const theme: DefaultTheme = {
  colors: {
    background: '#191a1d',
    backgroundSecondary: '#333437',
    primary: 'white',
    border: '#cccccc',
    borderSecondary: 'white'
  }
}

const AppContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: ${props => props.theme.colors.primary};
    background-color: ${props => props.theme.colors.background};
`


const Container = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.5rem;
`

const Label = styled.label`
  margin: 0;
  margin-right: 1rem;
  font-size: 1.5rem;
  padding: 0;
`

const LinkInput = styled.input`
  padding: 0.75rem;
  background-color: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.25rem;
  width: 25rem;
  margin-right: 1rem;
  font-size: 1rem;
  &:focus {
    outline: none;
    border: 1px solid ${props => props.theme.colors.borderSecondary};
  }
`

const SubmitButton = styled.input`
  background-color: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.primary};
  font-size: 1.25rem;
  border-radius: 0.25rem;
  padding: 0.5rem;
`

const LinkForm = styled.form`
  display: flex;
  align-items: center;
  justify-content: center;
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
`

let ipcRenderer: IpcRenderer = electron.ipcRenderer;

// ipcRenderer.on('response', (event: IpcRendererEvent, args: any) => {
//   console.log(args);
// })

const App: React.FC = () => {
  const [link, setLink] = useState<string>('');
  const [info, setInfo] = useState<ytdl.videoInfo | null>(null);
  const [audioFormats, setAudioFormats] = useState<ytdl.videoFormat[] | null>(null);
  const [videoFormats, setVideoFormats] = useState<ytdl.videoFormat[] | null>(null);
  const [audioFormat, setAudioFormat] = useState<number>(0);
  const [videoFormat, setVideoFormat] = useState<number>(0);
  const [selectedFormat, setSelectedFormat] = useState<string>('');

  const config = {
    "defaultAudioFormat": "mp3",
    "defaultVideoFormat": "mkv",
    "videoFormats": ['mkv', 'mp4'],
    "audioFormats": ['mp3', 'aac']
  }

  const handleSubmitInfo = async (event: React.SyntheticEvent): Promise<void> => {
    event.preventDefault();
    const infoOrNull: ytdl.videoInfo | null = await ipcRenderer.invoke('getInfo', link);
    if (infoOrNull === null)
      console.log('Invalid url for youtube video');
    else {
      setInfo(infoOrNull);
      setAudioFormats(ytdl.filterFormats(infoOrNull.formats, 'audioonly'));
      setVideoFormats(ytdl.filterFormats(infoOrNull.formats, 'videoonly'));
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

  const audioQualityText = (quality: string): string => {
    switch (quality) {
      case ('AUDIO_QUALITY_HIGH'):
        return 'high';
        break;
      case ('AUDIO_QUALITY_MEDIUM'):
        return 'medium';
        break;
      case ('AUDIO_QUALITY_LOW'):
        return 'low';
        break;
      default:
        return 'unknown';
        break;
    }
  }

  const stringOrUndefined = (str: string | undefined): string => {
    return str ? str : 'unknown';
  }

  const numberOrUndefined = (nbr: number | undefined): string => {
    return nbr ? String(nbr) : 'unknown';
  }

  const getAudioFormatNames = (): string[] => {
    if (!audioFormats)
      return [];
    const audioFormatsNames: string[] = ['0: None', ...audioFormats.map((format, ind) => `${String(ind + 1)}: audio bitrate: ${numberOrUndefined(format.audioBitrate)}; audio quality: ${audioQualityText(stringOrUndefined(format.audioQuality))}; audioChannels: ${numberOrUndefined(format.audioChannels)}; approximate size: ${Math.floor((Number(format.averageBitrate) / 1000))}mb`)];
    return audioFormatsNames;
  }

  const getVideoFormatNames = (): string[] => {
    if (!videoFormats)
      return [];
    const videoFormatsNames: string[] = ['0: None', ...videoFormats.map((format, ind) => `${String(ind + 1)}: video bitrate: ${format.bitrate}; width: ${numberOrUndefined(format.width)}; height: ${numberOrUndefined(format.height)}; fps: ${numberOrUndefined(format.fps)}; quality: ${format.quality}; approximate size: ${Math.floor((Number(format.averageBitrate) / 1000))}mb`)];
    return videoFormatsNames;
  }

  const selectTrack = (formatType: 'audio' | 'video'): ((event: React.ChangeEvent<HTMLSelectElement>) => void) => {
    const selectAudioTrack = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newAudioFormat: number = Number(event.target.value);
      if (newAudioFormat === 0) {
        if (videoFormat === 0)
          setSelectedFormat('');
      }
      setAudioFormat(newAudioFormat);
    };
    const selectVideoTrack = (event: React.ChangeEvent<HTMLSelectElement>): void => {
      const newVideoFormat: number = Number(event.target.value);
      if (newVideoFormat === 0) {
        if (audioFormat === 0)
          setSelectedFormat('');
        else
          setSelectedFormat(config.defaultAudioFormat);
      }
      setVideoFormat(newVideoFormat);
    };
    return formatType === 'audio' ? selectAudioTrack : selectVideoTrack;
  };

  const startProcessing = async (): Promise<void> => {
    if ((info === null) || (audioFormats === null) || (videoFormats === null))
      return;
    console.log('here');
    const actualAudioFormat = (audioFormat === 0) ? null : audioFormats[audioFormat - 1];
    const actualVideoFormat = (videoFormat === 0) ? null : videoFormats[videoFormat - 1];
    if (selectedFormat !== '')
      await ipcRenderer.invoke('process', info, actualAudioFormat, actualVideoFormat, selectedFormat);
    //await ipcRenderer.invoke('convert', actualAudioFormat, actualVideoFormat, audioFileName, videoFileName);
  }

  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <AppContainer className="App">
          <Container>
            <LinkForm onSubmit={handleSubmitInfo}>
              <Label htmlFor='link'>Youtube link:</Label>
              <LinkInput type='text' id='link' value={link} onChange={(event) => { setLink(event.target.value) }} />
              <SubmitButton type='submit' value='Get info' />
            </LinkForm>
            <Br />
            <Section>
              <SectionTitle>Video Info</SectionTitle>
              <div><SmallLabel>Title:</SmallLabel> {info !== null ? info.videoDetails.title : ''}</div>
              <div><SmallLabel>Author:</SmallLabel> {info !== null ? info.videoDetails.author.name : ''}</div>
              <div><SmallLabel>Duration:</SmallLabel> {info !== null ? lengthIntoText(info.videoDetails.lengthSeconds) : ''}</div>
            </Section>
            <Br />
            <Section>
              <SectionTitle>Track Selection</SectionTitle>
              <SelectRow>
                <SmallLabel>Audio Track:</SmallLabel>
                <Selector onChange={selectTrack('audio')}>
                  {info ? getAudioFormatNames().map((format: string, index: number) => <option value={index} key={index}>{format}</option>) : null}
                </Selector>
              </SelectRow>
              <SelectRow>
                <SmallLabel>Video Track:</SmallLabel>
                <Selector onChange={selectTrack('video')}>
                  {info ? getVideoFormatNames().map((format: string, index: number) => <option value={index} key={index}>{format}</option>) : null}
                </Selector>
              </SelectRow>
            </Section>
            <Br />
            <Section>
              <SectionTitle>Convert</SectionTitle>
              <SelectRow>
                <SmallLabel>Format: </SmallLabel>
                <Selector value={selectedFormat} onChange={(event) => { setSelectedFormat(event.target.value) }}>
                  {info ? (videoFormat !== 0 ? config.videoFormats.map((format: string, index: number) => <option value={format} key={index}>{format}</option>) :
                    ((audioFormat !== 0) ? config.audioFormats.map((format: string, index: number) => <option value={format} key={index}>{format}</option>) : null)) : null}
                </Selector>
              </SelectRow>
              <Start onClick={startProcessing}>Start</Start>
            </Section>
          </Container>
        </AppContainer>
      </ThemeProvider>
    </React.Fragment>
  );
}

export default App;
