import path from 'path';

// import { config } from 'dotenv';
// config({ path: path.resolve(__dirname, '..', 'deployment', 'environment', '.env') });

import nodeFetch from 'node-fetch';
global.fetch = nodeFetch;

// GENERATE

// Audio
import podcastPreProcessing from './generate/audio/podcastPreProcessing';

// Image
import generateCoverArt from './generate/image/generateCoverArt';

// Upload
import uploadYouTube from './generate/upload/uploadYouTube';

// Video
import generateVideo from './generate/video/generateVideo';

export const media = {
  podcastPreProcessing,
  generateCoverArt,
  generateVideo,
};

export const upload = {
  uploadYouTube,
};
