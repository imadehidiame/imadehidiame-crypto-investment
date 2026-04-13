//import InvestmentsPage from "@/components/dashboard-views/user/investments";
//import type { Route } from "./+types/dashboard-investments";
//import { getSess } from "@/layouts/app-layout";
//import Investment from "@/models/Investment.server";
import InvestmentsPage from "@/app/ui/pages/investments";
import { getCurrentUser } from "@/lib/auth";
//import { get_earnings } from "@/lib/utils";
//import Investment from "@/models/Investment";
import { Types } from "mongoose";
import { redirect } from "next/navigation";
import { Metadata } from "next";
//import { APPLICATION_TYPE } from "@/lib/config";
import ManualProfit from "@/models/ManualProfit";
import ManualInvestment from "@/models/ManualInvestment";
//import User from "@/models/User";
import { IInvestment, IInvestmentAdmin } from "@/types";
import { connectToDatabase } from "@/lib/mongodb";
import AdmWallet from "@/models/AdmWallet";
import InvestmentSection from "@/app/ui/components/investment-section";
import AdmInvestment from "@/app/ui/pages/adm/adm-investment";
import User from "@/models/User";


export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Investments',           
};

const is_transaction_active = (date:Date,duration:number)=>(date.getTime()+(duration*60*60*24*1000)) > Date.now();

const loader = async ()=>{
  const user = await getCurrentUser();
  if(!user || user.role !== 'admin')
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
  //let users = await User.find();
  //console.log({users});
  let investments = await ManualInvestment.find().populate({
    path:'userId',
    model:User,
    select:'name email _id',
  }).populate({
    path:'profits',
    model:ManualProfit,
    select:'profit',
    options:{sort:{date:-1}}
  }).lean();
  //investments.forEach(element => {
    //console.log(element.userId);
  //});
  //console.log({investments});
  const investmentss = investments.map((e)=>{
    const {email,name,_id} = e.userId;
    //console.log({email,name});
    delete e.userId;
    delete e._v;
    //const ret = {...e,_id:e._id?.toString(),email,name};
    /*console.log({
      _id:e._id?.toString()!,
    plan:e.plan! as string,
    duration:e.duration! as number,
    durationFlag:e.durationFlag as string,
    eth:e.eth as string,
    btc:e.btc as string,
    amount:e.amount as number,
    isWithdrawalPaid:e.isWithdrawalPaid as boolean,
    withdrawalCode:e.withdrawalCode as string,
    investmentDate:e.investmentDate as Date,
    maxUpgrade:e.maxUpgrade as number,
    isActive:e.isActive as boolean,
    customer:name,
    email
    });*/
    return {
      _id:e._id?.toString()!,
    plan:e.plan! as string,
    profits:(e.profits as {profit:number}[]).reduce((acc,{profit},index)=>acc+=profit,0),
    duration:e.duration! as number,
    durationFlag:e.durationFlag as string,
    eth:e.eth as string,
    btc:e.btc as string,
    stage:e.stage,
    amount:e.amount as number,
    //isWithdrawalPaid:e.isWithdrawalPaid as boolean,
    withdrawalCode:e.withdrawalCode as string,
    investmentDate:e.investmentDate as Date,
    maxUpgrade:e.maxUpgrade as number,
    //isActive:e.isActive as boolean,
    customer:name,
    email,
    user:_id.toString()
    } as IInvestmentAdmin
    //return ret;
    //return {...e,_id:e._id?.toString(),email,name};
  });
  return { investmentss };
}

export default async function(){
    const loaderData = await loader();
    return <AdmInvestment investments={loaderData.investmentss as any[]}  />;
}