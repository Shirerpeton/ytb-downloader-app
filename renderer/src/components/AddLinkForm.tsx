import React, { useState } from 'react';
import styled from 'styled-components';
import ytdl from 'ytdl-core';
import { IpcRenderer } from 'electron';

import LinkInputComponent from './LinkInput';

import { AppConfig, Video } from '../../types/types.js';
import utils from '../utils';


const SubmitButton = styled.input`
  background-color: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.primary};
  font-size: 1.25rem;
  border-radius: 0.25rem;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
  padding: 0.5rem;
  &:focus {
    outline: none;
    border: 1px solid ${props => props.theme.colors.borderSecondary};
  }
`

const LinkForm = styled.form`
  display: flex;
  align-items: start;
  justify-content: center;
`

interface AddLinkFormProps {
    readonly link: string,
    readonly setLink: React.Dispatch<React.SetStateAction<string>>,
    readonly ipcRenderer: IpcRenderer,
    readonly config: AppConfig,
    readonly isGettingInfo: boolean,
    readonly setIsGettingInfo: React.Dispatch<React.SetStateAction<boolean>>,
    readonly setVideos: React.Dispatch<React.SetStateAction<Video[]>>,
    readonly videos: Video[]
}

const AddLinkForm: React.FC<AddLinkFormProps> = ({link, setLink, ipcRenderer, config, isGettingInfo, setIsGettingInfo, setVideos, videos}: AddLinkFormProps) => {

    const [error, setError] = useState<string>('');

    const handleSubmitInfo = async (event: React.SyntheticEvent): Promise<void> => {
        event.preventDefault();
        if (link === '') {
          setError('Provide url fot youtube video');
          return;
        }
        setIsGettingInfo(true);
        const infoOrNull: ytdl.videoInfo | null = await ipcRenderer.invoke('getInfo', link);
        if (infoOrNull === null)
            setError('Invalid url for youtube video');
        else {
            const videoIds: string[] = videos.map(video => video.info.videoDetails.videoId);
            if (videoIds.includes(infoOrNull.videoDetails.videoId)) {
                setError('Video is already on the list');
                setIsGettingInfo(false);
                return;
            }
            const audioFormats: ytdl.videoFormat[] = utils.getAudioFormats(infoOrNull.formats);
            const videoFormats: ytdl.videoFormat[] = utils.getVideoFormats(infoOrNull.formats);
            const {audioFormat, videoFormat} = utils.getDefaultFormats(audioFormats, videoFormats, config);
            const reencode: boolean = config.reencode;
            let extension: string = '';
            if (videoFormat !== 0)
                extension = config.defaultVideoFormat;
            else if (audioFormat !== 0)
                extension = config.defaultAudioFormat;
            if (extension !== '')
                setVideos(oldVideos => [...oldVideos, {info: infoOrNull, audioFormat, videoFormat, extension, audioFormats, videoFormats, status: 'wait', reencode}]);
            setLink('');
        }
        setIsGettingInfo(false);
    }

    return (
        <LinkForm onSubmit={handleSubmitInfo}>
            <LinkInputComponent  link={link} setLink={setLink} isGettingInfo={isGettingInfo} error={error} setError={setError} />
            <SubmitButton type='submit' value='Add' disabled={isGettingInfo} />
        </LinkForm>
    );
}

export default AddLinkForm;