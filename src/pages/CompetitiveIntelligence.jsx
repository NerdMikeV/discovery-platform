import React, { useState, useRef, useEffect } from 'react';
import { Search, Building2, Loader2, AlertCircle, TrendingUp, Briefcase, Cpu, Users, FileText, ChevronDown, ChevronUp, Plus, X, Sparkles, Link, ExternalLink, Clock, Download, FileDown, FileJson, FileText as FileTextIcon, History, ArrowRight } from 'lucide-react';
import { useAssessment } from '../context/AssessmentContext';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const discoverCompetitorsPrompt = (companyName) => `You are a competitive intelligence analyst. Given the company "${companyName}", identify:

1. **Industry**: What industry/sector does this company operate in? Be specific (e.g., "Sneaker & Streetwear Retail" not just "Retail")

2. **Top 5 Competitors**: List the 5 most relevant direct competitors. For each, provide just the company name.

Respond in this exact JSON format only, no other text:
{
  "industry": "Industry name here",
  "competitors": ["Competitor 1", "Competitor 2", "Competitor 3", "Competitor 4", "Competitor 5"]
}`;

const researchPrompt = (company, isUserCompany, industry) => `You are a competitive intelligence analyst researching AI initiatives at ${company} in the ${industry} industry.
${isUserCompany ? '\nThis is the CLIENT COMPANY - research their current AI capabilities to establish a baseline.' : ''}

Conduct thorough research and provide a comprehensive analysis covering:

1. **Recent AI Announcements** (last 12 months)
   - Press releases about AI implementations
   - Product launches with AI capabilities
   - Partnerships with AI vendors or tech companies
   - Conference presentations or keynotes about AI

2. **AI-Related Hiring**
   - Recent job postings for AI/ML roles (data scientists, ML engineers, AI product managers)
   - Leadership hires with AI backgrounds
   - New AI-focused teams or departments

3. **Technology Stack & Vendors**
   - Known AI/ML platforms or tools in use
   - Cloud provider relationships (AWS, Azure, GCP) with AI implications
   - Partnerships with AI vendors (OpenAI, Anthropic, Google, Microsoft, etc.)
   - Enterprise software vendors with AI features (SAP, Oracle, Salesforce, etc.)

4. **Strategic Signals**
   - Executive quotes about AI strategy
   - Investor communications mentioning AI
   - Industry analyst coverage of their AI initiatives
   - Patents or research publications

5. **Specific Use Cases**
   - Supply chain / logistics AI applications
   - Customer experience / personalization AI
   - Pricing / merchandising AI
   - Operations / workforce AI
   - Any other AI applications mentioned

For each finding, note:
- The source and date
- The confidence level (confirmed, likely, speculative)
- The potential competitive implication

Be thorough and specific. If you cannot find information on a topic, explicitly state that rather than speculating.

At the end, provide:
- **AI Maturity Assessment**: How mature is their AI journey (early, developing, advanced)?
${isUserCompany ? '- **Baseline Summary**: Key AI capabilities currently in place' : '- **Threat Assessment**: What AI capabilities might give them competitive advantage over the client?'}`;

const synthesisPrompt = (userCompany, competitors, findings) => `You are a strategic analyst synthesizing competitive intelligence on AI initiatives.

The client company is: ${userCompany}

Here are the research findings for the client and each competitor:

${findings}

Provide a strategic synthesis that includes:

## 1. COMPETITIVE LANDSCAPE OVERVIEW
Create a clear comparison showing where ${userCompany} stands vs competitors:
- Who is leading in AI adoption and why?
- Where does ${userCompany} rank among these competitors?
- What patterns emerge across the competitive set?

## 2. COMMON AI INVESTMENTS (Table Stakes Emerging)
Create a comparison table showing which AI capabilities each company has invested in.
Format as a clear list showing:
- Use Case | Which companies have it | Is this becoming table stakes?

Focus on these categories:
- AI-Powered Search/Discovery
- Product Recommendations
- Customer Service AI/Chatbots
- Markdown/Pricing Optimization
- Inventory/Demand Forecasting
- Personalization Engines
- Supply Chain AI
- Workforce/Labor AI

## 3. DIFFERENTIATION OPPORTUNITIES FOR ${userCompany.toUpperCase()}
- Where are competitors NOT investing that could be an opportunity?
- What unique approaches could provide advantage?
- Where is there first-mover opportunity?

## 4. THREATS TO ADDRESS
- What competitor capabilities pose the biggest threat to ${userCompany}?
- What is the urgency level?
- What defensive moves should be considered?

## 5. RECOMMENDED ACTIONS FOR ${userCompany.toUpperCase()}
Top 5 AI initiatives to consider based on competitive dynamics:
1. [Initiative] - Priority: [Catch up / Match / Leapfrog] - Urgency: [High/Medium/Low]
2. ...

Be direct and actionable. The client needs to understand what this means for their strategy.`;

