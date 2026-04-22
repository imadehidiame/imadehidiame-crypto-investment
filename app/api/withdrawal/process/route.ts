import { UserPayload } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import ManualWithdrawal from "@/models/ManualWithdrawal";
import { jwtVerify } from "jose";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
 const JWT_SECRET = process.env.SESSION_SECRET!;
 const JWT_ENCODE_SECRET = new TextEncoder().encode(JWT_SECRET);

export async function POST(request:NextRequest){
    const user = request.cookies.get('access_token')?.value;
    if(!user){
        return NextResponse.json({error:'User session has expired'},{status:401,statusText:'Access to resource denied'});
    }
    try {
    const userSession = (await jwtVerify(user,JWT_ENCODE_SECRET)).payload as UserPayload;
    //const clientData = await request.json();
    const {
        balance,//: '$12,050',
        amount,//: '500,000',
        method,//: 'crypto',
        currency,//: 'btc',
        address,//: '839373973937ab'
        name,//: 'Ehidiamen Ima',
        country,//: 'Nigeria',
        bank,//: 'My Bank',
        swift_code,//: '83938739983',
        account_number,//: '3927827278'
        id,
        withdrawalCode
      } = await request.json();    
      await connectToDatabase();
      const userId = new Types.ObjectId(userSession.userId);
        if(!id){
        //new insert
        
        let additional:Record<string,any> = {amount:parseFloat((amount as string).replaceAll(',','')),stage:1,method};
        additional = method === 'bank' ? 
                    {...additional,name,country,bank,swift_code,account_number} :
                    {...additional,currency,address};
        
        const withdrawal = await ManualWithdrawal.insertOne(
            {...additional,withdrawalCode:Math.random().toString().slice(2,12),userId},
        );
        if(!withdrawal){
          throw new Error("An error occured while initiating withdrawal",{cause:419});
        }
        return NextResponse.json({logged:true,message:'Your withdrawal has been initiated',served:{...additional,id:withdrawal._id.toString()}});
        }
        //update
        const isCodeValid = (await ManualWithdrawal.findOneAndUpdate({
          _id:new Types.ObjectId(id as string),
          userId,
          withdrawalCode,
          stage:2
        },{stage:3})) ? true : false;
        if(!isCodeValid){
          throw new Error("Your withdrawal code is invalid for this operation",{cause:419});
        }
        return NextResponse.json({logged:true,message:'Your withdrawal is now processing. You will be notified when it has been completed'});
        //return isCodeValid ? NextResponse.json({logged:true,message:'Your withdrawal is now processing. You will be notified when it has been completed'}) 
        //: NextResponse.json({error:'Your withdrawal is now processing. You will be notified when it has been completed'});
      
    } catch (error) {
        if(error instanceof Error){
        if(error.cause === 419){
          return NextResponse.json({error:error.message});
        }
        }
        return NextResponse.json({error:'User session has expired'},{status:401,statusText:'Access to resource denied'});
    }
}