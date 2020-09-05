import React, { useEffect, useState } from 'react';
import styled from "styled-components";
import { IpcRenderer } from 'electron';
import { IpcRendererEvent } from 'electron/renderer';

interface BarProps {
    width: number,
    isActive: boolean
}

const Bar = styled.div<BarProps>`
    display: flex;
    justify-content: center;
    align-items: center;
    //margin: 1rem 0;
    border: 1px solid ${props => props.isActive ? props.theme.colors.borderSecondary : props.theme.colors.border};
    color: ${props => props.isActive ? props.theme.colors.primary : props.theme.colors.secondary};
    position: relative;
    height: 2rem;
    border-radius: 0.25rem;
    padding: 1rem;
    z-index: 1;
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
    ipcRenderer: IpcRenderer
}

const ProgressBar: React.FC<ProgressBarProps> = (props) => {
    const [isActive, setIsActive] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        props.ipcRenderer.on('progress-bar-progress', (_: IpcRendererEvent, data: number) => {
            setProgress(data);
        });
        props.ipcRenderer.on('progress-bar-toggle', (_: IpcRendererEvent, data: boolean) => {
            setIsActive(data);
        });

        return () => {
            props.ipcRenderer.removeAllListeners('progress-bar-progress');
            props.ipcRenderer.removeAllListeners('progress-bar-toggle');
        };
    }, [props.ipcRenderer]);

    return (
        <Bar width={progress} isActive={isActive}>{progress + '%'}</Bar>
    );
}

export default ProgressBar;