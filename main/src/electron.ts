import { BrowserWindow, app, ipcMain, IpcMainInvokeEvent } from 'electron';
import isDev from "electron-is-dev";;
import path from 'path';
import helpers from './helpers.js';
import ytdl from 'ytdl-core';

let mainWindow: BrowserWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200, height: 1000, webPreferences: {
            nodeIntegration: true,
        }
    });
    
    mainWindow.loadURL(
        isDev
            ? "http://localhost:3000"
            : `file://${path.join(__dirname, "../build/index.html")}`
    );
    mainWindow.on("closed", () => (mainWindow.destroy()));

    ipcMain.handle('getInfo', async (_: IpcMainInvokeEvent, link: string): Promise<ytdl.videoInfo | null> => {
        return await helpers.getInfo(link);
    });
    ipcMain.handle('process', async (_: IpcMainInvokeEvent, info: ytdl.videoInfo, audioFormat: ytdl.videoFormat, videoFormat: ytdl.videoFormat, extension: string): Promise<void> => {
        const sendProgressMessage = (progress: number): void => {
            mainWindow.webContents.send('progress-bar-progress', progress);
        }
        const sendStatusMessage = (status: string): void => {
            mainWindow.webContents.send('status-line-message', status);
        }
        mainWindow.webContents.send('progress-bar-toggle', true);
        const {audioFileName, videoFileName} = await helpers.download(info, audioFormat, videoFormat, sendProgressMessage, sendStatusMessage);
        sendStatusMessage('Converting files');
        await helpers.convert(info, audioFormat, videoFormat, audioFileName, videoFileName, extension, sendProgressMessage);
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