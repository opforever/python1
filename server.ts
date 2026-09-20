import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', runtime: 'Python Sanctuary Fullstack' });
  });

  // AI Python Tutor Endpoint
  app.post('/api/tutor', async (req, res) => {
    try {
      const { code, question, action, error } = req.body;

      let prompt = '';
      const baseSystemContext = `You are "Zen Sensei", a gentle, encouraging, and deeply knowledgeable Python tutor. 
Your student is a beginner learning Python.
Always maintain a calm, supportive, and peaceful tone. 
Explain concepts clearly without overly dense jargon, using clear formatting and bite-sized examples where helpful.
Never make the student feel intimidated; celebrate their curiosity.`;

      if (action === 'explain') {
        prompt = `${baseSystemContext}

The student wrote this Python code:
\`\`\`python
${code || '# No code provided'}
\`\`\`

Please explain what this code does in clear, warm, step-by-step terms for a beginner.
Highlight how variables, inputs, or loops work here. Keep it concise, friendly, and easy to read.`;
      } else if (action === 'fix') {
        prompt = `${baseSystemContext}

The student's Python code encountered an error.
Code:
\`\`\`python
${code || '# No code provided'}
\`\`\`

Error message:
${error || 'Unknown error'}

Please:
1. Explain what caused this error in simple, peaceful terms.
2. Show the corrected code snippet.
3. Give a helpful mnemonic or tip to remember for the future.`;
      } else if (action === 'challenge') {
        prompt = `${baseSystemContext}

The student just wrote and tested this Python code:
\`\`\`python
${code || '# No code provided'}
\`\`\`

Based on what they just practiced, suggest 1 fun, gentle, bite-sized mini-challenge or modification they can try next to deepen their understanding.`;
      } else {
        // Free-form Q&A
        prompt = `${baseSystemContext}

Current Python script:
\`\`\`python
${code || '# No code provided'}
\`\`\`

Student's question:
"${question || 'How can I improve my Python skills?'}"

Please give a clear, warm, and helpful answer.`;
      }

      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      res.json({
        success: true,
        reply: response.text || 'I am here with you. Please feel free to try running your code again.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Tutor API Error:', msg);
      res.status(500).json({
        success: false,
        error: msg,
        reply: 'The Zen Sensei is reflecting peacefully. Please ensure your Gemini API key is configured in settings.',
      });
    }
  });

  // Determine if serving pre-built production files
  const distPath = path.join(process.cwd(), 'dist');
  const distIndex = path.join(distPath, 'index.html');
  const hasDist = fs.existsSync(distIndex);
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction || (hasDist && process.env.npm_lifecycle_event === 'start')) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(distIndex);
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Development HTML fallback
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        if (fs.existsSync(indexPath)) {
          let template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } else {
          next();
        }
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Python Sanctuary Server running at:`);
    console.log(`  > Local:   http://localhost:${PORT}`);
    console.log(`  > Network: http://0.0.0.0:${PORT}`);
  });
}

startServer();
