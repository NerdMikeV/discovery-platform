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

const colorClasses = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-600' }
};

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
            const colors = colorClasses[tool.color];
            return (
              <Link
                key={tool.path}
                to={tool.path}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{tool.name}</h2>
                <p className="text-gray-600 text-sm mt-1">{tool.description}</p>
                <p className="text-gray-400 text-xs mt-3">Estimated time: {tool.time}</p>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12 text-sm text-gray-500">
          <p>Powered by Claris AI</p>
        </div>
      </div>
    </div>
  );
}
