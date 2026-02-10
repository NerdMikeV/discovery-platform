import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Shield, Users, Brain, Lightbulb, HeartHandshake, BarChart3 } from 'lucide-react';

const sections = [
  { id: 'about', title: 'About You', icon: Users },
  { id: 'awareness', title: 'AI Awareness', icon: Brain },
  { id: 'usage', title: 'Current AI Use', icon: Lightbulb },
  { id: 'sentiment', title: 'AI Sentiment', icon: HeartHandshake },
  { id: 'opportunities', title: 'Opportunities', icon: BarChart3 },
];

const questions = {
  about: [
    {
      id: 'department',
      type: 'select',
      label: 'What department do you work in?',
      options: [
        'Operations / Warehouse',
        'Store Operations',
        'Merchandising / Buying',
        'Supply Chain / Logistics',
        'IT / Technology',
        'Finance / Accounting',
        'Human Resources',
        'Marketing',
        'Customer Service',
        'Executive / Leadership',
        'Other',
      ],
    },
    {
      id: 'role_level',
      type: 'select',
      label: 'What level best describes your role?',
      options: [
        'Individual Contributor',
        'Team Lead / Supervisor',
        'Manager',
        'Director',
        'VP / Executive',
      ],
    },
    {
      id: 'tenure',
      type: 'select',
      label: 'How long have you been with the company?',
      options: [
        'Less than 1 year',
        '1-3 years',
        '3-5 years',
        '5-10 years',
        'More than 10 years',
      ],
    },
    {
      id: 'tech_comfort',
      type: 'select',
      label: 'How comfortable are you with learning new technology?',
      options: [
        'Very comfortable - I enjoy learning new tools',
        'Somewhat comfortable - I can learn with some support',
        'Neutral - depends on the tool',
        'Somewhat uncomfortable - I prefer familiar tools',
        'Very uncomfortable - I struggle with new technology',
      ],
    },
  ],
  awareness: [
    {
      id: 'ai_familiarity',
      type: 'select',
      label: 'How familiar are you with AI tools like ChatGPT, Claude, or Copilot?',
      options: [
        'Very familiar - I use them regularly',
        'Somewhat familiar - I\'ve tried them a few times',
        'Slightly familiar - I\'ve heard of them but haven\'t used them',
        'Not familiar - I don\'t know what these are',
      ],
    },
    {
      id: 'ai_understanding',
      type: 'select',
      label: 'How well do you understand what AI can and cannot do?',
      options: [
        'Very well - I have a clear understanding of AI capabilities and limitations',
        'Somewhat - I have a general idea',
        'Not very well - I\'m not sure what AI is capable of',
        'Not at all - AI is confusing to me',
      ],
    },
    {
      id: 'company_ai_awareness',
      type: 'select',
      label: 'Are you aware of any AI initiatives or tools your company is exploring?',
      options: [
        'Yes - I\'m directly involved',
        'Yes - I\'ve heard about them but not involved',
        'Maybe - I\'ve heard rumors but nothing concrete',
        'No - I\'m not aware of any AI initiatives',
      ],
    },
    {
      id: 'ai_policy_awareness',
      type: 'select',
      label: 'Does your company have a policy on using AI tools at work?',
      options: [
        'Yes - there\'s a clear policy I\'m aware of',
        'I think so, but I\'m not sure what it says',
        'No policy that I know of',
        'AI is discouraged or banned',
        'I don\'t know',
      ],
    },
  ],
  usage: [
    {
      id: 'personal_ai_use',
      type: 'select',
      label: 'Do you personally use AI tools (ChatGPT, Claude, etc.) for work?',
      options: [
        'Yes - daily',
        'Yes - weekly',
        'Yes - occasionally',
        'No - but I\'d like to',
        'No - and I\'m not interested',
        'No - it\'s not allowed',
      ],
    },
    {
      id: 'ai_use_cases',
      type: 'multiselect',
      label: 'If you use AI at work, what do you use it for? (Select all that apply)',
      options: [
        'Writing and editing (emails, documents, reports)',
        'Research and information gathering',
        'Data analysis and spreadsheets',
        'Coding and technical work',
        'Brainstorming and ideation',
        'Summarizing long documents',
        'Learning new skills',
        'Customer communication',
        'Translations',
        'I don\'t use AI at work',
      ],
    },
    {
      id: 'ai_time_saved',
      type: 'select',
      label: 'If you use AI, how much time does it save you per week?',
      options: [
        'More than 5 hours',
        '2-5 hours',
        '1-2 hours',
        'Less than 1 hour',
        'Not sure / hard to measure',
        'I don\'t use AI',
      ],
    },
    {
      id: 'ai_barriers',
      type: 'multiselect',
      label: 'What prevents you from using AI more at work? (Select all that apply)',
      options: [
        'Don\'t know how to use it effectively',
        'Not sure if it\'s allowed',
        'Concerns about data security/privacy',
        'Don\'t trust the outputs',
        'My work doesn\'t seem like a good fit for AI',
        'Don\'t have time to learn',
        'Prefer doing things my own way',
        'Technical issues (access, tools not available)',
        'Nothing - I use it as much as I want',
      ],
    },
  ],
  sentiment: [
    {
      id: 'ai_excitement',
      type: 'scale',
      label: 'How excited are you about AI being used more in your workplace?',
      scale: ['Not at all excited', 'Slightly excited', 'Neutral', 'Somewhat excited', 'Very excited'],
    },
    {
      id: 'ai_concern',
      type: 'scale',
      label: 'How concerned are you about AI affecting your job?',
      scale: ['Not at all concerned', 'Slightly concerned', 'Neutral', 'Somewhat concerned', 'Very concerned'],
    },
    {
      id: 'ai_concerns_specific',
      type: 'multiselect',
      label: 'What concerns, if any, do you have about AI at work? (Select all that apply)',
      options: [
        'AI might replace my job',
        'AI might make my skills less valuable',
        'I won\'t be able to keep up with AI changes',
        'AI will make mistakes and I\'ll be blamed',
        'AI will be used to monitor my performance',
        'AI will make work less human/personal',
        'Privacy and security risks',
        'I don\'t trust AI decisions',
        'It will create more work, not less',
        'I have no concerns about AI',
      ],
    },
    {
      id: 'ai_hopes',
      type: 'multiselect',
      label: 'What do you hope AI could do for you at work? (Select all that apply)',
      options: [
        'Automate boring, repetitive tasks',
        'Help me make better decisions',
        'Find information faster',
        'Reduce errors in my work',
        'Help me learn new skills',
        'Make my job less stressful',
        'Help me communicate better',
        'Give me more time for important work',
        'I don\'t have specific hopes for AI',
      ],
    },
    {
      id: 'ai_training_interest',
      type: 'select',
      label: 'Would you be interested in AI training if your company offered it?',
      options: [
        'Very interested - I\'d sign up immediately',
        'Somewhat interested - depending on the format and timing',
        'Neutral - maybe if required',
        'Not very interested',
        'Not at all interested',
      ],
    },
  ],
  opportunities: [
    {
      id: 'job_fulfilling',
      type: 'textarea',
      label: 'What parts of your job do you find most fulfilling?',
      placeholder: 'Describe the work that energizes you, that you look forward to, or where you feel you add the most value...',
    },
    {
      id: 'job_least_fulfilling',
      type: 'textarea',
      label: 'What parts of your job do you find least fulfilling?',
      placeholder: 'Describe work that drains you, feels like a waste of your skills, or that you dread doing...',
    },
    {
      id: 'pain_points',
      type: 'textarea',
      label: 'What parts of your job are most frustrating or time-consuming?',
      placeholder: 'Describe tasks that are repetitive, tedious, or feel like they could be done better...',
    },
    {
      id: 'ai_ideas',
      type: 'textarea',
      label: 'If AI could help you with one thing at work, what would it be?',
      placeholder: 'Describe a specific task or challenge where AI assistance would be valuable...',
    },
    {
      id: 'process_improvements',
      type: 'textarea',
      label: 'What processes or workflows do you think could be improved with technology?',
      placeholder: 'Think about bottlenecks, manual handoffs, or things that seem inefficient...',
    },
    {
      id: 'data_wishes',
      type: 'textarea',
      label: 'What information or data do you wish you had easier access to?',
      placeholder: 'Think about reports you request, data you hunt for, or insights that would help your decisions...',
    },
    {
      id: 'final_thoughts',
      type: 'textarea',
      label: 'Anything else you want to share about AI at your workplace?',
      placeholder: 'Optional - any other thoughts, concerns, or ideas...',
    },
  ],
};

