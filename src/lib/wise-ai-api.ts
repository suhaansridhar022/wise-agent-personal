import { Message } from "@langchain/langgraph-sdk";

export interface WiseAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function callWiseAIAPI(
  messages: Message[],
  model: string,
  apiUrl: string,
  apiKey: string
): Promise<WiseAIResponse> {
  // Convert LangGraph messages to OpenAI format
  const openAIMessages = messages.map((msg) => {
    if (msg.type === "human") {
      return {
        role: "user",
        content: Array.isArray(msg.content) 
          ? msg.content.map(c => c.type === "text" ? c.text : "").join("")
          : msg.content
      };
    } else if (msg.type === "ai") {
      return {
        role: "assistant", 
        content: Array.isArray(msg.content)
          ? msg.content.map(c => c.type === "text" ? c.text : "").join("")
          : msg.content
      };
    }
    return null;
  }).filter(Boolean);

  const response = await fetch(`${apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: openAIMessages,
      max_tokens: 1000,
      temperature: 0.7,
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Wise AI API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

export function isWiseAIModel(model: string): boolean {
  return model.toLowerCase().includes('wise_ai') || model.toLowerCase().includes('wise-ai');
}

export function isWiseAIUrl(url: string): boolean {
  return url.includes('wisseninfotech.com') || url.includes('wise');
}
