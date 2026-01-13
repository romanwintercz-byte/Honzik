
import React, { useState, useEffect } from 'react';
import { LoanDetails, AmortizationSchedule } from '../types';
import { getLoanAdvice } from '../services/geminiService';

interface AIAdvisorProps {
  details: LoanDetails;
  schedule: AmortizationSchedule;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ details, schedule }) => {
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAdvice = async () => {
    setLoading(true);
    const text = await getLoanAdvice(details, schedule);
    setAdvice(text || 'Nepodařilo se získat radu.');
    setLoading(false);
  };

  useEffect(() => {
    fetchAdvice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span className="text-blue-400">✨</span> Inteligentní Poradce (Gemini)
        </h3>
        <button 
          onClick={fetchAdvice}
          disabled={loading}
          className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-full transition disabled:opacity-50"
        >
          {loading ? 'Analyzuji...' : 'Aktualizovat analýzu'}
        </button>
      </div>
      
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-slate-800 rounded w-3/4"></div>
          <div className="h-4 bg-slate-800 rounded w-5/6"></div>
          <div className="h-4 bg-slate-800 rounded w-2/3"></div>
        </div>
      ) : (
        <div className="text-slate-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
          {advice}
        </div>
      )}
    </div>
  );
};

export default AIAdvisor;
