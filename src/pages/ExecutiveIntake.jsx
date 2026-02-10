import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Building2, Target, Shield, Users, Gauge, DollarSign } from 'lucide-react';

const sections = [
  { id: 'company', title: 'Company Profile', icon: Building2 },
  { id: 'motivation', title: 'Motivation & Goals', icon: Target },
  { id: 'constraints', title: 'Constraints', icon: Shield },
  { id: 'philosophy', title: 'AI Philosophy', icon: Users },
  { id: 'readiness', title: 'Organizational Readiness', icon: Gauge },
  { id: 'investment', title: 'Investment & Timeline', icon: DollarSign },
];

const questions = {
  company: [
    {
      id: 'company_name',
      type: 'text',
      label: 'Company Name',
      placeholder: 'Enter your company name',
    },
    {
      id: 'industry',
      type: 'select',
      label: 'Industry',
      options: [
        'Apparel & Fashion Retail',
        'Grocery & Food Retail',
        'Department Stores',
        'Specialty Retail',
        'E-commerce / DTC',
        'Warehouse / Distribution',
        'Airport / Travel Retail',
        'Other Retail',
        'Other (Non-Retail)',
      ],
    },
    {
      id: 'company_size',
      type: 'select',
      label: 'Company Size (Employees)',
      options: [
        'Under 100',
        '100-500',
        '500-1,000',
        '1,000-5,000',
        '5,000-10,000',
        '10,000+',
      ],
    },
    {
      id: 'annual_revenue',
      type: 'select',
      label: 'Annual Revenue Range',
      options: [
        'Under $10M',
        '$10M - $50M',
        '$50M - $100M',
        '$100M - $500M',
        '$500M - $1B',
        'Over $1B',
        'Prefer not to say',
      ],
    },
    {
      id: 'locations',
      type: 'select',
      label: 'Number of Locations (Stores, DCs, etc.)',
      options: [
        '1-10',
        '11-50',
        '51-100',
        '101-500',
        '500+',
        'N/A (E-commerce only)',
      ],
    },
    {
      id: 'your_role',
      type: 'text',
      label: 'Your Role/Title',
      placeholder: 'e.g., VP of Operations, CIO, CEO',
    },
  ],
  motivation: [
    {
      id: 'ai_driver',
      type: 'multiselect',
      label: 'What is driving your interest in AI? (Select all that apply)',
      options: [
        'Executive/board mandate',
        'Competitive pressure (competitors are doing it)',
        'Cost reduction needs',
        'Labor shortage or productivity challenges',
        'Customer experience improvement',
        'Investor expectations',
        'Employee demand for better tools',
        'General sense that we should be doing something',
        'Specific problem we believe AI can solve',
      ],
    },
    {
      id: 'specific_problem',
      type: 'textarea',
      label: 'If you have a specific problem in mind, please describe it:',
      placeholder: 'Describe the problem, pain point, or opportunity...',
      conditional: { field: 'ai_driver', includes: 'Specific problem we believe AI can solve' },
    },
    {
      id: 'desired_outcomes',
      type: 'multiselect',
      label: 'What outcomes matter most to you? (Select up to 3)',
      maxSelections: 3,
      options: [
        'Reduce operating costs',
        'Increase revenue',
        'Improve speed/efficiency',
        'Reduce errors and quality issues',
        'Better decision-making',
        'Improve employee experience',
        'Improve customer experience',
        'Free people for higher-value work',
        'Handle growth without proportional hiring',
        'Competitive advantage',
      ],
    },
    {
      id: 'success_definition',
      type: 'textarea',
      label: 'How would you define success for AI initiatives in 12 months?',
      placeholder: 'What would need to be true for you to consider AI investments successful?',
    },
    {
      id: 'do_nothing',
      type: 'textarea',
      label: 'What happens if you do nothing with AI for the next 12-24 months?',
      placeholder: 'What are the risks of inaction?',
    },
  ],
  constraints: [
    {
      id: 'data_sensitivity',
      type: 'multiselect',
      label: 'Which data types are OFF LIMITS for AI processing? (Select all that apply)',
      options: [
        'Customer PII (names, addresses, payment info)',
        'Employee personal data',
        'Financial/accounting data',
        'Pricing and margin data',
        'Vendor/supplier contracts',
        'Strategic planning documents',
        'None - all data could potentially be used',
        'Not sure - need to involve legal/compliance',
      ],
    },
    {
      id: 'data_location',
      type: 'select',
      label: 'Where must data stay?',
      options: [
        'Can use cloud-based AI services (data leaves our systems)',
        'Data must stay in US-based cloud infrastructure',
        'Data must stay on-premise / in our private cloud',
        'Depends on the data type',
        'Not sure - need to check with IT/legal',
      ],
    },
    {
      id: 'regulatory',
      type: 'multiselect',
      label: 'What regulatory requirements apply? (Select all that apply)',
      options: [
        'PCI-DSS (payment card data)',
        'GDPR (EU customer data)',
        'CCPA (California consumer privacy)',
        'SOX (financial controls)',
        'HIPAA (health data)',
        'Industry-specific regulations',
        'None that we know of',
        'Not sure',
      ],
    },
    {
      id: 'approval_process',
      type: 'select',
      label: 'What approval is needed for new AI tools/initiatives?',
      options: [
        'I can approve on my own',
        'Need executive team approval',
        'Need board approval',
        'Need IT/security review',
        'Need legal review',
        'Multiple approvals required',
        'Not sure of the process',
      ],
    },
    {
      id: 'vendor_restrictions',
      type: 'textarea',
      label: 'Are there any vendor restrictions we should know about?',
      placeholder: 'e.g., preferred vendors, banned vendors, existing contracts that limit options...',
    },
  ],
  philosophy: [
    {
      id: 'ai_role',
      type: 'select',
      label: 'How do you see AI\'s role in your organization?',
      options: [
        'Augment employees - help people do their jobs better',
        'Automate tasks - reduce manual work',
        'Both augmentation and automation',
        'Replace roles where possible',
        'Not sure yet - exploring options',
      ],
    },
    {
      id: 'employee_tools',
      type: 'select',
      label: 'Should employees have access to AI tools for their own use?',
      options: [
        'Yes - encourage experimentation with any tools',
        'Yes - but only approved/vetted tools',
        'Limited - only certain roles or use cases',
        'No - AI should be embedded in systems, not direct access',
        'Not sure - need to think about this',
      ],
    },
    {
      id: 'current_policy',
      type: 'select',
      label: 'Do you have a stated company policy on AI use?',
      options: [
        'Yes - formal policy exists',
        'Informal guidance but no formal policy',
        'No policy - employees figure it out',
        'No policy - AI use is discouraged or banned',
        'Currently developing a policy',
      ],
    },
    {
      id: 'current_usage',
      type: 'select',
      label: 'Are employees currently using AI tools (ChatGPT, Claude, etc.)?',
      options: [
        'Yes - widespread and sanctioned',
        'Yes - widespread but informal/unsanctioned',
        'Yes - limited to certain teams',
        'Probably - but we don\'t have visibility',
        'No - not aware of any usage',
        'No - it\'s prohibited',
      ],
    },
    {
      id: 'build_vs_buy',
      type: 'select',
      label: 'Preference for building custom vs. buying solutions?',
      options: [
        'Strongly prefer buying off-the-shelf solutions',
        'Prefer buying, but open to custom for unique needs',
        'No strong preference - whatever works best',
        'Prefer custom solutions that fit our exact needs',
        'Strongly prefer custom - we have unique requirements',
      ],
    },
    {
      id: 'transparency',
      type: 'select',
      label: 'How important is understanding how AI makes decisions?',
      options: [
        'Critical - we need full transparency and explainability',
        'Important - want to understand the logic',
        'Moderate - depends on the use case',
        'Low - results matter more than understanding the "how"',
        'Not important - black box is fine if it works',
      ],
    },
    {
      id: 'agents',
      type: 'select',
      label: 'Are you comfortable with AI taking actions (not just providing information)?',
      options: [
        'Yes - AI can take actions autonomously',
        'Yes - with human approval for significant actions',
        'Limited - AI can take minor actions only',
        'No - AI should inform, humans should act',
        'Not sure - need to understand the risks',
      ],
    },
    {
      id: 'internal_capability',
      type: 'select',
      label: 'Do you want to build internal AI capability or rely on external partners?',
      options: [
        'Build internal - hire AI talent and develop expertise',
        'Hybrid - internal team + external partners',
        'External - rely on consultants and vendors',
        'Not sure yet - depends on what we need',
      ],
    },
  ],
  readiness: [
    {
      id: 'tech_adoption',
      type: 'select',
      label: 'How would you rate your organization\'s track record on technology adoption?',
      options: [
        'Excellent - we adopt and integrate new tech smoothly',
        'Good - some bumps but generally successful',
        'Mixed - some successes, some failures',
        'Poor - we struggle with new technology',
        'Not sure',
      ],
    },
    {
      id: 'change_management',
      type: 'select',
      label: 'Who would own driving adoption of AI tools once built?',
      options: [
        'Clear owner exists with capacity',
        'Clear owner but they\'re stretched thin',
        'Would need to assign someone',
        'Not sure - this is a gap',
        'Vendor/consultant would need to drive it',
      ],
    },
    {
      id: 'executive_sponsor',
      type: 'select',
      label: 'Is there executive sponsorship for AI initiatives?',
      options: [
        'Yes - active sponsor with authority and budget',
        'Yes - sponsor exists but limited authority',
        'Partial - interest but not committed',
        'No - would need to build the case',
        'I am the sponsor',
      ],
    },
    {
      id: 'failure_tolerance',
      type: 'select',
      label: 'What happens if an AI initiative doesn\'t work?',
      options: [
        'Expected - we learn and iterate',
        'Acceptable - if we learn something',
        'Problematic - but not career-ending',
        'Risky - would damage credibility',
        'Unacceptable - must succeed',
      ],
    },
    {
      id: 'previous_ai',
      type: 'textarea',
      label: 'Have you attempted AI initiatives before? What happened?',
      placeholder: 'Describe any previous AI projects - successes, failures, lessons learned...',
    },
    {
      id: 'it_capacity',
      type: 'select',
      label: 'Does IT have capacity to support AI initiatives?',
      options: [
        'Yes - IT is ready and available',
        'Limited - IT is busy but can prioritize this',
        'Constrained - IT is a bottleneck',
        'Outsourced - we rely on external IT support',
        'Not sure',
      ],
    },
    {
      id: 'data_quality',
      type: 'select',
      label: 'How would you rate your overall data quality?',
      options: [
        'Excellent - clean, integrated, accessible',
        'Good - some issues but workable',
        'Mixed - depends on the system/domain',
        'Poor - significant data quality issues',
        'Not sure',
      ],
    },
  ],
  investment: [
    {
      id: 'budget_range',
      type: 'select',
      label: 'What budget range are you considering for AI initiatives (first year)?',
      options: [
        'Under $25,000',
        '$25,000 - $50,000',
        '$50,000 - $100,000',
        '$100,000 - $250,000',
        '$250,000 - $500,000',
        '$500,000+',
        'No budget allocated yet',
        'Prefer not to say',
      ],
    },
    {
      id: 'budget_type',
      type: 'select',
      label: 'Is budget available, or does a business case need to be made?',
      options: [
        'Budget is allocated and available',
        'Budget exists but needs approval',
        'Need to build business case for budget',
        'Would come from operational savings',
        'Not sure',
      ],
    },
    {
      id: 'timeline',
      type: 'select',
      label: 'When do you want to see results from AI investments?',
      options: [
        'Within 3 months (quick wins)',
        'Within 6 months',
        'Within 12 months',
        'Willing to invest for 18-24 month payback',
        'Long-term transformation (2+ years)',
      ],
    },
    {
      id: 'start_timing',
      type: 'select',
      label: 'When would you want to start?',
      options: [
        'Immediately - ready to go',
        'Within 1-2 months',
        'Within 3-6 months',
        'Next fiscal year',
        'Just exploring for now',
      ],
    },
    {
      id: 'ongoing_investment',
      type: 'select',
      label: 'Are you prepared for ongoing costs (not just one-time)?',
      options: [
        'Yes - understand AI requires ongoing investment',
        'Depends on the ROI',
        'Prefer one-time investments',
        'Not sure what to expect',
      ],
    },
    {
      id: 'additional_context',
      type: 'textarea',
      label: 'Anything else we should know?',
      placeholder: 'Any additional context, concerns, or questions...',
    },
  ],
};

