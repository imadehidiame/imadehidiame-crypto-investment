import { dashboardLoader } from "@/lib/dashboard-loader";
import Dashboard from "@/app/ui/pages/dashboard";

export const dynamic = 'force-dynamic';

export default async function(/*{loaderData}:Route.HydrateFallbackProps*/){
const loaderData = await dashboardLoader();

  const {recentTransactions,portfolioChartData,account_balance,earnings_data_months,earnings_data_values,earnings_title} 
  = loaderData!;
   

  const dashboard = {
    earnings_title,
    balance: account_balance.balance, // Placeholder
    totalEarnings: account_balance.earnings, // Placeholder
    activeInvestments: account_balance.active_investments, // Placeholder
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
         labels: portfolioChartData.labels,
         datasets: [
             {
                 //data: [40, 29.90, 30.10], // Percentages
                 data: portfolioChartData.datasets.data,
                 backgroundColor: portfolioChartData.datasets.backgroundColor
                 //backgroundColor: ['#FCD34D', '#D97706', '#CA8A04'], // Shades of amber/gold
             }
         ]
     }
};
  return <Dashboard name={loaderData?.name as string} dashboard={dashboard} />
  
} 