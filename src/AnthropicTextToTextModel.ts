/**
 * Anthropic Text-to-Text Model
 *
 * Concrete implementation of TextToTextModel for Anthropic's Claude models.
 */

import { TextToTextModel, TextToTextOptions } from '../../models/abstracts/TextToTextModel';
import { ModelMetadata } from '../../models/abstracts/Model';
import { Text, TextRole } from '../../assets/roles';
import { AnthropicAPIClient } from './AnthropicAPIClient';
import { createGenerationPrompt, extractInputContent } from '../../utils/GenerationPromptHelper';

export interface AnthropicTextToTextOptions extends TextToTextOptions {
  systemPrompt?: string;
}

export interface AnthropicTextToTextConfig {
  apiClient: AnthropicAPIClient;
  modelId: string;
  metadata?: Partial<ModelMetadata>;
}

export class AnthropicTextToTextModel extends TextToTextModel {
  private apiClient: AnthropicAPIClient;
  private modelId: string;

  constructor(config: AnthropicTextToTextConfig) {
    const metadata: ModelMetadata = {
      id: config.modelId,
      name: config.metadata?.name || `Anthropic ${config.modelId}`,
      description: config.metadata?.description || `Anthropic text-to-text model: ${config.modelId}`,
      version: config.metadata?.version || '1.0.0',
      provider: 'anthropic',
      capabilities: ['text-generation'],
      inputTypes: ['text'],
      outputTypes: ['text'],
      ...config.metadata
    };

    super(metadata);
    this.apiClient = config.apiClient;
    this.modelId = config.modelId;
  }

  async transform(input: TextRole | TextRole[] | string | string[], options?: AnthropicTextToTextOptions): Promise<Text> {
    const startTime = Date.now();

    const inputRole = Array.isArray(input) ? input[0] : input;
    
    // Handle both TextRole and string inputs
    let text: Text;
    if (typeof inputRole === 'string') {
      text = Text.fromString(inputRole);
    } else {
      text = await inputRole.asRole(Text);
    }

    if (!text.isValid()) {
      throw new Error('Invalid text data provided');
    }

    const generated = await this.apiClient.generateText(this.modelId, text.content, {
      temperature: options?.temperature,
      maxTokens: options?.maxOutputTokens,
      topP: options?.topP,
      systemPrompt: options?.systemPrompt
    });

    const processingTime = Date.now() - startTime;

    return Text.fromString(generated, text.language || 'auto', 1.0, {
      processingTime,
      model: this.modelId,
      provider: 'anthropic',
      generation_prompt: createGenerationPrompt({
        input,
        options,
        modelId: this.modelId,
        modelName: this.modelId,
        provider: 'anthropic',
        transformationType: 'text-to-text',
        processingTime
      })
    }, text.sourceAsset);
  }

  async isAvailable(): Promise<boolean> {
    try {
      return await this.apiClient.testConnection();
    } catch (error) {
      console.warn(`Anthropic model ${this.modelId} availability check failed:`, error);
      return false;
    }
  }
}
