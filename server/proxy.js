import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

app.post('/api/anthropic', async (req, res) => {
  console.log('--- Incoming request ---');
  console.log('API Key present:', !!ANTHROPIC_API_KEY);
  console.log('Model:', ANTHROPIC_MODEL);
  console.log('Request body keys:', Object.keys(req.body));

  try {
    const { messages, tools, max_tokens = 4000 } = req.body;

    const requestBody = {
      model: ANTHROPIC_MODEL,
      max_tokens,
      messages,
      ...(tools && { tools })
    };

    console.log('Calling Anthropic API...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Anthropic response status:', response.status);

    const data = await response.json();

    if (data.error) {
      console.log('Anthropic API error:', data.error);
    } else {
      console.log('Response content types:', data.content?.map(c => c.type));
    }

    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
