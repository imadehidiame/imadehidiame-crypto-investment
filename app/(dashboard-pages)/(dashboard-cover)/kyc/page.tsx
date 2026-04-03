import Kyc from "@/app/ui/pages/kyc";
import { getCurrentUser } from "@/lib/auth";

export default async function(){
    const user = await getCurrentUser();
    return (
        <Kyc user={user!} />
    );
}