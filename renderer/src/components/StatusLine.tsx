import React, { useEffect, useState } from 'react';
import styled from "styled-components";
import { IpcRenderer } from 'electron';
import { IpcRendererEvent } from 'electron/renderer';

const Status = styled.div`
    display: flex;
    justify-content: center;
    align-content: center;
    color: ${props => props.theme.colors.primary};
    margin: 1rem 0;
`

interface StatusLineProps {
    ipcRenderer: IpcRenderer
}

const StatusLine: React.FC<StatusLineProps> = (props) => {
    const [status, setStatus] = useState<string>('---');

    useEffect(() => {
        props.ipcRenderer.on('status-line-message', (_: IpcRendererEvent, status: string) => {
            setStatus(status);
        });

        return () => {
            props.ipcRenderer.removeAllListeners('status-line-message');
        };
    }, [props.ipcRenderer]);

    return (
        <Status>{status}</Status>
    );
}

export default StatusLine;