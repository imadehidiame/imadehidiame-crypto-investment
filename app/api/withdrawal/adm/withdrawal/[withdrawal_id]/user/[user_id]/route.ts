import ManualWithdrawal from "@/models/ManualWithdrawal";
import { UserPayload } from "@/types";
import { errors, jwtVerify } from "jose";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server"

interface Props{
    params:Promise<{
        withdrawal_id:string,
        user_id:string
    }>
}

const JWT_SEC = process.env.SESSION_SECRET!;
const JWT_SEC_ENC = new TextEncoder().encode(JWT_SEC);

export async function PATCH(request:NextRequest,{params}:Props){
    try {
        const session = request.cookies.get('access_token')?.value;
        if(!session)
            throw new Error("Access to resource denied",{cause:401});  
        const user =((await jwtVerify(session,JWT_SEC_ENC)).payload) as any as UserPayload;
        if(user.role !== 'admin')
            throw Error("Access to resource denied for user",{cause:403});
        const {withdrawal_id,user_id} = await params;
        if(!withdrawal_id || !user_id)
            throw Error("Access to resource denied",{cause:403});
        const withdrawalHeader = request.headers.get('X-WITH-ID');
        const userHeader = request.headers.get('X-USE-ID');
        const currentStage = request.headers.get('X-STA-ID');

        if(!withdrawalHeader || !userHeader || !currentStage){
            throw Error("Access to resource denied",{cause:403});
        }
        if(withdrawalHeader !== withdrawal_id || userHeader !== user_id)
            throw Error("Access to resource denied",{cause:403});
        const {stage} = await request.json();
        //console.log({withdrawalHeader,userHeader,currentStage,stage});
        if(!stage || stage !== parseInt(currentStage))
            throw Error("Access to resource denied as invalid credentials was submitted",{cause:403});

        const updateWithdrawal = await ManualWithdrawal.findOneAndUpdate({
            _id:new Types.ObjectId(withdrawal_id),
            userId:new Types.ObjectId(user_id),
            stage:{$lt:parseInt(currentStage)+1}
        },{
            $inc:{stage:1}
        });
        if(!updateWithdrawal){
            throw Error('Withdrawal information not found or upgrade has already been carried out',{cause:403});
        }
        return NextResponse.json({logged:true,message:'Update successful'});
    } catch (error) {
        console.log(error);
        if(error instanceof Error && error.message && error.cause && typeof error.cause === 'number'){
            //if(error.cause && typeof error.cause === 'number')
            return NextResponse.json({error:error.message},{status:error.cause as number,statusText:error.message});
            //else
            //return NextResponse.json({error:error.message},{status:401,statusText:error.message});
        }
        if (error instanceof errors.JWTExpired) {
            return NextResponse.json({error:'User session expired'},{status:401,statusText:'Session expired'});
            //console.error("User session has expired. Please log in again.");
          } 
          
          // 3. Check for any error originating from the jose library
          if (error instanceof errors.JOSEError) {
            console.error("A JWT-related error occurred:", error.message + ' \n'+error.code);
            return NextResponse.json({error:'An error occured on the server'},{status:500,statusText:'An error occured on the server'});
          }
          return NextResponse.json({error:'An error occured on the server'},{status:500,statusText:'An error occured on the server'});
        //console.log(error);
    }
    
    
}