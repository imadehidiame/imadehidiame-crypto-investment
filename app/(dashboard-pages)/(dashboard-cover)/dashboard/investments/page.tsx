//import InvestmentsPage from "@/components/dashboard-views/user/investments";
//import type { Route } from "./+types/dashboard-investments";
//import { getSess } from "@/layouts/app-layout";
//import Investment from "@/models/Investment.server";
import InvestmentsPage from "@/app/ui/pages/investments";
import { getCurrentUser } from "@/lib/auth";
import { get_earnings, log } from "@/lib/utils";
import Investment from "@/models/Investment";
import { Types } from "mongoose";



const is_transaction_active = (date:Date,duration:number)=>(date.getTime()+(duration*60*60*24*1000)) > Date.now();

export const loader = async ()=>{
  const user = await getCurrentUser();
  //log(user?._id.toString(),'User ID');
  const userId = new Types.ObjectId(user?.userId);
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
    const loaderData = await loader();
  return <InvestmentsPage investmentsData={loaderData} />
}