import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Activity from "@/models/Activity";
import ManualInvestment from "@/models/ManualInvestment";
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
    const {id} = await request.json();
    await connectToDatabase();    
    const investment = await ManualInvestment.findByIdAndUpdate(new Types.ObjectId(id as string),{
        stage:1,
        investmentDate:(new Date)
    });
    //const userId = new Types.ObjectId(user.userId);
    const {amount,plan}:{amount:number,plan:string} = investment;
    await Activity.insertMany([
            //{userId,type:'Deposit',amount:amountt,status:'Completed',description:`$${amount} deposit`},
            {userId:investment.userId,type:'Investment',amount,status:'Active',description:`${plan} plan investment of $${amount.toLocaleString()} confirmed`}
          ]);
    return NextResponse.json({logged:true});
    } catch (error) {
        console.log(error);
        return NextResponse.json({error:'Server error'},{status:500,statusText:'An error occured on the server'});
    }
    
}