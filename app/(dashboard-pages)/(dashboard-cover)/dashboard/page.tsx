import { dashboardLoader } from "@/lib/dashboard-loader";
import Dashboard from "@/app/ui/pages/dashboard";
import { Metadata } from "next";
import { APPLICATION_TYPE } from "@/lib/config";
import { EarningsChartData, PortfolioChartData, RecentTransactions } from "@/types";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard',           
};

interface DashboardManual {
  balance:number,
  earnings:number,
  active_investments:number,
  active_investments_amount:number
  recentTransactions:any[]
}

interface DashboardData {
  balance: number | string;
  totalEarnings: number;
  activeInvestments: number;
  recentTransactions: RecentTransactions;
  earningsChartData: EarningsChartData;
  portfolioChartData: PortfolioChartData;
  marketTrends: { asset: string; price: number; change: number }[];
  earnings_title?:string;
}



export default async function(/*{loaderData}:Route.HydrateFallbackProps*/){
const loaderData = await dashboardLoader();
const isManualApp = APPLICATION_TYPE === 'manual';
if(isManualApp){
  const {dashboard,recentTransactions,name} = loaderData as {
    dashboard:{
      balance:number,
      earnings:number,
      active_investments:number,
      active_investments_amount:number
  },
    recentTransactions:any[],
    name:string
  };
  //const {name} = loaderData;
  const dashboard_data = {...dashboard,recentTransactions};
  return <Dashboard name={name as string} dashboard={dashboard_data} />
}

  const {recentTransactions,portfolioChartData,account_balance,earnings_data_months,earnings_data_values,earnings_title} 
  = loaderData!;
   

  const dashboard = {
    earnings_title,
    balance: account_balance?.balance, // Placeholder
    totalEarnings: account_balance?.earnings, // Placeholder
    activeInvestments: account_balance?.active_investments, // Placeholder
    recentTransactions/*: [ 
        { id: 1, type: 'Deposit', amount: 1000, date: '2023-10-25' },
        { id: 2, type: 'Earning', amount: 15.50, date: '2023-10-26' },
        { id: 3, type: 'Investment', amount: 500, date: '2023-10-26', plan: 'Bronze' },
        //{ id: '2', date: '2023-10-26', type: 'Investment', amount: -500.00, status: 'Completed', description: 'Bronze Plan' },
    ]*/,
    earningsChartData: { // Placeholder data for Line chart
        labels: earnings_data_months,//['Jan','Feb','March']
        datasets: [
          {
            label: 'Earnings',
            data: /*[100, 150, 200, 180, 250, 300]*/earnings_data_values,
            borderColor: '#FCD34D', // amber-300
            backgroundColor: 'rgba(252, 211, 77, 0.2)', // amber-300 with opacity
            tension: 0.4,
          },
        ],
     },
     marketTrends:[
      {asset: "BTC", price: 190000, change: 3},
      {asset: "ETH", price: 19000, change: 1.5},
      {asset: "XRP", price: 190, change: 5}
     ],
     portfolioChartData: { 
         //labels: ['Bitcoin Plan', 'Ethereum Plan', 'Altcoin Plan'],
         labels: portfolioChartData?.labels,
         datasets: [
             {
                 //data: [40, 29.90, 30.10], // Percentages
                 data: portfolioChartData?.datasets.data,
                 backgroundColor: portfolioChartData?.datasets.backgroundColor
                 //backgroundColor: ['#FCD34D', '#D97706', '#CA8A04'], // Shades of amber/gold
             }
         ]
     }
};
  return <Dashboard name={loaderData?.name as string} dashboard={(dashboard as DashboardData)} />
  
} 