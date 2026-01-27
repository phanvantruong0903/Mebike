import { MeiliSearch } from 'meilisearch';

export const meiliClient = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILI_MASTER_KEY || 'mebikepasssep09093',
});
