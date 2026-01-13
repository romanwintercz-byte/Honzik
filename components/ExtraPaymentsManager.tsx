
import React, { useState } from 'react';
import { ExtraPayment } from '../types';
import { formatCurrency } from '../utils/calculations';

interface ExtraPaymentsManagerProps {
  extraPayments: ExtraPayment[];
  onAdd: (payment: ExtraPayment) => void;
  onRemove: (id: string) => void;
}

const ExtraPaymentsManager: React.FC<ExtraPaymentsManagerProps> = ({ extraPayments, onAdd, onRemove }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAdd = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      name: name || 'Mimořádná splátka',
      amount: parseFloat(amount),
      date
    });
    setName('');
    setAmount('');
  };

  const inputBaseClasses = "px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400";

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="font-bold text-slate-800 mb-4">Mimořádné splátky</h3>
      
      <div className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Název (např. Bonus z práce)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full ${inputBaseClasses}`}
        />
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Částka (Kč)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`flex-1 ${inputBaseClasses}`}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-36 ${inputBaseClasses}`}
          />
        </div>
        <button
          onClick={handleAdd}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition text-sm shadow-sm active:scale-[0.98]"
        >
          Přidat splátku
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {extraPayments.length === 0 && (
          <p className="text-slate-400 text-xs text-center py-4 italic">Žádné mimořádné splátky</p>
        )}
        {extraPayments.map((p) => (
          <div key={p.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-700">{p.name}</p>
              <p className="text-[10px] text-slate-500 font-medium">
                {new Date(p.date).toLocaleDateString('cs-CZ')} • {formatCurrency(p.amount)}
              </p>
            </div>
            <button
              onClick={() => onRemove(p.id)}
              className="text-slate-300 hover:text-red-500 transition px-2 font-bold text-lg"
              title="Odstranit"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExtraPaymentsManager;
