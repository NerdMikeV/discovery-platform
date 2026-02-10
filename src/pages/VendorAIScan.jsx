import React, { useState, useRef, useEffect } from 'react';
import { Search, Package, Loader2, AlertCircle, ChevronDown, ChevronUp, Plus, X, Cpu, Zap, Calendar, Link, Clock } from 'lucide-react';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const vendorCategories = [
  { id: 'wms', label: 'Warehouse Management (WMS)', examples: 'Manhattan SCALE, Blue Yonder WMS, SAP EWM, Oracle WMS' },
  { id: 'erp', label: 'ERP', examples: 'SAP S/4HANA, Oracle, Microsoft Dynamics, NetSuite' },
  { id: 'oms', label: 'Order Management (OMS)', examples: 'Manhattan, Fluent Commerce, IBM Sterling' },
  { id: 'pos', label: 'Point of Sale (POS)', examples: 'Oracle Retail, NCR, Shopify POS, Square' },
  { id: 'planning', label: 'Planning & Allocation', examples: 'Blue Yonder, o9 Solutions, Kinaxis, SAP IBP, Oracle Retail' },
  { id: 'crm', label: 'CRM & Customer Data', examples: 'Salesforce, HubSpot, Microsoft Dynamics' },
  { id: 'ecommerce', label: 'E-commerce Platform', examples: 'Shopify, Magento, Salesforce Commerce Cloud' },
  { id: 'analytics', label: 'Analytics & BI', examples: 'Tableau, Power BI, Looker, Snowflake' },
  { id: 'robotics', label: 'Warehouse Robotics & Automation', examples: 'Locus, 6 River, Geek+, AutoStore, Berkshire Grey' },
  { id: 'labor', label: 'Labor Management (LMS)', examples: 'Manhattan, Blue Yonder, Kronos/UKG, Legion' },
  { id: 'tms', label: 'Transportation Management (TMS)', examples: 'Blue Yonder, Manhattan, Oracle TMS, SAP TM' },
  { id: 'other', label: 'Other', examples: 'Any other relevant systems' },
];

const researchPrompt = (vendor, version, category) => `You are a technology analyst specializing in enterprise software AI capabilities. Research ${vendor}${version ? ` (version: ${version})` : ''} in the ${category} category.

Provide a comprehensive analysis:

## 1. Current AI Features (Available Now)
For each AI feature, provide:
- Feature name and description
- What it does specifically
- Availability (included, add-on module, separate license)
- Maturity level (new, established, mature)
- Real customer examples if available

Common areas to investigate:
- Demand forecasting / predictive analytics
- Optimization algorithms (inventory, labor, routing)
- Natural language interfaces / conversational AI
- Computer vision capabilities
- Anomaly detection / exception management
- Recommendation engines
- Automation / robotics integration
- Machine learning customization options

## 2. AI Roadmap (Coming Soon)
- Announced features not yet released
- Beta or early access programs
- Strategic direction based on:
  - Recent conference announcements
  - Analyst briefings
  - Press releases
  - Executive interviews
- Expected timelines if available

## 3. AI Partnerships & Ecosystem
- Cloud AI partnerships (AWS, Azure, GCP)
- LLM integrations (OpenAI, Anthropic, Google)
- Technology partnerships for AI
- Acquisition activity related to AI
- Third-party AI add-ons or extensions

## 4. Technical Requirements
- Infrastructure requirements for AI features
- Data requirements
- Integration complexity
- Cloud vs on-premise AI capabilities
- API availability for custom AI

## 5. Competitive Position
- How does their AI compare to competitors in this category?
- Strengths and weaknesses
- Analyst ratings or rankings if available
- Customer sentiment on AI capabilities

## 6. Practical Recommendations
- Which AI features are production-ready vs experimental?
- What should customers prioritize?
- What gaps might require third-party solutions?
- Build vs wait recommendations

Be specific and cite sources where possible. Distinguish between confirmed information and speculation.`;

const synthesisPrompt = (vendors) => `You are a technology strategist analyzing a company's vendor ecosystem for AI opportunities.

Here is the research on their current vendors:

${vendors}

Provide a strategic synthesis:

## VENDOR ECOSYSTEM AI ASSESSMENT

### 1. What's Already Available (Quick Wins)
Create a table with the following columns: Feature | Vendor | Current State | Quick Win Opportunity | Effort to Activate

Focus on AI capabilities that exist but may not be fully utilized.

### 2. Vendor AI Maturity Ranking
Rank the vendors from most to least mature in their AI capabilities:
1. [Vendor] - [Maturity Level] - [Key Strengths]
2. ...

### 3. Roadmap Alignment
Which vendors have strong AI roadmaps the company should plan for?
- What's coming in the next 6-12 months
- What should the company wait for vs build custom

### 4. Gaps & Build Opportunities
Where do vendors fall short on AI?
- Problems that would require custom solutions
- Integration opportunities across vendors

### 5. Risk Assessment
- Vendors with weak AI strategies (potential replacement candidates)
- Vendor lock-in concerns
- Technical debt implications

### 6. Recommendations Summary

**Activate Now** (features available but not used):
- [Feature] from [Vendor] - Effort: Low/Medium/High

**Plan For** (vendor features coming that should be adopted):
- [Feature] from [Vendor] - Expected: [Timeline]

**Build Custom** (gaps requiring custom development):
- [Capability] - Why: [Reason vendors can't provide]

**Evaluate Alternatives** (vendors that may need replacement):
- [Vendor] - Concern: [Issue]`;

