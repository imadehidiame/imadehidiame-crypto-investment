import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import ManualInvestment from "@/models/ManualInvestment";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest){
    try {
    const user = await getCurrentUser();
    if(!user || user.role !== 'admin'){
        return NextResponse.json({error:'Access denied'},{status:403,statusText:'Access to resource denied'});
    }
    const {id} = await request.json();
    await connectToDatabase();    
    await ManualInvestment.findByIdAndUpdate(new Types.ObjectId(id as string),{
        isActive:true,
        investmentDate:(new Date)
    });
    return NextResponse.json({logged:true});
    } catch (error) {
        console.log(error);
        return NextResponse.json({error:'Server error'},{status:500,statusText:'An error occured on the server'});
    }
    
}