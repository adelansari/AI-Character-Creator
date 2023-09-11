import { Redis } from "@upstash/redis";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";

export type CharacterKey = {
  characterName: string;
  modelName: string;
  userId: string;
};

export class StorageManager {
  private static instance: StorageManager;
  private history: Redis;
  private vectorDBClient: PineconeClient;

  public constructor() {
    this.history = Redis.fromEnv();
    this.vectorDBClient = new PineconeClient();
  }

  public async init() {
    if (this.vectorDBClient instanceof PineconeClient) {
      await this.vectorDBClient.init({
        apiKey: process.env.PINECONE_API_KEY!,
        environment: process.env.PINECONE_ENVIRONMENT!,
      });
    }
  }

  public async vectorSearch(
    recentChatHistory: string,
    characterFileName: string
  ) {
    const pineconeClient = <PineconeClient>this.vectorDBClient;

    const pineconeIndex = pineconeClient.Index(
      process.env.PINECONE_INDEX! || ""
    );

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
      { pineconeIndex }
    );

    const similarDocs = await vectorStore
      .similaritySearch(recentChatHistory, 3, { fileName: characterFileName })
      .catch((err) => {
        console.log("WARNING: failed to get vector search results.", err);
      });
    return similarDocs;
  }

  public static async getInstance(): Promise<StorageManager> {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
      await StorageManager.instance.init();
    }
    return StorageManager.instance;
  }

  private generateRedisCharacterKey(characterKey: CharacterKey): string {
    return `${characterKey.characterName}-${characterKey.modelName}-${characterKey.userId}`;
  }

  public async writeToHistory(text: string, characterKey: CharacterKey) {
    if (!characterKey || typeof characterKey.userId == "undefined") {
      console.log("Character key set incorrectly");
      return "";
    }

    const key = this.generateRedisCharacterKey(characterKey);
    const result = await this.history.zadd(key, {
      score: Date.now(),
      member: text,
    });

    return result;
  }

  public async readLatestHistory(characterKey: CharacterKey): Promise<string> {
    if (!characterKey || typeof characterKey.userId == "undefined") {
      console.log("Character key set incorrectly");
      return "";
    }

    const key = this.generateRedisCharacterKey(characterKey);
    let result = await this.history.zrange(key, 0, Date.now(), {
      byScore: true,
    });

    result = result.slice(-30).reverse();
    const recentChats = result.reverse().join("\n");
    return recentChats;
  }

  public async seedChatHistory(
    seedContent: String,
    delimiter: string = "\n",
    characterKey: CharacterKey
  ) {
    const key = this.generateRedisCharacterKey(characterKey);
    if (await this.history.exists(key)) {
      console.log("User already has chat history");
      return;
    }

    const content = seedContent.split(delimiter);
    let counter = 0;
    for (const line of content) {
      await this.history.zadd(key, { score: counter, member: line });
      counter += 1;
    }
  }
}
