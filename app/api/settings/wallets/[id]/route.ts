import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Wallet from "@/models/Wallet";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

type Props = {
    params:Promise<{
        id:string
    }>
}

export async function DELETE(request:NextRequest,{params}:Props){
    try {
    const {id} = await params;
    const {deleteWalletId} = await request.json();
    console.log({id,deleteWalletId});
    if(id !== deleteWalletId){
        return NextResponse.json({logged:false,error:'Access to resource denied'},{status:403,statusText:'Access to resource deniend'});
    }
    const user = await getCurrentUser();
    await connectToDatabase();
    const userId = new Types.ObjectId(user?.userId);
    //const result await Wallet.findByIdAndDelete(new Types.ObjectId(deleteWalletId as string));
    const result = await Wallet.findOneAndDelete({userId,_id:deleteWalletId});
    if (!result) {
        return NextResponse.json({ 
          error: "Wallet not found or you don't have permission to delete it" 
        }, { status: 404, statusText:"Wallet not found or you don't have permission to delete it" });
      }
        return NextResponse.json({logged:true})
    } catch (error:any) {
        return NextResponse.json(error && error.message ? error.message : 'An error occured on the server',{status:500,statusText:'Server error'});
    }
    
}