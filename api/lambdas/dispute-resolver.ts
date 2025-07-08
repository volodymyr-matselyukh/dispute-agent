import { APIGatewayEvent, Handler } from "aws-lambda";

import * as dotenv from "dotenv";
import { submitMessageToThread } from "./common/nearAiClient";

dotenv.config();

export const handler: Handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message:
          "Please provide task name, task description, task's owner comment and task's contractor comment",
      }),
    };
  }

  const body = JSON.parse(event.body);

  if (
    !body.taskName ||
    !body.taskDescription ||
    !body.ownerComment ||
    !body.contractorComment
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message:
          "Please provide task name, task description, task's owner comment, task's contractor comment",
      }),
    };
  }

  return await resolveDispute(
    body.taskName,
    body.taskDescription,
    body.ownerComment,
    body.contractorComment
  );
};

async function resolveDispute(
  taskName: string,
  taskDescription: string,
  ownerComment: string,
  contractorComment: string
) {
  try {
    const message = `Please provide your resolution for task name: ${taskName}, task description ${taskDescription}, task's owner comment ${ownerComment}, task's contractor comment ${contractorComment}`;

    const threadId = await submitMessageToThread(
      message,
      "nescrow_dispute.near/dispute-resolver/0.0.1"
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ threadId }),
    };
  } catch (error) {
    console.log("Error computing dispute resolution ", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error happened" }),
    };
  }
}
