import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type AIModel = 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet' | 'gemini-pro' | 'grok-1';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  model: AIModel;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// OpenAI client
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Anthropic client
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// Google AI client
const googleAI = process.env.GOOGLE_AI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  : null;

export async function chat(
  messages: ChatMessage[],
  model: AIModel = 'gpt-4'
): Promise<AIResponse> {
  switch (model) {
    case 'gpt-4':
    case 'gpt-4-turbo':
    case 'gpt-3.5-turbo':
      return chatWithOpenAI(messages, model);
    case 'claude-3-opus':
    case 'claude-3-sonnet':
      return chatWithAnthropic(messages, model);
    case 'gemini-pro':
      return chatWithGemini(messages);
    case 'grok-1':
      return chatWithGrok(messages);
    default:
      throw new Error(`Unsupported model: ${model}`);
  }
}

async function chatWithOpenAI(
  messages: ChatMessage[],
  model: string
): Promise<AIResponse> {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  const modelMap: Record<string, string> = {
    'gpt-4': 'gpt-4',
    'gpt-4-turbo': 'gpt-4-turbo-preview',
    'gpt-3.5-turbo': 'gpt-3.5-turbo',
  };

  const response = await openai.chat.completions.create({
    model: modelMap[model] || 'gpt-4',
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    max_tokens: 4096,
  });

  return {
    content: response.choices[0]?.message?.content || '',
    model: model as AIModel,
    usage: {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    },
  };
}

async function chatWithAnthropic(
  messages: ChatMessage[],
  model: string
): Promise<AIResponse> {
  if (!anthropic) {
    throw new Error('Anthropic API key not configured');
  }

  const modelMap: Record<string, string> = {
    'claude-3-opus': 'claude-3-opus-20240229',
    'claude-3-sonnet': 'claude-3-sonnet-20240229',
  };

  const systemMessage = messages.find((m) => m.role === 'system');
  const conversationMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

  const response = await anthropic.messages.create({
    model: modelMap[model] || 'claude-3-sonnet-20240229',
    max_tokens: 4096,
    system: systemMessage?.content,
    messages: conversationMessages,
  });

  const textContent = response.content.find((c) => c.type === 'text');

  return {
    content: textContent?.type === 'text' ? textContent.text : '',
    model: model as AIModel,
    usage: {
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
    },
  };
}

async function chatWithGemini(messages: ChatMessage[]): Promise<AIResponse> {
  if (!googleAI) {
    throw new Error('Google AI API key not configured');
  }

  const model = googleAI.getGenerativeModel({ model: 'gemini-pro' });

  const history = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const lastMessage = history.pop();
  if (!lastMessage) {
    throw new Error('No messages provided');
  }

  const chat = model.startChat({
    history: history as Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  });

  const result = await chat.sendMessage(lastMessage.parts[0].text);
  const response = result.response;

  return {
    content: response.text(),
    model: 'gemini-pro',
  };
}

async function chatWithGrok(messages: ChatMessage[]): Promise<AIResponse> {
  // xAI Grok API - using OpenAI-compatible endpoint
  const grokApiKey = process.env.XAI_API_KEY;
  if (!grokApiKey) {
    throw new Error('xAI API key not configured');
  }

  const grokClient = new OpenAI({
    apiKey: grokApiKey,
    baseURL: 'https://api.x.ai/v1',
  });

  const response = await grokClient.chat.completions.create({
    model: 'grok-beta',
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    max_tokens: 4096,
  });

  return {
    content: response.choices[0]?.message?.content || '',
    model: 'grok-1',
    usage: {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    },
  };
}

export const AI_MODELS: { value: AIModel; label: string; provider: string }[] = [
  { value: 'gpt-4', label: 'GPT-4', provider: 'OpenAI' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', provider: 'OpenAI' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus', provider: 'Anthropic' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', provider: 'Anthropic' },
  { value: 'gemini-pro', label: 'Gemini Pro', provider: 'Google' },
  { value: 'grok-1', label: 'Grok', provider: 'xAI' },
];
