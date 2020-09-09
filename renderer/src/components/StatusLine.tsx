import React, { useEffect, useState } from 'react';
import styled from "styled-components";
import { IpcRenderer } from 'electron';
import { IpcRendererEvent } from 'electron/renderer';

const Status = styled.div`
    display: flex;
    justify-content: center;
    align-content: center;
    color: ${props => props.theme.colors.primary};
    //margin: 1rem 0;
`

interface StatusLineProps {
    ipcRenderer: IpcRenderer,
    index?: number
}

const StatusLine: React.FC<StatusLineProps> = (props) => {
    const [status, setStatus] = useState<string>('---');

    useEffect(() => {
        const messageChannel: string = props.index === undefined ? 'status-line-message' : 'status-line-message-' + String(props.index);
        props.ipcRenderer.on(messageChannel, (_: IpcRendererEvent, status: string) => {
            setStatus(status);
        });

        return () => {
            props.ipcRenderer.removeAllListeners(messageChannel);
        };
    }, [props.ipcRenderer, props.index]);

    return (
        <Status>{status}</Status>
    );
}

export default StatusLine;