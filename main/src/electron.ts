import { BrowserWindow, app, ipcMain, IpcMainInvokeEvent } from 'electron';
import isDev from "electron-is-dev";
import path from 'path';
import helpers from './helpers.js';
import ytdl, { videoInfo } from 'ytdl-core';

import { AppConfig, Messages } from '../types/types.js';

let mainWindow: BrowserWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 750,
        minWidth: 900,
        minHeight: 750,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        title: 'Ytb Downloader',
        show: false,
        backgroundColor: '#191a1d'
    });

    //mainWindow.removeMenu();

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.show();
    });

    mainWindow.loadURL(
        isDev
            ? "http://localhost:3000"
            : `file://${path.join(__dirname, "../build/index.html")}`
    );

    mainWindow.on("closed", () => (mainWindow.destroy()));

    const sendMessage = (channel: string, index?: number,): (<T>(message: T) => void) => {
        const actualChannel = index === undefined ? channel : channel + '-' + String(index);
        return (<T>(message: T): void => {
            mainWindow.webContents.send(actualChannel, message);
        });
    };

    const sendErrorMessage = (error: string): void => {
        mainWindow.webContents.send('error-message', error);
    };
    const msg: Messages = { sendStatusMessage: sendMessage('status-line-message'), sendProgressMessage: sendMessage('progress-bar-progress'), sendErrorMessage, sendProgressToggle: sendMessage('progress-bar-toggle') };

    ipcMain.handle('getInfo', async (_: IpcMainInvokeEvent, link: string): Promise<ytdl.videoInfo | null> => {
        const result: videoInfo | null = await helpers.getInfo(link);
        if (result !== null) {
            msg.sendProgressMessage(0);
            msg.sendStatusMessage('---')
        }
        return result;
    });

    ipcMain.handle('detectFfmpeg', async (_: IpcMainInvokeEvent, path: string): Promise<boolean> => {
        return await helpers.detectFfmpeg(msg, path);
    });
    ipcMain.handle('getConfig', async (): Promise<AppConfig> => {
        return await helpers.loadConfig(msg);
    });

    ipcMain.handle('process', async (_: IpcMainInvokeEvent, info: ytdl.videoInfo, audioFormat: ytdl.videoFormat, videoFormat: ytdl.videoFormat, extension: string, convert: boolean, config: AppConfig, index?: number): Promise<number> => {
        const actualMsg: Messages = { sendStatusMessage: sendMessage('status-line-message', index), sendProgressMessage: sendMessage('progress-bar-progress', index), sendProgressToggle: sendMessage('progress-bar-toggle', index), sendErrorMessage };
        actualMsg.sendProgressToggle(true);
        const { audioFileName, videoFileName } = await helpers.download(info, audioFormat, videoFormat, actualMsg);
        actualMsg.sendStatusMessage('Converting files');
        await helpers.convert(info, audioFormat, videoFormat, audioFileName, videoFileName, extension, convert, actualMsg, config);
        actualMsg.sendStatusMessage('Cleaning up');
        await helpers.cleanUp(audioFileName, videoFileName);
        actualMsg.sendStatusMessage('Done');
        actualMsg.sendProgressToggle(false);
        return index === undefined ? -1 : index;
    });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
app.on("activate", () => {
    if (mainWindow === null) {
        createWindow();
    }
});