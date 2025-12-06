# Monolith to Microservices Migration Orchestrator 🚀

An intelligent **AI-powered multi-agent system** that transforms legacy PHP monolith applications into modern, production-ready microservices in **Go**, **Python (FastAPI)**, or **Node.js + TypeScript**.

## ✨ Features

### 🤖 Multi-Agent Architecture
- **Architecture Agent** (Claude Haiku) - Analyzes monolith structure and detects all endpoints
- **Endpoint Analysis Agent** (Claude Sonnet) - Deep-dives into selected endpoints
- **Microservice Generator Agent** (Claude Sonnet) - Generates complete microservice code
- **Verifier Agent** (Claude Haiku) - Validates code quality and security
- **Aggregator Agent** (GPT-4o) - Orchestrates the entire workflow

### 🎯 Key Capabilities
- ✅ Automatic endpoint detection from PHP monoliths
- ✅ Multi-language support: Go, Python (FastAPI), Node.js + TypeScript
- ✅ Complete microservice generation including:
  - Source code with proper structure
  - Dockerfile (multi-stage, optimized)
  - Dependencies management
  - Error handling & logging
  - API documentation
  - Environment configuration
- ✅ Security analysis and best practices validation
- ✅ One-click ZIP download of complete microservice

### 🔧 Technology Stack
- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **AI**: Vercel AI SDK with Anthropic Claude & OpenAI GPT-4o
- **Validation**: Zod schemas
- **Deployment**: Ready for Vercel, Docker, or any Node.js hosting

## 📋 Prerequisites

- Node.js 20+ 
- npm or yarn
- API Keys:
  - Anthropic API key (for Claude models)
  - OpenAI API key (for GPT-4o)

## 🚀 Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd agents-orchestrator
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Configure environment variables**

