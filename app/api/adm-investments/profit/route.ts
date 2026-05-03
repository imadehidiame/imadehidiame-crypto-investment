import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Activity from "@/models/Activity";
import ManualInvestment from "@/models/ManualInvestment";
import ManualProfit from "@/models/ManualProfit";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest){
    try {
    const user = await getCurrentUser();
    if(!user){
            return NextResponse.json({error:'User session expired'},{status:401,statusText:'Access to resource denied. Session expired'});
    }
    if(user.role !== 'admin'){
        return NextResponse.json({error:'Access denied'},{status:403,statusText:'Access to resource denied'});
    }
    const {id,investmentId,userId:usedId,profit} = await request.json();
    await connectToDatabase();    
    const userId = new Types.ObjectId(usedId as string);
    const profitId = await ManualProfit.create([{
        profit,
        userId,
        investmentId:new Types.ObjectId(investmentId as string)
    }])
    const investment = await ManualInvestment.findByIdAndUpdate(
        investmentId,
        { $push: { profits: profitId[0]._id } },
      );
      //const {amount,plan}:{amount:number,plan:string} = investment;
      await Activity.insertMany([
                  //{userId,type:'Deposit',amount:amountt,status:'Completed',description:`$${amount} deposit`},
                  {userId,type:'Profit',amount:profit,status:'Active',description:`A profit of $${(profit as number).toLocaleString()} has been added to your account`}
                ]);
    /*await ManualInvestment.findByIdAndUpdate(new Types.ObjectId(id as string),{
        stage:1,
        investmentDate:(new Date) 
    });*/
    return NextResponse.json({logged:true,profit,message:'Profit added successfully'});
    } catch (error) {
        console.log(error);
        return NextResponse.json({error:'Server error'},{status:500,statusText:'An error occured on the server'});
    }
    
}