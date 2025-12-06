# Troubleshooting Guide 🔧

## Common Issues and Solutions

### 1. API Key Errors

**Error**: `ANTHROPIC_API_KEY is not defined`

**Solution**:
\`\`\`bash
# Create .env.local file
echo "ANTHROPIC_API_KEY=your_key_here" > .env.local
echo "OPENAI_API_KEY=your_key_here" >> .env.local

# Restart dev server
npm run dev
\`\`\`

**Check**: Keys should start with:
- Anthropic: `sk-ant-`
- OpenAI: `sk-`

### 2. Upload Issues

**Error**: Files not detected after upload

**Possible causes**:
- Browser doesn't support directory upload (use Chrome/Edge)
- Files are too large (>10MB per file)
- Non-text files in folder

**Solution**:
\`\`\`javascript
// Check browser support
if (!HTMLInputElement.prototype.webkitdirectory) {
  console.error('Directory upload not supported');
}
\`\`\`

### 3. Generation Timeout

**Error**: Request timeout after 60s

**Causes**:
- Complex endpoint with many dependencies
- API rate limits reached
- Network issues

**Solutions**:
1. Increase timeout in `app/api/aggregator/route.ts`:
\`\`\`typescript
export const maxDuration = 300; // 5 minutes
\`\`\`

2. Check API rate limits:
   - Anthropic: https://console.anthropic.com/settings/limits
   - OpenAI: https://platform.openai.com/account/rate-limits

3. Retry with simpler endpoint first

### 4. TypeScript Errors

**Error**: Module not found

**Solution**:
\`\`\`bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
\`\`\`

### 5. AI Model Errors

**Error**: `model not found` or `invalid model`

**Check**:
- Model names in `lib/agents/`:
  - Claude Haiku: `claude-3-5-haiku-20241022`
  - Claude Sonnet: `claude-3-5-sonnet-20241022`
  - GPT-4o: `gpt-4o`

**Update** if models are deprecated:
\`\`\`typescript
const MODEL = 'claude-3-5-sonnet-20241022'; // Update this
\`\`\`

### 6. ZIP Download Empty

**Error**: Downloaded ZIP is empty or corrupted

**Causes**:
- Files not properly stored in memory
- Archive finalization error

**Debug**:
\`\`\`typescript
// Add logging in app/api/download/[id]/route.ts
console.log('Files count:', microservice.files.length);
console.log('Archive size:', buffer.length);
\`\`\`

**Solution**:
- Ensure `archiver` is installed: `npm install archiver`
- Check browser console for errors

### 7. Slow Performance

**Issue**: App feels slow

**Optimizations**:

1. Enable streaming (advanced):
\`\`\`typescript
// In agent files
import { streamObject } from 'ai';
// Use streamObject instead of generateObject
\`\`\`

2. Reduce file context:
\`\`\`typescript
// In aggregator-agent.ts
const relatedFiles = this.findRelatedFiles(
  fileStructure,
  mainContent
).slice(0, 5); // Reduce from 10 to 5
\`\`\`

3. Cache architecture analysis:
\`\`\`typescript
// Store in database instead of memory
\`\`\`

### 8. Memory Issues (Node.js)

**Error**: JavaScript heap out of memory

**Solution**:
\`\`\`bash
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
\`\`\`

Or add to `package.json`:
\`\`\`json
{
  "scripts": {
    "dev": "NODE_OPTIONS='--max-old-space-size=4096' next dev"
  }
}
\`\`\`

### 9. CORS Errors

**Error**: CORS policy blocked

**For local development**:
- Already handled by Next.js
- If using external frontend, add to `next.config.js`:

\`\`\`javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
        ],
      },
    ];
  },
};
\`\`\`

### 10. Production Build Fails

**Error**: Build errors in production

**Check**:
\`\`\`bash
# Test production build locally
npm run build
npm start
\`\`\`

**Common fixes**:
1. Add missing dependencies
2. Fix TypeScript errors: `npm run type-check`
3. Check environment variables in Vercel dashboard

## Getting Help

### Enable Debug Logging

Add to `.env.local`:
\`\`\`env
NODE_ENV=development
DEBUG=true
\`\`\`

### Check Logs

**Development**:
- Browser console (F12)
- Terminal running `npm run dev`

**Production (Vercel)**:
- Vercel dashboard → Project → Logs
- Real-time function logs

### Still Stuck?

1. ✅ Check main README.md
2. ✅ Review API.md for endpoint details
3. ✅ Check GitHub issues
4. ✅ Enable debug logging
5. ✅ Test with simple PHP example

## Performance Benchmarks

Expected timings (vary by endpoint complexity):

| Operation | Time | Notes |
|-----------|------|-------|
| Upload | 1-2s | Depends on file count |
| Architecture | 10-20s | Claude Haiku |
| Endpoint Analysis | 20-40s | Claude Sonnet |
| Code Generation | 30-90s | Claude Sonnet (most time) |
| Verification | 10-15s | Claude Haiku |
| Total | 1-3 min | Full workflow |

If times exceed 2x these values, investigate:
- API rate limits
- Network latency
- Complexity of monolith

## Debug Mode

Create `lib/utils/debug.ts`:

\`\`\`typescript
export const DEBUG = process.env.DEBUG === 'true';

export function debugLog(context: string, data: any) {
  if (DEBUG) {
    console.log(\`[DEBUG \${context}]\`, JSON.stringify(data, null, 2));
  }
}
\`\`\`

Use in agents:
\`\`\`typescript
import { debugLog } from '@/lib/utils/debug';

// In agent
debugLog('Architecture Agent', { fileCount: files.length });
\`\`\`

---

**Happy debugging! 🐛**
