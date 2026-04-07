import React, { createContext, useContext, useState, useEffect } from 'react';

const AssessmentContext = createContext(null);

const SESSION_KEY = 'claris_assessment';

export function AssessmentProvider({ children }) {
  const [assessmentId, setAssessmentId] = useState(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored).assessmentId : null;
    } catch { return null; }
  });

  const [companyName, setCompanyName] = useState(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored).companyName : '';
    } catch { return ''; }
  });

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ assessmentId, companyName }));
  }, [assessmentId, companyName]);

  const ensureAssessment = async (name, industry, companySize) => {
    if (assessmentId) return assessmentId;

    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: name || companyName || 'Unknown',
          industry: industry || null,
          company_size: companySize || null,
        }),
      });
      const data = await res.json();
      if (data.id) {
        setAssessmentId(data.id);
        setCompanyName(name || companyName);
        return data.id;
      }
    } catch (err) {
      console.error('Failed to create assessment:', err);
    }
    return null;
  };

  return (
    <AssessmentContext.Provider value={{ assessmentId, companyName, setCompanyName, ensureAssessment }}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  return useContext(AssessmentContext);
}
