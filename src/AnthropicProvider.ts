/**
 * Anthropic Provider with TextToText Support
 *
 * Provider that integrates with Anthropic's Claude API.
 * Provides access to Claude models for advanced reasoning and analysis.
 */

import {
  MediaProvider,
  ProviderType,
  MediaCapability,
  ProviderModel,
  ProviderConfig,
  GenerationRequest,
  GenerationResult
} from '@mediaconduit/mediaconduit/src/media/types/provider';
import { AnthropicAPIClient, AnthropicConfig } from './AnthropicAPIClient';
import { TextToTextProvider } from '@mediaconduit/mediaconduit/src/media/capabilities';
import { AnthropicTextToTextModel } from './AnthropicTextToTextModel';

export class AnthropicProvider implements MediaProvider, TextToTextProvider {
  readonly id = 'anthropic';
  readonly name = 'Anthropic';
  readonly type = ProviderType.REMOTE;
  readonly capabilities = [MediaCapability.TEXT_TO_TEXT];

  private config?: ProviderConfig;
  private apiClient?: AnthropicAPIClient;
  private discoveredModels = new Map<string, ProviderModel>();

  constructor() {
    // Sync configuration from environment variables
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (apiKey) {
      const anthropicConfig: AnthropicConfig = {
        apiKey,
        // Only set baseUrl if it's explicitly provided
        ...(process.env.ANTHROPIC_BASE_URL && { baseUrl: process.env.ANTHROPIC_BASE_URL }),
        ...(process.env.ANTHROPIC_TIMEOUT && { timeout: parseInt(process.env.ANTHROPIC_TIMEOUT) })
      };

      this.apiClient = new AnthropicAPIClient(anthropicConfig);
      this.config = { apiKey };
      
      // Initialize with known Claude models immediately (no async calls!)
      this.initializeKnownClaudeModels();
    }
    // If no API key, provider will be available but not functional until configured
  }

  get models(): ProviderModel[] {
    return Array.from(this.discoveredModels.values());
  }

  async configure(config: ProviderConfig): Promise<void> {
    this.config = config;

    if (!config.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    const anthropicConfig: AnthropicConfig = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      timeout: config.timeout
    };

    this.apiClient = new AnthropicAPIClient(anthropicConfig);

    // Initialize known models if not already done
    if (this.discoveredModels.size === 0) {
      this.initializeKnownClaudeModels();
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiClient) {
      return false;
    }

    try {
      return await this.apiClient.testConnection();
    } catch (error) {
      console.warn('Anthropic availability check failed:', error);
      return false;
    }
  }

  getModelsForCapability(capability: MediaCapability): ProviderModel[] {
    if (capability === MediaCapability.TEXT_TO_TEXT) {
      return this.models;
    }
    return [];
  }

  async getHealth() {
    const isAvailable = await this.isAvailable();

    return {
      status: isAvailable ? 'healthy' as const : 'unhealthy' as const,
      uptime: process.uptime(),
      activeJobs: 0,
      queuedJobs: 0,
      lastError: isAvailable ? undefined : 'API connection failed'
    };
  }

  async createTextToTextModel(modelId: string): Promise<any> {
    if (!this.apiClient) {
      throw new Error('Provider not configured');
    }

    if (!this.supportsTextToTextModel(modelId)) {
      throw new Error(`Model '${modelId}' is not supported by Anthropic provider`);
    }

    return new AnthropicTextToTextModel({ apiClient: this.apiClient, modelId });
  }

  async getModel(modelId: string): Promise<any> {
    if (!this.apiClient) {
      throw new Error('Provider not configured - set ANTHROPIC_API_KEY environment variable or call configure()');
    }

    return this.createTextToTextModel(modelId);
  }

  /**
   * Initialize with well-known Claude models (no API calls needed)
   * This ensures instant availability with reliable, stable models
   */
  private initializeKnownClaudeModels(): void {
    // Well-known stable Claude models - always available and reliable
    const knownModels = [
      // Latest generation (if available)
      'claude-3-5-sonnet-latest',
      'claude-3-5-haiku-latest', 
      'claude-3-opus-latest',
      
      // Specific stable versions
      'claude-3-5-sonnet-20241022',
      'claude-3-5-sonnet-20240620',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      
      // Legacy stable models
      'claude-2.1',
      'claude-2.0'
    ];

    knownModels.forEach(id => {
      const providerModel: ProviderModel = {
        id,
        name: this.getModelDisplayName(id),
        description: `Anthropic Claude model: ${id}`,
        capabilities: [MediaCapability.TEXT_TO_TEXT],
        parameters: {
          temperature: { type: 'number', min: 0, max: 1, default: 0.7 },
          max_tokens: { type: 'number', min: 1, max: 100000, default: 1024 },
          top_p: { type: 'number', min: 0, max: 1, default: 1 }
        }
      };
      this.discoveredModels.set(id, providerModel);
    });

    console.log(`[AnthropicProvider] Initialized ${knownModels.length} known Claude models`);
  }

  private getModelDisplayName(modelId: string): string {
    // Convert model IDs to friendly names
    const nameMap: { [key: string]: string } = {
      'claude-3-5-sonnet-latest': 'Claude 3.5 Sonnet (Latest)',
      'claude-3-5-haiku-latest': 'Claude 3.5 Haiku (Latest)',
      'claude-3-opus-latest': 'Claude 3 Opus (Latest)',
      'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet (Oct 2024)',
      'claude-3-5-sonnet-20240620': 'Claude 3.5 Sonnet (Jun 2024)',
      'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku (Oct 2024)',
      'claude-3-opus-20240229': 'Claude 3 Opus',
      'claude-3-sonnet-20240229': 'Claude 3 Sonnet',
      'claude-3-haiku-20240307': 'Claude 3 Haiku',
      'claude-2.1': 'Claude 2.1',
      'claude-2.0': 'Claude 2.0'
    };
    
    return nameMap[modelId] || modelId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }


  supportsTextToTextModel(modelId: string): boolean {
    return this.discoveredModels.has(modelId);
  }

  // Missing TextToTextProvider methods
  getSupportedTextToTextModels(): string[] {
    return Array.from(this.discoveredModels.keys()).filter(id => 
      this.discoveredModels.get(id)?.capabilities.includes(MediaCapability.TEXT_TO_TEXT)
    );
  }

  async startService(): Promise<boolean> {
    return await this.isAvailable();
  }

  async stopService(): Promise<boolean> {
    // Remote API - no service to stop
    return true;
  }

  async getServiceStatus(): Promise<{ running: boolean; healthy: boolean; error?: string }> {
    const isAvailable = await this.isAvailable();
    return {
      running: true, // Remote APIs are always "running"
      healthy: isAvailable,
    };
  }
}
