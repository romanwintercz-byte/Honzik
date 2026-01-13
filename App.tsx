
import React, { useState, useMemo } from 'react';
import { LoanDetails, ExtraPayment } from './types';
import { calculateAmortization, formatCurrency } from './utils/calculations';
import LoanForm from './components/LoanForm';
import Dashboard from './components/Dashboard';
import LoanChart from './components/LoanChart';
import AIAdvisor from './components/AIAdvisor';
import ExtraPaymentsManager from './components/ExtraPaymentsManager';

const App: React.FC = () => {
  const [loanDetails, setLoanDetails] = useState<LoanDetails>({
    principal: 500000,
    interestRate: 4.5,
    years: 5,
    startDate: new Date().toISOString().split('T')[0],
    extraPayments: []
  });

  const handleAddExtra = (payment: ExtraPayment) => {
    setLoanDetails(prev => ({
      ...prev,
      extraPayments: [...prev.extraPayments, payment]
    }));
  };

  const handleRemoveExtra = (id: string) => {
    setLoanDetails(prev => ({
      ...prev,
      extraPayments: prev.extraPayments.filter(p => p.id !== id)
    }));
  };

  const amortizationSchedule = useMemo(() => {
    return calculateAmortization(loanDetails);
  }, [loanDetails]);

  const timeSaved = useMemo(() => {
    const diff = amortizationSchedule.payments.length - amortizationSchedule.actualPayments.length;
    if (diff <= 0) return null;
    return `${diff} měsíců`;
  }, [amortizationSchedule]);

  return (
    <div className="min-h-screen pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
            <h1 className="text-xl font-bold text-slate-800">Sledování Půjčky <span className="text-blue-600">AI</span></h1>
          </div>
          <div className="text-sm text-slate-500 font-medium hidden sm:block">
            Pokročilý monitoring a predikce splácení
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <LoanForm 
              details={loanDetails} 
              onChange={setLoanDetails} 
            />

            <ExtraPaymentsManager 
              extraPayments={loanDetails.extraPayments}
              onAdd={handleAddExtra}
              onRemove={handleRemoveExtra}
            />
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4">Efekt mimořádných splátek</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Původní konec:</span>
                  <span className="font-semibold text-slate-800">
                    {amortizationSchedule.payments[amortizationSchedule.payments.length - 1]?.date || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Předpokládaný konec:</span>
                  <span className="font-bold text-emerald-600">{amortizationSchedule.projectedEndDate}</span>
                </div>
                {timeSaved && (
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-xs">Ušetřený čas:</span>
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">{timeSaved}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <Dashboard schedule={amortizationSchedule} />
            
            <div className="grid grid-cols-1 gap-8">
              <LoanChart schedule={amortizationSchedule} />
              <AIAdvisor details={loanDetails} schedule={amortizationSchedule} />
              
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-800">Historie a predikce plateb</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                        <th className="px-6 py-3">Datum</th>
                        <th className="px-6 py-3">Typ platby</th>
                        <th className="px-6 py-3 text-right">Částka</th>
                        <th className="px-6 py-3 text-right">Zůstatek</th>
                        <th className="px-6 py-3 text-center">Stav</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {amortizationSchedule.history.slice(0, 30).map((h, idx) => (
                        <tr key={idx} className={`hover:bg-slate-50 transition ${h.type === 'extra' ? 'bg-blue-50/20' : ''}`}>
                          <td className="px-6 py-3 font-medium whitespace-nowrap">
                            {new Date(h.date).toLocaleDateString('cs-CZ')}
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex flex-col">
                              <span className={`text-[10px] uppercase font-bold tracking-wider ${h.type === 'extra' ? 'text-blue-600' : 'text-slate-400'}`}>
                                {h.type === 'extra' ? 'Mimořádná' : 'Pravidelná'}
                              </span>
                              <span className="text-slate-700">{h.label}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-right text-slate-800 font-semibold">{formatCurrency(h.amount)}</td>
                          <td className="px-6 py-3 text-right text-slate-600">{formatCurrency(h.balance)}</td>
                          <td className="px-6 py-3 text-center">
                            {h.isProjected ? (
                              <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Plán</span>
                            ) : (
                              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">OK</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {amortizationSchedule.history.length > 30 && (
                    <div className="px-6 py-3 text-center text-slate-400 text-xs italic bg-slate-50">
                      Zobrazeno prvních 30 transakcí z celkových {amortizationSchedule.history.length}.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
