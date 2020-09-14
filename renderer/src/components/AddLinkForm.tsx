import React, { useState } from 'react';
import styled from 'styled-components';
import ytdl from 'ytdl-core'
import { IpcRenderer } from 'electron';

import { AppConfig, Video } from '../../types/types.js';
import utils from '../utils';

interface LinkInputProps {
    readonly gettingInfo: boolean,
    readonly error: string
};

const LinkInput = styled.input<LinkInputProps>`
  padding: 0.50rem;
  background-color: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => !props.gettingInfo ? props.theme.colors.primary : props.theme.colors.secondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.25rem;
  width: 25rem;
  margin-right: 1rem;
  font-size: 1.25rem;
  ${props => props.error !== '' ?
        'border: 1px solid' + props.theme.colors.error + '};'
        :
        null}
  &:focus {
    outline: none;
    border: 1px solid ${props => props.theme.colors.borderSecondary};
  }
  &:after {
    content: ${props => props.error};
  }
`

const Error = styled.span`
    color: ${props => props.theme.colors.error};
`

const SubmitButton = styled.input`
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

const LinkForm = styled.form`
  display: flex;
  align-items: start;
  justify-content: center;
`

const LinkInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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

const AddLinkForm: React.FC<AddLinkFormProps> = (props) => {

    const [error, setError] = useState<string>('');

    const handleSubmitInfo = async (event: React.SyntheticEvent): Promise<void> => {
        event.preventDefault();
        props.setIsGettingInfo(true);
        const infoOrNull: ytdl.videoInfo | null = await props.ipcRenderer.invoke('getInfo', props.link);
        if (infoOrNull === null)
            setError('Invalid url for youtube video');
        else {
            const videoIds: string[] = props.videos.map(video => video.info.videoDetails.videoId);
            if (videoIds.includes(infoOrNull.videoDetails.videoId)) {
                setError('Video is already on the list');
                props.setIsGettingInfo(false);
                return;
            }
            const audioFormats: ytdl.videoFormat[] = utils.getAudioFormats(infoOrNull.formats);
            const videoFormats: ytdl.videoFormat[] = utils.getVideoFormats(infoOrNull.formats);
            const {audioFormat, videoFormat} = utils.getDefaultFormats(audioFormats, videoFormats, props.config);
            let extension: string = '';
            if (videoFormat !== 0)
                extension = props.config.defaultVideoFormat;
            else if (audioFormat !== 0)
                extension = props.config.defaultAudioFormat;
            if (extension !== '')
                props.setVideos(oldVideos => [...oldVideos, {info: infoOrNull, audioFormat, videoFormat, extension, audioFormats, videoFormats, status: 'wait'}]);
        }
        props.setIsGettingInfo(false);
    }

    return (
        <LinkForm onSubmit={handleSubmitInfo}>
            <LinkInputContainer>
                <LinkInput type='text' id='link' value={props.link} onChange={(event) => { if (!props.isGettingInfo) setError(''); props.setLink(event.target.value); }} gettingInfo={props.isGettingInfo} error={error} required placeholder='Youtube link' />
                {error !== '' ? <Error>{error}</Error> : null}
            </LinkInputContainer>
            <SubmitButton type='submit' value='Add' disabled={props.isGettingInfo} />
        </LinkForm>
    );
}

export default AddLinkForm;