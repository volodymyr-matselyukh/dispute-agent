import { APIGatewayEvent, Handler } from "aws-lambda";

import * as dotenv from "dotenv";
import { extractComplianceLikelhood } from "./common/complianceLikelihoodExtractor";
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
        message: "Please provide task name and task description",
      }),
    };
  }

  const body = JSON.parse(event.body);

  if (!body.taskName || !body.taskDescription) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Please provide task name and task description",
      }),
    };
  }

  return await validateTask(body.taskName, body.taskDescription);
};

async function validateTask(taskName: string, taskDescription: string) {
  try {
    const message = `Please validate the following task name: ${taskName} and task description ${taskDescription}`;
    const threadId = await submitMessageToThread(
      message,
      "nescrow_dispute.near/compliance-validator/0.0.4"
    );

    const lastBotMessage = await getLastThreadMessageFromBot(threadId);

    if (lastBotMessage) {
      const match = extractComplianceLikelhood(lastBotMessage);

      if (match) {
        return {
          statusCode: 200,
          body: match,
        };
      }
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error validating data" }),
    };
  } catch (error) {
    console.log("Error validating task", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error happened" }),
    };
  }
}
