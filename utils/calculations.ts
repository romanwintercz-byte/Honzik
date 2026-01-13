
import { LoanDetails, AmortizationSchedule, PaymentEntry, HistoryEvent } from '../types';

export const calculateAmortization = (details: LoanDetails): AmortizationSchedule => {
  const { principal, interestRate, years, startDate, extraPayments = [] } = details;
  const numberOfPayments = Math.max(1, years * 12);
  const start = new Date(startDate);
  const monthlyRate = interestRate / 100 / 12;
  const today = new Date();

  // 1. Calculate Theoretical Monthly Payment
  let theoreticalMonthlyPayment = 0;
  if (interestRate === 0) {
    theoreticalMonthlyPayment = principal / numberOfPayments;
  } else {
    theoreticalMonthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  // 2. Generate Theoretical Schedule
  const theoreticalPayments: PaymentEntry[] = [];
  let theoreticalBalance = principal;
  let theoreticalTotalInterest = 0;

  for (let i = 1; i <= numberOfPayments; i++) {
    const interestPart = theoreticalBalance * (interestRate / 100 / 12);
    const principalPart = theoreticalMonthlyPayment - interestPart;
    theoreticalBalance -= principalPart;
    theoreticalTotalInterest += interestPart;

    const paymentDate = new Date(start);
    paymentDate.setMonth(start.getMonth() + i);

    theoreticalPayments.push({
      period: i,
      date: paymentDate.toLocaleDateString('cs-CZ', { year: 'numeric', month: 'short' }),
      payment: theoreticalMonthlyPayment,
      principalPart,
      interestPart,
      remainingBalance: Math.max(0, theoreticalBalance),
    });
  }

  // 3. Generate Actual/Projected Schedule and Detailed History
  const actualPayments: PaymentEntry[] = [];
  const history: HistoryEvent[] = [];
  let actualBalance = principal;
  let actualTotalInterest = 0;
  
  const sortedExtras = [...extraPayments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (let i = 1; i <= 600; i++) {
    if (actualBalance <= 0.01) break;

    const paymentDate = new Date(start);
    paymentDate.setMonth(start.getMonth() + i);
    
    const monthStart = new Date(start);
    monthStart.setMonth(start.getMonth() + i - 1);
    const monthEnd = new Date(start);
    monthEnd.setMonth(start.getMonth() + i);

    const interestPart = actualBalance * (interestRate / 100 / 12);
    actualTotalInterest += interestPart;
    
    let monthlyPrincipalPart = Math.min(actualBalance, theoreticalMonthlyPayment - interestPart);
    actualBalance -= monthlyPrincipalPart;
    
    history.push({
      date: paymentDate.toISOString().split('T')[0],
      amount: monthlyPrincipalPart + interestPart,
      type: 'regular',
      label: 'Měsíční splátka',
      balance: Math.max(0, actualBalance),
      isProjected: paymentDate > today
    });

    const extrasThisMonth = sortedExtras.filter(ex => {
      const exDate = new Date(ex.date);
      return exDate >= monthStart && exDate < monthEnd;
    });

    let extraPrincipalInMonth = 0;
    for (const ex of extrasThisMonth) {
      const exAmount = Math.min(actualBalance, ex.amount);
      actualBalance -= exAmount;
      extraPrincipalInMonth += exAmount;
      
      history.push({
        date: ex.date,
        amount: exAmount,
        type: 'extra',
        label: ex.name,
        balance: Math.max(0, actualBalance),
        isProjected: new Date(ex.date) > today
      });
    }

    actualPayments.push({
      period: i,
      date: paymentDate.toLocaleDateString('cs-CZ', { year: 'numeric', month: 'short' }),
      payment: theoreticalMonthlyPayment + extraPrincipalInMonth,
      principalPart: monthlyPrincipalPart + extraPrincipalInMonth,
      interestPart,
      remainingBalance: Math.max(0, actualBalance),
      isProjected: paymentDate > today
    });
  }

  const sortedHistory = history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Calculate summary metrics
  const paidToDate = sortedHistory
    .filter(h => !h.isProjected)
    .reduce((sum, h) => sum + h.amount, 0);

  const extraPaidToDate = sortedHistory
    .filter(h => !h.isProjected && h.type === 'extra')
    .reduce((sum, h) => sum + h.amount, 0);

  // Find the current balance from history (last entry before today or initial principal)
  const pastEvents = sortedHistory.filter(h => !h.isProjected);
  const currentBalance = pastEvents.length > 0 ? pastEvents[pastEvents.length - 1].balance : principal;
  
  const projectedEndDate = actualPayments.length > 0 
    ? actualPayments[actualPayments.length - 1].date 
    : '-';

  return {
    monthlyPayment: theoreticalMonthlyPayment,
    totalInterest: theoreticalTotalInterest,
    totalPaid: principal + theoreticalTotalInterest,
    actualTotalInterest,
    actualTotalPaid: principal + actualTotalInterest,
    paidToDate,
    extraPaidToDate,
    currentBalance,
    projectedEndDate,
    payments: theoreticalPayments,
    actualPayments: actualPayments,
    history: sortedHistory
  };
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(value);
};
