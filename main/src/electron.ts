import { BrowserWindow, app, ipcMain, IpcMainInvokeEvent } from 'electron';
import * as isDev from "electron-is-dev";;
import * as path from 'path';
import * as helpers from './helpers.js';
import ytdl from 'ytdl-core';

let mainWindow: BrowserWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900, height: 680, webPreferences: {
            nodeIntegration: true,
        }
    });
    
    mainWindow.loadURL(
        isDev
            ? "http://localhost:3000"
            : `file://${path.join(__dirname, "../build/index.html")}`
    );
    mainWindow.on("closed", () => (mainWindow.destroy()));

    ipcMain.handle('getInfo', async (event: IpcMainInvokeEvent, link: string): Promise<ytdl.videoInfo | null> => {
        console.log(event.sender);
        return await helpers.default.getInfo(link);
    })
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