import path from 'path';

import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '..', 'deployment', 'environment', '.env') });

import nodeFetch from 'node-fetch';
global.fetch = nodeFetch;

import { media } from './index';
import { data } from '@dottjt/datareade';

const generateVideoIndex = async (): Promise<void> => {

  const { episodesTNDD } = data;

  const rootFolder = path.join(__dirname);
  const audioFolder = path.join(__dirname, 'test', 'inputAudio');
  const videoFolder = path.join(__dirname, 'test', 'output');
  const backgroundImageFolder = path.join(__dirname, 'test', 'background-image');
  const podcastLogoFile = path.join(__dirname, 'test', 'assets', 'logo_400_correct.png');
  const videoFont = '/System/Library/Fonts/Avenir.ttc';

  await media.generateVideo({
    rootFolder,
    audioFolder,
    videoFolder,
    backgroundImageFolder,
    videoFont,
    podcastLogoFile,
    episodes: episodesTNDD,
  });
};

generateVideoIndex();

// const podcastPreProcessingIndex = async (): Promise<void> => {
//   const { podcastPreProcessing } = media;

//   const audioFolder = path.join(__dirname, 'inputPodcastAudio');

//   await podcastPreProcessing({
//     inputFolder: audioFolder,
//   });
// };

// podcastPreProcessingIndex();


// const uploadYoutubeindex = async (): Promise<void> => {
//   const coverArtDirectory = path.join(__dirname, 'output');

//   media.uploadYoutube({
//     videoFolder,
//     credentialsFile,
//     fakeYouTubeAPIFile,
//     episodes,
//   });
// };

// uploadYoutubeindex();


// const generateCoverArtindex = async (): Promise<void> => {
//   const coverArtDirectory = path.join(__dirname, 'output');

//   await media.generateCoverArt({
//     episodes: data.episodesTWD,
//     coverArtDirectory,
//   });
// };

// generateCoverArtindex();
