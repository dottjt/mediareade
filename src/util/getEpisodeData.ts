import { EpisodeData } from '../types/episodeTypes';

export const getEpisodeData = (episodeData: EpisodeData): any => {
  const title = episodeData.title;
  const content = episodeData.content;
  const description = episodeData.description;
  const castboxLink = episodeData.castboxLink;
  const socialPublishDate = episodeData.socialPublishDate.replace('+', '.888+');
  const tags = episodeData.tags;
  return {
    title,
    content,
    castboxLink,
    description,
    socialPublishDate,
    tags
  }
}