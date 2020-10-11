import React, { useEffect, useState } from 'react';
import styled from "styled-components";
import { IpcRenderer } from 'electron';
import { IpcRendererEvent } from 'electron/renderer';

const Status = styled.div`
    display: flex;
    justify-content: center;
    align-content: center;
    color: ${props => props.theme.colors.primary};
`

interface StatusLineProps {
    readonly ipcRenderer: IpcRenderer,
    readonly index?: number
}

const StatusLine: React.FC<StatusLineProps> = ({ipcRenderer, index}: StatusLineProps) => {
    const [status, setStatus] = useState<string>('---');

    useEffect(() => {
        const messageChannel: string = index === undefined ? 'status-line-message' : 'status-line-message-' + String(index);
        ipcRenderer.on(messageChannel, (_: IpcRendererEvent, status: string) => {
            setStatus(status);
        });

        return () => {
            ipcRenderer.removeAllListeners(messageChannel);
        };
    }, [ipcRenderer, index]);

    return (
        <Status>{status}</Status>
    );
}

export default StatusLine;