import DashboardProfile from "@/app/ui/pages/profile";
import { getCurrentUser, getUserKyc } from "@/lib/auth";

export default async function(){
    const user = await getCurrentUser();
    const kyc = await getUserKyc(user?.userId);
    return (
        <DashboardProfile user={user!} kyc={kyc!} />
    );
}