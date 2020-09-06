# ytb-downloader-app

Application to download video and audio from youtube.

This application is based on [YtbDownloader](https://github.com/Shirerpeton/ytbDownloader) script with Electron and React to provide UI. 

To convert downloaded files into common formats (mkv/mp4 or aac/mp3) and to package both audio and video streams into one container ffmpeg is used. 
ffmpeg should go into ./ffmpeg in the directory with application. 
Output files would be placed into ./output directory.
