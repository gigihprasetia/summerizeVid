"use server";

import { AI_AGENT } from "@/lib/utils";

// import OpenAI from "openai";

// const apiKey = process.env.OPEN_AI_KEY;

// export const AI_AGENT = new OpenAI({
//   apiKey,
// });

export const askToChatGPT = async (userPrompt: string) => {
  try {
    const response = await AI_AGENT.responses.create({
      model: "gpt-4",

      input: [
        {
          role: "system",
          content: `give the formatting text \n to prettier`,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    return response.output;
  } catch (err: any) {
    console.error(
      "❌ Error calling ChatGPT:",
      err.response?.data || err.message
    );
    throw err;
  }
};
