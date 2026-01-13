
import React from 'react';
import { AmortizationSchedule } from '../types';
import { formatCurrency } from '../utils/calculations';

interface DashboardProps {
  schedule: AmortizationSchedule;
}

const Dashboard: React.FC<DashboardProps> = ({ schedule }) => {
  return (
    <div className="space-y-4 mb-8">
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Měsíční splátka</p>
          <p className="text-2xl font-black text-slate-800 mt-0.5">{formatCurrency(schedule.monthlyPayment)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-amber-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Celkem úroky (reálné)</p>
          <p className="text-2xl font-black text-slate-800 mt-0.5">{formatCurrency(schedule.actualTotalInterest)}</p>
          {schedule.actualTotalInterest < schedule.totalInterest && (
            <p className="text-[10px] text-emerald-600 font-bold mt-1">Ušetříte {formatCurrency(schedule.totalInterest - schedule.actualTotalInterest)}</p>
          )}
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Celkem zaplatíte</p>
          <p className="text-2xl font-black text-slate-800 mt-0.5">{formatCurrency(schedule.actualTotalPaid)}</p>
        </div>
      </div>

      {/* Current Status Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Aktuálně zaplaceno</p>
          <p className="text-lg font-bold text-slate-700 mt-0.5">{formatCurrency(schedule.paidToDate)}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Zaplaceno navíc</p>
          <p className="text-lg font-bold text-blue-600 mt-0.5">{formatCurrency(schedule.extraPaidToDate)}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Zbývá doplatit (jistina)</p>
          <p className="text-lg font-bold text-rose-600 mt-0.5">{formatCurrency(schedule.currentBalance)}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Předpokládaný konec</p>
          <p className="text-lg font-bold text-emerald-700 mt-0.5">{schedule.projectedEndDate}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
