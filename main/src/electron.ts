import { BrowserWindow, app, ipcMain, IpcMainInvokeEvent } from 'electron';
import isDev from "electron-is-dev";;
import path from 'path';
import helpers from './helpers.js';
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

    ipcMain.handle('getInfo', async (_: IpcMainInvokeEvent, link: string): Promise<ytdl.videoInfo | null> => {
        //console.log(event.sender);
        return await helpers.getInfo(link);
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