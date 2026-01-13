
export interface ExtraPayment {
  id: string;
  name: string;
  amount: number;
  date: string;
}

export interface LoanDetails {
  principal: number;
  interestRate: number;
  years: number;
  startDate: string;
  extraPayments: ExtraPayment[];
}

export interface PaymentEntry {
  period: number;
  date: string;
  payment: number;
  principalPart: number;
  interestPart: number;
  remainingBalance: number;
  isProjected?: boolean;
}

export interface HistoryEvent {
  date: string;
  amount: number;
  type: 'regular' | 'extra';
  label: string;
  balance: number;
  isProjected: boolean;
}

export interface AmortizationSchedule {
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
  payments: PaymentEntry[];
  actualPayments: PaymentEntry[];
  history: HistoryEvent[];
}
