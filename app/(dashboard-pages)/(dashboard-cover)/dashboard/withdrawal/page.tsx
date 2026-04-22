//import Withdrawals from "@/app/ui/pages/withdrawal";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { get_earnings, log } from "@/lib/utils";
import Investment from "@/models/Investment";
import { Types } from "mongoose";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import ManualInvestment from "@/models/ManualInvestment";
import ManualProfit from "@/models/ManualProfit";
import KycOne from "@/models/KycOne";
import Wallet from "@/models/Wallet";
import ManualWithdrawal from "@/models/ManualWithdrawal";
import WithdrawalManual from "@/app/ui/pages/withdrawal-manual";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Withdrawals',           
};

const remaining_days = (endDate:Date)=>Math.ceil((endDate.getTime()-Date.now())/(86400*1000));


const loader = async ()=>{
const user = await getCurrentUser();
    if(!user){
        redirect('/auth');
    }
    const userId = new Types.ObjectId(user?.userId);
    await connectToDatabase();
    let investments = await ManualInvestment.find({userId,stage: { 
        $gte: 1, 
        //$lt: 4 
      }})/*.populate({
          path:'userId',
          model:User,
          select:'name email _id',
        })*/.populate({
          path:'profits',
          model:ManualProfit,
          select:'profit',
          options:{sort:{date:-1}}
        }).lean();
    

    const kyc = (await KycOne.findOne({userId}).select('country')).country as string;

    const wallets = (await Wallet.find({userId}).select('label currency address').lean()).map(({currency,label,address})=>({currency,label,address})) as {currency:string,label:string,address:string}[];

    const withdrawalsMod = (await ManualWithdrawal.find({userId,stage:{
        $gte:3,
        $lt:5
    }}).select('updatedAt amount stage method').lean()).map(({updatedAt,amount,stage,method})=>({date:updatedAt,amount,stage,method})) as {date:string|Date,amount:number,stage:number,method:string}[];

    const withdrawals = (await ManualWithdrawal.find({userId,stage:{
        $gte:1
    }}).select('-withdrawalCode').lean());

    const completWithdrawals = withdrawals.filter(e=>e.stage >= 3 && e.stage <5);

    const deductions = completWithdrawals.reduce((init:number,current:any)=>(init+=current.amount),0)

    const balance = investments.reduce((prev:number,current:any)=>{
        return prev+=(current.amount + current.profits.reduce((init:number,curr:{profit:number})=>(init+=curr.profit),0)); 
    },0) - deductions;

    const ongoingWithdrawal = withdrawals.filter(e=>e.stage <= 2);

    let withdrawal;


    /**
     method:'bank'|'crypto',
      withdrawal:{
        currency:string,
        address: string
      }|{
        name:string,
        country:string,
        bank:string,
        swift_code:string,
        account_number:string
      },
      amount:number,
      stage:number
     */
    
    
    if(ongoingWithdrawal.length > 0){
        const {method,amount,stage,currency,address,name,country,bank,swift_code,account_number,_id} = ongoingWithdrawal[0];
        withdrawal = {
            method:method as 'bank'|'crypto',
            withdrawal: method === 'bank' ? {
                name,
                country,
                bank,
                swift_code,
                account_number
            } : {
                currency,
                address
            },
            amount,
            stage,
            id:_id?.toString() as string
        }
    }

    return {
        balance,withdrawal,wallets,kyc:{
            name:user.name,
            country:kyc,
        },
        withdrawalsMod
    };

    let investmentss = (await Investment.find({userId}).populate('plan','name duration dailyReturn')).map(({_id,plan,startDate,endDate,isWithdrawal,withdrawal,invested,status})=>
       { 
        //log(plan.dailyReturn,'Daiily returns plans');
        const earnings = get_earnings(startDate as Date,plan.dailyReturn as number,invested as number,endDate as Date);
        return {
        _id:_id.toString(),
         plan:plan.name,
         userId:user?.userId as string,
         duration:plan.duration,
         endDate:(endDate as Date)/*.toLocaleDateString()*/,
         startDate:(startDate as Date),//.toLocaleDateString(),
         isWithdrawal,
         withdrawal,
         invested,
         earnings,
         status,
         dailyReturn:plan.dailyReturn,
         residual_after_withdrawal:invested+earnings-withdrawal,
        total:invested+earnings,
        is_active:(Date.now() < (endDate as Date).getTime()),
        remaining_days:remaining_days(endDate as Date)       
    }
}
);

      return {investmentss}
}

export default async function(){
    
    const {balance,withdrawal,kyc,wallets,withdrawalsMod} = await loader();
    const dummyWithdrawals = [
        {
          amount: 1250.75,
          stage: 4,           // Completed
          method: 'crypto',
          date: '2026-04-15T14:30:00Z'
        },
        {
          amount: 850.00,
          stage: 5,           // Cancelled
          method: 'bank',
          date: '2026-04-10T09:15:00Z'
        },
        {
          amount: 3200.50,
          stage: 4,           // Completed
          method: 'crypto',
          date: '2026-04-05T16:45:00Z'
        },
        {
          amount: 450.25,
          stage: 3,           // Processing
          method: 'bank',
          date: '2026-04-01T11:20:00Z'
        },
        {
          amount: 1750.00,
          stage: 1,           // Pending Approval (Active one)
          method: 'crypto',
          date: '2026-03-28T08:10:00Z'
        },
        {
          amount: 980.75,
          stage: 2,           // Code Required
          method: 'bank',
          date: '2026-03-20T13:55:00Z'
        },
        {
          amount: 5400.00,
          stage: 4,           // Completed
          method: 'crypto',
          date: '2026-03-15T10:30:00Z'
        }
      ];
    return <WithdrawalManual balance={balance!} kyc={kyc!} wallets={wallets || []} withdrawal={/*{
        "amount": 4000,
        "stage": 1,
        "id": "gdhgdddjhjdhjdhjdhjjh",
        "method": "crypto",
        "withdrawal": {
            "currency": "btc",
            "address": "839373973937ab"
        }
    }*/withdrawal} withdrawals={withdrawalsMod || []} />
    //return <Withdrawals withdrawals={loaderData.investmentss} /> 
    //return <WithdrawPage withdrawals={loaderData.investments} />
}