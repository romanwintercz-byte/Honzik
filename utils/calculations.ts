
import { LoanDetails, AmortizationSchedule, PaymentEntry, HistoryEvent } from '../types';

/**
 * Standard financial rounding to 2 decimal places
 */
const round = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export const calculateAmortization = (details: LoanDetails): AmortizationSchedule => {
  const { principal, interestRate, years, startDate, extraPayments = [] } = details;
  const numberOfPayments = Math.max(1, years * 12);
  const start = new Date(startDate);
  const monthlyRate = interestRate / 100 / 12;
  const today = new Date();

  // 1. Calculate Theoretical Monthly Payment
  let theoreticalMonthlyPayment = 0;
  if (interestRate === 0) {
    theoreticalMonthlyPayment = round(principal / numberOfPayments);
  } else {
    theoreticalMonthlyPayment = round(
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    );
  }

  // 2. Generate Theoretical Schedule
  const theoreticalPayments: PaymentEntry[] = [];
  let theoreticalBalance = principal;
  let theoreticalTotalInterest = 0;

  for (let i = 1; i <= numberOfPayments; i++) {
    const interestPart = round(theoreticalBalance * monthlyRate);
    const principalPart = round(theoreticalMonthlyPayment - interestPart);
    theoreticalBalance = round(theoreticalBalance - principalPart);
    theoreticalTotalInterest = round(theoreticalTotalInterest + interestPart);

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

  // Safety limit 1200 months (100 years)
  for (let i = 1; i <= 1200; i++) {
    if (actualBalance <= 0) break;

    const paymentDate = new Date(start);
    paymentDate.setMonth(start.getMonth() + i);
    
    const monthStart = new Date(start);
    monthStart.setMonth(start.getMonth() + i - 1);
    const monthEnd = new Date(start);
    monthEnd.setMonth(start.getMonth() + i);

    const interestPart = round(actualBalance * monthlyRate);
    actualTotalInterest = round(actualTotalInterest + interestPart);
    
    // Monthly regular payment
    let monthlyPrincipalPart = round(Math.min(actualBalance, theoreticalMonthlyPayment - interestPart));
    actualBalance = round(actualBalance - monthlyPrincipalPart);
    
    history.push({
      date: paymentDate.toISOString().split('T')[0],
      amount: round(monthlyPrincipalPart + interestPart),
      type: 'regular',
      label: 'Měsíční splátka',
      balance: Math.max(0, actualBalance),
      isProjected: paymentDate > today
    });

    // Check extra payments in this window
    const extrasThisMonth = sortedExtras.filter(ex => {
      const exDate = new Date(ex.date);
      return exDate >= monthStart && exDate < monthEnd;
    });

    let extraPrincipalInMonth = 0;
    for (const ex of extrasThisMonth) {
      if (actualBalance <= 0) break;
      const exAmount = round(Math.min(actualBalance, ex.amount));
      actualBalance = round(actualBalance - exAmount);
      extraPrincipalInMonth = round(extraPrincipalInMonth + exAmount);
      
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
      payment: round(theoreticalMonthlyPayment + extraPrincipalInMonth),
      principalPart: round(monthlyPrincipalPart + extraPrincipalInMonth),
      interestPart,
      remainingBalance: Math.max(0, actualBalance),
      isProjected: paymentDate > today
    });
  }

  const sortedHistory = history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const paidToDate = round(sortedHistory
    .filter(h => !h.isProjected)
    .reduce((sum, h) => sum + h.amount, 0));

  const extraPaidToDate = round(sortedHistory
    .filter(h => !h.isProjected && h.type === 'extra')
    .reduce((sum, h) => sum + h.amount, 0));

  const pastEvents = sortedHistory.filter(h => !h.isProjected);
  const currentBalance = pastEvents.length > 0 ? pastEvents[pastEvents.length - 1].balance : principal;
  
  const projectedEndDate = actualPayments.length > 0 
    ? actualPayments[actualPayments.length - 1].date 
    : '-';

  return {
    monthlyPayment: theoreticalMonthlyPayment,
    totalInterest: theoreticalTotalInterest,
    totalPaid: round(principal + theoreticalTotalInterest),
    actualTotalInterest,
    actualTotalPaid: round(principal + actualTotalInterest),
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
