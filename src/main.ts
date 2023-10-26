// node_modules/langchain/dist/vectorstores/googlevertexai.js
// node_modules/langchain/dist/utils/googlevertexai-connection.js
// 以上2つのファイルについて、プロジェクトIDを指定している部分をプロジェクト番号に書き換える

import { GoogleVertexAIEmbeddings } from 'langchain/embeddings/googlevertexai';
import { GoogleCloudStorageDocstore } from 'langchain/stores/doc/gcs';
import { MatchingEngine, MatchingEngineArgs } from 'langchain/vectorstores/googlevertexai';

const embeddings = new GoogleVertexAIEmbeddings({
  temperature: 0.2,
});

const store = new GoogleCloudStorageDocstore({
  bucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET!,
  prefix: 'card_list/',
});

const config: MatchingEngineArgs = {
  location: 'asia-northeast1',
  endpoint: 'asia-northeast1-aiplatform.googleapis.com',
  index: process.env.GOOGLE_VERTEXAI_VECTORSTORE_INDEX!,
  indexEndpoint: process.env.GOOGLE_VERTEXAI_VECTORSTORE_INDEXENDPOINT!,
  deployedIndexId: process.env.GOOGLE_VERTEXAI_VECTORSTORE_DEPLOYEDINDEXID!,
  apiVersion: 'v1',
  docstore: store,
};

const engine = new MatchingEngine(embeddings, config);

const results = await engine.similaritySearch('');

console.log(results);
