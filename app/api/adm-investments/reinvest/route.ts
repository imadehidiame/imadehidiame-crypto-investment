import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
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
    const {investmentId,maxUpgrade} = await request.json();
    console.log({investmentId,maxUpgrade});
    await connectToDatabase();    
    await ManualInvestment.findByIdAndUpdate(new Types.ObjectId(investmentId as string),{
        maxUpgrade
    });
    return NextResponse.json({logged:true,message:'Update successful',maxUpgrade});
    } catch (error) {
        console.log(error);
        return NextResponse.json({error:'Server error'},{status:500,statusText:'An error occured on the server'});
    }
     
}