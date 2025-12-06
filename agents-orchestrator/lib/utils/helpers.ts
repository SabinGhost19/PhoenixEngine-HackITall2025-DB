export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (i < maxRetries - 1) {
        const backoffDelay = delay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

export function parseCodeBlock(content: string, language?: string): string {
  const regex = language 
    ? new RegExp(`\`\`\`${language}\\n([\\s\\S]*?)\`\`\``, 'g')
    : /```[\w]*\n([\s\S]*?)```/g;
  
  const matches = content.match(regex);
  if (matches && matches.length > 0) {
    return matches[0].replace(/```[\w]*\n/, '').replace(/```$/, '').trim();
  }
  
  return content;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
