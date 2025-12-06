# Deployment Guide 🚀

## Deploy to Vercel (Recommended)

Vercel offers the best experience for Next.js applications with automatic deployments and edge functions.

### Prerequisites
- GitHub/GitLab/Bitbucket account
- Vercel account (free tier available)

### Steps

1. **Push code to Git repository**

\`\`\`bash
git init
git add .
git commit -m "Initial commit: Multi-agent migration orchestrator"
git remote add origin https://github.com/yourusername/agents-orchestrator.git
git push -u origin main
\`\`\`

2. **Connect to Vercel**

Visit: https://vercel.com/new

- Import your Git repository
- Framework: Next.js (auto-detected)
- Root directory: `./`
- Build command: `npm run build`
- Output directory: `.next`

3. **Add Environment Variables**

In Vercel dashboard → Settings → Environment Variables:

\`\`\`
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-key-here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
\`\`\`

4. **Deploy**

Click "Deploy" - Done! ✅

Your app will be live at: `https://your-app.vercel.app`

### Automatic Deployments

Every push to `main` branch will automatically deploy.

Preview deployments are created for pull requests.

## Deploy to Docker

### Build Image

\`\`\`bash
docker build -t agents-orchestrator:latest .
\`\`\`

### Run Container

\`\`\`bash
docker run -d \\
  --name agents-orchestrator \\
  -p 3000:3000 \\
  -e ANTHROPIC_API_KEY=your_key \\
  -e OPENAI_API_KEY=your_key \\
  agents-orchestrator:latest
\`\`\`

### Docker Compose

Create `docker-compose.yml`:

\`\`\`yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY}
      - OPENAI_API_KEY=\${OPENAI_API_KEY}
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
    restart: unless-stopped
\`\`\`

Run with:
\`\`\`bash
docker-compose up -d
\`\`\`

## Deploy to AWS

### Using AWS Amplify

1. Push code to GitHub
2. Go to AWS Amplify console
3. Connect repository
4. Add environment variables
5. Deploy

### Using EC2

\`\`\`bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/yourusername/agents-orchestrator.git
cd agents-orchestrator

# Install dependencies
npm install

# Create .env.local
echo "ANTHROPIC_API_KEY=your_key" > .env.local
echo "OPENAI_API_KEY=your_key" >> .env.local

# Build
npm run build

# Install PM2
sudo npm install -g pm2

# Start with PM2
pm2 start npm --name "agents-orchestrator" -- start
pm2 save
pm2 startup
\`\`\`

### Setup Nginx

\`\`\`nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

## Deploy to Google Cloud Platform

### Using Cloud Run

\`\`\`bash
# Install gcloud CLI
# Authenticate
gcloud auth login

# Build and push to GCR
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/agents-orchestrator

# Deploy to Cloud Run
gcloud run deploy agents-orchestrator \\
  --image gcr.io/YOUR_PROJECT_ID/agents-orchestrator \\
  --platform managed \\
  --region us-central1 \\
  --allow-unauthenticated \\
  --set-env-vars="ANTHROPIC_API_KEY=your_key,OPENAI_API_KEY=your_key"
\`\`\`

## Deploy to Azure

### Using Azure App Service

\`\`\`bash
# Install Azure CLI
# Login
az login

# Create resource group
az group create --name agents-orchestrator-rg --location eastus

# Create App Service plan
az appservice plan create \\
  --name agents-orchestrator-plan \\
  --resource-group agents-orchestrator-rg \\
  --sku B1 --is-linux

# Create web app
az webapp create \\
  --resource-group agents-orchestrator-rg \\
  --plan agents-orchestrator-plan \\
  --name agents-orchestrator \\
  --runtime "NODE|20-lts"

# Configure environment variables
az webapp config appsettings set \\
  --resource-group agents-orchestrator-rg \\
  --name agents-orchestrator \\
  --settings ANTHROPIC_API_KEY=your_key OPENAI_API_KEY=your_key

# Deploy
az webapp deployment source config-zip \\
  --resource-group agents-orchestrator-rg \\
  --name agents-orchestrator \\
  --src output.zip
\`\`\`

## Environment Variables

Required for all deployments:

| Variable | Description | Example |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | `sk-ant-...` |
| `OPENAI_API_KEY` | OpenAI GPT-4o API key | `sk-...` |
| `NEXT_PUBLIC_APP_URL` | Public app URL | `https://app.com` |

