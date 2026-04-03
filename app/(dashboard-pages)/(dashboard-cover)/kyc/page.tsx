import Kyc from "@/app/ui/pages/kyc";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function(){
    const user = await getCurrentUser();
    if(!user)
        redirect('/auth');
    return (
        <Kyc user={user!} />
    );
}