import Kyc from "@/app/ui/pages/kyc";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'KYC',           
};

export default async function(){
    const user = await getCurrentUser();
    if(!user)
        redirect('/auth');
    return (
        <Kyc user={user!} />
    );
}