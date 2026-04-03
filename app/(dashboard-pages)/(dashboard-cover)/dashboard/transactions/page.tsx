import TransactionHistoryPage from "@/app/ui/pages/transactions";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { NumberFormat } from "@/lib/utils";
import Activity from "@/models/Activity";
import { Types } from "mongoose";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Transactions',           
};

const loader = async () =>{
    const user = await getCurrentUser();
    if(!user)
      redirect('/auth');
    const userId = new Types.ObjectId(user?.userId);
    await connectToDatabase();
    let transactions  = await Activity.find({userId});
    transactions = transactions.map(e=>{
        return {id:e._id.toString(),date:e.date.toLocaleDateString(),type:e.type,amount:e.type == 'Investment' || e.type == 'Withdrawal' ? `-$${NumberFormat.thousands(e.amount,{allow_decimal:true,length_after_decimal:2,add_if_empty:true,allow_zero_start:false})}`:`$${NumberFormat.thousands(e.amount,{allow_decimal:true,length_after_decimal:2,add_if_empty:true,allow_zero_start:false})}`,status:e.status,description:e.description};
    })

const transactionss = [ // Placeholder
        { id: '1', date: '2023-10-26', type: 'Deposit', amount: 1000.00, status: 'Completed' },
        { id: '2', date: '2023-10-26', type: 'Investment', amount: -500.00, status: 'Completed', description: 'Bronze Plan' },
        { id: '3', date: '2023-10-27', type: 'Earning', amount: 7.50, status: 'Completed', description: 'Bronze Plan Daily Return' },
        { id: '4', date: '2023-10-27', type: 'Withdrawal', amount: -100.00, status: 'Pending' },
      
    ];
  
  
  return {transactions}
}

export default async function(){
  const loaderData = await loader();
  //if(loaderData)
  return <TransactionHistoryPage transactions={loaderData?.transactions || []} />
} 