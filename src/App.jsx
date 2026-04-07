import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AssessmentProvider } from './context/AssessmentContext';
import Home from './pages/Home';
import ExecutiveIntake from './pages/ExecutiveIntake';
import CompetitiveIntelligence from './pages/CompetitiveIntelligence';
import VendorAIScan from './pages/VendorAIScan';
import EmployeePulse from './pages/EmployeePulse';

export default function App() {
  return (
    <BrowserRouter>
      <AssessmentProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/executive-intake" element={<ExecutiveIntake />} />
        <Route path="/competitive-intelligence" element={<CompetitiveIntelligence />} />
        <Route path="/vendor-scan" element={<VendorAIScan />} />
        <Route path="/employee-pulse" element={<EmployeePulse />} />
      </Routes>
      </AssessmentProvider>
    </BrowserRouter>
  );
}
