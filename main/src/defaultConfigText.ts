export default `#path to ffmpeg
ffmpegPath: ./ffmpeg/bin/ffmpeg.exe

#output directory
outputDir: ./output/

#default audio format from avalaible ones ('mp3', 'aac')
defaultAudioFormat: mp3

#default video (container) format from avalaible ones ('mkv', 'mp4')
defaultVideoFormat: mkv


#default video and audio tracks, flags are in order of their piority from higher pirity to lower priority (higher piority flags override lower priority)

#deselect video
noVideo: false

#deselect audio
noAudio: false

#select highest quality for both video and audio tacks
highestQuality: false

#audio quality (in kbps) if the first option is unavailable tries second etc
audioQuality: 

#video quality (resolution) if the first option is unavailable tries second etc
videoQuality: 
`