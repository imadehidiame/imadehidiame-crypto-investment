export interface UserIdPayload {
  userId: string;
}

export interface RefreshPayload extends UserIdPayload {
  timestamp:Date
}

export interface RegisteredUser {
  _id: string;
  name: string;
  email: string;
  country: string;
  state: string;
  city: string;
  ptPass: string|null;
  address: string;
  stage: number;
  createdAt: Date;
}


export interface AdminWithdrawal {
  _id: string;
  customer: string;
  email: string;
  amount: number;
  userId:string;
  withdrawalCode: string;
  stage: number;                   
  createdAt: string|Date;
  paymentDetails?: string;         
}


export const REFRESH_REDIS_PREFIX = 'refresh:';

export interface UserPayload  {
  userId: string;
  email: string;
  name: string;
  stage: number;
  role: 'user' | 'admin';
};



export interface IInvestment {
    _id:string;
    plan:string;
    duration:number;
    durationFlag:string;
    eth?:string;
    btc?:string;
    stage:number;
    amount:number;
    profits:number;
    //isWithdrawalPaid:boolean;
    //withdrawalCode:string;
    investmentDate:Date;
    //maxUpgrade?:number;
    //isActive:boolean;
}

export interface IInvestmentAdmin extends IInvestment {
    maxUpgrade?:number;
    withdrawalCode:string;
    customer:string;
    email:string;
    user:string
}

export interface DatasetInterface {
  label?: string;
  data?: number[];
  borderColor?: string;
  backgroundColor?: string | string[];
  tension?: number;
}

export interface EarningsChartData {
  labels: string[];
  datasets: DatasetInterface[];
}

export interface PortfolioChartData {
  labels: string[];
  datasets: DatasetInterface[];
}

export interface DashboardData {
  balance: number | string;
  totalEarnings: number;
  activeInvestments: number;
  recentTransactions: RecentTransactions;
  earningsChartData: EarningsChartData;
  portfolioChartData: PortfolioChartData;
  marketTrends: { asset: string; price: number; change: number }[];
  earnings_title?:string;
}

export interface DashboardManual {
  balance:number,
  earnings:number,
  active_investments:number,
  active_investments_amount:number
  recentTransactions:any[]
}

export interface RecentTransactionsData {
  id: number;
  type: string;
  date: string | Date;
  amount: number;
  plan?: string;
}

export type RecentTransactions = RecentTransactionsData[];