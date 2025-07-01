# Anthropic Provider for MediaConduit

A dynamic provider for integrating Anthropic's Claude models with MediaConduit. Provides access to **advanced reasoning**, **analysis**, and **conversational AI** through Claude's industry-leading language models.

## Features

- **🧠 Advanced Reasoning**: Claude's superior logical thinking and analysis
- **🔍 Dynamic Discovery**: Automatically discovers available Claude models
- **⚡ Dynamic Loading**: Loads directly from GitHub repository
- **🔧 Zero Configuration**: Works immediately after loading with API key
- **📊 Model Variety**: Access to latest Claude models automatically
- **🚀 High Quality**: Industry-leading text generation and reasoning

## Supported Model Types

### Claude Model Families
- **Claude 3.5**: Latest production models (Sonnet, Haiku)
- **Claude 3**: Established models (Opus, Sonnet, Haiku)
- **Claude 2.x**: Legacy models for compatibility

### Model Capabilities
- **Advanced Reasoning**: Complex problem-solving and analysis
- **Code Generation**: High-quality code writing and debugging
- **Creative Writing**: Literary and creative content generation
- **Document Analysis**: Comprehensive text understanding
- **Mathematical Reasoning**: Advanced mathematical problem-solving

**Models are discovered dynamically** - always up-to-date with Anthropic's latest releases!

## Quick Start

### 1. Load the Provider

```typescript
import { getProviderRegistry } from '@mediaconduit/mediaconduit';

// Load provider from GitHub
const registry = getProviderRegistry();
const provider = await registry.getProvider('https://github.com/MediaConduit/anthropic-provider');
```

### 2. Configure with API Key

```typescript
// Provider auto-configures from environment variable
// Set ANTHROPIC_API_KEY in your environment
```

### 3. Use Claude Models

```typescript
// List available models
const models = provider.getModelsForCapability(MediaCapability.TEXT_TO_TEXT);
console.log(`${models.length} Claude models available`);

// Use the latest Claude model
const claude = await provider.getModel('claude-3-5-sonnet-latest');
const analysis = await claude.transform(`
  Analyze the pros and cons of microservices architecture
  for a fintech application handling 1M+ transactions daily.
`);

// The result contains sophisticated analysis
console.log(`Generated analysis: ${analysis.content.length} characters`);
```

## Configuration

### Environment Variables

```bash
# Required: Anthropic API key
ANTHROPIC_API_KEY=your_api_key_here

# Optional: Custom base URL
ANTHROPIC_BASE_URL=https://api.anthropic.com

# Optional: Request timeout
ANTHROPIC_TIMEOUT=30000
```

### Provider Configuration

```yaml
# MediaConduit.provider.yml
id: anthropic-provider
name: Anthropic Provider
type: remote
capabilities:
  - text-to-text

# No hardcoded models - they're discovered dynamically!
```

## Development

### Building

```bash
npm install
npm run build
```

### Testing

```bash
# Set API key
export ANTHROPIC_API_KEY=your_key_here

# Run tests
npm test
```

### Project Structure

```
anthropic-provider/
├── src/
│   ├── AnthropicProvider.ts          # Main provider class
│   ├── AnthropicAPIClient.ts         # API client
│   ├── AnthropicTextToTextModel.ts   # Text-to-text model
│   └── index.ts                      # Exports
├── MediaConduit.provider.yml         # Provider metadata
├── package.json                      # Dependencies
└── README.md                         # This file
```

## API Reference

### AnthropicProvider

```typescript
class AnthropicProvider implements MediaProvider {
  readonly id: string = 'anthropic';
  readonly name: string = 'Anthropic';
  readonly type: ProviderType = ProviderType.REMOTE;
  readonly capabilities: MediaCapability[];
  
  async configure(config: ProviderConfig): Promise<void>;
  async isAvailable(): Promise<boolean>;
  getModelsForCapability(capability: MediaCapability): ProviderModel[];
  async getModel(modelId: string): Promise<TextToTextModel>;
}
```

### Generation Options

```typescript
interface AnthropicTextToTextOptions {
  temperature?: number;          // 0.0 to 1.0 (creativity)
  max_tokens?: number;          // Maximum tokens to generate
  top_p?: number;               // 0.0 to 1.0 (nucleus sampling)
  system?: string;              // System message for context
  stop_sequences?: string[];    // Custom stop sequences
}
```

## Model Selection Guide

### For Advanced Reasoning
- Use `claude-3-5-sonnet-latest` for the most sophisticated analysis
- Use `claude-3-opus-latest` for maximum reasoning power

