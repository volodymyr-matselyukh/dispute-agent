import { APIGatewayEvent, Handler } from "aws-lambda";

import * as dotenv from "dotenv";
import {
  getLastThreadMessageFromBot,
  submitMessageToThread,
} from "./common/nearAiClient";

dotenv.config();

export const handler: Handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Please provide message and thread id",
      }),
    };
  }

  const body = JSON.parse(event.body);

  if (!body.message || !body.threadId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Please provide message and thread id",
      }),
    };
  }

  return clarifyDisputeResolution(body.message, body.threadId);
};

async function clarifyDisputeResolution(message: string, threadId: string) {
  try {
    const threadIdFromResponse = await submitMessageToThread(
      message,
      "nescrow_dispute.near/dispute-resolver/0.0.1",
      threadId
    );

    const lastBotMessage = await getLastThreadMessageFromBot(
      threadIdFromResponse
    );

    if (lastBotMessage) {
      return {
        statusCode: 200,
        body: { threadId: threadIdFromResponse, response: lastBotMessage },
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error clarifying resolution" }),
    };
  } catch (error) {
    console.log("Error clarifying resolution ", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error happened" }),
    };
  }
}
