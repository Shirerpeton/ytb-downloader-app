import React, { useState } from 'react';
import styled from 'styled-components';
import { IpcRenderer } from 'electron';
import ytdl from 'ytdl-core';

import { AppConfig, FileType, YtbVideoInfo } from '../../types/types.js';
import utils from '../utils';

import LinkForm from './LinkForm'
import ProgressBar from './ProgressBar'
import StatusLine from './StatusLine'


const SectionTitle = styled.h3`
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
  font-size: 1rem;
  border-radius: 0.25rem;
  padding: 0.5rem;
  &:focus {
    outline: none;
    border: 1px solid ${props => props.theme.colors.borderSecondary};
  }
`
const Space = styled.div`
    height: 1rem;
`

interface SingleVideoModeProps {
    config: AppConfig,
    ipcRenderer: IpcRenderer,
    isGettingInfo: boolean,
    setIsGettingInfo: React.Dispatch<React.SetStateAction<boolean>>,
    isProcessing: boolean,
    setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>
}

const SingleVideoMode: React.FC<SingleVideoModeProps> = (props) => {
    const [link, setLink] = useState<string>('');
    const [ytbVideoInfo, setYtbVideoInfo] = useState<YtbVideoInfo | null>(null);
    const [audioFormat, setAudioFormat] = useState<number>(0);
    const [videoFormat, setVideoFormat] = useState<number>(0);
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
        const actualAudioFormat: ytdl.videoFormat | null = (audioFormat === 0) ? null : ytbVideoInfo.audioFormats[audioFormat - 1];
        const actualVideoFormat: ytdl.videoFormat | null = (videoFormat === 0) ? null : ytbVideoInfo.videoFormats[videoFormat - 1];
        if (fileType !== null) {
            props.setIsProcessing(true);
            await props.ipcRenderer.invoke('process', ytbVideoInfo.info, actualAudioFormat, actualVideoFormat, fileType.extension, props.config);
            props.setIsProcessing(false);
        }
    }

    return (
        <React.Fragment>
            <LinkForm link={link} setLink={setLink} isGettingInfo={props.isGettingInfo} setIsGettingInfo={props.setIsGettingInfo} setYtbVideoInfo={setYtbVideoInfo} ipcRenderer={props.ipcRenderer} config={props.config} selectTrack={selectTrack}/>
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
                    <Selector value={audioFormat} onChange={event => { if (!props.isProcessing && !props.isGettingInfo) selectTrack('audio')(Number(event.target.value)) }} disabled={props.isProcessing || props.isGettingInfo}>
                        {ytbVideoInfo ? utils.getAudioFormatNames(ytbVideoInfo).map((format: string, index: number) => <option value={index} key={index}>{format}</option>) : null}
                    </Selector>
                </SelectRow>
                <SelectRow>
                    <SmallLabel>Video Track:</SmallLabel>
                    <Selector value={videoFormat} onChange={event => { if (!props.isProcessing && !props.isGettingInfo) selectTrack('video')(Number(event.target.value)) }} disabled={props.isProcessing || props.isGettingInfo}>
                        {ytbVideoInfo ? utils.getVideoFormatNames(ytbVideoInfo).map((format: string, index: number) => <option value={index} key={index}>{format}</option>) : null}
                    </Selector>
                </SelectRow>
            </Section>
            <Br />
            <Section>
                <SectionTitle>Convert</SectionTitle>
                <SelectRow>
                    <SmallLabel>Format: </SmallLabel>
                    <Selector value={fileType ? fileType.extension : ''} onChange={({ target: { value } }) => { if (!props.isProcessing && !props.isGettingInfo) setFileType(oldFileType => oldFileType ? { type: oldFileType.type, extension: value } : null) }} disabled={props.isProcessing || props.isGettingInfo}>
                        {ytbVideoInfo && fileType ?
                            (fileType.type === 'video' ?
                                props.config.videoFormats.map((format: string, index: number) => <option value={format} key={index}>{format}</option>) :
                                props.config.audioFormats.map((format: string, index: number) => <option value={format} key={index}>{format}</option>))
                            : null}
                    </Selector>
                </SelectRow>
                <ProgressBar ipcRenderer={props.ipcRenderer} />
                <Space />
                <StatusLine ipcRenderer={props.ipcRenderer} />
                <Space />
                <Start onClick={startProcessing} disabled={props.isProcessing || props.isGettingInfo}>Start</Start>
            </Section>
        </React.Fragment>
    );
}

export default SingleVideoMode;