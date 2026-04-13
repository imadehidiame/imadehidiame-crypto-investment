//import InvestmentsPage from "@/components/dashboard-views/user/investments";
//import type { Route } from "./+types/dashboard-investments";
//import { getSess } from "@/layouts/app-layout";
//import Investment from "@/models/Investment.server";
import InvestmentsPage from "@/app/ui/pages/investments";
import { getCurrentUser } from "@/lib/auth";
import { get_earnings } from "@/lib/utils";
import Investment from "@/models/Investment";
import { Types } from "mongoose";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { APPLICATION_TYPE } from "@/lib/config";
import ManualInvestment from "@/models/ManualInvestment";
import { IInvestment } from "@/types";
import { connectToDatabase } from "@/lib/mongodb";
import AdmWallet from "@/models/AdmWallet";
import InvestmentSection from "@/app/ui/components/investment-section";
import ManualProfit from "@/models/ManualProfit";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Investments',           
};

const is_transaction_active = (date:Date,duration:number)=>(date.getTime()+(duration*60*60*24*1000)) > Date.now();

const loader = async ()=>{
  const user = await getCurrentUser();
  if(!user)
    redirect('/auth');
  //log(user?._id.toString(),'User ID');
  /**
   * 
     VM1690 <anonymous>:1  Server  Only plain objects can be passed to Client Components from Server Components. Objects with toJSON methods are not supported. Convert it manually to a simple value before passing it to props.
  {_id: {buffer: ...}, plan: "Silver", btc: ..., eth: ..., duration: ..., durationFlag: ..., amount: ..., investmentDate: ..., maxUpgrade: ..., isActive: ..., createdAt: ..., updatedAt: ...}
        ^^^^^^^^^^^^^
   */
  const userId = new Types.ObjectId(user?.userId);
  await connectToDatabase();
  if(APPLICATION_TYPE === 'manual'){
    
    let investments = await ManualInvestment.find({userId}).populate({
      path:'profits',
      model:ManualProfit,
      select:'profit',
      options:{sort:{date:-1}}
    }).select('-withdrawalCode -isWithdrawalPaid -__v -userId').lean();
    investments = investments.map((e)=>{
      //console.log({e});
      //const ret = {...e,_id:e._id?.toString()}
      //console.log({ret});
      //return ret;
      const profits = (e.profits as {profit:number}[]).reduce((acc,{profit})=>acc+=profit,0)
      return {...e,_id:e._id?.toString(),profits};
    });
    const wallets = await AdmWallet.find({}).select('type address');
        let wallets_sub = {btc:'',eth:''};
        wallets.forEach(element => {
          if(element.type === 'btc')
            wallets_sub.btc = element.address as string;
          else
          wallets_sub.eth = element.address as string;
        });
        return {investments,wallets_sub,userId:user.userId};
  }

  let investments = await Investment.find({userId}).populate('plan','name dailyReturn duration');
  //log(investments,'Investments data');

  investments = investments.map((e)=>{
    return {id:e._id.toString(),plan:e.plan.name,invested:e.invested,startDate:(e.startDate as Date).toLocaleDateString(),duration:e.plan.duration,currentEarnings:get_earnings(e.startDate as Date,e.plan.dailyReturn as number,e.invested as number,e.endDate as Date),status:is_transaction_active(e.startDate,e.plan.duration) ? 'Active': "Completed",_status:e.status};
  }); 

  const investmentsData = {
    active:investments.filter(e=>e.status === 'Active'),
    completed:investments.filter(e=>e.status === 'Completed'),
  }
 


  const investmentsDataaa = {
    active: [ // Placeholder
        { id: '1', plan: 'Bronze Plan', invested: 500, startDate: '2023-10-26', duration: 30, currentEarnings: 18.75, status: 'Active' },
        { id: '2', plan: 'Silver Plan', invested: 2000, startDate: '2023-11-01', duration: 60, currentEarnings: 50.00, status: 'Active' },
    ],
    completed: [ // Placeholder
        { id: '3', plan: 'Bronze Plan', invested: 300, startDate: '2023-09-15', duration: 30, totalEarnings: 45.00, status: 'Completed' },
    ]
};
  return investmentsData;
}

export default async function(){
    if(APPLICATION_TYPE === 'manual'){
      const loaderData = await loader() as {
        investments:any[],
        wallets_sub:{btc:string,eth:string},
        userId:string
      };
      return <InvestmentSection investments={loaderData.investments} wallets={loaderData.wallets_sub} userId={loaderData.userId} />;
    }
    const loaderData = await loader() as {active:any[],completed:any[]};
    return <InvestmentsPage investmentsData={loaderData} />;
   
}