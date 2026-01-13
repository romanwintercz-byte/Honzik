
import React from 'react';
import { AmortizationSchedule } from '../types';
import { formatCurrency } from '../utils/calculations';

interface DashboardProps {
  schedule: AmortizationSchedule;
}

const Dashboard: React.FC<DashboardProps> = ({ schedule }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500">
        <p className="text-sm font-medium text-slate-500 uppercase">Měsíční splátka</p>
        <p className="text-3xl font-bold text-slate-800 mt-1">{formatCurrency(schedule.monthlyPayment)}</p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-amber-500">
        <p className="text-sm font-medium text-slate-500 uppercase">Celkem úroky</p>
        <p className="text-3xl font-bold text-slate-800 mt-1">{formatCurrency(schedule.totalInterest)}</p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500">
        <p className="text-sm font-medium text-slate-500 uppercase">Celkem zaplatíte</p>
        <p className="text-3xl font-bold text-slate-800 mt-1">{formatCurrency(schedule.totalPaid)}</p>
      </div>
    </div>
  );
};

export default Dashboard;
