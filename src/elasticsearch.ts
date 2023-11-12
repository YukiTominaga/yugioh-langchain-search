import { GoogleCloudStorageDocstore } from 'langchain/stores/doc/gcs';
import { PromptTemplate } from 'langchain/prompts';
import { OpenAI } from 'langchain/llms/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { LLMChain, VectorDBQAChain } from 'langchain/chains';
import { Client, ClientOptions } from '@elastic/elasticsearch';
import { ElasticClientArgs, ElasticVectorSearch } from 'langchain/vectorstores/elasticsearch';
import KnnSearchApi from '@elastic/elasticsearch/lib/api/api/knn_search.js';

const model = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  temperature: 0.2,
  modelName: 'gpt-4-1106-preview',
  // modelKwargs: { response_format: { type: 'json_object' } },
});

const promptTemplate = PromptTemplate.fromTemplate(
  '遊戯王OCGというカードゲームのテキストについて検索したjson形式の結果があります。\nこれから貼る検索結果において、 そのテキストが｢{search}｣を満たすものを新たなjson形式で抽出してください。\n手札に加えたり、特殊召喚を伴う効果については、｢デッキから｣、｢墓地から｣、｢手札から｣、｢除外されている｣ などの場所を示すような表現について厳密にフィルタリングをして抽出してください。\n -------- \n {result}',
);

// const chain = new LLMChain({ llm: llm, prompt: promptTemplate });

const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-ada-002',
  stripNewLines: true,
});

const elasticClientOptions: ClientOptions = {
  node: process.env.ELASTICSEARCH_ENDPOINT!,
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY!,
  },
};

const client = new Client(elasticClientOptions);

const queryVector = await embeddings.embedQuery('相手フィールドにトークンを特殊召喚する');

const result = await client.knnSearch({
  index: process.env.ELASTICSEARCH_INDEX!,
  knn: { field: 'embedding', query_vector: queryVector, k: 10, num_candidates: 100 },
  fields: ['card_name', 'card_text'],
});

for (const hit of result.hits.hits) {
  console.log(hit.fields);
}

// const clientArgs: ElasticClientArgs = {
//   client: client,
//   indexName: process.env.ELASTICSEARCH_INDEX!,
//   vectorSearchOptions: { similarity: 'cosine' },
// };

// const vectorStore = await ElasticVectorSearch.fromExistingIndex(embeddings, clientArgs);
// const results = await vectorStore.similaritySearchWithScore('相手フィールドにトークンを特殊召喚する', 10);
// console.log(results);

// const chain = VectorDBQAChain.fromLLM(model, vectorStore, { k: 5, returnSourceDocuments: true });
// const response = await chain.call({ query: '相手フィールドにトークンを特殊召喚する' });
// console.log(response);

// const chain = VectorDBQAChain.fromLLM(llm, vectorSearch, { k: 5, returnSourceDocuments: true });

// const response = await chain.call();
// console.log(JSON.stringify(response, null, 2));
