// node_modules/langchain/dist/vectorstores/googlevertexai.js
// node_modules/langchain/dist/utils/googlevertexai-connection.js
// 以上2つのファイルについて、プロジェクトIDを指定している部分をプロジェクト番号に書き換える

import { GoogleVertexAIEmbeddings } from 'langchain/embeddings/googlevertexai';
import { GoogleCloudStorageDocstore } from 'langchain/stores/doc/gcs';
import { MatchingEngine, MatchingEngineArgs, Restriction } from 'langchain/vectorstores/googlevertexai';
import { PromptTemplate } from 'langchain/prompts';
import { OpenAI } from 'langchain/llms/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { LLMChain } from 'langchain/chains';

const llm = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  temperature: 0.2,
  modelName: 'gpt-4-1106-preview',
  modelKwargs: { response_format: { type: 'json_object' } },
});

const promptTemplate = PromptTemplate.fromTemplate(
  '遊戯王OCGというカードゲームのテキストについて検索したjson形式の結果があります。\nこれから貼る検索結果において、 そのテキストが｢{search}｣を満たすものを新たなjson形式で抽出してください。\n手札に加えたり、特殊召喚を伴う効果については、｢デッキから｣、｢墓地から｣、｢手札から｣、｢除外されている｣ などの場所を示すような表現について厳密にフィルタリングをして抽出してください。\n -------- \n {result}',
);

// const chain = promptTemplate.pipe(llm);
const chain = new LLMChain({ llm: llm, prompt: promptTemplate });

// const embeddings = new GoogleVertexAIEmbeddings({
//   temperature: 0.2,
//   model: 'textembedding-gecko-multilingual@latest',
// });

const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-ada-002',
  stripNewLines: true,
});

const store = new GoogleCloudStorageDocstore({
  bucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET!,
  prefix: 'card_list/',
});

const config: MatchingEngineArgs = {
  location: 'us-central1',
  endpoint: 'us-central1-aiplatform.googleapis.com',
  index: process.env.GOOGLE_VERTEXAI_VECTORSTORE_INDEX!,
  indexEndpoint: process.env.GOOGLE_VERTEXAI_VECTORSTORE_INDEXENDPOINT!,
  deployedIndexId: process.env.GOOGLE_VERTEXAI_VECTORSTORE_DEPLOYEDINDEXID!,
  apiVersion: 'v1',
  docstore: store,
};

const engine = new MatchingEngine(embeddings, config);

const search = '相手フィールドにトークンを特殊召喚する';
const restriction: Restriction[] = [
  {
    namespace: 'card_type',
    allowList: ['モンスター'],
  },
  // {
  //   namespace: 'card_info',
  //   allowList: ['岩石族'],
  // },
];

const vectorSearchResult = await engine.similaritySearchVectorWithScore(
  await embeddings.embedQuery(search),
  10,
  restriction,
);
console.log(vectorSearchResult);

const llmResult = await chain.invoke({ search: search, result: JSON.stringify(vectorSearchResult, null, 2) });
console.log(JSON.parse(llmResult.text));