export default function ExecutiveIntake() {
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState({});
  const [completed, setCompleted] = useState(false);

  const updateResponse = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const toggleMultiSelect = (questionId, option, maxSelections) => {
    const current = responses[questionId] || [];
    if (current.includes(option)) {
      updateResponse(questionId, current.filter(o => o !== option));
    } else if (!maxSelections || current.length < maxSelections) {
      updateResponse(questionId, [...current, option]);
    }
  };

  const currentQuestions = questions[sections[currentSection].id];
  const Icon = sections[currentSection].icon;

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setCompleted(true);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const renderQuestion = (q) => {
    // Check conditional
    if (q.conditional) {
      const fieldValue = responses[q.conditional.field] || [];
      if (!fieldValue.includes(q.conditional.includes)) {
        return null;
      }
    }

    return (
      <div key={q.id} className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {q.label}
          {q.maxSelections && <span className="text-gray-500 font-normal"> (max {q.maxSelections})</span>}
        </label>
        
        {q.type === 'text' && (
          <input
            type="text"
            value={responses[q.id] || ''}
            onChange={(e) => updateResponse(q.id, e.target.value)}
            placeholder={q.placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        )}
        
        {q.type === 'textarea' && (
          <textarea
            value={responses[q.id] || ''}
            onChange={(e) => updateResponse(q.id, e.target.value)}
            placeholder={q.placeholder}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        )}
        
        {q.type === 'select' && (
          <div className="space-y-2">
            {q.options.map(option => (
              <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name={q.id}
                  checked={responses[q.id] === option}
                  onChange={() => updateResponse(q.id, option)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}
        
        {q.type === 'multiselect' && (
          <div className="space-y-2">
            {q.options.map(option => {
              const selected = (responses[q.id] || []).includes(option);
              const atMax = q.maxSelections && (responses[q.id] || []).length >= q.maxSelections && !selected;
              return (
                <label 
                  key={option} 
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  } ${atMax ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleMultiSelect(q.id, option, q.maxSelections)}
                    disabled={atMax}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="ml-3 text-gray-700">{option}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Assessment Complete</h1>
              <p className="text-gray-600 mt-2">Thank you for completing the Executive AI Readiness Assessment.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-4">Summary of Responses</h2>
              {sections.map(section => (
                <div key={section.id} className="mb-6">
                  <h3 className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-2">{section.title}</h3>
                  {questions[section.id].map(q => {
                    const response = responses[q.id];
                    if (!response || (Array.isArray(response) && response.length === 0)) return null;
                    return (
                      <div key={q.id} className="mb-3">
                        <p className="text-xs text-gray-500">{q.label}</p>
                        <p className="text-sm text-gray-900">
                          {Array.isArray(response) ? response.join(', ') : response}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>Your responses have been recorded. A member of our team will be in touch to discuss next steps.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">AI Readiness Assessment</h1>
          <p className="text-gray-600 mt-1">Executive Intake Questionnaire</p>
        </div>
        
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {sections.map((section, idx) => {
              const SectionIcon = section.icon;
              return (
                <div 
                  key={section.id}
                  className={`flex flex-col items-center ${idx <= currentSection ? 'text-blue-600' : 'text-gray-400'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                    idx < currentSection ? 'bg-blue-600 text-white' : 
                    idx === currentSection ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-600' : 
                    'bg-gray-200 text-gray-400'
                  }`}>
                    {idx < currentSection ? <Check className="w-5 h-5" /> : <SectionIcon className="w-5 h-5" />}
                  </div>
                  <span className="text-xs hidden sm:block">{section.title}</span>
                </div>
              );
            })}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Current Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{sections[currentSection].title}</h2>
              <p className="text-sm text-gray-500">Section {currentSection + 1} of {sections.length}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {currentQuestions.map(renderQuestion)}
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={prevSection}
              disabled={currentSection === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentSection === 0 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            
            <button
              onClick={nextSection}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {currentSection === sections.length - 1 ? 'Complete' : 'Next'}
              {currentSection < sections.length - 1 && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Powered by Claris AI</p>
        </div>
      </div>
    </div>
  );
}
