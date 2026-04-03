import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Wallet from "@/models/Wallet";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request:NextRequest){
    try {
    
        
            const {label,currency,address} = await request.json();
            if(!label || !currency || !address){
                return NextResponse.json({error:'Some important fields are missing'});
            }
            const user = await getCurrentUser(); 
            if(!user?.userId){
                return NextResponse.json({error:'Access denied',message:'Access to request denied'},{status:403,statusText:'Forbidden'});
            }
            //log({label,currency,address},'Submit data');
            const userId = new Types.ObjectId(user.userId);
            await connectToDatabase();
            const wallet = await Wallet.insertOne({
                label,
                currency,
                address,
                userId
            });
            //log(wallet,'Wallet Data');
            //log(wallet._id,'Wallet Data ID');
            return NextResponse.json({logged:true,message:'Wallet has been saved successfully',data:{label,currency,address,createdAt:new Date(Date.now()),_id: typeof wallet._id == 'string' ? wallet._id : wallet._id.toString()}});
        
        
        
    } catch (error) {
     //log(error,'Error report');   
     return {data:{logged:false,error:'An error occured on the server'}};
    }
}

export async function PATCH(request:NextRequest){

    try {
    
        
            const {label,currency,address,_id} = await request.json();
            console.log({label,currency,address,_id});
            if(!label || !currency || !address || !_id){
                return NextResponse.json({error:'Some important fields are missing'});
            }
            const user = await getCurrentUser(); 
            if(!user?.userId){
                return NextResponse.json({error:'Access denied',message:'Access to request denied'},{status:403,statusText:'Forbidden'});
            }
            await connectToDatabase();
            //const userId = new Types.ObjectId(user.userId);
            const wallet = await Wallet.findByIdAndUpdate(new Types.ObjectId(_id as string),{
                label,currency,address
            },{new:true});
            //log(wallet,'Wallet Data update');
            return NextResponse.json({logged:true,message:'Wallet has been updated successfully',data:{label,currency,address}});
        
        
        
    } catch (error) {
     //log(error,'Error report');   
     return NextResponse.json(null,{status:500,statusText:'An error occured on the server'});
     //return {data:{logged:false,error:'An error occured on the server'}};
    }

}