### For Fast Responses
- Use `claude-3-5-haiku-latest` for quick, efficient responses
- Use `claude-3-haiku-20240307` for proven fast performance

### For Code Generation
- Use `claude-3-5-sonnet-latest` for complex code generation
- Use `claude-3-sonnet-20240229` for code analysis and debugging

## Advanced Usage

### Complex Analysis

```typescript
const claude = await provider.getModel('claude-3-5-sonnet-latest');
const analysis = await claude.transform(
  `Analyze this business problem: A SaaS company wants to migrate 
   from monolithic to microservices architecture. They have 200K users, 
   $50M ARR, and a team of 30 engineers. What's the migration strategy?`,
  {
    temperature: 0.3,     // Lower temperature for analytical tasks
    max_tokens: 4000,     // Longer response for detailed analysis
    system: 'You are a senior software architect with 20 years of experience.'
  }
);
```

### Code Generation

```typescript
const codeGenerator = await provider.getModel('claude-3-5-sonnet-latest');
const code = await codeGenerator.transform(
  'Create a TypeScript class for managing Redis connections with connection pooling',
  {
    temperature: 0.1,     // Very low for code generation
    max_tokens: 2000,
    system: 'You are an expert TypeScript developer. Write clean, well-documented code.'
  }
);
```

### Creative Writing

```typescript
const writer = await provider.getModel('claude-3-opus-latest');
const story = await writer.transform(
  'Write a short story about AI and human collaboration in the year 2030',
  {
    temperature: 0.8,     // Higher temperature for creativity
    max_tokens: 3000,
    system: 'You are a creative science fiction writer.'
  }
);
```

### Batch Processing

```typescript
// Process multiple analyses with the same model
const claude = await provider.getModel('claude-3-5-sonnet-latest');
const questions = [
  'What are the benefits of serverless architecture?',
  'How does edge computing improve performance?',
  'What are the security implications of containerization?'
];

const analyses = await Promise.all(
  questions.map(question => claude.transform(question, {
    temperature: 0.3,
    max_tokens: 1500
  }))
);

console.log(`Generated ${analyses.length} detailed analyses`);
```

## Quality Optimization

Claude models excel with proper prompting:

```typescript
// High-quality analysis prompting
const claude = await provider.getModel('claude-3-5-sonnet-latest');
const result = await claude.transform(`
  <task>
  Analyze the technical architecture for a real-time chat application 
  that needs to handle 100K concurrent users.
  </task>
  
  <context>
  - Budget: $50K/month infrastructure
  - Team: 5 full-stack engineers
  - Timeline: 6 months to MVP
  - Compliance: SOC2 required
  </context>
  
  <requirements>
  Provide:
  1. System architecture diagram (text description)
  2. Technology stack recommendations
  3. Scalability considerations
  4. Security implementation
  5. Cost breakdown
  6. Risk assessment
  </requirements>
`,
  {
    temperature: 0.2,
    max_tokens: 5000,
    system: `You are a senior solutions architect with expertise in:
    - Real-time systems and WebSocket technologies
    - Cloud infrastructure (AWS, GCP, Azure)
    - Security and compliance frameworks
    - Cost optimization strategies
    
    Provide detailed, actionable recommendations with specific technologies and implementation approaches.`
  }
);
```

## Error Handling

The provider includes comprehensive error handling:

- **API Errors**: Automatic retries for transient failures
- **Rate Limiting**: Respects Anthropic's rate limits
- **Model Validation**: Validates model existence before requests
- **Network Issues**: Graceful degradation with informative error messages
- **Dynamic Discovery**: Falls back to known models if API discovery fails

## Cost Optimization

Anthropic pricing is based on token usage:

```typescript
// Optimize for cost
const efficientOptions = {
  temperature: 0.1,      // More deterministic = fewer retries
  max_tokens: 1000,      // Limit response length
  top_p: 0.9            // Focus on most likely tokens
};

// Use faster models for simple tasks
const haiku = await provider.getModel('claude-3-5-haiku-latest');
const quickResponse = await haiku.transform('Summarize this in 3 bullets', efficientOptions);

// Use premium models only for complex reasoning
const sonnet = await provider.getModel('claude-3-5-sonnet-latest');
const complexAnalysis = await sonnet.transform('Detailed architectural analysis...');
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: https://github.com/MediaConduit/anthropic-provider/issues
- Anthropic Documentation: https://docs.anthropic.com
- MediaConduit Documentation: https://mediaconduit.dev/docs/providers/anthropic
