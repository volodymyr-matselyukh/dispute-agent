import axios from "axios";

export const getLastThreadMessageFromBot = async (threadId: string) => {
  const messagesResponse = await axios.get(
    `https://api.near.ai/v1/threads/${threadId}/messages?limit=100`,
    {
      headers: {
        Authorization: `Bearer ${process.env.authorizationToken}`,
      },
    }
  );

  const messages: [
    {
      role: string;
      created_at: number;
      content: [{ text: { value: string } }];
      metadata: {
        message_type: string;
      };
    }
  ] = messagesResponse?.data?.data ?? [];

  const assistantMessages = messages.filter(
    (message: {
      role: string;
      metadata: {
        message_type: string;
      };
    }) => message.role === "assistant" && message.metadata == null
  );

  assistantMessages.sort(
    (message1: { created_at: number }, message2: { created_at: number }) =>
      message2.created_at - message1.created_at
  );

  if (assistantMessages.length > 0) {
    return assistantMessages[0].content[0].text.value;
  }

  return "";
};

export const listMessages = async (threadId: string) => {
  const messagesResponse = await axios.get(
    `https://api.near.ai/v1/threads/${threadId}/messages?limit=100`,
    {
      headers: {
        Authorization: `Bearer ${process.env.authorizationToken}`,
      },
    }
  );

  const messages: [
    {
      role: string;
      created_at: number;
      content: [{ text: { value: string } }];
      metadata: {
        message_type: string;
      };
    }
  ] = messagesResponse?.data?.data ?? [];

  const filteredMessages = messages.filter(
    (message: {
      role: string;
      created_at: number;
      content: [{ text: { value: string } }];
      metadata: {
        message_type: string;
      };
    }) => message.metadata == null
  );

  filteredMessages.sort(
    (message1: { created_at: number }, message2: { created_at: number }) =>
      message2.created_at - message1.created_at
  );

  return filteredMessages.map((message) => ({
    text: message.content[0].text.value,
    role: message.role,
    createdAt: message.created_at,
  }));
};

export const submitMessageToThread = async (
  message: string,
  agentId: string,
  threadId?: string
) => {
  const body: {
    agent_id: string;
    new_message: string;
    max_iterations: string;
    thread_id?: string;
  } = {
    agent_id: agentId,
    new_message: message,
    max_iterations: "1",
  };

  if (threadId) {
    body.thread_id = threadId;
  }

  const threadsResponse = await axios.post(
    "https://api.near.ai/v1/threads/runs",
    body,
    {
      headers: {
        Authorization: `Bearer ${process.env.authorizationToken}`,
      },
    }
  );

  const threadIdFromResponse = threadsResponse.data;

  return threadIdFromResponse;
};
