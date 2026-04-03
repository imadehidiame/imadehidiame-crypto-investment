import SubscriptionPlan from "@/models/SubscriptionPlan";
import { get_earnings, NumberFormat } from "@/lib/utils";
import { Types } from "mongoose";
import Deposit from "@/models/Deposit";
import Investment from "@/models/Investment";
import { getCurrentUser, Subscription, SubscriptionData } from "@/lib/auth";
import SubscribePage from "@/app/ui/pages/subscription";
import { connectToDatabase } from "@/lib/mongodb";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Subscribe',           
};

const is_transaction_active = (date:Date)=>Date.now() < date.getTime();

/*export const action = async ({request,context}:Route.ActionArgs)=>{
  const user = getSess(context);
  let { plan,amount,plan_name,duration,dailyReturn } = await request.json();
  const userId = user?.user?._id;
  let amountt = parseFloat((amount as string).replaceAll(',',''));
  const session = await mongoose.startSession();
  try {
    
    session.startTransaction();
    //await Deposit.insertOne({userId,amount:amountt},{session});
    await Investment.insertOne({plan:new mongoose.Types.ObjectId(plan as string),userId,invested:amountt,endDate:new Date(Date.now()+(duration*60*60*24*1000)),duration,dailyReturn,plan_name},{session}); 
    await Activity.insertMany([
      //{userId,type:'Deposit',amount:amountt,status:'Completed',description:`$${amount} deposit`},
      {userId,type:'Investment',amount:amountt,status:'Active',description:`${plan_name} investment of $${amount}`}
    ]);
    await session.commitTransaction();
    return {data:{logged:true,message:'Saved'}};
  } catch (error) { 
    await session.abortTransaction();
    log(error,'Transaction error');
  }finally {
    await session.endSession();
    //return {data:{logged:false,error:'An error occured on the server. Please try again later'}};
  }


}*/

