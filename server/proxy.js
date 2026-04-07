import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files from the dist folder in production
app.use(express.static(path.join(__dirname, '../dist')));

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

// Supabase client
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null;

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

// ---- Assessment API endpoints ----

// Create new assessment
app.post('/api/assessments', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });
  try {
    const { company_name, industry, company_size } = req.body;
    const { data, error } = await supabase
      .from('assessments')
      .insert({ company_name, industry, company_size, status: 'in_progress' })
      .select('id')
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get full assessment with all related data
app.get('/api/assessments/:id', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });
  try {
    const { id } = req.params;
    const { data: assessment, error: aErr } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .single();
    if (aErr) throw aErr;

    const [execRes, compRes, vendRes, pulseRes] = await Promise.all([
      supabase.from('executive_intake').select('*').eq('assessment_id', id),
      supabase.from('competitive_intel').select('*').eq('assessment_id', id),
      supabase.from('vendor_scan').select('*').eq('assessment_id', id),
      supabase.from('employee_pulse').select('*').eq('assessment_id', id),
    ]);

    res.json({
      ...assessment,
      executive_intake: execRes.data || [],
      competitive_intel: compRes.data || [],
      vendor_scan: vendRes.data || [],
      employee_pulse: pulseRes.data || [],
    });
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save executive intake
app.post('/api/assessments/:id/executive-intake', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });
  try {
    const { respondent_name, respondent_role, responses } = req.body;
    const { data, error } = await supabase
      .from('executive_intake')
      .insert({ assessment_id: req.params.id, respondent_name, respondent_role, responses })
      .select('id')
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Save executive intake error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save competitive intel
app.post('/api/assessments/:id/competitive-intel', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });
  try {
    const { company_name, industry, competitors, synthesis } = req.body;
    const { data, error } = await supabase
      .from('competitive_intel')
      .insert({ assessment_id: req.params.id, company_name, industry, competitors, synthesis })
      .select('id')
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Save competitive intel error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save vendor scan
app.post('/api/assessments/:id/vendor-scan', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });
  try {
    const { vendors, synthesis } = req.body;
    const { data, error } = await supabase
      .from('vendor_scan')
      .insert({ assessment_id: req.params.id, vendors, synthesis })
      .select('id')
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Save vendor scan error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save employee pulse
app.post('/api/assessments/:id/employee-pulse', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });
  try {
    const { responses } = req.body;
    const { data, error } = await supabase
      .from('employee_pulse')
      .insert({ assessment_id: req.params.id, responses })
      .select('id')
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Save employee pulse error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Catch-all for client-side routing - serve index.html for all other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
