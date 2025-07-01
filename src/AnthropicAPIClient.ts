/**
 * Anthropic API Client
 *
 * Minimal client for interacting with Anthropic's Claude API.
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface AnthropicConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface AnthropicMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AnthropicChatRequest {
  model: string;
  max_tokens: number;
  messages: AnthropicMessage[];
  temperature?: number;
  top_p?: number;
  stop_sequences?: string[];
  system?: string;
  stream?: boolean;
}

export interface AnthropicChatResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{ type: string; text: string }>;
  model: string;
  stop_reason: string | null;
  stop_sequence: string | null;
}

export interface AnthropicModel {
  id: string;
  input_tokens?: number;
  output_tokens?: number;
}

export interface AnthropicModelsResponse {
  data: AnthropicModel[];
}

export class AnthropicAPIClient {
  private client: AxiosInstance;
  private config: AnthropicConfig;

  constructor(config: AnthropicConfig) {
    this.config = {
      baseUrl: 'https://api.anthropic.com/v1',
      timeout: 300000,
      ...config
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/models');
      return true;
    } catch (error) {
      console.warn('Anthropic connection test failed:', error);
      return false;
    }
  }

  async getAvailableModels(): Promise<AnthropicModel[]> {
    try {
      const response: AxiosResponse<AnthropicModelsResponse> = await this.client.get('/models');
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to fetch Anthropic models: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateText(model: string, prompt: string, options?: { temperature?: number; maxTokens?: number; topP?: number; systemPrompt?: string }): Promise<string> {
    const messages: AnthropicMessage[] = [];

    if (options?.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    const request: AnthropicChatRequest = {
      model,
      max_tokens: options?.maxTokens ?? 1024,
      messages,
      temperature: options?.temperature,
      top_p: options?.topP
    };

    const response: AxiosResponse<AnthropicChatResponse> = await this.client.post('/messages', request);

    if (!response.data || !response.data.content || response.data.content.length === 0) {
      throw new Error('No response content returned from Anthropic');
    }

    return response.data.content.map(part => part.text).join('');
  }
}
