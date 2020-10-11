import React, { useState, useEffect } from 'react';
import { IpcRenderer, IpcRendererEvent } from 'electron';
import styled from 'styled-components';

const MessageContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`

const Message = styled.ul`
    background-color: ${props => props.theme.colors.error};
    color: ${props => props.theme.colors.primary};
    font-weight: bold;
    border: 2px solid ${props => props.theme.colors.border};
    padding: 1rem;
    padding-left: 2rem;
    margin: 0;
    margin-top: 1rem;;
    border-radius: 0.5rem;
`

interface ErrorMessageProps {
    readonly ipcRenderer: IpcRenderer
}

const ErrorMessage: React.FC<ErrorMessageProps> = (props: ErrorMessageProps) => {
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        props.ipcRenderer.on('error-message', (_: IpcRendererEvent, message: string) => {
            setMessages(oldMessages => [...oldMessages, message]);
        });

        return () => {
            props.ipcRenderer.removeAllListeners('error-message');
        };
    }, [props.ipcRenderer]);

    return (
        <React.Fragment>
            {messages.length !== 0 ?
                <MessageContainer>
                    <Message> {messages.map((msg: string, idx: number) => <li key={idx}>{msg}</li>)}</Message>
                </MessageContainer>
                : null}
        </React.Fragment>
    );
}

export default ErrorMessage;