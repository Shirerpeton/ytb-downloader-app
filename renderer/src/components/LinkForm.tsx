import React, { useState } from 'react';
import styled from 'styled-components';
import ytdl from 'ytdl-core'
import { IpcRenderer } from 'electron';
import { YtbVideoInfo, AppConfig } from '../types';

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

interface LinkFormProps {
  readonly link: string,
  readonly setLink: React.Dispatch<React.SetStateAction<string>>,
  readonly gettingInfo: boolean,
  readonly setGettingInfo: React.Dispatch<React.SetStateAction<boolean>>,
  readonly setYtbVideoInfo: React.Dispatch<React.SetStateAction<YtbVideoInfo | null>>,
  readonly ipcRenderer: IpcRenderer,
  readonly config: AppConfig,
  readonly selectTrack: (formatType: 'audio' | 'video') => (newFormat: number) => void,
  readonly isProcessing: boolean
}

const LinkFormComponent: React.FC<LinkFormProps> = (props: LinkFormProps) => {

  const [error, setError] = useState<string>('');

  const handleSubmitInfo = async (event: React.SyntheticEvent): Promise<void> => {
    event.preventDefault();
    props.setGettingInfo(true);
    const infoOrNull: ytdl.videoInfo | null = await props.ipcRenderer.invoke('getInfo', props.link);
    if (infoOrNull === null)
      setError('Invalid url for youtube video');
    else {
      props.setYtbVideoInfo({ info: infoOrNull, audioFormats: ytdl.filterFormats(infoOrNull.formats, 'audioonly'), videoFormats: ytdl.filterFormats(infoOrNull.formats, 'videoonly') });
      if (props.config.highestQuality && props.config.onlyAudio)
        props.selectTrack('audio')(1);
      else {
        if (props.config.highestQuality) {
          props.selectTrack('audio')(1);
          props.selectTrack('video')(1);
        }
      }

    }
    props.setGettingInfo(false);
  }

  return (
    <LinkForm onSubmit={handleSubmitInfo}>
      <LinkInputContainer>
        <LinkInput type='text' id='link' value={props.link} onChange={(event) => { if (!props.gettingInfo) setError(''); props.setLink(event.target.value); }} gettingInfo={props.gettingInfo} error={error} required placeholder='Youtube link' />
        {error !== '' ? <Error>{error}</Error> : null}
      </LinkInputContainer>
      <SubmitButton type='submit' value='Get info' disabled={props.isProcessing}/>
    </LinkForm>
  );
}

export default LinkFormComponent;