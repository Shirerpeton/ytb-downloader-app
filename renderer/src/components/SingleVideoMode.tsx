import React, { useState } from 'react';
import styled from 'styled-components';
import { AppConfig, FileType, YtbVideoInfo } from '../types';
import { IpcRenderer } from 'electron';
import ytdl from 'ytdl-core';

import utils from '../utils';


import LinkForm from './LinkForm'
import ProgressBar from './ProgressBar'
import StatusLine from './StatusLine'


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

interface SingleVideoModeProps {
    config: AppConfig,
    ipcRenderer: IpcRenderer,
    isProcessing: boolean,
    setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>
}

const SingleVideoMode: React.FC<SingleVideoModeProps> = (props) => {
    const [link, setLink] = useState<string>('');
    const [ytbVideoInfo, setYtbVideoInfo] = useState<YtbVideoInfo | null>(null);
    const [audioFormat, setAudioFormat] = useState<number>(0);
    const [videoFormat, setVideoFormat] = useState<number>(0);
    const [gettingInfo, setGettingInfo] = useState<boolean>(false);
    const [fileType, setFileType] = useState<FileType | null>(null);

    const selectTrack = (formatType: 'audio' | 'video'): ((newFormat: number) => void) => {
        const selectAudioTrack = (newAudioFormat: number) => {
            if (newAudioFormat === audioFormat) return;
            if (newAudioFormat === 0) {
                if (videoFormat === 0)
                    setFileType(null);
            } else {
                if ((audioFormat === 0) && (videoFormat === 0))
                    setFileType({ type: 'audio', extension: props.config.defaultAudioFormat });
            }
            setAudioFormat(newAudioFormat);
        };
        const selectVideoTrack = (newVideoFormat: number): void => {
            if (newVideoFormat === videoFormat) return;
            if (newVideoFormat === 0) {
                if (audioFormat === 0)
                    setFileType(null);
                else
                    setFileType({ type: 'audio', extension: props.config.defaultAudioFormat });
            } else {
                if (videoFormat === 0)
                    setFileType({ type: 'video', extension: props.config.defaultVideoFormat });
            }
            setVideoFormat(newVideoFormat);
        };
        return formatType === 'audio' ? selectAudioTrack : selectVideoTrack;
    };

    const startProcessing = async (): Promise<void> => {
        if (ytbVideoInfo === null)
            return;
        const actualAudioFormat: ytdl.videoFormat = (audioFormat === 0) ? null : ytbVideoInfo.audioFormats[audioFormat - 1];
        const actualVideoFormat: ytdl.videoFormat = (videoFormat === 0) ? null : ytbVideoInfo.videoFormats[videoFormat - 1];
        if (fileType !== null) {
            props.setIsProcessing(true);
            await props.ipcRenderer.invoke('process', ytbVideoInfo.info, actualAudioFormat, actualVideoFormat, fileType.extension);
            props.setIsProcessing(false);
        }
    }

    return (
        <React.Fragment>
            <LinkForm link={link} setLink={setLink} gettingInfo={gettingInfo} setGettingInfo={setGettingInfo} setYtbVideoInfo={setYtbVideoInfo} ipcRenderer={props.ipcRenderer} config={props.config} selectTrack={selectTrack} isProcessing={props.isProcessing}/>
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
                    <Selector value={audioFormat} onChange={event => { if (!props.isProcessing) selectTrack('audio')(Number(event.target.value)) }} disabled={props.isProcessing}>
                        {ytbVideoInfo ? utils.getAudioFormatNames(ytbVideoInfo).map((format: string, index: number) => <option value={index} key={index}>{format}</option>) : null}
                    </Selector>
                </SelectRow>
                <SelectRow>
                    <SmallLabel>Video Track:</SmallLabel>
                    <Selector value={videoFormat} onChange={event => { if (!props.isProcessing) selectTrack('video')(Number(event.target.value)) }} disabled={props.isProcessing}>
                        {ytbVideoInfo ? utils.getVideoFormatNames(ytbVideoInfo).map((format: string, index: number) => <option value={index} key={index}>{format}</option>) : null}
                    </Selector>
                </SelectRow>
            </Section>
            <Br />
            <Section>
                <SectionTitle>Convert</SectionTitle>
                <SelectRow>
                    <SmallLabel>Format: </SmallLabel>
                    <Selector value={fileType ? fileType.extension : ''} onChange={({ target: { value } }) => { if (!props.isProcessing) setFileType(oldFileType => oldFileType ? { type: oldFileType.type, extension: value } : null) }} disabled={props.isProcessing}>
                        {ytbVideoInfo && fileType ?
                            (fileType.type === 'video' ?
                                props.config.videoFormats.map((format: string, index: number) => <option value={format} key={index}>{format}</option>) :
                                props.config.audioFormats.map((format: string, index: number) => <option value={format} key={index}>{format}</option>))
                            : null}
                    </Selector>
                </SelectRow>
                <ProgressBar ipcRenderer={props.ipcRenderer} />
                <StatusLine ipcRenderer={props.ipcRenderer} />
                <Start onClick={startProcessing} disabled={props.isProcessing}>Start</Start>
            </Section>
        </React.Fragment>
    );
}

export default SingleVideoMode;