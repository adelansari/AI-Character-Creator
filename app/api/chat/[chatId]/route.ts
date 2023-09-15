import { StreamingTextResponse, LangChainStream } from "ai";
import { auth, currentUser } from "@clerk/nextjs";
import { Replicate } from "langchain/llms/replicate";
import { CallbackManager } from "langchain/callbacks";
import { NextResponse } from "next/server";
import { StorageManager } from "@/lib/storage";
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";
import NodeCache from "node-cache";

const cache = new NodeCache({
  stdTTL: 60 * 60, // The standard live time in seconds for every generated cache element.
  checkperiod: 120, // The period in seconds, as a number, used for the automatic delete check interval.
});

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { prompt } = await request.json();
    const user = await currentUser();

    if (!user || !user.firstName || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const identifier = request.url + "-" + user.id;
    const { success } = await rateLimit(identifier);

    if (!success) {
      return new NextResponse("Rate limit exceeded", { status: 429 });
    }

    const character = await prismadb.character.update({
      where: {
        id: params.chatId,
      },
      data: {
        messages: {
          create: {
            content: prompt,
            role: "user",
            userId: user.id,
          },
        },
      },
    });

    if (!character) {
      return new NextResponse("Character not found", { status: 404 });
    }

    const name = character.id;
    const character_file_name = name + ".txt";

    const characterKey = {
      characterName: name!,
      userId: user.id,
      modelName: "llama2-13b",
    };
    const storageManager = await StorageManager.getInstance();

    const records = await storageManager.readLatestHistory(characterKey);
    if (records.length === 0) {
      await storageManager.seedChatHistory(
        character.seed,
        "\n\n",
        characterKey
      );
    }
    await storageManager.writeToHistory("User: " + prompt + "\n", characterKey);

    // Query Pinecone

    const recentChatHistory =
      await storageManager.readLatestHistory(characterKey);

    // Right now the preamble is included in the similarity search, but that
    // shouldn't be an issue

    const similarDocs = await storageManager.vectorSearch(
      recentChatHistory,
      character_file_name
    );

    let relevantHistory = "";
    if (!!similarDocs && similarDocs.length !== 0) {
      relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n");
    }
    const { handlers } = LangChainStream();
    // Call Replicate for inference
    const model = new Replicate({
      model:
        "a16z-infra/llama-2-13b-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
      input: {
        max_length: 2048,
      },
      apiKey: process.env.REPLICATE_API_TOKEN,
      callbackManager: CallbackManager.fromHandlers(handlers),
    });

    // Turn verbose on for debugging
    model.verbose = true;

    // Create a timeout function that takes a time limit and a promise as arguments
    const timeout = <T>(timeLimit: number, promise: Promise<T>) => {
      return Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timed out")), timeLimit)
        ),
      ]);
    };

    const cacheKey = `${params.chatId}-${prompt}`;
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse && typeof cachedResponse === "string") {
      return new NextResponse(cachedResponse);
    }

    // Wrap the Replicate call with the timeout function and set the time limit to 20s
    const resp = String(
      await timeout(
        20000,
        model.call(
          `
        ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${character.name}: prefix. 

        ${character.instructions}

        Below are relevant details about ${character.name}'s past and the conversation you are in.
        ${relevantHistory}


        ${recentChatHistory}\n${character.name}:`
        )
      ).catch(console.error)
    );

    // Store the result in the cache
    cache.set(cacheKey, resp);

    const cleaned = resp.replaceAll(",", "");
    const chunks = cleaned.split("\n");
    const response = chunks[0];

    await storageManager.writeToHistory("" + response.trim(), characterKey);
    var Readable = require("stream").Readable;

    let s = new Readable();
    s.push(response);
    s.push(null);
    if (response !== undefined && response.length > 1) {
      storageManager.writeToHistory("" + response.trim(), characterKey);

      await prismadb.character.update({
        where: {
          id: params.chatId,
        },
        data: {
          messages: {
            create: {
              content: response.trim(),
              role: "system",
              userId: user.id,
            },
          },
        },
      });
    }

    return new NextResponse(resp);
  } catch (error) {
    if (error instanceof Error && error.message === "Request timed out") {
      return new NextResponse("Gateway Timeout", { status: 504 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
