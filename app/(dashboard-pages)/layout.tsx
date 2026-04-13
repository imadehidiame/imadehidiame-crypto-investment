import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import DashboardClientLayout from '../ui/layouts/dashboard-layout';
import { account_info } from '@/lib/dashboard-loader';
import CryptoTicker from '../ui/components/crypto-ticker';
import CryptoTickerFixed from '../ui/components/crypto-ticker-fixed';

// Mock data (replace with real data from your backend)
const portfolioData = [
  { date: '2025-05-01', value: 10000 },
  { date: '2025-05-02', value: 10500 },
  { date: '2025-05-03', value: 10000 },
  { date: '2025-05-04', value: 10800 },
  { date: '2025-05-05', value: 11000 },
  { date: '2025-05-06', value: 11500 },
];

const recentTransactions = [
  { id: '1', date: '2025-05-14', type: 'Buy', asset: 'BTC', amount: 0.5, value: 25000 },
  { id: '2', date: '2025-05-13', type: 'Sell', asset: 'ETH', amount: 2, value: 4000 },
];

/*export const loader = async ({ context }: Route.LoaderArgs) => {
  const { account_info } = await import('@/lib/utils.server');
  const user_context = getSess(context);
  const account = await account_info(user_context?.user?._id!);
  //log(account,'Account info');
  //log(user_context,'USER CONTEXT')
  return { user: { name: user_context?.user?.name, email: user_context?.user?.email, role: user_context?.user?.role }, account };
};*/


export default async function DashboardLayout(/*{ loaderData }: Route.ComponentProps*/{children}:{children:React.ReactNode}) {
  const user = await getCurrentUser();
  //console.log({user});
  const loaderData = {account: {...await account_info(user?.userId)}};
  //loaderData.
  /*const loaderData = {
    account:{
      investments:5000,
      earnings:10000,
      investable:1500
    }
  }*/
  
  
  return (
    <DashboardClientLayout loaderData={loaderData} user={user!}>
      {children}
      <CryptoTickerFixed />
      {/*<CryptoTicker />*/}
    </DashboardClientLayout>
  );
}