Create a \`.env.local\` file in the root directory:

\`\`\`env
# AI API Keys (REQUIRED)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

**How to get API keys:**
- **Anthropic**: https://console.anthropic.com/
- **OpenAI**: https://platform.openai.com/api-keys

4. **Run the development server**
\`\`\`bash
npm run dev
\`\`\`

5. **Open your browser**
\`\`\`
http://localhost:3000
\`\`\`

## 📖 Usage Guide

### Step 1: Upload Monolith
1. Navigate to the upload page
2. Select your PHP monolith folder (supports entire directory upload)
3. Click "Analyze Application"

### Step 2: Review Architecture
- View detected endpoints with their:
  - HTTP method (GET, POST, PUT, DELETE)
  - Path
  - File location
  - Complexity level
  - Description

### Step 3: Select Endpoint
- Click "Migrate" on any endpoint
- Review detailed analysis:
  - Input parameters
  - Business logic breakdown
  - Database operations
  - Dependencies
  - Security considerations

### Step 4: Choose Language
Select your target language:
- **Go** - High performance, compiled
- **Python (FastAPI)** - Modern, async Python
- **Node.js + TypeScript** - JavaScript with type safety

### Step 5: Generate & Download
- Wait for AI agents to generate your microservice (~1-2 minutes)
- Review verification results and quality score
- Browse generated files
- Download complete ZIP package

## 🏗️ Architecture

### Agent Workflow

\`\`\`
┌─────────────────┐
│   Upload Files  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Architecture Agent     │ ← Analyzes structure
│  (Claude Haiku)         │   Detects endpoints
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Endpoint Analysis Agent │ ← Deep analysis
│ (Claude Sonnet)         │   Parameters, DB, logic
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Microservice Generator  │ ← Generates code
│ (Claude Sonnet)         │   Dockerfile, configs
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Verifier Agent        │ ← Validates & optimizes
│   (Claude Haiku)        │   Security checks
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Aggregator (GPT-4o)    │ ← Orchestrates workflow
│                         │   Packages ZIP
└─────────────────────────┘
\`\`\`

### Project Structure

\`\`\`
agents-orchestrator/
├── app/
│   ├── api/                    # API routes
│   │   ├── upload/             # File upload
│   │   ├── architecture/       # Architecture analysis
│   │   ├── endpoint-analysis/  # Endpoint deep-dive
│   │   ├── microservice-generator/ # Code generation
│   │   ├── verifier/           # Code verification
│   │   ├── aggregator/         # Workflow orchestrator
│   │   └── download/[id]/      # ZIP download
│   ├── upload/                 # Upload page
│   ├── scan/                   # Endpoints list
│   ├── endpoint/[id]/          # Endpoint analysis view
│   ├── select-language/[id]/   # Language selection
│   ├── generate/[id]/          # Generation & results
│   └── page.tsx                # Home page
├── components/
│   ├── upload/
│   │   └── FileUploader.tsx
│   ├── endpoint/
│   │   ├── EndpointTable.tsx
│   │   └── EndpointInspector.tsx
│   └── generator/
│       ├── LanguageSelector.tsx
│       └── MicroservicePreview.tsx
├── lib/
│   ├── agents/                 # AI agents
│   │   ├── architecture-agent.ts
│   │   ├── endpoint-analysis-agent.ts
│   │   ├── microservice-generator-agent.ts
│   │   ├── verifier-agent.ts
│   │   └── aggregator-agent.ts
│   ├── schemas/                # Zod schemas
│   │   └── index.ts
│   ├── templates/              # Code templates
│   │   ├── go/
│   │   ├── python/
│   │   └── nodejs/
│   └── utils/                  # Helper functions
│       ├── helpers.ts
│       └── storage.ts
└── .env.local                  # Environment variables
\`\`\`

## 🔒 Security Considerations

- API keys are stored server-side only (never exposed to client)
- Input validation using Zod schemas
- AI-powered security analysis in generated code
- SQL injection detection
- Authentication/authorization checks

## 🎨 Customization

### Adding New Target Languages

1. Create template in \`lib/templates/[language]/\`
2. Update \`MicroserviceGeneratorAgent\` prompt
3. Add language option to \`LanguageSelector\` component
4. Update Zod schema to include new language

### Modifying Agent Behavior

Edit agent system prompts in \`lib/agents/[agent-name].ts\`:
- Adjust temperature for creativity vs consistency
- Modify prompt templates for different analysis styles
- Change AI models (see Vercel AI SDK docs)

## 🐛 Troubleshooting

### "API key not found" error
- Ensure \`.env.local\` exists with valid API keys
- Restart dev server after adding env variables

### Generation takes too long
- Claude Sonnet can take 30-60s for complex endpoints
- Check your API rate limits
- Consider using streaming responses (advanced)

### Upload fails
- Check file size limits (default: no limit, but consider adding)
- Ensure files are text-based (PHP, JS, HTML)
- Binary files are not supported

## 📊 Performance

- Architecture analysis: ~10-20 seconds
- Endpoint analysis: ~15-30 seconds
- Code generation: ~30-60 seconds
- Verification: ~10-15 seconds
- **Total workflow**: ~1-2 minutes per endpoint

## 🚢 Deployment

### Vercel (Recommended)

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
\`\`\`

### Docker

\`\`\`bash
# Build
docker build -t agents-orchestrator .

# Run
docker run -p 3000:3000 \\
  -e ANTHROPIC_API_KEY=your_key \\
  -e OPENAI_API_KEY=your_key \\
  agents-orchestrator
\`\`\`

## 📝 Models Used

| Agent | Model | Purpose |
|-------|-------|---------|
| Architecture | claude-3-5-haiku-20241022 | Fast structure analysis |
| Endpoint Analysis | claude-3-5-sonnet-20241022 | Deep code understanding |
| Generator | claude-3-5-sonnet-20241022 | Complex code generation |
| Verifier | claude-3-5-haiku-20241022 | Quick validation |
| Aggregator | gpt-4o | Workflow orchestration |

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Additional language support (Rust, Java, C#)
- Streaming responses for real-time progress
- Database schema migration
- Test generation
- CI/CD pipeline generation

## 📄 License

MIT License - feel free to use in commercial projects

## 🙏 Acknowledgments

- Vercel AI SDK for seamless AI integration
- Anthropic Claude for powerful code analysis
- OpenAI GPT-4o for workflow orchestration
- Next.js team for the amazing framework

---

**Built with ❤️ for developers tired of manual migrations**

## 🆘 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check existing discussions
- Review documentation

**Happy migrating! 🎉**
