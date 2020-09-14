import React, { useState, useEffect } from 'react';
import { IpcRenderer } from 'electron';
import styled from 'styled-components';

import ErrorMessage from './components/ErrorMessage'
import SingleVideoMode from './components/SingleVideoMode'
import BatchMode from './components/BatchMode'

import { AppConfig } from './types';

const electron = window.require('electron');  // require electron like this in all the files. Don't Use import from 'electron' syntax for importing IpcRender from electron.

const AppContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${props => props.theme.colors.primary};
  background-color: ${props => props.theme.colors.background};
`
const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
`
const Controls = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  width: 100%;
`
const ModeButtons = styled.div`
  border: 1px solid ${props => props.theme.colors.border};
  border-top-right-radius: 0.25rem;
  border-top-left-radius: 0.25rem;
`

interface ModeButtonProps {
  selected: boolean
}
const ModeButton = styled.button<ModeButtonProps>`
  background-color: ${props => props.selected ? props.theme.colors.backgroundSecondary : props.theme.colors.background};
  border: none;
  color: ${props => props.selected ? props.theme.colors.primary : props.theme.colors.secondary};
  padding: 0.5rem;
  &:focus {
    outline: none;
  }
`
const ModeContainer = styled.div`
  width: 95vw;
  padding: 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.5rem;
  border-top-right-radius: 0;
`

const ipcRenderer: IpcRenderer = electron.ipcRenderer;

const defaultConfig: AppConfig = {
  defaultAudioFormat: 'mp3',
  defaultVideoFormat: 'mkv',
  videoFormats: ['mkv', 'mp4'],
  audioFormats: ['mp3', 'aac'],
  highestQuality: false,
  noVideo: false,
  noAudio: false
}

type Mode = 'single' | 'batch';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('single');
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isGettingInfo, setIsGettingInfo] = useState<boolean>(false);

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

  return (
    <AppContainer className="App">
      <ErrorMessage ipcRenderer={ipcRenderer} />
      <ControlsContainer>
        <Controls>
          <ModeButtons>
            <ModeButton onClick={() => { if (!isGettingInfo && !isProcessing) setMode('single') }} selected={mode === 'single'} disabled={isGettingInfo || isProcessing}>Single Video Mode</ModeButton>
            <ModeButton onClick={() => { if (!isGettingInfo && !isProcessing) setMode('batch') }} selected={mode === 'batch'} disabled={isGettingInfo || isProcessing}>Batch Mode</ModeButton>
          </ModeButtons>
        </Controls>
        <ModeContainer>
          {(mode === 'single')?
            <SingleVideoMode config={config} ipcRenderer={ipcRenderer} isGettingInfo={isGettingInfo} setIsGettingInfo={setIsGettingInfo} isProcessing={isProcessing} setIsProcessing={setIsProcessing}/>
            :
            <BatchMode config={config} ipcRenderer={ipcRenderer} isGettingInfo={isGettingInfo} setIsGettingInfo={setIsGettingInfo} isProcessing={isProcessing} setIsProcessing={setIsProcessing}/>}
        </ModeContainer>
      </ControlsContainer>
    </AppContainer>
  );
}

export default App;