const loader = async (search?:string)=>{

  /*const inserts = [
    {
      insertOne:{
        document:{name:'Bronze Plan',minInvestment:100,maxInvestment:999,duration:2,dailyReturn:2.2}
      },
    },
    {
      insertOne:{
        document:{name:'Silver Plan',minInvestment:1000,maxInvestment:4999,duration:4,dailyReturn:2.9}
      },
    },
    {
      insertOne:{
        document:{name:'Gold Plan',minInvestment:5000,maxInvestment:9999,duration:6,dailyReturn:3.5}
      },
    }
  ];*/  

  await connectToDatabase();

  //const subcription = new SubscriptionPlan({});
  let plans = await SubscriptionPlan.find();



  const context_data = await getCurrentUser();
  
  if(!context_data)
    redirect('/auth');

  plans = plans.map((e)=>({name:e.name,minInvestment:NumberFormat.thousands(e.minInvestment,{allow_decimal:true,length_after_decimal:2,add_if_empty:true,allow_zero_start:false}),maxInvestment:NumberFormat.thousands(e.maxInvestment,{allow_decimal:true,length_after_decimal:2,add_if_empty:true,allow_zero_start:false}),duration:e.duration,dailyReturn:e.dailyReturn,id:e._id.toString()})).sort((a,b)=>a.dailyReturn - b.dailyReturn) as SubscriptionData;

  

  let investmentss = (await Investment.find({userId: new Types.ObjectId(context_data?.userId)}).populate('plan','name duration dailyReturn')).reduce((acc,{startDate,endDate,invested,dailyReturn,plan_name,withdrawal})=>{
    if(!is_transaction_active(endDate as Date)){
      return acc+=get_earnings(startDate as Date,dailyReturn as number,invested as number,endDate as Date) - withdrawal as number;
    }else{
      return acc-=invested
    }
  },0);
  
  let deposits  = (await Deposit.find({userId:new Types.ObjectId(context_data?.userId)}).sort({date:-1})).reduce((acc,{amount})=>{
    return acc+=amount;
  },0);

  let residuals = (await Investment.find({userId:new Types.ObjectId(context_data?.userId)}).populate('plan','name duration dailyReturn')).reduce((acc,{startDate,endDate,invested,dailyReturn,withdrawal})=>{
    if(!is_transaction_active(endDate as Date)){
      //completed investment
      //log((get_earnings(startDate as Date,dailyReturn as number,invested as number,endDate as Date) - withdrawal as number) + acc,'EARNED')
      return {...acc,earnings:acc.earnings+=get_earnings(startDate as Date,dailyReturn as number,invested as number,endDate as Date) - withdrawal as number}
      //return (get_earnings(startDate as Date,dailyReturn as number,invested as number,endDate as Date) - withdrawal as number) + acc;
    }else{
      //ongoing investment
      //log(invested + get_earnings(startDate as Date,dailyReturn as number,invested as number,endDate as Date) - withdrawal as number,'NEGAT')
      return {...acc,investments:acc.investments+=invested}
      //return acc-=(invested + get_earnings(startDate as Date,dailyReturn as number,invested as number,endDate as Date) - withdrawal as number)
    }
  },{investments:0,earnings:0} as {investments:number,earnings:number}) as {investments:number,earnings:number};

  

  //log(investmentss,'INVEST');
  //log(deposits + residuals.earnings,'Total DEPOS')

  residuals = Object.assign({},residuals,{investments:parseFloat((residuals.investments as number).toFixed(2)),earnings: parseFloat((residuals.earnings+=deposits as number).toFixed(2))}) as {earnings:number,investments:number};

  //log(residuals,'RESIDUALS');

  //log(parseFloat(((deposits+investmentss) as number).toFixed(2)),'BALV')
  //log(deposits+investmentss,'Total Balance')
  
  
  //const subs = await SubscriptionPlan.bulkWrite(inserts);
  //log(subs,'Subscriptions object plan');
  //log(subs,'Subscriptions object plan1');
  //console.log(subs.insertedIds)

  /*const plans = [ 
    {
      id: '1',
      name: 'Bronze Plan',
      minInvestment: 100,
      maxInvestment: 1000,
      duration: 30,
      dailyReturn: 1.5,
    },
    {
      id: '2',
      name: 'Silver Plan',
      minInvestment: 1001,
      maxInvestment: 5000,
      duration: 60, 
      dailyReturn: 2.0,
    },
    {
        id: '3',
        name: 'Gold Plan',
        minInvestment: 5001,
        maxInvestment: 10000,
        duration: 90,
        dailyReturn: 2.5,
      },
  
];*/
//const url = new URL(request.url);
//const planId = url.searchParams.get('planId');

const initialSelectedPlan = plans.find(e=>e.id === search) || null;
return {plans,initialSelectedPlan,balance:parseFloat(((deposits+investmentss) as number).toFixed(2)),account_info:residuals};
}

type Props = {
    searchParams:Promise<{
        planId:string
    }>;
} 

export default async function({searchParams}:Props){
  /*await connectToDatabase();
  const plansData = [
    { name: 'Bronze Plan', minInvestment: 100, maxInvestment: 999, duration: 2, dailyReturn: 2.2 },
    { name: 'Silver Plan', minInvestment: 1000, maxInvestment: 4999, duration: 4, dailyReturn: 2.9 },
    { name: 'Gold Plan', minInvestment: 5000, maxInvestment: 9999, duration: 6, dailyReturn: 3.5 },
  ];
  await SubscriptionPlan.deleteMany({});
  const result = await SubscriptionPlan.insertMany(plansData, { ordered: true });
  console.log({result});*/
  const {planId} = await searchParams;
  const {plans,initialSelectedPlan,balance,account_info} = await loader(planId);
  console.log({plans,initialSelectedPlan,balance,account_info});
  return <SubscribePage plans={plans as SubscriptionData} balance={balance} account_info={account_info} initialSelectedPlan={initialSelectedPlan as (/*typeof plans[0]*/ Subscription | null)} />
}