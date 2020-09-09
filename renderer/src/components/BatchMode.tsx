import React, { useState } from 'react'
import styled from 'styled-components'
import { AppConfig, Video } from '../types';
import { IpcRenderer } from 'electron';
import ytdl from 'ytdl-core';

import AddLinkForm from './AddLinkForm'
import StatusLine from './StatusLine'
import ProgressBar from './ProgressBar';

const VideoList = styled.div`
    //overflow: scroll;
    border-radius: 0.25rem;
    border: 1px solid ${props => props.theme.colors.border};
    height:  70vh;
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
`
const Br = styled.div`
  margin: 1rem;
  border-top: 1px solid ${props => props.theme.colors.border};
`

const CenterDiv = styled.div`
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
`

const Row = styled.div`
    display: flex;
    align-items: stretch;
    justify-content: start;
    border-bottom: 1px solid ${props => props.theme.colors.border};
`
const Title = styled(CenterDiv)`
    width: 40%;
    max-width: 40%;
    border-right: 1px solid ${props => props.theme.colors.border};
`
const Status = styled(CenterDiv)`
    width: 20%;
    max-width: 20%;
    border-right: 1px solid ${props => props.theme.colors.border};
`
const Progress = styled(CenterDiv)`
    width: 40%;
    max-width: 40%;
`
const Start = styled.button`
  display: inline-block;
  width: 100%;
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

interface BatchModeProps {
    config: AppConfig,
    ipcRenderer: IpcRenderer,
    isBlocked: boolean,
    setIsBlocked: React.Dispatch<React.SetStateAction<boolean>>
}

const BatchMode: React.FC<BatchModeProps> = (props) => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [link, setLink] = useState<string>('');

    const startProcessing = async (): Promise<void> => {
        if (videos.length === 0)
            return;
        props.setIsBlocked(true);
        Promise.all(videos.map((video, index): Promise<void> => {
            const actualAudioFormat: ytdl.videoFormat = (video.audioFormat === 0) ? null : video.audioFormats[video.audioFormat - 1];
            const actualVideoFormat: ytdl.videoFormat = (video.videoFormat === 0) ? null : video.videoFormats[video.videoFormat - 1];
            return props.ipcRenderer.invoke('process', video.info, actualAudioFormat, actualVideoFormat, video.extension, index);
        }));
        props.setIsBlocked(false);

    }

    return (
        <React.Fragment>
            <VideoList>
                <Row>
                    <Title>Video title</Title>
                    <Status>Status</Status>
                    <Progress>Progress</Progress>
                </Row>
                {videos.map((video, index) => (<Row key={index}>
                    <Title>{video.info.videoDetails.title}</Title>
                    <Status>
                        <StatusLine ipcRenderer={props.ipcRenderer} index={index} />
                    </Status>
                    <Progress>
                        <ProgressBar ipcRenderer={props.ipcRenderer} index={index} />
                    </Progress>
                </Row>))}
            </VideoList>
            <AddLinkForm ipcRenderer={props.ipcRenderer} config={props.config} link={link} setLink={setLink} isBlocked={props.isBlocked} setIsBlocked={props.setIsBlocked} setVideos={setVideos} videos={videos} />
            <Br />
            <Start onClick={startProcessing} disabled={props.isBlocked}>Start</Start>
        </React.Fragment>
    );
}

export default BatchMode;