import MessagingPageUser from "@/app/ui/pages/messaging";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

const string_to_date = (date:string|Date)=>{
    return typeof date === 'string' ? (new Date(date)).getTime() : date.getTime();
  }
const loader = async () =>{
  const context_data = await getCurrentUser();
    if (!context_data || !context_data.userId) {
        redirect('/auth');   
    }

    const { name, userId: _id } = context_data;

    return {
        user_data: {
            _id: _id.toString(),
            name
        }
    };
}

export default async function(){
  const {user_data} = await loader();
  return <MessagingPageUser user_data={user_data} />
} 