import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import AdmWallet from "@/models/AdmWallet";
import { NextRequest, NextResponse } from "next/server";

type Wallet = {
    previousWalletType?:string;
    type:string;
    address:string;
}

export async function POST(request:NextRequest){
    const user = await getCurrentUser();
    if(!user){
        return NextResponse.json({error:'Access to resource denied. Expired session'},{status:401,statusText:'Session expired'});
    }
    if(user.role !== 'admin' ){
        return NextResponse.json({error:'Access to resource denied'},{status:403,statusText:'Access denied'});
    }
    await connectToDatabase();
    const {previousWalletType,type,address}:Wallet = await request.json();
    if(!type || !address)
        return NextResponse.json({error:'Some fields are missing'});
    if(previousWalletType){
        await AdmWallet.findOneAndUpdate({type:previousWalletType},{address});
    }else{
        await AdmWallet.create({type,address});
    }
    return NextResponse.json({message:'Wallet has been registered successfully',type,address});
}