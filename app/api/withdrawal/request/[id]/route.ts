import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { get_earnings } from "@/lib/utils";
import Activity from "@/models/Activity";
import Investment from "@/models/Investment";
import WithdrawalRequest from "@/models/WithdrawalRequest";
import mongoose, { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

type Props = {
    params:Promise<{
        investment_id:string
    }>
}

export async function POST(request:NextRequest,{params}:Props){
    const client_data = await request.json();
    const {investment_id} = await params;
    //const params = 
    //log(client_data,'Request jsons');
    const user = await getCurrentUser();
    const userId = new Types.ObjectId(user?.userId);
    await connectToDatabase();
    let investment = (await Investment.findOne({_id:investment_id,userId:user?.userId,isWithdrawal:false,withdrawal:0,invested:{$gt:0}}, { invested: 1, isWithdrawal: 1, withdrawal:1, plan: 1, endDate: 1, startDate: 1,  }).populate('plan', 'name dailyReturn duration minInvestment').lean()) as unknown as {invested:number,isWithdrawal:boolean,plan:{_id:mongoose.Types.ObjectId,name:string,dailyReturn:number,duration:number},endDate:Date,startDate:Date,_id:mongoose.Types.ObjectId};
    if(!investment){
        return NextResponse.json('Access denied',{status:403,statusText:'Access to request denied'});
    }
    const earnings = get_earnings(investment.startDate,investment.plan.dailyReturn,investment.invested,investment.endDate);
    const amount = parseFloat(client_data.amount.replaceAll(',',''));
    const available_withdrawal = earnings + investment.invested;
    if(available_withdrawal < amount){
        return NextResponse.json('Access denied',{status:403,statusText:'Access to request denied by server'});
    }
    //const residual_after_withdrawal = available_withdrawal - amount;
    
    const session = await mongoose.startSession();
      try {
        
        session.startTransaction();
        //await Deposit.insertOne({userId,amount:amountt},{session});
        await Investment.updateOne({_id: new mongoose.Types.ObjectId(investment_id)},{isWithdrawal:true,withdrawal:amount,status:1},{timestamps:true});   
        //await Investment.insertOne({plan:new mongoose.Types.ObjectId(plan as string),userId,invested:amountt,endDate:new Date(Date.now()+(duration*60*60*24*1000))},{session});
        await Activity.insertMany([
          {userId,type:'Withdrawal Request',amount,status:'Pending',description:`Withdrawal request of $${amount}`},
          //{userId,type:'Investment',amount:amountt,status:'Active',description:`${plan_name} investment  of $${amount}`}
        ]);
        await WithdrawalRequest.insertOne({amount,investment:new mongoose.Types.ObjectId(investment_id),userId,currency:client_data.currency});
        await session.commitTransaction();
        //log('Before time out','I got here');
        return NextResponse.json({logged:true,message:'Request sent'});
        //return {data:{logged:true,message:'Saved'}}; 
      } catch (error) { 
        //log(error,'Transaction error');
        await session.abortTransaction();
        //log(error,'Transaction error');
        return NextResponse.json('Server error',{status:403,statusText:'An error occured on the server'});
        //return {data:{logged:false,error:'An error occured on the server. Please try again later'}};
        //return {data:{logged:false,error:'An error occured on the server. Please try again later'}};
      }finally {
        await session.endSession();
        
      }
}