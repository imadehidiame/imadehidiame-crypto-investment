import { connectToDatabase } from "@/lib/mongodb";
import ManualWithdrawal from "@/models/ManualWithdrawal";
import { UserPayload } from "@/types";
import { jwtVerify } from "jose";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

interface Props  {
    params:Promise<{
        id:string
    }>
}
const JWT_SEC = process.env.SESSION_SECRET!;
const JWT_SEC_ENC = new TextEncoder().encode(JWT_SEC);

export async function DELETE(request:NextRequest,{params}:Props){
    try {
        const session = request.cookies.get('access_token')?.value;
        if(!session)
            return NextResponse.json({error:'Session expired'},{status:401,statusText:'Your session has expired'});
        const {id} = await params;
        console.log({id});
        if(!id){
            return NextResponse.json({error:'Access to resource denied'},{status:403,statusText:'Access denied'});
        }
        const header = request.headers.get('X-WITH-CANCEL-ID');
        console.log({header});
        console.log(header === id);
        if(!header){
            return NextResponse.json({error:'Access to resource denied'},{status:403,statusText:'Access denied'});
        }
        if(header !== id){
            return NextResponse.json({error:'Access to resource denied'},{status:403,statusText:'Access denied'});
        }
        const user = (await jwtVerify(session,JWT_SEC_ENC)).payload as any as UserPayload; 
        await connectToDatabase();
        const del = await ManualWithdrawal.findOneAndUpdate({
            _id:new Types.ObjectId(id),
            userId:new Types.ObjectId(user.userId)
        },{stage:5});
        if(!del)
            return NextResponse.json({error:'An error occured along the way'},{status:500,statusText:'An error occured on the server'});
        return NextResponse.json({message:'Withdrawal cancelled'});   
    } catch (error) {
        return NextResponse.json({error:'Session expired'},{status:401,statusText:'Your session has expired'});
    }
}