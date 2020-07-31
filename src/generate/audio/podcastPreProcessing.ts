import fse from 'fs-extra';
import ffmpeg from 'fluent-ffmpeg';

// print os.popen("ffmpeg -i long/" + file + " -af silenceremove=1:0:-96dB " + temp1).read()
// print os.popen("ffmpeg -i " + temp1 + " -af areverse " + temp2).read()
// print os.popen("ffmpeg -i " + temp2 + " -af silenceremove=1:0:-96dB " + temp3).read()
// print os.popen("ffmpeg -i " + temp3 + " -af areverse output/" + file).read()

// Need to test.
const silenceRemove = async (audioFileWithFolder: string) => new Promise<string>((resolve, reject) => {
  ffmpeg(audioFileWithFolder)
    // .withAudioFilter('silenceremove')
    .complexFilter([
      {
        filter : 'silenceremove',
        options: {
          start_periods : 1,
          start_duration : 1,
          start_threshold: '-60dB',
          detection: 'peak',
        }
      }
    ])
    // .addOption('-f', 'null')
    .on('error', function(err) {
      console.log('An error occurred: ' + err.message);
      reject(err);
    })
    .on('end', function(stdout, stderr){
      console.log('finished, ffmpeg output is:\n' + stdout);
      // TODO Figure out how to do this.
      console.log(stdout);
      resolve(stdout);
    })
    .saveToFile(audioFileWithFolder);
});

// TODO trim audio from beginning.

const detectVolume = (audioFileWithFolder: string) => new Promise<string>((resolve, reject) => {
  ffmpeg(audioFileWithFolder)
    .withAudioFilter('volumedetect')
    .addOption('-f', 'null')
    .on('error', function(err) {
      console.log('An error occurred: ' + err.message);
      reject(err);
    })
    .on('end', function(stdout, stderr){
      console.log('finished, ffmpeg output is:\n' + stdout);
      // TODO Figure out how to do this.
      console.log(stdout);
      resolve(stdout);
    })
    .saveToFile('/dev/null');
});

// https://superuser.com/questions/1303036/adjusting-audio-with-varying-loudness-recorded-talks-with-ffmpeg
// https://superuser.com/questions/323119/how-can-i-normalize-audio-using-ffmpeg
const increaseAudioVolume = (audioFileWithFolder: string, maxVolume: string) => new Promise((resolve, reject) => {
  ffmpeg(audioFileWithFolder)
    .audioFilters(`volume=${maxVolume}dB`)
    .output(audioFileWithFolder)
    .on('start', function(commandLine) {
      console.log(`Start ffmpeg cmd: ${commandLine}`);
      console.log(`Output to: ${audioFileWithFolder}`)
    })
    .on('end', function(_commandLine) {
      console.log(`${audioFileWithFolder} finished rendering.`);
      resolve(`${audioFileWithFolder} finished rendering.`);
    })
    .on('error', function(err) {
      console.log('an error happened: ' + err.message);
      reject('an error happened: ' + err.message);
    })
    .run();
});

// https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/161
const convertFromWavToMP3 = (audioFileWithFolder: string) => new Promise((resolve, reject) => {
  const audioFileBase = audioFileWithFolder.split('.')[0];
  const audioFileExtension = audioFileWithFolder.split('.').slice(-1)[0];

  ffmpeg(audioFileWithFolder)
    .toFormat('mp3')
    .withAudioCodec('libmp3lame') // mp3
    .withAudioFrequency(44100) // 44100
    .withAudioBitrate('128k') // 320k
    .withAudioChannels(1) // 2
    .addOptions(['-vn'])
    .on('start', function(commandLine) {
      console.log(`Start ffmpeg cmd: ${commandLine}`);
      console.log(`Output to: ${audioFileWithFolder}`)
    })
    .on('end', function(_commandLine) {
      console.log(`${audioFileWithFolder} finished rendering.`);
      resolve(`${audioFileWithFolder} finished rendering.`);
    })
    .on('error', function(err) {
      console.log('an error happened: ' + err.message);
      reject('an error happened: ' + err.message);
    })
    .save(`${audioFileBase}.mp3`)
});

type PodcastPreProcessingEffectsProps = {
  audioFileWithFolder: string;
};

const podcastPreProcessingEffects = async ({
  audioFileWithFolder,
}: PodcastPreProcessingEffectsProps) => {
  const audioFileBase = audioFileWithFolder.split('.')[0];
  const audioFileExtension = audioFileWithFolder.split('.').slice(-1)[0];

  console.log();
  if (audioFileExtension === 'wav' || audioFileExtension === 'mp3') {
    console.log(`Start Conversion: ${audioFileWithFolder}`);
    // if (audioFileExtension === 'wav') {
    //   await convertFromWavToMP3(audioFileWithFolder);
    // }
    await silenceRemove(audioFileWithFolder);
    const maxVolume = await detectVolume(audioFileWithFolder);
    // await increaseAudioVolume(`${audioFileBase}.mp3`, maxVolume);
  } else {
    console.log(`Not Audio: ${audioFileWithFolder}`);
  }
};

type PodcastPreProcessingProps = {
  inputFolder: string;
};

const podcastPreProcessing = async ({
  inputFolder,
}: PodcastPreProcessingProps) => {
  const audioFolderFilesAwait = await fse.readdir(inputFolder);
  const audioFolderFiles = audioFolderFilesAwait.filter(item => !item.includes('.DS_Store'));

  for (const audioFile of audioFolderFiles) {
    const isDirectory = fse.lstatSync(`${inputFolder}/${audioFile}`).isDirectory()
    if (isDirectory) {
      console.log(`Directory: ${inputFolder}/${audioFile}`);
      await podcastPreProcessing({
        inputFolder: `${inputFolder}/${audioFile}`,
      });
    } else {
      // console.log(`${inputFolder}/${audioFile}`);
      await podcastPreProcessingEffects({ audioFileWithFolder: `${inputFolder}/${audioFile}` });
    }
  }
};

export default podcastPreProcessing;
