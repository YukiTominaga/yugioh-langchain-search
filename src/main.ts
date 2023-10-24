import { MatchingEngine } from 'langchain/vectorstores/googlevertexai';
import { Document } from 'langchain/document';
import { SyntheticEmbeddings } from 'langchain/embeddings/fake';
import { GoogleCloudStorageDocstore } from 'langchain/stores/doc/gcs';

const embeddings = new SyntheticEmbeddings({
  vectorSize: Number.parseInt(process.env.SYNTHETIC_EMBEDDINGS_VECTOR_SIZE ?? '768', 10),
});

const store = new GoogleCloudStorageDocstore({
  bucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET!,
});

const config = {
  index: process.env.GOOGLE_VERTEXAI_MATCHINGENGINE_INDEX!,
  indexEndpoint: process.env.GOOGLE_VERTEXAI_MATCHINGENGINE_INDEXENDPOINT!,
  apiVersion: 'v1beta1',
  docstore: store,
};

const engine = new MatchingEngine(embeddings, config);
