import { Types } from "mongoose";
import { getCurrentUser, SettingsData } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import AdmWallet from "@/models/AdmWallet";
import AdminSettingsPage from "@/app/ui/pages/adm/adm-settings";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Settings',           
};

type Wallet = {address:string,type:string,createdAt:Date};

const loader = async () =>{
    await connectToDatabase();
    const context_data = await getCurrentUser();
    if(!context_data)
        redirect('/auth');
    
    const wallets = await AdmWallet.find({}).select('address type createdAt').lean();
    return wallets.map(wallet=>({address:wallet.address,type:wallet.type,createdAt:wallet.createdAt})) as Wallet[];
}

export default async function(){
    const loaderData = await loader();
  return <AdminSettingsPage registeredWallets={loaderData} />
  
} 