export default function VendorAIScan() {
  const [vendors, setVendors] = useState([{ name: '', version: '', category: '' }]);
  const [isResearching, setIsResearching] = useState(false);
  const [researchLog, setResearchLog] = useState([]);
  const [results, setResults] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [error, setError] = useState(null);
  const logEndRef = useRef(null);

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

  const addVendor = () => {
    if (vendors.length < 10) {
      setVendors([...vendors, { name: '', version: '', category: '' }]);
    }
  };

  const removeVendor = (index) => {
    if (vendors.length > 1) {
      setVendors(vendors.filter((_, i) => i !== index));
    }
  };

  const updateVendor = (index, field, value) => {
    const updated = [...vendors];
    updated[index] = { ...updated[index], [field]: value };
    setVendors(updated);
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const runResearch = async () => {
    const validVendors = vendors.filter(v => v.name.trim() && v.category);
    if (validVendors.length === 0) {
      setError('Please enter at least one vendor with a category.');
      return;
    }

    setError(null);
    setIsResearching(true);
    setResults(null);
    setResearchLog([]);

    addLogEntry('start', 'Beginning vendor AI capability scan');

    try {
      const vendorResults = [];

      for (let i = 0; i < validVendors.length; i++) {
        const vendor = validVendors[i];
        const categoryLabel = vendorCategories.find(c => c.id === vendor.category)?.label || vendor.category;

        addLogEntry('vendor', `Researching ${vendor.name}${vendor.version ? ` v${vendor.version}` : ''}`, {
          progress: `${i + 1}/${validVendors.length}`,
          category: categoryLabel
        });

        addLogEntry('search', `Searching for ${vendor.name} AI features, roadmap, partnerships...`);

        let data;
        let retryCount = 0;
        const maxRetries = 1;

        while (retryCount <= maxRetries) {
          const response = await fetch('http://localhost:3003/api/anthropic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [{
                role: 'user',
                content: researchPrompt(vendor.name, vendor.version, categoryLabel)
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

        const urlMatches = textContent.match(/https?:\/\/[^\s)]+/g) || [];
        if (urlMatches.length > 0) {
          addLogEntry('sources', `Found ${urlMatches.length} sources`, { urls: urlMatches.slice(0, 3) });
        }

        vendorResults.push({
          ...vendor,
          categoryLabel,
          research: textContent
        });

        addLogEntry('complete', `Completed research for ${vendor.name}`);

        // Wait between API calls to avoid rate limits
        if (i < validVendors.length - 1) {
          addLogEntry('waiting', `Waiting 60 seconds before next vendor to avoid rate limits...`);
          await delay(60000);
        }
      }

      // Synthesize
      addLogEntry('synthesis', '🧠 Synthesizing vendor ecosystem analysis...');
      addLogEntry('waiting', `Waiting 60 seconds before synthesis to avoid rate limits...`);
      await delay(60000);

      const vendorSummary = vendorResults
        .map(v => `## ${v.name} (${v.categoryLabel})${v.version ? ` - Version: ${v.version}` : ''}\n${v.research}`)
        .join('\n\n---\n\n');

      let synthesisData;
      let synthesisRetry = 0;

      while (synthesisRetry <= 1) {
        const synthesisResponse = await fetch('http://localhost:3003/api/anthropic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{
              role: 'user',
              content: synthesisPrompt(vendorSummary)
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

      setResults({
        vendors: vendorResults,
        synthesis,
        generatedAt: new Date().toLocaleString()
      });

    } catch (err) {
      setError(`Research failed: ${err.message}`);
      addLogEntry('error', `Error: ${err.message}`);
    } finally {
      setIsResearching(false);
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
        const dataRows = tableRows.slice(2);

        elements.push(
          <div key={`table-${elements.length}`} className="my-4 overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
              <thead className="bg-purple-50">
                <tr>
                  {headers.split('|').filter(c => c.trim()).map((cell, i) => (
                    <th key={i} className="px-3 py-2 text-left font-semibold text-purple-900 border-b border-purple-200">
                      {cell.trim().replace(/\*\*/g, '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.split('|').filter(c => c.trim()).map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-3 py-2 text-gray-700 border-b border-gray-100">
                        {cell.trim().replace(/\*\*/g, '')}
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
      } else if (line.match(/^\*\*[^*]+\*\*:?$/)) {
        elements.push(<p key={i} className="font-semibold text-gray-900 mt-4 mb-2">{line.replace(/\*\*/g, '')}</p>);
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

    flushTable();
    return elements;
  };

  if (isResearching) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              <span className="text-lg font-medium">Scanning Vendor AI Capabilities...</span>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-sm">
              {researchLog.map((entry, index) => (
                <div key={index} className={`py-1 ${
                  entry.type === 'error' ? 'text-red-400' :
                  entry.type === 'success' ? 'text-green-400' :
                  entry.type === 'vendor' ? 'text-yellow-400' :
                  entry.type === 'synthesis' ? 'text-purple-400' :
                  'text-gray-300'
                }`}>
                  <span className="text-gray-500">[{entry.timestamp}]</span>{' '}
                  {entry.message}
                  {entry.details?.progress && (
                    <span className="text-purple-400 ml-2">[{entry.details.progress}]</span>
                  )}
                  {entry.details?.category && (
                    <span className="text-gray-500 ml-2">({entry.details.category})</span>
                  )}
                  {entry.details?.urls && (
                    <div className="mt-1 ml-4 space-y-1">
                      {entry.details.urls.map((url, i) => (
                        <div key={i} className="text-purple-400 text-xs flex items-center gap-1">
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
              <span>Research typically takes 1-2 minutes per vendor</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (results) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Vendor AI Capability Report</h1>
            <p className="text-gray-600">Analysis of {results.vendors.length} vendors in your technology stack</p>
          </div>

          <div className="space-y-6">
            {/* Synthesis */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
                <div className="flex items-center gap-2 text-white">
                  <Cpu className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Vendor Ecosystem AI Assessment</h2>
                </div>
                <p className="text-purple-100 text-sm mt-1">Strategic analysis and recommendations</p>
              </div>
              <div className="p-6">
                {renderMarkdown(results.synthesis)}
              </div>
            </div>

            {/* Individual Vendor Results */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Detailed Research by Vendor</h2>

              {results.vendors.map((vendor, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleSection(vendor.name)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <span className="font-medium text-gray-900">{vendor.name}</span>
                        {vendor.version && <span className="text-gray-500 ml-2">v{vendor.version}</span>}
                        <p className="text-sm text-gray-500">{vendor.categoryLabel}</p>
                      </div>
                    </div>
                    {expandedSections[vendor.name] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {expandedSections[vendor.name] && (
                    <div className="p-6 pt-0 border-t">
                      {renderMarkdown(vendor.research)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Meta */}
            <div className="text-center text-sm text-gray-500">
              <p>Research generated: {results.generatedAt}</p>
              <button
                onClick={() => setResults(null)}
                className="mt-2 text-purple-600 hover:text-purple-700"
              >
                Run new scan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Cpu className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Vendor AI Scan</h1>
          </div>
          <p className="text-gray-600">Deep analysis of AI capabilities in your technology stack</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {/* Vendor List */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Vendor Stack
              <span className="text-gray-500 font-normal ml-1">(add all relevant systems)</span>
            </label>

            <div className="space-y-4">
              {vendors.map((vendor, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Vendor/Product Name</label>
                      <input
                        type="text"
                        value={vendor.name}
                        onChange={(e) => updateVendor(index, 'name', e.target.value)}
                        placeholder="e.g., Manhattan SCALE, Blue Yonder"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-xs text-gray-500 mb-1">Version (optional)</label>
                      <input
                        type="text"
                        value={vendor.version}
                        onChange={(e) => updateVendor(index, 'version', e.target.value)}
                        placeholder="e.g., 2023.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>
                    {vendors.length > 1 && (
                      <button
                        onClick={() => removeVendor(index)}
                        className="self-end p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Category</label>
                    <select
                      value={vendor.category}
                      onChange={(e) => updateVendor(index, 'category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      <option value="">Select category...</option>
                      {vendorCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                    {vendor.category && (
                      <p className="text-xs text-gray-400 mt-1">
                        Examples: {vendorCategories.find(c => c.id === vendor.category)?.examples}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {vendors.length < 10 && (
              <button
                onClick={addVendor}
                className="mt-3 flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
              >
                <Plus className="w-4 h-4" /> Add another vendor
              </button>
            )}
          </div>

          {/* What we'll research */}
          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-purple-900 mb-2">Research will cover:</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-purple-800">
              <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> Current AI features</div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> AI roadmap & timelines</div>
              <div className="flex items-center gap-2"><Package className="w-4 h-4" /> AI partnerships</div>
              <div className="flex items-center gap-2"><Cpu className="w-4 h-4" /> Technical requirements</div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <button
            onClick={runResearch}
            className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Scan Vendor AI Capabilities
          </button>

          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Research typically takes 1-2 minutes per vendor</span>
          </div>
        </div>
      </div>
    </div>
  );
}
