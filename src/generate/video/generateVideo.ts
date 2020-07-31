import fse from 'fs-extra';
import ffmpeg from 'fluent-ffmpeg';

import { generateRandomSVGBackgroundImage } from '../../util/generateBackgroundImage';

import { EpisodeData } from '../../types/episodeTypes';

type RenderVideoProps = {
  rootFolder: string;
  audioFolder: string;
  videoFolder: string;
  backgroundImageFolder: string;
  videoFont: string;
  podcastLogoFile: string;
  title: string;
  relevantFileName: string;
};

const renderVideo = ({
  rootFolder,
  audioFolder,
  videoFolder,
  backgroundImageFolder,
  videoFont,
  podcastLogoFile,
  title,
  relevantFileName,
}: RenderVideoProps) => new Promise((resolve, reject) => {
  const audioFile = `${relevantFileName}.mp3`;
  const videoFile = `${relevantFileName}.mp4`;

  ffmpeg(`${audioFolder}/${audioFile}`) // original audio file
    .input(`${backgroundImageFolder}/index.png`) // background image
    .input(podcastLogoFile) // podcast logo
    .complexFilter([
      '[0:a]showwaves=s=1280x720:mode=cline,colorkey=0x000000:0.01:0.1[v]',
      '[1:v][v]overlay[outFirst]',
      '[outFirst][2:v]overlay=(W-w)/2:(H-h)/2[outSecond]',
      `[outSecond]drawtext=fontfile=${videoFont}:text="${title}":fontcolor=white:fontsize=32:box=1:boxcolor=black@0.5:boxborderw=15:x=(w-text_w)/2:y=h-80,fade=in:0:15[outv]`,
    ], 'outv')
    .addInputOption('-framerate 25')
    .outputOptions(['-pix_fmt yuv420p', '-map 0:a', '-shortest']) // , '-t 5' (for testing)
    .output(`${videoFolder}/${videoFile}`)
    .on('start', function(commandLine) {
      console.log(`Start ffmpeg cmd: ${commandLine}`);
      console.log(`Output to: ${videoFolder}/${videoFile}`)
    })
    .on('end', function(_commandLine) {
      console.log(`${videoFolder}/${videoFile} finished rendering.`);
      resolve(`${videoFolder}/${videoFile} finished rendering.`);
    })
    .on('error', function(err) {
      console.log('an error happened: ' + err.message);
      reject('an error happened: ' + err.message);
    })
    .run();
});

type PopulateVideoProps = {
  rootFolder: string;
  audioFolder: string;
  videoFolder: string;
  backgroundImageFolder: string;
  videoFont: string;
  podcastLogoFile: string;
  relevantFileName: string;
  episodes: EpisodeData[];
};

const populateVideo = async ({
  rootFolder,
  audioFolder,
  videoFolder,
  backgroundImageFolder,
  videoFont,
  podcastLogoFile,
  relevantFileName,
  episodes
}: PopulateVideoProps): Promise<void> => {
  const episodeNumber = relevantFileName.split('-')[1];
  const episodeData = episodes.find((episode: EpisodeData) => episode.episode_number === Number(episodeNumber));
  const title = episodeData?.title as string;
  const singleQuoteEscapedTitle = title.replace(/'/g, "\\'");

  console.log(singleQuoteEscapedTitle);

  await generateRandomSVGBackgroundImage({
    backgroundImageFolder
  });

  await renderVideo({
    rootFolder,
    audioFolder,
    videoFolder,
    backgroundImageFolder,
    videoFont,
    podcastLogoFile,
    title: singleQuoteEscapedTitle,
    relevantFileName,
  });
}

type GenerateVideoProps = {
  rootFolder: string;
  audioFolder: string;
  videoFont: string;
  podcastLogoFile: string;
  videoFolder: string;
  backgroundImageFolder: string;
  episodes: EpisodeData[];
};

const generateVideo = async ({
  rootFolder,
  audioFolder,
  videoFolder,
  backgroundImageFolder,
  videoFont,
  podcastLogoFile,
  episodes
}: GenerateVideoProps) => {
  try {
    const audioFolderFilesAwait = await fse.readdir(audioFolder);
    const videoFolderFilesAwait = await fse.readdir(videoFolder);

    const audioFolderFiles = audioFolderFilesAwait.filter(item => !item.includes('.DS_Store'));
    const videoFolderFiles = videoFolderFilesAwait.filter(item => !item.includes('.DS_Store'));

    for (const audioFile of audioFolderFiles) {
      const relevantFileName = audioFile.split('.')[0]; // ep-1-final
      const videoExists = videoFolderFiles.includes(`${relevantFileName}.mp4`);

      if (!videoExists) {
        await populateVideo({
          rootFolder,
          audioFolder,
          videoFolder,
          backgroundImageFolder,
          videoFont,
          podcastLogoFile,
          relevantFileName, // ep-1-final
          episodes
        });
      }
    };
    console.log('All videos converted.');
  } catch (error) {
    throw new Error(`generateVideo - ${error}`);
  }
}

export default generateVideo;
