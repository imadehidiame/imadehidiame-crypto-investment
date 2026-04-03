import Withdrawals from "@/app/ui/pages/withdrawal";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { get_earnings, log } from "@/lib/utils";
import Investment from "@/models/Investment";
import { Types } from "mongoose";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

const remaining_days = (endDate:Date)=>Math.ceil((endDate.getTime()-Date.now())/(86400*1000));


const loader = async ()=>{
    const user = await getCurrentUser();
    if(!user){
        redirect('/auth');
    }
    const userId = new Types.ObjectId(user?.userId);
    await connectToDatabase();
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
    const loaderData = await loader();
    return <Withdrawals withdrawals={loaderData.investmentss} /> 
    //return <WithdrawPage withdrawals={loaderData.investments} />
}