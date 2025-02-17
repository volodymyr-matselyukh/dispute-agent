import { Handler } from "aws-lambda";

export const handler: Handler = async (event, context) => {
  return getHello(event);
};

async function getHello(event: any) {
  return {
    statusCode: 200,
    body: JSON.stringify("hello world"),
  };
}
