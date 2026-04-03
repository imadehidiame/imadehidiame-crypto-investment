import  { randomUUID } from 'node:crypto';
//import type { Route } from "./+types/process-adm-withdrawal";
import Activity from "@/models/Activity";
import mongoose from "mongoose";
import AdmWithdrawal from "@/models/AdmWithdrawal";
import { NextRequest, NextResponse } from 'next/server';
    

 
export async function POST(request:NextRequest){
    const {amount,user,description} = await request.json() as {
        amount:number,
        user:string,
        description:string
    }
    const userId = new mongoose.Types.ObjectId(user);
    await Activity.insertOne({
            userId,
            type:'Withdrawal',
            amount,
            status:'Completed',
            payment_id:randomUUID(),
            description
    });

    await AdmWithdrawal.insertOne({
        userId,
        amount,
    })
    return NextResponse.json({data:{logged:true}});
    //return Response.json({data:{logged:true}},{status:200});
}