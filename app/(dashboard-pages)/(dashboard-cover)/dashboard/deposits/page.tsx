//import { getSess } from "@/layouts/app-layout";
//import DepositPage, { type CryptoData, type Deposit } from "@/components/dashboard-views/user/deposit";
//import type { Route } from "./+types/dashboard-deposit";
import DepositPage from "@/app/ui/pages/deposit";
import { CryptoData, Deposit, fetch_request_mod, getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { Types } from "mongoose";
import { redirect } from "next/navigation";


export const dynamic = 'force-dynamic';

const loader = async () => {
  await connectToDatabase();

  const user = await getCurrentUser();

  // Critical: Redirect if not authenticated
  if (!user || !user.userId) {
      redirect('/auth');
  }

  const userId = new Types.ObjectId(user.userId);

  // Fetch currencies (this part looks okay)
  let currencies: CryptoData[] = [];
  let prices: { btc: number; eth: number } = { btc: 0, eth: 0 };

  try {
      const search = new URLSearchParams({ price: '1' }).toString();
      const { data, served, status, is_error } = await fetch_request_mod<{ btc: any; eth: any; trc20: any }>(
          'GET',
          `https://api.cryptapi.io/info/?${search}`
      );

      if (!is_error && status === 200 && served) {
          const { btc, eth, trc20 } = served;
          const needed_data = Object.entries({ btc, eth, trc20 });

          prices = {
              btc: parseFloat(btc?.prices?.USD || '0'),
              eth: parseFloat(eth?.prices?.USD || '0')
          };

          currencies = needed_data.reduce((acc, [currency, currency_data]) => {
              if (currency === 'trc20') {
                  return acc.concat([currency_data.usdt as CryptoData]);
              } else {
                  return acc.concat([currency_data as CryptoData]);
              }
          }, [] as CryptoData[]);
      }
  } catch (err) {
      console.error("Failed to fetch crypto prices:", err);
  }

  // Fetch transactions safely
  const transactions = await Payment.aggregate<Deposit>([
      { $match: { userId } },
      {
          $project: {
              _id: { $toString: "$_id" },
              deposit: 1,
              createdAt: 1,
              status: 1,
              updatedAt: 1,
              coin: 1,
              value_coin: 1
          }
      },
      { $sort: { createdAt: -1 } }
  ]);

  return {
      transactions: transactions || [],
      userId: user.userId,
      currencies,
      prices
  };
};

export default async function DepositsPage() {
  const loaderData = await loader();

  return (
      <DepositPage 
          deposits={loaderData.transactions} 
          userId={loaderData.userId} 
          currencies={loaderData.currencies} 
          prices={loaderData.prices} 
      />
  );
}

/*export default async function(){
  const loaderData = await loader();
  
  //if(loaderData)
  return <DepositPage deposits={loaderData?.transactions || []} userId={loaderData?.userId!} currencies={loaderData?.currencies!} prices={loaderData?.prices!} />
} */