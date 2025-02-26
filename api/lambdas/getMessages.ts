import { APIGatewayEvent, Handler } from "aws-lambda";

import * as dotenv from "dotenv";
import { listMessages } from "./common/nearAiClient";

dotenv.config();

export const handler: Handler = async (event: APIGatewayEvent) => {
  if (!event.pathParameters) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Please provide thread id",
      }),
    };
  }

  const threadId = event.pathParameters.threadId;

  if (!threadId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Please provide thread id",
      }),
    };
  }

  return await getMessages(threadId);
};

async function getMessages(threadId: string) {
  try {
    const messages = await listMessages(threadId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        messages,
      }),
    };
  } catch (error) {
    console.log("Error listing messages", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error happened" }),
    };
  }
}