export default function EmployeePulse() {
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState({});
  const [completed, setCompleted] = useState(false);

  const updateResponse = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const toggleMultiSelect = (questionId, option) => {
    const current = responses[questionId] || [];
    if (current.includes(option)) {
      updateResponse(questionId, current.filter(o => o !== option));
    } else {
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
    return (
      <div key={q.id} className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {q.label}
        </label>
        
        {q.type === 'text' && (
          <input
            type="text"
            value={responses[q.id] || ''}
            onChange={(e) => updateResponse(q.id, e.target.value)}
            placeholder={q.placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        )}
        
        {q.type === 'textarea' && (
          <textarea
            value={responses[q.id] || ''}
            onChange={(e) => updateResponse(q.id, e.target.value)}
            placeholder={q.placeholder}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                  className="w-4 h-4 text-teal-600"
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
              return (
                <label 
                  key={option} 
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selected ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleMultiSelect(q.id, option)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span className="ml-3 text-gray-700">{option}</span>
                </label>
              );
            })}
          </div>
        )}
        
        {q.type === 'scale' && (
          <div className="space-y-2">
            {q.scale.map((option, index) => {
              const selected = responses[q.id] === index;
              return (
                <label 
                  key={option} 
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selected ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={selected}
                    onChange={() => updateResponse(q.id, index)}
                    className="w-4 h-4 text-teal-600"
                  />
                  <span className="ml-3 text-gray-700">
                    <span className="font-medium text-teal-700">{index + 1}</span>
                    <span className="mx-2">-</span>
                    {option}
                  </span>
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
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-teal-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Thank You!</h1>
              <p className="text-gray-600 mt-2">Your response has been recorded anonymously.</p>
            </div>
            
            <div className="bg-teal-50 rounded-lg p-6 text-center">
              <Shield className="w-8 h-8 text-teal-600 mx-auto mb-3" />
              <h2 className="font-semibold text-gray-900 mb-2">Your Privacy is Protected</h2>
              <p className="text-sm text-gray-600">
                This survey is completely anonymous. Your responses cannot be linked to your identity 
                and will only be used in aggregate to understand overall employee sentiment about AI.
              </p>
            </div>
            
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Your input helps shape how AI is implemented at your organization.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Employee AI Pulse Survey</h1>
          <p className="text-gray-600 mt-1">Help us understand how AI can best support your work</p>
        </div>
        
        {/* Anonymous badge */}
        <div className="flex items-center justify-center gap-2 mb-6 text-teal-700 bg-teal-50 py-2 px-4 rounded-full w-fit mx-auto">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium">This survey is anonymous</span>
        </div>
        
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {sections.map((section, idx) => {
              const SectionIcon = section.icon;
              return (
                <div 
                  key={section.id}
                  className={`flex flex-col items-center ${idx <= currentSection ? 'text-teal-600' : 'text-gray-400'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                    idx < currentSection ? 'bg-teal-600 text-white' : 
                    idx === currentSection ? 'bg-teal-100 text-teal-600 ring-2 ring-teal-600' : 
                    'bg-gray-200 text-gray-400'
                  }`}>
                    {idx < currentSection ? <Check className="w-5 h-5" /> : <SectionIcon className="w-5 h-5" />}
                  </div>
                  <span className="text-xs hidden sm:block text-center">{section.title}</span>
                </div>
              );
            })}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-teal-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Current Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-teal-600" />
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
              className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              {currentSection === sections.length - 1 ? 'Submit' : 'Next'}
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