export default function CompetitiveIntelligence() {
  const [step, setStep] = useState('input'); // input, discovering, editing, researching, results
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [competitors, setCompetitors] = useState(['', '', '', '', '']);
  const [researchLog, setResearchLog] = useState([]);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loadingHistoryId, setLoadingHistoryId] = useState(null);
  const logEndRef = useRef(null);
  const reportRef = useRef(null);
  const { ensureAssessment } = useAssessment();

  // Fetch saved reports list when on the input step
  useEffect(() => {
    if (step !== 'input') return;
    let cancelled = false;
    (async () => {
      setHistoryLoading(true);
      try {
        const res = await fetch('/api/competitive-intel');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [step]);

  const loadHistoryItem = async (id) => {
    setLoadingHistoryId(id);
    try {
      const res = await fetch(`/api/competitive-intel/${id}`);
      if (!res.ok) throw new Error('Failed to load report');
      const data = await res.json();

      // Reconstruct the results shape used by the UI
      setCompanyName(data.company_name || '');
      setIndustry(data.industry || '');
      setResults({
        userCompany: data.company_name || '',
        industry: data.industry || '',
        companies: Array.isArray(data.competitors) ? data.competitors : [],
        synthesis: typeof data.synthesis === 'string'
          ? data.synthesis
          : (data.synthesis ? JSON.stringify(data.synthesis) : ''),
        generatedAt: data.created_at
          ? new Date(data.created_at).toLocaleString()
          : 'Saved report',
      });
      setStep('results');
    } catch (err) {
      console.error('Failed to load saved report:', err);
      setError('Could not load saved report.');
    } finally {
      setLoadingHistoryId(null);
    }
  };

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [researchLog]);

  const addLogEntry = (type, message, details = null) => {
    setResearchLog(prev => [...prev, {
      type,
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const discoverCompetitors = async () => {
    if (!companyName.trim()) {
      setError('Please enter your company name.');
      return;
    }

    setError(null);
    setStep('discovering');
    setResearchLog([]);

    addLogEntry('start', `Analyzing ${companyName}...`);
    addLogEntry('search', 'Identifying industry and competitive landscape');

    try {
      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: discoverCompetitorsPrompt(companyName)
          }],
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          max_tokens: 1000
        })
      });

      const data = await response.json();
      const textContent = data.content
        ?.filter(block => block.type === 'text')
        ?.map(block => block.text)
        ?.join('') || '';

      // Parse the JSON response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setIndustry(parsed.industry || '');
        setCompetitors(parsed.competitors || ['', '', '', '', '']);
        addLogEntry('success', `Found industry: ${parsed.industry}`);
        addLogEntry('success', `Identified ${parsed.competitors?.length || 0} competitors`);
      }

      setStep('editing');
    } catch (err) {
      setError(`Discovery failed: ${err.message}`);
      setStep('input');
    }
  };

  const addCompetitor = () => {
    if (competitors.length < 8) {
      setCompetitors([...competitors, '']);
    }
  };

  const removeCompetitor = (index) => {
    if (competitors.length > 1) {
      setCompetitors(competitors.filter((_, i) => i !== index));
    }
  };

  const updateCompetitor = (index, value) => {
    const updated = [...competitors];
    updated[index] = value;
    setCompetitors(updated);
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ---- Export helpers ----
  const slugify = (s) => (s || 'report').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const buildMarkdown = () => {
    if (!results) return '';
    const lines = [];
    lines.push(`# Competitive AI Intelligence Report`);
    lines.push(`**Company:** ${results.userCompany}`);
    lines.push(`**Industry:** ${results.industry}`);
    lines.push(`**Generated:** ${results.generatedAt}`);
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('# Strategic Analysis');
    lines.push('');
    lines.push(results.synthesis || '');
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('# Detailed Research by Company');
    lines.push('');
    results.companies.forEach(comp => {
      lines.push(`## ${comp.name}${comp.isUserCompany ? ' (Your Company)' : ''}`);
      lines.push('');
      lines.push(comp.research || '');
      lines.push('');
      lines.push('---');
      lines.push('');
    });
    return lines.join('\n');
  };

  const downloadBlob = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportMarkdown = () => {
    const md = buildMarkdown();
    const filename = `competitive-ai-${slugify(results?.userCompany)}-${new Date().toISOString().slice(0, 10)}.md`;
    downloadBlob(md, filename, 'text/markdown;charset=utf-8');
    setExportMenuOpen(false);
  };

  const exportJSON = () => {
    const json = JSON.stringify(results, null, 2);
    const filename = `competitive-ai-${slugify(results?.userCompany)}-${new Date().toISOString().slice(0, 10)}.json`;
    downloadBlob(json, filename, 'application/json');
    setExportMenuOpen(false);
  };

  // PDF export uses the browser's native print dialog. The browser's CSS
  // engine handles oklch() colors and gradients natively (unlike html2canvas),
  // so output fidelity is high. The user picks "Save as PDF" in the print
  // dialog. The document title is temporarily set so the suggested filename
  // is meaningful.
  const exportPDF = async () => {
    setExportMenuOpen(false);
    setIsExporting(true);

    const previousTitle = document.title;
    const previousExpanded = expandedSections;

    try {
      // Expand all company sections so the full report prints
      const allExpanded = {};
      (results?.companies || []).forEach(c => { allExpanded[c.name] = true; });
      setExpandedSections(allExpanded);

      // Set a meaningful filename via the document title (browsers use this
      // as the default name in the "Save as PDF" dialog)
      const filename = `competitive-ai-${slugify(results?.userCompany)}-${new Date().toISOString().slice(0, 10)}`;
      document.title = filename;

      // Wait one paint so the expanded sections render
      await new Promise(resolve => setTimeout(resolve, 250));

      // Open print dialog. Returns when the dialog closes (saved or cancelled).
      window.print();
    } catch (err) {
      console.error('Print failed:', err);
      alert('Could not open print dialog. Try Markdown or JSON export instead.');
    } finally {
      // ALWAYS restore state — runs whether print succeeded, failed, or was cancelled
      document.title = previousTitle;
      setExpandedSections(previousExpanded);
      setIsExporting(false);
    }
  };

  const runResearch = async () => {
    const validCompetitors = competitors.filter(c => c.trim());
    if (validCompetitors.length === 0) {
      setError('Please add at least one competitor.');
      return;
    }

    setError(null);
    setStep('researching');
    setResearchLog([]);

    addLogEntry('start', 'Beginning comprehensive AI competitive analysis');

    try {
      const allCompanies = [companyName, ...validCompetitors];
      const companyResults = [];

      for (let i = 0; i < allCompanies.length; i++) {
        const company = allCompanies[i];
        const isUserCompany = i === 0;

        addLogEntry('company', `${isUserCompany ? '📊 Analyzing your company' : '🔍 Researching competitor'}: ${company}`, {
          progress: `${i + 1}/${allCompanies.length}`
        });

        addLogEntry('search', `Searching for ${company} AI initiatives, announcements, hiring...`);

        let data;
        let retryCount = 0;
        const maxRetries = 1;

        while (retryCount <= maxRetries) {
          const response = await fetch('/api/anthropic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [{
                role: 'user',
                content: researchPrompt(company, isUserCompany, industry)
              }],
              tools: [{ type: 'web_search_20250305', name: 'web_search' }],
              max_tokens: 4000
            })
          });

          data = await response.json();

          if (data.error?.type === 'rate_limit_error' || response.status === 429) {
            if (retryCount < maxRetries) {
              addLogEntry('warning', `Rate limited. Waiting 60 seconds before retry...`);
              await delay(60000);
              retryCount++;
              continue;
            }
          }
          break;
        }

        // Extract search queries and sources from the response
        const searchBlocks = data.content?.filter(block => block.type === 'tool_use') || [];
        searchBlocks.forEach(block => {
          if (block.input?.query) {
            addLogEntry('query', `Search: "${block.input.query}"`);
          }
        });

        const textContent = data.content
          ?.filter(block => block.type === 'text')
          ?.map(block => block.text)
          ?.join('\n') || 'No results found.';

        // Extract any URLs mentioned in the research
        const urlMatches = textContent.match(/https?:\/\/[^\s)]+/g) || [];
        if (urlMatches.length > 0) {
          addLogEntry('sources', `Found ${urlMatches.length} sources`, { urls: urlMatches.slice(0, 5) });
        }

        companyResults.push({
          name: company,
          isUserCompany,
          research: textContent
        });

        addLogEntry('complete', `Completed research for ${company}`);

        // Wait between API calls to avoid rate limits
        if (i < allCompanies.length - 1) {
          addLogEntry('waiting', `Waiting 60 seconds before next company to avoid rate limits...`);
          await delay(60000);
        }
      }

      // Synthesize findings
      addLogEntry('synthesis', '🧠 Synthesizing competitive landscape...');
      addLogEntry('waiting', `Waiting 60 seconds before synthesis to avoid rate limits...`);
      await delay(60000);

      const findingsSummary = companyResults
        .map(r => `## ${r.name}${r.isUserCompany ? ' (CLIENT)' : ''}\n${r.research}`)
        .join('\n\n---\n\n');

      let synthesisData;
      let synthesisRetry = 0;

      while (synthesisRetry <= 1) {
        const synthesisResponse = await fetch('/api/anthropic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{
              role: 'user',
              content: synthesisPrompt(companyName, validCompetitors, findingsSummary)
            }],
            max_tokens: 4000
          })
        });

        synthesisData = await synthesisResponse.json();

        if (synthesisData.error?.type === 'rate_limit_error' || synthesisResponse.status === 429) {
          if (synthesisRetry < 1) {
            addLogEntry('warning', `Rate limited on synthesis. Waiting 60 seconds before retry...`);
            await delay(60000);
            synthesisRetry++;
            continue;
          }
        }
        break;
      }
      const synthesis = synthesisData.content
        ?.filter(block => block.type === 'text')
        ?.map(block => block.text)
        ?.join('\n') || 'Unable to synthesize findings.';

      addLogEntry('success', '✅ Analysis complete!');

      const resultData = {
        userCompany: companyName,
        industry,
        companies: companyResults,
        synthesis,
        generatedAt: new Date().toLocaleString()
      };

      setResults(resultData);
      setStep('results');

      // Save to Supabase (fire-and-forget)
      (async () => {
        try {
          const id = await ensureAssessment(companyName, industry);
          if (!id) return;
          await fetch(`/api/assessments/${id}/competitive-intel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              company_name: companyName,
              industry,
              competitors: companyResults,
              synthesis,
            }),
          });
        } catch (err) {
          console.error('Failed to save competitive intel:', err);
        }
      })();

    } catch (err) {
      setError(`Research failed: ${err.message}`);
      addLogEntry('error', `Error: ${err.message}`);
    }
  };

  const renderMarkdown = (text) => {
    const lines = text.split('\n');
    let inTable = false;
    let tableRows = [];
    const elements = [];

    const flushTable = () => {
      if (tableRows.length > 0) {
        const headers = tableRows[0];
        const dataRows = tableRows.slice(2); // Skip header and separator

        elements.push(
          <div key={`table-${elements.length}`} className="my-4 overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  {headers.split('|').filter(c => c.trim()).map((cell, i) => (
                    <th key={i} className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                      {cell.trim().replace(/\*\*/g, '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.split('|').filter(c => c.trim()).map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-2 text-sm text-gray-700 border-b">
                        {cell.trim()
                          .replace(/\*\*/g, '')
                          .replace(/✅/g, '✓')
                          .replace(/❌/g, '✗')
                          .replace(/⚠️/g, '⚠')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
    };

    lines.forEach((line, i) => {
      // Detect table
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        inTable = true;
        tableRows.push(line);
        return;
      } else if (inTable) {
        flushTable();
        inTable = false;
      }

      if (line.startsWith('## ')) {
        elements.push(<h2 key={i} className="text-xl font-bold text-gray-900 mt-6 mb-3 pb-2 border-b">{line.replace('## ', '').replace(/\*\*/g, '')}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={i} className="text-lg font-semibold text-gray-800 mt-4 mb-2">{line.replace('### ', '').replace(/\*\*/g, '')}</h3>);
      } else if (line.startsWith('#### ')) {
        elements.push(<h4 key={i} className="text-md font-semibold text-gray-700 mt-3 mb-1">{line.replace('#### ', '').replace(/\*\*/g, '')}</h4>);
      } else if (line.match(/^\*\*[^*]+\*\*$/)) {
        elements.push(<p key={i} className="font-semibold text-gray-900 mt-3 mb-1">{line.replace(/\*\*/g, '')}</p>);
      } else if (line.match(/^\d+\.\s\*\*/)) {
        // Numbered list with bold
        const content = line.replace(/^\d+\.\s/, '').replace(/\*\*/g, '');
        elements.push(<li key={i} className="ml-4 text-gray-700 list-decimal font-medium">{content}</li>);
      } else if (line.startsWith('- ')) {
        elements.push(<li key={i} className="ml-4 text-gray-700 list-disc">{line.replace('- ', '').replace(/\*\*/g, '')}</li>);
      } else if (line.match(/^\d+\.\s/)) {
        elements.push(<li key={i} className="ml-4 text-gray-700 list-decimal">{line.replace(/^\d+\.\s/, '').replace(/\*\*/g, '')}</li>);
      } else if (line.trim() === '') {
        elements.push(<br key={i} />);
      } else {
        elements.push(<p key={i} className="text-gray-700 my-1">{line.replace(/\*\*/g, '')}</p>);
      }
    });

    flushTable(); // Flush any remaining table
    return elements;
  };

  const renderLogEntry = (entry, index) => {
    const icons = {
      start: '🚀',
      search: '🔍',
      query: '📝',
      sources: '📚',
      company: '🏢',
      complete: '✅',
      synthesis: '🧠',
      success: '✨',
      error: '❌'
    };

    return (
      <div key={index} className={`flex items-start gap-2 py-1 text-sm ${entry.type === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
        <span>{icons[entry.type] || '•'}</span>
        <div className="flex-1">
          <span>{entry.message}</span>
          {entry.details?.progress && (
            <span className="ml-2 text-blue-600 font-medium">[{entry.details.progress}]</span>
          )}
          {entry.details?.urls && (
            <div className="mt-1 space-y-1">
              {entry.details.urls.map((url, i) => (
                <div key={i} className="flex items-center gap-1 text-xs text-blue-500">
                  <Link className="w-3 h-3" />
                  <span className="truncate max-w-md">{url}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <span className="text-xs text-gray-400">{entry.timestamp}</span>
      </div>
    );
  };

  // INPUT STEP
  if (step === 'input') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Search className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Competitive AI Intelligence</h1>
            </div>
            <p className="text-gray-600">Deep research on competitor AI initiatives and capabilities</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What company are you researching for?
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter your company name (e.g., Snipes, Target, Nordstrom)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                onKeyDown={(e) => e.key === 'Enter' && discoverCompetitors()}
              />
            </div>

            <p className="text-sm text-gray-500 mt-2">
              We'll automatically identify your industry and top competitors
            </p>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <button
              onClick={discoverCompetitors}
              className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Find Competitors
            </button>
          </div>

          {/* Previous Reports */}
          {(historyLoading || history.length > 0) && (
            <div className="mt-6 bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => setHistoryOpen(o => !o)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Previous Reports</span>
                  {history.length > 0 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {history.length}
                    </span>
                  )}
                </div>
                {historyOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {historyOpen && (
                <div className="border-t border-gray-100">
                  {historyLoading ? (
                    <div className="p-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </div>
                  ) : history.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500">
                      No saved reports yet.
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                      {history.map(item => (
                        <li key={item.id}>
                          <button
                            onClick={() => loadHistoryItem(item.id)}
                            disabled={loadingHistoryId === item.id}
                            className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left disabled:opacity-60"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {item.company_name || 'Unknown'}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {item.industry ? `${item.industry} · ` : ''}
                                  {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                                </div>
                              </div>
                            </div>
                            {loadingHistoryId === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />
                            ) : (
                              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // DISCOVERING STEP
  if (step === 'discovering') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-lg font-medium">Analyzing {companyName}...</span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
              {researchLog.map(renderLogEntry)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EDITING STEP
  if (step === 'editing') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Confirm Competitors</h1>
            <p className="text-gray-600">Review and adjust before running deep research</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            {/* Your Company */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-blue-800 mb-1">Your Company</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Industry */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., Sneaker & Streetwear Retail"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Competitors */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Competitors to Research
                <span className="text-gray-500 font-normal ml-1">(edit or add more)</span>
              </label>
              <div className="space-y-2">
                {competitors.map((comp, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1 relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={comp}
                        onChange={(e) => updateCompetitor(index, e.target.value)}
                        placeholder={`Competitor ${index + 1}`}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {competitors.length > 1 && (
                      <button
                        onClick={() => removeCompetitor(index)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {competitors.length < 8 && (
                <button
                  onClick={addCompetitor}
                  className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" /> Add competitor
                </button>
              )}
            </div>

            {/* Research info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Research will cover:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" /> AI announcements</div>
                <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-green-500" /> AI hiring signals</div>
                <div className="flex items-center gap-2"><Cpu className="w-4 h-4 text-purple-500" /> Tech stack & vendors</div>
                <div className="flex items-center gap-2"><Users className="w-4 h-4 text-orange-500" /> Executive statements</div>
                <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-red-500" /> Use cases deployed</div>
                <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-500" /> Strategic synthesis</div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('input')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={runResearch}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Run Deep Research
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Research typically takes 1-2 minutes per company</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RESEARCHING STEP
  if (step === 'researching') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-lg font-medium">Conducting Deep Research...</span>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-sm">
              {researchLog.map((entry, index) => (
                <div key={index} className={`py-1 ${entry.type === 'error' ? 'text-red-400' : entry.type === 'success' ? 'text-green-400' : entry.type === 'company' ? 'text-yellow-400' : 'text-gray-300'}`}>
                  <span className="text-gray-500">[{entry.timestamp}]</span>{' '}
                  {entry.message}
                  {entry.details?.progress && (
                    <span className="text-blue-400 ml-2">{entry.details.progress}</span>
                  )}
                  {entry.details?.urls && (
                    <div className="mt-1 ml-4 space-y-1">
                      {entry.details.urls.map((url, i) => (
                        <div key={i} className="text-blue-400 text-xs flex items-center gap-1">
                          <Link className="w-3 h-3" />
                          <span className="truncate">{url}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>This typically takes 1-2 minutes per company</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RESULTS STEP
  if (step === 'results' && results) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="relative mb-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Competitive AI Intelligence Report</h1>
              <p className="text-gray-600">{results.userCompany} vs. Competitors in {results.industry}</p>
            </div>

            {/* Export menu */}
            <div className="absolute right-0 top-0 print:hidden">
              <div className="relative">
                <button
                  onClick={() => setExportMenuOpen(o => !o)}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Export
                  <ChevronDown className="w-4 h-4" />
                </button>

                {exportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                    <button
                      onClick={exportPDF}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm text-gray-700"
                    >
                      <FileDown className="w-4 h-4 text-red-600" />
                      <div>
                        <div className="font-medium">Export as PDF</div>
                        <div className="text-xs text-gray-500">Print-ready report</div>
                      </div>
                    </button>
                    <button
                      onClick={exportMarkdown}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm text-gray-700 border-t border-gray-100"
                    >
                      <FileTextIcon className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-medium">Export as Markdown</div>
                        <div className="text-xs text-gray-500">Editable text format</div>
                      </div>
                    </button>
                    <button
                      onClick={exportJSON}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm text-gray-700 border-t border-gray-100"
                    >
                      <FileJson className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="font-medium">Export as JSON</div>
                        <div className="text-xs text-gray-500">Raw data</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6" ref={reportRef}>
            {/* Synthesis */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                <div className="flex items-center gap-2 text-white">
                  <Sparkles className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Strategic Analysis</h2>
                </div>
                <p className="text-blue-100 text-sm mt-1">
                  Competitive landscape analysis for {results.userCompany}
                </p>
              </div>
              <div className="p-6">
                {renderMarkdown(results.synthesis)}
              </div>
            </div>

            {/* Individual Company Results */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Detailed Research by Company</h2>

              {results.companies.map((comp, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleSection(comp.name)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${comp.isUserCompany ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Building2 className={`w-5 h-5 ${comp.isUserCompany ? 'text-blue-600' : 'text-gray-600'}`} />
                      </div>
                      <div className="text-left">
                        <span className="font-medium text-gray-900">{comp.name}</span>
                        {comp.isUserCompany && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Your Company</span>
                        )}
                      </div>
                    </div>
                    {expandedSections[comp.name] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {expandedSections[comp.name] && (
                    <div className="p-6 pt-0 border-t">
                      {renderMarkdown(comp.research)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Meta */}
            <div className="text-center text-sm text-gray-500">
              <p>Research generated: {results.generatedAt}</p>
              <button
                onClick={() => {
                  setStep('input');
                  setResults(null);
                  setCompanyName('');
                  setIndustry('');
                  setCompetitors(['', '', '', '', '']);
                }}
                className="mt-2 text-blue-600 hover:text-blue-700 print:hidden"
              >
                Start new research
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
