import { BrowserWindow, app, ipcMain, IpcMainInvokeEvent } from 'electron';
import isDev from "electron-is-dev";;
import path from 'path';
import helpers from './helpers.js';
import ytdl from 'ytdl-core';
import { AppConfig, Messages} from './types/types.js';

let mainWindow: BrowserWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000, 
        height: 850,
        minWidth: 900,
        minHeight: 850,
        webPreferences: {
            nodeIntegration: true,
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
    
    const sendStatusMessage = (status: string): void => {
        mainWindow.webContents.send('status-line-message', status);
    }

    const sendProgressMessage = (progress: number): void => {
        mainWindow.webContents.send('progress-bar-progress', progress);
    }

    const sendErrorMessage = (error: string): void => {
        mainWindow.webContents.send('error-message', error);
    }

    const msg: Messages = {sendStatusMessage, sendProgressMessage, sendErrorMessage}

    ipcMain.handle('getInfo', async (_: IpcMainInvokeEvent, link: string): Promise<ytdl.videoInfo | null> => {
        return await helpers.getInfo(link);
    });

    ipcMain.handle('detectFfmpeg', async (): Promise<boolean> => {
        return await helpers.detectFfmpeg(msg);
    });

    ipcMain.handle('getConfig', async (_: IpcMainInvokeEvent): Promise<AppConfig> => {
        return await helpers.loadConfig(msg);
    });

    ipcMain.handle('process', async (_: IpcMainInvokeEvent, info: ytdl.videoInfo, audioFormat: ytdl.videoFormat, videoFormat: ytdl.videoFormat, extension: string): Promise<void> => {
        mainWindow.webContents.send('progress-bar-toggle', true);
        const {audioFileName, videoFileName} = await helpers.download(info, audioFormat, videoFormat, msg);
        sendStatusMessage('Converting files');
        await helpers.convert(info, audioFormat, videoFormat, audioFileName, videoFileName, extension, msg);
        sendStatusMessage('Cleaning up');
        await helpers.cleanUp(audioFileName, videoFileName);
        sendStatusMessage('Done');
        mainWindow.webContents.send('progress-bar-toggle', false);
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