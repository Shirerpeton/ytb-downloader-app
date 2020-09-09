import React from 'react'
// import styled from 'styled-components'
import { AppConfig } from '../types';
import { IpcRenderer } from 'electron';



interface BatchModeProps {
    config: AppConfig,
    ipcRenderer: IpcRenderer
}

const BatchMode: React.FC<BatchModeProps> = (props) => {
    console.log(props);
    return(
        <React.Fragment>

        </React.Fragment>
    );
}

export default BatchMode;