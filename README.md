# ytb-downloader-app

Application to download video and audio from youtube.

This application is based on [YtbDownloader](https://github.com/Shirerpeton/ytbDownloader) script with Electron and React to provide UI. 
To convert downloaded files into common formats (mkv/mp4 or aac/mp3) and to package both audio and video streams into one container ffmpeg is used. 

## Usage
The application has single video mode and batch mode. Single video mode picks default audio and video tracks and format to convert resulting file to based on your config setup but allows you to change them before downloading and converting file. Batch mode downloads and converts multiple files simultaneously with default tracks and default format selected based on your config setup.

## Config
Config file (config.cfg in the same directory as the program) with all available flags is created authomatically on the first launch.
Path to ffmpeg could be set in config file. Example: `ffmpegPath: ./ffmpeg/bin/ffmpeg.exe`
Path to output directory could also be set in the config file. Example: `outputDir: ./output/`

Default format for audio files could be set in config file (from currently availible ones (mp3, aac)). Example `defaultAudioFormat: mp3`
Default format for video files (container format) could be set in config file (from currently availible ones (mkv, mp4)). Example `defaultVideoFormat: mkv`

All other options are used to pick default audio and video track (especially important for batch mode).
All these options have priorities. Flags with higher priority override flags with lower priority. Here (and in default config) flags are listed from the highest priority to the lowest.

`noVideo: true` and `noAudio: true` options set video and audio tracks respectively to null (deselecting them), no matter what other config flags are.
`highestQuality: true` sets both audio and video tracks to tracks with highest quality (according to video and audio bitrate).
`audioQuality` allows you to put several quality labels (based on bitrate) separated by commas which program will use to pick audio track if all other options related to audio tracks mentioned above are set to false. If video doesn't have matching audio track, program will try to find the next provided etc. Example: `audioQuality: 160kbps, 128kbps`. All supported audio quality labels: `256kbps`, `160kbps`, `128kbps`, `64kbps`, `48kbps`.

`videoQuality` allows you to put several quality labels (based on resolution, framerate and HDR flag) separated by commas which program will use to pick video track if all other options related to video tracks mentioned above are set to false. If the video doesn't have matching video track, program will try to find the next provided etc. Example: `videoQuality: 1080p60, 1080p, 720p60, 720p`. All supported video quality labels: `144p`, `144p 15fps`, `144p60 HDR`, `240p`, `240p60 HDR`, `270p`, `360p`, `360p60 HDR`,
`480p`, `480p60 HDR`, `720p`, `720p60`, `720p60 HDR`, `1080p`, `1080p60`, `1080p60 HDR`, `1440p`, `1440p60`, `1440p60 HDR`, `2160p`, `2160p60`, `2160p60 HDR`, `4320p`, `4320p60`
