# Claris AI Assessment Platform - Build Spec

## Overview

Build a demo-ready React application that bundles 4 AI assessment tools for evaluating an organization's AI readiness. Two of the tools make API calls to Anthropic for AI-powered research.

## Directory Structure

```
claris-assessment/
├── .env                    # API keys (create from .env.template)
├── .env.template           # Template for env vars
├── package.json
├── vite.config.js
├── index.html
├── server/
│   └── proxy.js            # Express server to proxy Anthropic API calls
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css           # Tailwind imports
│   ├── components/
│   │   └── Layout.jsx      # Shared layout with navigation
│   └── pages/
│       ├── Home.jsx
│       ├── ExecutiveIntake.jsx
│       ├── CompetitiveIntelligence.jsx
│       ├── VendorAIScan.jsx
│       └── EmployeePulse.jsx
```

## Tech Stack

- **Frontend:** Vite + React 18
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Routing:** React Router v6
- **Backend:** Express.js (simple proxy server)
- **AI:** Anthropic API (claude-opus-4-5-20250514)

## Setup Instructions

### 1. Initialize the project

```bash
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom lucide-react
npm install express cors dotenv concurrently
```

### 2. Configure Tailwind

Update `tailwind.config.js`:
```js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

Update `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3. Create the proxy server

The competitive intelligence and vendor scan tools need to call the Anthropic API. Browsers can't do this directly (CORS), so we need a simple Express proxy.

Create `server/proxy.js`:

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-5-20250514';

app.post('/api/anthropic', async (req, res) => {
  try {
    const { messages, tools, max_tokens = 4000 } = req.body;
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens,
        messages,
        tools
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
```

### 4. Update package.json scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:server\"",
    "dev:frontend": "vite",
    "dev:server": "node server/proxy.js",
    "build": "vite build",
    "preview": "vite preview"
  },
  "type": "module"
}
```

### 5. Update the React components

The existing JSX files make fetch calls to `https://api.anthropic.com/v1/messages`. 

**Change all instances of:**
```javascript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    // ...
  })
});
```

**To:**
```javascript
const response = await fetch('http://localhost:3001/api/anthropic', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages,
    tools,
    max_tokens
  })
});
```

Note: Remove the `model` from the request body - the server will add it from env vars.

**Files to update:**
- `CompetitiveIntelligence.jsx` - has 4 fetch calls to Anthropic
- `VendorAIScan.jsx` - has 3 fetch calls to Anthropic

### 6. Create the Home page

```jsx
// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { ClipboardList, Search, Cpu, Users } from 'lucide-react';

const tools = [
  {
    name: 'Executive Intake',
    description: 'Capture organizational context, constraints, and AI philosophy from leadership',
    icon: ClipboardList,
    path: '/executive-intake',
    color: 'blue',
    time: '15-20 min'
  },
  {
    name: 'Competitive AI Intelligence',
    description: 'Deep research on competitor AI initiatives using web search and analysis',
    icon: Search,
    path: '/competitive-intelligence',
    color: 'indigo',
    time: '5-10 min'
  },
  {
    name: 'Vendor AI Scan',
    description: 'Analyze AI capabilities in your current technology stack',
    icon: Cpu,
    path: '/vendor-scan',
    color: 'purple',
    time: '5-10 min'
  },
  {
    name: 'Employee AI Pulse',
    description: 'Anonymous survey to gauge employee AI sentiment and surface opportunities',
    icon: Users,
    path: '/employee-pulse',
    color: 'teal',
    time: '5-10 min'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Claris AI Assessment Platform</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive AI readiness assessment for retail organizations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map(tool => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.path}
                to={tool.path}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 bg-${tool.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 text-${tool.color}-600`} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{tool.name}</h2>
                <p className="text-gray-600 text-sm mt-1">{tool.description}</p>
                <p className="text-gray-400 text-xs mt-3">Estimated time: {tool.time}</p>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12 text-sm text-gray-500">
          <p>Powered by Claris AI • claude-opus-4-5</p>
        </div>
      </div>
    </div>
  );
}
```

### 7. Create App.jsx with routing

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ExecutiveIntake from './pages/ExecutiveIntake';
import CompetitiveIntelligence from './pages/CompetitiveIntelligence';
import VendorAIScan from './pages/VendorAIScan';
import EmployeePulse from './pages/EmployeePulse';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/executive-intake" element={<ExecutiveIntake />} />
        <Route path="/competitive-intelligence" element={<CompetitiveIntelligence />} />
        <Route path="/vendor-scan" element={<VendorAIScan />} />
        <Route path="/employee-pulse" element={<EmployeePulse />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 8. Update main.jsx

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Key Changes to Existing Components

### CompetitiveIntelligence.jsx

Find all `fetch('https://api.anthropic.com/v1/messages'` calls and replace with:

```javascript
const response = await fetch('http://localhost:3001/api/anthropic', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: promptText }],
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    max_tokens: 4000
  })
});
```

There are 4 places to update (discoverCompetitors, 2 in runResearch loop, and synthesis).

### VendorAIScan.jsx

Same pattern - 3 places to update (2 in research loop, 1 for synthesis).

## Running the App

1. Create `.env` from `.env.template` and add your Anthropic API key
2. Run `npm run dev`
3. This starts both the Vite dev server (port 5173) and the proxy (port 3001)
4. Open http://localhost:5173

## Notes

- The Executive Intake and Employee Pulse tools don't need the API - they're just forms
- Data doesn't persist yet - that's a future enhancement
- For demos, the research tools will make real API calls and cost money (~$1-3 per full analysis with Opus 4.5)
