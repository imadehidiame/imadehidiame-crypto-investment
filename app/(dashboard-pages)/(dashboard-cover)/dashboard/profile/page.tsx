import DashboardProfile from "@/app/ui/pages/profile";
import { getCurrentUser, getUserKyc } from "@/lib/auth";
import { redirect } from "next/navigation";


export const dynamic = 'force-dynamic';

export default async function(){
    const user = await getCurrentUser();
    if(!user)
        return redirect('/auth');
    const kyc = await getUserKyc(user?.userId);
    return (
        <DashboardProfile user={user!} kyc={kyc!} />
    );
}