Optional:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3000` |
| `DEBUG` | Enable debug logs | `false` |

## Performance Considerations

### For Production

1. **Enable caching**
   - Cache architecture analysis results
   - Use Redis for session storage

2. **Rate limiting**
   - Add rate limits to API routes
   - Prevent abuse

3. **Monitoring**
   - Use Vercel Analytics or similar
   - Monitor AI API usage and costs

4. **Database**
   - Replace in-memory storage with PostgreSQL/MongoDB
   - Store migration history

### Example Redis Integration

\`\`\`typescript
// lib/utils/cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

export async function cacheArchitecture(uploadId: string, data: any) {
  await redis.set(\`arch:\${uploadId}\`, JSON.stringify(data), {
    ex: 3600, // 1 hour
  });
}

export async function getCachedArchitecture(uploadId: string) {
  const data = await redis.get(\`arch:\${uploadId}\`);
  return data ? JSON.parse(data) : null;
}
\`\`\`

## SSL/HTTPS

Most platforms handle SSL automatically:
- ✅ Vercel: Free SSL included
- ✅ AWS Amplify: Free SSL included
- ✅ Cloud Run: Free SSL included

For custom servers (EC2, etc.), use Let's Encrypt:

\`\`\`bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
\`\`\`

## Health Checks

Add health check endpoint:

\`\`\`typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  });
}
\`\`\`

## Monitoring & Logs

### Vercel
- Real-time logs in dashboard
- Function logs per request
- Error tracking

### Custom Servers
Use PM2 with logging:

\`\`\`bash
pm2 logs agents-orchestrator
pm2 monit
\`\`\`

Or use dedicated services:
- Datadog
- New Relic
- Sentry (for error tracking)

## Cost Estimation

### Vercel (Recommended for MVP)
- **Free tier**: Enough for testing
- **Pro ($20/mo)**: Production use
- Includes: Hosting, SSL, CDN, Analytics

### AI API Costs (approximate)
- Claude Haiku: ~$0.25 per endpoint analysis
- Claude Sonnet: ~$3 per microservice generation
- GPT-4o: ~$0.01 per orchestration

**Example**: 100 migrations/month ≈ $325 in AI costs

### Self-Hosted (AWS/GCP)
- **Compute**: $20-50/month (small instance)
- **Storage**: $5-10/month
- **Bandwidth**: $10-20/month
- **Total**: $35-80/month + AI costs

## Scaling

For high traffic:

1. **Horizontal scaling**: Multiple instances behind load balancer
2. **Caching**: Redis for frequently accessed data
3. **Queue system**: RabbitMQ/SQS for long-running tasks
4. **CDN**: CloudFlare for static assets

## Backup & Recovery

### Database Backups
\`\`\`bash
# Daily automated backups
0 2 * * * pg_dump dbname > backup-$(date +%Y%m%d).sql
\`\`\`

### Code Backups
- Git repository (already backed up)
- Environment variables: Store securely in 1Password/Vault

## Security Checklist

- ✅ API keys in environment variables (never commit)
- ✅ HTTPS enabled
- ✅ Rate limiting configured
- ✅ Input validation with Zod
- ✅ CORS properly configured
- ✅ Regular dependency updates
- ✅ Security headers (helmet.js)

## Post-Deployment

1. Test all endpoints
2. Monitor error rates
3. Check AI API usage
4. Set up alerts
5. Document any custom configuration

---

**Your app is production-ready! 🎉**

Need help? Check TROUBLESHOOTING.md
