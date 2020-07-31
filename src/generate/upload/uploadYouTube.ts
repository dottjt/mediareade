import Youtube from 'youtube-api';
import fs from 'fs';
import fse from 'fs-extra';
import readJson from 'r-json';
import Lien from 'lien';
import Logger from 'winston';
import opn from 'opn';

import { getEpisodeData } from '../../util/getEpisodeData';
import { EpisodeData } from '../../types/episodeTypes';

type UploadProps = {
  title: string;
  showTitle: string;
  showDescription: string;
  content: string;
  socialPublishDate: string;
  castboxLink: string;
  tags: string;
  videoFile: string;
  videoFolder: string;
};

// NOTE: status.publishAt property can only be set if the video's privacy status is private and the video has never been published. This is because it is MADE public once it is published.
// https://stackoverflow.com/questions/47545477/update-publishat-error-invalidvideometadata-youtube-v3-api-php
const upload = ({
  title,
  showTitle,
  showDescription,
  castboxLink,
  content,
  socialPublishDate,
  tags,
  videoFile,
  videoFolder,
}: UploadProps) => new Promise((resolve, reject) => {
  Youtube.videos.insert({
    part: 'snippet,status',
    resource: {
      snippet: {
        title: `${showTitle} ${title}`,
        description: (
`${content}

${castboxLink}

${showDescription}`
        ),
        tags: [
          'The Writer\'s Daily',
          'podcast',
          'writing podcast',
          'comedy podcast',
          title,
          'topic',
          'news',
          'comedy',
        ].concat(tags),
        categoryId: 24, // https://gist.github.com/dgp/1b24bf2961521bd75d6c
        defaultLanguage: 'en'
      },
      status: {
        privacyStatus: 'private',
        publishAt: socialPublishDate
      }
    },
    media: {
      body: fs.createReadStream(`${videoFolder}/${videoFile}`)
    }
  }, (err: any, data: any) => {
    if (err) {
      console.log('error.', err);
      reject(err);
    }
    console.log('Video Uploaded.');
    resolve(data);
  });
})

type UploadVideosProps = {
  showTitle: string;
  showDescription: string;
  videoFolder: string;
  fakeYouTubeAPIFile: string;
  episodes: EpisodeData[];
};

const uploadVideos = async ({
  showTitle,
  showDescription,
  videoFolder,
  fakeYouTubeAPIFile,
  episodes,
}: UploadVideosProps) => {
  const videoFolderFilesAwait = await fse.readdir(videoFolder);
  const videoFolderFiles = videoFolderFilesAwait.filter(item => !item.includes('.DS_Store'));

  const file = fs.readFileSync(fakeYouTubeAPIFile);
  const fileString = file.toString();
  const uploadedEpisodeNumberList = fileString.split('\n').filter(Boolean).map(Number);

  for (const videoFile of videoFolderFiles) {
    const relevantFileName = videoFile.split('.')[0];
    const relevantEpisodeNumber = Number(relevantFileName.split('-')[1]);

    const videoExists = uploadedEpisodeNumberList.includes(relevantEpisodeNumber);

    if (!videoExists) {
      const NEWfile = fs.readFileSync(fakeYouTubeAPIFile);
      const NEWfileString = NEWfile.toString();
      const NEWuploadedEpisodeNumberList = NEWfileString.split('\n').filter(Boolean).map(Number);

      const episodeData = episodes.find((episode: EpisodeData) => episode.episode_number === Number(relevantEpisodeNumber));
      const { title, content, socialPublishDate, castboxLink, tags } = getEpisodeData(episodeData as EpisodeData);

      console.log(`Upload ${title} - socialPublishDate: ${socialPublishDate}`);

      await upload({
        showTitle,
        castboxLink,
        showDescription,
        title,
        content,
        socialPublishDate,
        tags,
        videoFile,
        videoFolder,
      });

      const newFakeYouTubeAPIString = NEWuploadedEpisodeNumberList.concat(relevantEpisodeNumber).sort().join('\n');
      fs.writeFileSync(fakeYouTubeAPIFile, newFakeYouTubeAPIString);

      console.log(`${title} video upload complete.`);
    }
  }
  console.log('All videos uploaded.');
}

type UploadYouTubeProps = {
  showTitle: string;
  showDescription: string;
  videoFolder: string;
  credentialsFile: string;
  fakeYouTubeAPIFile: string;
  episodes: EpisodeData[];
};

const uploadYouTube = ({
  showTitle,
  showDescription,
  videoFolder,
  credentialsFile,
  fakeYouTubeAPIFile,
  episodes
}: UploadYouTubeProps) => {
  const CREDENTIALS = readJson(credentialsFile);
  const server = new Lien({ host: 'localhost', port: 4004 });

  // You can access the Youtube resources via OAuth2 only.
  // https://developers.google.com/youtube/v3/guides/moving_to_oauth#service_accounts
  const oauth = Youtube.authenticate({
    type: 'oauth',
    client_id: CREDENTIALS.web.client_id,
    client_secret: CREDENTIALS.web.client_secret,
    redirect_url: CREDENTIALS.web.redirect_uris[2] // because this is where localhost:4004 is located.
  });

  opn(oauth.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.force-ssl',
        'https://www.googleapis.com/auth/youtube.readonly'
      ]
    }));

  server.addPage('/oauth2callback', (lien: any) => {
    Logger.info('Trying to retrieve the token using the following code: ' + lien.query.code);
    oauth.getToken(lien.query.code, async (err: any, tokens: any) => {
      if (err) {
        lien.lien(err, 400);
        return Logger.info(err);
      }
      Logger.info('Token retrieved.');
      lien.end('Thank you, bby ^^=-.');
      oauth.setCredentials(tokens);

      await uploadVideos({
        showTitle,
        showDescription,
        videoFolder,
        fakeYouTubeAPIFile,
        episodes
      });
    });
  });
}

export default uploadYouTube;