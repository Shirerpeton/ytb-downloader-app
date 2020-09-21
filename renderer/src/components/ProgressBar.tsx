import React, { useEffect, useState } from 'react';
import styled from "styled-components";
import { IpcRenderer } from 'electron';
import { IpcRendererEvent } from 'electron/renderer';

interface BarProps {
    width: number,
    isActive: boolean
}

const Bar = styled.div<BarProps>`
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid ${props => props.isActive ? props.theme.colors.borderSecondary : props.theme.colors.border};
    color: ${props => props.isActive ? props.theme.colors.primary : props.theme.colors.secondary};
    position: relative;
    height: 2rem;
    border-radius: 0.25rem;
    padding: 1rem;
    z-index: 1;
    margin: 0;
    &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 2rem;
        border-radius: 0.25rem;
        background-color: ${props => props.theme.colors.backgroundSecondary};
        width: ${props => props.width}%;
        z-index: -1;
    }
`

interface ProgressBarProps {
    ipcRenderer: IpcRenderer,
    index?: number
}

const ProgressBar: React.FC<ProgressBarProps> = ({ ipcRenderer, index }: ProgressBarProps) => {
    const [isActive, setIsActive] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        const progressChannel: string = index === undefined? 'progress-bar-progress' : 'progress-bar-progress-' + String(index);
        const toggleChannel: string = index === undefined? 'progress-bar-toggle' : 'progress-bar-toggle-' + String(index);
        ipcRenderer.on(progressChannel, (_: IpcRendererEvent, data: number) => {
            setProgress(data);
        });
        ipcRenderer.on(toggleChannel, (_: IpcRendererEvent, data: boolean) => {
            setIsActive(data);
        });

        return () => {
            ipcRenderer.removeAllListeners(progressChannel);
            ipcRenderer.removeAllListeners(toggleChannel);
        };
    }, [ipcRenderer, index]);

    return (
        <Bar width={progress} isActive={isActive}>{progress + '%'}</Bar>
    );
}

export default ProgressBar;