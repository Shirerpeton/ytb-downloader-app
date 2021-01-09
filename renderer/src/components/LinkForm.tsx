import React, { useState } from 'react';
import styled from 'styled-components';
import ytdl from 'ytdl-core';
import { IpcRenderer } from 'electron';

import LinkInputComponent from './LinkInput';

import { YtbVideoInfo, AppConfig } from '../../types/types.js';
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
  margin: 0;
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

interface LinkFormProps {
  readonly link: string,
  readonly setLink: React.Dispatch<React.SetStateAction<string>>,
  readonly setYtbVideoInfo: React.Dispatch<React.SetStateAction<YtbVideoInfo | null>>,
  readonly ipcRenderer: IpcRenderer,
  readonly config: AppConfig,
  readonly selectTrack: (formatType: 'audio' | 'video') => (newFormat: number) => void,
  readonly setReencode: React.Dispatch<React.SetStateAction<boolean>>,
  readonly isGettingInfo: boolean,
  readonly setIsGettingInfo: React.Dispatch<React.SetStateAction<boolean>>,
}

const LinkFormComponent: React.FC<LinkFormProps> = ({ link, setLink, setYtbVideoInfo, ipcRenderer, config, selectTrack, setReencode, isGettingInfo, setIsGettingInfo }: LinkFormProps) => {

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
      const audioFormats: ytdl.videoFormat[] = utils.getAudioFormats(infoOrNull.formats);
      const videoFormats: ytdl.videoFormat[] = utils.getVideoFormats(infoOrNull.formats)
      setYtbVideoInfo({ info: infoOrNull, audioFormats, videoFormats });
      const { audioFormat, videoFormat } = utils.getDefaultFormats(audioFormats, videoFormats, config);
      selectTrack('audio')(audioFormat);
      selectTrack('video')(videoFormat);
      setReencode(config.reencode);
      setLink('');
    }
    setIsGettingInfo(false);
  }

  return (
    <LinkForm onSubmit={handleSubmitInfo}>
      <LinkInputComponent link={link} setLink={setLink} isGettingInfo={isGettingInfo} error={error} setError={setError} />
      <SubmitButton type='submit' value='Get info' disabled={isGettingInfo} />
    </LinkForm>
  );
}

export default LinkFormComponent;