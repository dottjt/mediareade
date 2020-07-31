import { EpisodeData } from '@dottjt/datareade';

import fse from 'fs-extra';
import sharp from 'sharp';
import path from 'path';

type CoverArtGeneratorProps = {
  episode: EpisodeData;
  fileNamePNG: string;
  coverArtDirectory: string;
};

const coverArtGenerator = ({
  episode,
  fileNamePNG,
  coverArtDirectory
}) => new Promise((resolve, reject) => {
  const textedSVG = new Buffer(`
    <svg>
      <rect x="0" y="0" width="700" height="250" />
      <text x="10" y="76" font-size="124" font-family="Arial, Helvetica, sans-serif" fill="#fff">${episode.title}</text>
    </svg>`
  );
  const inputFile = path.join(__dirname, 'assets', 'logo_3000_non_transparent.png');

  sharp(inputFile)
    .tint({ r: 192, g: 184, b: 195 })
    .flatten({ background: '#ff6600' })
    .composite([{
      input: textedSVG,
      // gravity: 'center',
      background: { r: 192, g: 184, b: 195, alpha: 0.3 },
    }])
    .resize(1000)
    .sharpen()
    .withMetadata()
    .png()
    .toFile(`${coverArtDirectory}/${fileNamePNG}`, (err, info) => {
      if (err) {
        reject(err);
      }
      console.log(info);
      console.log('');
      resolve(info);
    });
});

type GenerateCoverArtProps = {
  episodes: EpisodeData[];
  coverArtDirectory: string;
};

const generateCoverArt = async ({
  episodes,
  coverArtDirectory
}: GenerateCoverArtProps): Promise<void> => {
  try {
    const coverArtDirList = await fse.readdir(coverArtDirectory);

    // ep-5-final.png
    for (const episode of episodes) {
      const fileNamePNG = `ep-${episode.episode_number}-final.png`;
      const coverArtExists = coverArtDirList.includes(fileNamePNG);

      if (!coverArtExists) {
        await coverArtGenerator({
          coverArtDirectory,
          fileNamePNG,
          episode
        });
      }
    }

    console.log('Finished cover art creation.');
  } catch(error) {
    throw new Error(`generateCoverArt - ${error}`);
  }
};

export default generateCoverArt;


