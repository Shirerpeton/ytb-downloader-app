import React, { useState } from 'react'
import styled from 'styled-components'

import { AppConfig, Video } from '../../types/types.js';
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
interface TitleProps {
    done?: boolean
}

const Title = styled(CenterDiv) <TitleProps>`
    width: 40%;
    max-width: 40%;
    border-right: 1px solid ${props => props.theme.colors.border};
    background-color: ${props => props.done ? props.theme.colors.backgroundSecondary : props.theme.colors.background};
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
    isGettingInfo: boolean,
    setIsGettingInfo: React.Dispatch<React.SetStateAction<boolean>>,
    isProcessing: boolean,
    setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>
}

const BatchMode: React.FC<BatchModeProps> = (props) => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [link, setLink] = useState<string>('');

    const startProcessing = async (): Promise<void> => {
        if (videos.length === 0)
            return;
        props.setIsProcessing(true);
        let processingIds: number[] = [];
        const promises: Promise<number>[] = (videos.map((video, index): Promise<number> | null=> {
            const actualAudioFormat: ytdl.videoFormat = (video.audioFormat === 0) ? null : video.audioFormats[video.audioFormat - 1];
            const actualVideoFormat: ytdl.videoFormat = (video.videoFormat === 0) ? null : video.videoFormats[video.videoFormat - 1];
            if (video.status === 'wait') {
                processingIds.push(index);
                return props.ipcRenderer.invoke('process', video.info, actualAudioFormat, actualVideoFormat, video.extension, props.config, index);
            } else return null;
        }).filter(elem => elem !== null) as unknown as Promise<number>[]);
        setVideos(oldVideos => oldVideos.map((video: Video): Video => ({ ...video, status: video.status === 'wait' ? 'processing' : video.status })));
        const processedIds: number[] = await Promise.all(promises);
        setVideos(oldVideos => oldVideos.map((video, index): Video => ({ ...video, status: (video.status === 'processing' && processedIds.includes(index) ? 'done' : video.status) })));
        props.setIsProcessing(false);
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
                    <Title done={video.status === 'done'}>{video.info.videoDetails.title}</Title>
                    <Status>
                        <StatusLine ipcRenderer={props.ipcRenderer} index={index} />
                    </Status>
                    <Progress>
                        <ProgressBar ipcRenderer={props.ipcRenderer} index={index} />
                    </Progress>
                </Row>))}
            </VideoList>
            <AddLinkForm ipcRenderer={props.ipcRenderer} config={props.config} link={link} setLink={setLink} isGettingInfo={props.isGettingInfo} setIsGettingInfo={props.setIsGettingInfo} setVideos={setVideos} videos={videos} />
            <Br />
            <Start onClick={startProcessing} disabled={props.isGettingInfo}>Start</Start>
        </React.Fragment>
    );
}

export default BatchMode;