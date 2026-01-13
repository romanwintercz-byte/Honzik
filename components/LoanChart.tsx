
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AmortizationSchedule } from '../types';

interface LoanChartProps {
  schedule: AmortizationSchedule;
}

const LoanChart: React.FC<LoanChartProps> = ({ schedule }) => {
  // Line data: Theoretical vs Actual Monthly Snapshots
  const maxLength = Math.max(schedule.payments.length, schedule.actualPayments.length);
  const chartData = Array.from({ length: maxLength }).map((_, i) => {
    const theoretical = schedule.payments[i];
    const actual = schedule.actualPayments[i];
    return {
      date: actual?.date || theoretical?.date,
      // Rounding the balances to the nearest integer for the chart display
      theoreticalBalance: theoretical ? Math.round(theoretical.remainingBalance) : undefined,
      actualBalance: actual ? Math.round(actual.remainingBalance) : undefined,
      isProjected: actual?.isProjected
    };
  });

  // Highlight points for extra payments
  const extraPoints = schedule.history
    .filter(h => h.type === 'extra')
    .map(h => ({
      date: new Date(h.date).toLocaleDateString('cs-CZ', { year: 'numeric', month: 'short' }),
      balance: Math.round(h.balance),
      label: h.label,
      amount: h.amount
    }));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[480px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Srovnání průběhu splácení</h3>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorTheoretical" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            tick={{fontSize: 10}}
            interval={Math.floor(chartData.length / 8)}
          />
          <YAxis 
            tickFormatter={(value) => `${Math.round(value / 1000)}k`}
            tick={{fontSize: 12}}
            width={40}
          />
          <Tooltip 
            formatter={(value: any, name: string) => {
              if (name === 'theoreticalBalance') return [new Intl.NumberFormat('cs-CZ').format(Math.round(value)) + ' Kč', 'Plánovaný'];
              if (name === 'actualBalance') return [new Intl.NumberFormat('cs-CZ').format(Math.round(value)) + ' Kč', 'Skutečný'];
              return [value, name];
            }}
            labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
          />
          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
          
          <Area 
            type="monotone" 
            dataKey="theoreticalBalance" 
            stroke="#94a3b8" 
            fillOpacity={1} 
            fill="url(#colorTheoretical)" 
            name="Plánovaný zůstatek"
            strokeDasharray="5 5"
            connectNulls
          />
          <Area 
            type="monotone" 
            dataKey="actualBalance" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorActual)" 
            name="Skutečný / Předpokládaný zůstatek"
            connectNulls
            dot={(props: any) => {
              // Only draw dots for months where an extra payment happened
              const hasExtra = extraPoints.some(ep => ep.date === props.payload.date);
              if (hasExtra) {
                return (
                  <circle 
                    key={props.key}
                    cx={props.cx} 
                    cy={props.cy} 
                    r={5} 
                    fill="#3b82f6" 
                    stroke="white" 
                    strokeWidth={2} 
                  />
                );
              }
              return <React.Fragment key={props.key}></React.Fragment>;
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LoanChart;
