
import React from 'react';
import { LoanDetails } from '../types';

interface LoanFormProps {
  details: LoanDetails;
  onChange: (details: LoanDetails) => void;
}

const LoanForm: React.FC<LoanFormProps> = ({ details, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      ...details,
      [name]: name === 'startDate' ? value : parseFloat(value) || 0,
    });
  };

  const inputClasses = "w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder:text-slate-400";

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold mb-6 text-slate-800">Parametry Půjčky</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Výše půjčky (Kč)</label>
          <input
            type="number"
            name="principal"
            value={details.principal}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Roční úrok (%)</label>
          <input
            type="number"
            step="0.1"
            name="interestRate"
            value={details.interestRate}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Doba splácení (roky)</label>
          <input
            type="number"
            name="years"
            value={details.years}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Datum zahájení</label>
          <input
            type="date"
            name="startDate"
            value={details.startDate}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
      </div>
    </div>
  );
};

export default LoanForm;
